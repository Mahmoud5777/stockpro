// Accept both --option=value and --option value; preserve '=' inside values.
function parseArgs(args, valueOptions = []) {
  const options = {};
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) { positional.push(arg); continue; }
    const separator = arg.indexOf("=");
    const name = separator < 0 ? arg.slice(2) : arg.slice(2, separator);
    if (separator >= 0) options[name] = arg.slice(separator + 1);
    else if (valueOptions.includes(name)) {
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error(`--${name} requires a value`);
      options[name] = value;
    } else options[name] = true;
  }
  return { options, positional };
}
module.exports = { parseArgs };
