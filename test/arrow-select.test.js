"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");

const { selectOptions } = require("../cli.js");

// Simulates a real TTY: the interactive branch of selectOptions switches to
// raw mode and reads arrow-key escape sequences from stdin. pause()/resume()
// follow real stream semantics (a paused stream stops emitting data), so a
// stray rl.pause() would hang the selection exactly like on a real terminal.
function makeIo() {
  const stdin = new EventEmitter();
  stdin.isTTY = true;
  stdin.isRaw = false;
  stdin.paused = false;
  stdin.pauseCalls = 0;
  stdin.setRawMode = (mode) => {
    stdin.isRaw = mode;
  };
  stdin.pause = () => {
    stdin.paused = true;
    stdin.pauseCalls += 1;
  };
  stdin.resume = () => {
    stdin.paused = false;
  };
  const stdout = {
    isTTY: true,
    write() {},
  };
  const rl = {
    pause() {
      stdin.pause();
    },
    resume() {
      stdin.resume();
    },
  };
  return { stdin, stdout, rl };
}

function press(stdin, seq) {
  if (stdin.paused) return;
  stdin.emit("data", Buffer.from(seq, "utf8"));
}

// If the selection freezes (e.g. stdin got paused), fail loudly instead of
// hanging the whole suite.
const FROZEN = "menu froze (stdin not flowing)";
async function confirm(pending) {
  return Promise.race([
    pending,
    new Promise((_, reject) => setTimeout(() => reject(new Error(FROZEN)), 2000)),
  ]);
}

test("arrow keys move the selection; Enter confirms", async () => {
  const { stdin, stdout, rl } = makeIo();
  const pending = selectOptions(rl, "Menu", ["A", "B", "C"], 0, { stdin, stdout });

  press(stdin, "\x1b[B"); // Down -> B
  press(stdin, "\x1b[B"); // Down -> C
  press(stdin, "\x1bOA"); // SS3 Up -> B
  press(stdin, "\x1b[A"); // ANSI Up -> A
  press(stdin, "\x1b[B"); // Down -> B
  press(stdin, "\x1b[B"); // Down -> C
  press(stdin, "\r");

  const value = await confirm(pending);
  assert.equal(value, "C");
  assert.equal(stdin.isRaw, true);
  assert.equal(stdin.pauseCalls, 0, "stdin must keep flowing during the menu");
});

test("escape sequence split across chunks is still decoded", async () => {
  const { stdin, stdout, rl } = makeIo();
  const pending = selectOptions(rl, "Menu", ["A", "B", "C"], 0, { stdin, stdout });

  press(stdin, "\x1b");
  press(stdin, "[B");
  press(stdin, "\x1b");
  press(stdin, "[B");
  press(stdin, "\n");

  const value = await confirm(pending);
  assert.equal(value, "C");
  assert.equal(stdin.pauseCalls, 0, "stdin must keep flowing during the menu");
});

test("up arrow wraps around to the last option", async () => {
  const { stdin, stdout, rl } = makeIo();
  const pending = selectOptions(rl, "Menu", ["A", "B", "C"], 0, { stdin, stdout });

  press(stdin, "\x1b[A"); // Up from first -> last
  press(stdin, "\x1b[A"); // Up from last -> middle
  press(stdin, "\r");

  const value = await confirm(pending);
  assert.equal(value, "B");
  assert.equal(stdin.pauseCalls, 0, "stdin must keep flowing during the menu");
});

test("number keys jump directly, right arrow is ignored", async () => {
  const { stdin, stdout, rl } = makeIo();
  const pending = selectOptions(rl, "Menu", ["A", "B", "C"], 0, { stdin, stdout });

  press(stdin, "\x1b[C"); // Right arrow: not handled
  press(stdin, "2"); // Jump to B
  press(stdin, "\x1b[C"); // Still ignored
  press(stdin, "\r");

  const value = await confirm(pending);
  assert.equal(value, "B");
  assert.equal(stdin.pauseCalls, 0, "stdin must keep flowing during the menu");
});

test("Ctrl+C cancels with an error", async () => {
  const { stdin, stdout, rl } = makeIo();
  const pending = selectOptions(rl, "Menu", ["A", "B"], 0, { stdin, stdout });

  press(stdin, "\x03");

  await assert.rejects(() => confirm(pending), /Annulé par l'utilisateur \(Ctrl\+C\)\./);
  assert.equal(stdin.pauseCalls, 0, "stdin must keep flowing during the menu");
});

test("default index is selected on Enter without any arrow", async () => {
  const { stdin, stdout, rl } = makeIo();
  const pending = selectOptions(rl, "Menu", ["A", "B", "C"], 1, { stdin, stdout });

  press(stdin, "\r");

  const value = await confirm(pending);
  assert.equal(value, "B");
  assert.equal(stdin.pauseCalls, 0, "stdin must keep flowing during the menu");
});
