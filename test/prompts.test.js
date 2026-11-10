const assert = require("node:assert/strict");
const { PassThrough, Writable } = require("node:stream");
const test = require("node:test");
const { choiceIndex, selectOption, interactiveInterface } = require("../lib/prompts");

function terminal() {
  const input = new PassThrough();
  input.isTTY = true;
  input.isRaw = false;
  input.setRawMode = (value) => { input.isRaw = value; };
  input.pause();
  let text = "";
  const output = new Writable({ write(chunk, encoding, callback) { text += chunk.toString(); callback(); } });
  output.isTTY = true;
  output.columns = 100;
  return { input, output, text: () => text };
}

async function send(input, keys) {
  input.write(keys);
  await new Promise((resolve) => setImmediate(resolve));
}

test("Up/Down select an option and Enter confirms it, restoring terminal state", async () => {
  const tty = terminal();
  const result = selectOption(tty.input, tty.output, "Database", ["postgresql", "mysql", "h2"], 1);
  assert.equal(tty.input.isRaw, true);
  assert.match(tty.text(), /> 2\. mysql/);
  await send(tty.input, "\x1b[B\x1b[A\x1b[A\r");
  assert.equal(await result, "postgresql");
  assert.equal(tty.input.isRaw, false);
  assert.equal(tty.input.isPaused(), true);
  assert.equal(tty.input.listenerCount("keypress"), 0);
  assert.equal(tty.output.listenerCount("resize"), 0);
  assert.match(tty.text(), /Database : postgresql/);
});

test("arrow navigation wraps at both ends and Enter accepts the highlighted default", async () => {
  const tty = terminal();
  let result = selectOption(tty.input, tty.output, "Target", ["backend", "frontend", "both"], 2);
  await send(tty.input, "\r");
  assert.equal(await result, "both");
  result = selectOption(tty.input, tty.output, "Target", ["backend", "frontend", "both"]);
  await send(tty.input, "\x1b[A\r");
  assert.equal(await result, "both");
  result = selectOption(tty.input, tty.output, "Target", ["backend", "frontend", "both"], 2);
  await send(tty.input, "\x1b[B\r");
  assert.equal(await result, "backend");
});

test("typed option names and numbers work; an invalid choice can be corrected", async () => {
  const tty = terminal();
  let result = selectOption(tty.input, tty.output, "Build", ["maven", "gradle"]);
  await send(tty.input, "GRADLE\r");
  assert.equal(await result, "gradle");
  result = selectOption(tty.input, tty.output, "Build", ["maven", "gradle"]);
  await send(tty.input, "9\r");
  assert.match(tty.text(), /Choix invalide/);
  assert.equal(tty.input.isRaw, true);
  await send(tty.input, "\x7f2\r");
  assert.equal(await result, "gradle");
  assert.equal(choiceIndex("0", ["maven", "gradle"]), -1);
  assert.equal(choiceIndex("3", ["maven", "gradle"]), -1);
});

test("Yes/No menus accept arrow keys and existing typed aliases", async () => {
  const tty = terminal();
  const aliases = { y: 0, yes: 0, o: 0, n: 1, no: 1 };
  let result = selectOption(tty.input, tty.output, "Pagination", ["Oui", "Non"], 0, aliases);
  await send(tty.input, "\x1b[B\r");
  assert.equal(await result, "Non");
  result = selectOption(tty.input, tty.output, "Pagination", ["Oui", "Non"], 1, aliases);
  await send(tty.input, "y\r");
  assert.equal(await result, "Oui");
});

test("Ctrl+C cancels and restores the previous raw and paused modes", async () => {
  const tty = terminal();
  tty.input.setRawMode(true);
  tty.input.resume();
  const result = selectOption(tty.input, tty.output, "Target", ["backend", "frontend"]);
  const rejected = assert.rejects(result, { code: "PROMPT_CANCELLED" });
  await send(tty.input, "\x03");
  await rejected;
  assert.equal(tty.input.isRaw, true);
  assert.equal(tty.input.isPaused(), false);
  assert.equal(tty.input.listenerCount("keypress"), 0);
  tty.input.pause();
});

test("text prompts and arrow menus can alternate without consuming each other's keys", async () => {
  const tty = terminal();
  const prompts = interactiveInterface(tty.input, tty.output);
  let answer = new Promise((resolve) => prompts.question("Name: ", resolve));
  await send(tty.input, "Inventory\r");
  assert.equal(await answer, "Inventory");
  answer = prompts.select("Target", ["backend", "frontend", "both"]);
  await send(tty.input, "\x1b[B\r");
  assert.equal(await answer, "frontend");
  answer = new Promise((resolve) => prompts.question("Package: ", resolve));
  await send(tty.input, "com.example\r");
  assert.equal(await answer, "com.example");
  prompts.close();
  assert.equal(tty.input.isRaw, false);
});
