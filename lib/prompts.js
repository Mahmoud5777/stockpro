const readline = require("node:readline");

class PromptCancelledError extends Error {
  constructor() {
    super("Assistant annulé.");
    this.code = "PROMPT_CANCELLED";
  }
}

function choiceIndex(answer, options, aliases = {}) {
  const value = answer.trim();
  const alias = aliases[value.toLowerCase()];
  if (Number.isInteger(alias) && alias >= 0 && alias < options.length) return alias;
  const named = options.findIndex((option) => option.toLowerCase() === value.toLowerCase());
  if (named >= 0) return named;
  if (/^[1-9]\d*$/.test(value)) {
    const index = Number(value) - 1;
    if (index < options.length) return index;
  }
  return -1;
}

function selectOption(input, output, label, options, defaultIndex = 0, aliases = {}) {
  if (!options.length || defaultIndex < 0 || defaultIndex >= options.length) {
    return Promise.reject(new Error("Invalid selection options or default."));
  }
  return new Promise((resolve, reject) => {
    let selected = defaultIndex;
    let typed = "";
    let invalid = false;
    let renderedLines = 0;
    const wasRaw = Boolean(input.isRaw);
    const wasPaused = input.isPaused();

    const clear = () => {
      if (!renderedLines) return;
      readline.moveCursor(output, 0, -renderedLines);
      readline.cursorTo(output, 0);
      readline.clearScreenDown(output);
      renderedLines = 0;
    };
    const render = () => {
      clear();
      const lines = [
        `  ${label}`,
        ...options.map((option, index) => `  ${index === selected ? ">" : " "} ${index + 1}. ${option}`),
        invalid ? "  Choix invalide. Utilisez les flèches ou saisissez un choix." : "  ↑/↓ : choisir · Entrée : confirmer · Ctrl+C : annuler",
        ...(typed ? [`  Saisie : ${typed}`] : []),
      ];
      // Keep each row within the terminal width so redraws do not leave wrapped text.
      const width = Math.max(1, (output.columns || 80) - 1);
      output.write(lines.map((line) => Array.from(line).slice(0, width).join("")).join("\n") + "\n");
      renderedLines = lines.length;
    };
    const cleanup = () => {
      input.removeListener("keypress", onKey);
      input.removeListener("end", onEnd);
      output.removeListener("resize", render);
      input.setRawMode(wasRaw);
      if (wasPaused) input.pause();
    };
    const cancel = () => {
      cleanup();
      clear();
      output.write(`  ${label} : annulé\n`);
      reject(new PromptCancelledError());
    };
    const onEnd = () => cancel();
    const onKey = (text, key = {}) => {
      if (key.ctrl && (key.name === "c" || key.name === "d")) return cancel();
      if (key.name === "up" || key.name === "down" || key.name === "home" || key.name === "end") {
        if (key.name === "home") selected = 0;
        else if (key.name === "end") selected = options.length - 1;
        else selected = (selected + (key.name === "up" ? -1 : 1) + options.length) % options.length;
        typed = "";
        invalid = false;
      } else if (key.name === "return" || key.name === "enter") {
        if (typed.trim()) {
          const index = choiceIndex(typed, options, aliases);
          if (index < 0) {
            invalid = true;
            render();
            return;
          }
          selected = index;
        }
        cleanup();
        clear();
        output.write(`  ${label} : ${options[selected]}\n`);
        resolve(options[selected]);
        return;
      } else if (key.name === "backspace") {
        typed = Array.from(typed).slice(0, -1).join("");
        invalid = false;
      } else if (text && !key.ctrl && !key.meta && !/[\x00-\x1f\x7f]/.test(text)) {
        typed += text;
        invalid = false;
      } else {
        return;
      }
      render();
    };

    readline.emitKeypressEvents(input);
    input.on("keypress", onKey);
    input.once("end", onEnd);
    output.on("resize", render);
    input.setRawMode(true);
    input.resume();
    render();
  });
}

function interactiveInterface(input = process.stdin, output = process.stdout) {
  let active;
  return {
    question(prompt, callback) {
      // A text readline must be closed before a menu takes ownership of raw input.
      active = readline.createInterface({ input, output });
      active.on("SIGINT", () => {
        active.close();
        process.exitCode = 130;
      });
      active.question(prompt, (answer) => {
        active.close();
        active = undefined;
        callback(answer);
      });
    },
    select(label, options, defaultIndex, aliases) {
      return selectOption(input, output, label, options, defaultIndex, aliases);
    },
    close() {
      if (active) active.close();
    },
  };
}

module.exports = { choiceIndex, selectOption, interactiveInterface };
