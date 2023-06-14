import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export function readFileSync(filePath, ...args) {
  return fs.readFileSync(path.resolve(__dirname, filePath), ...args);
}

export function writeFileSync(filePath, ...args) {
  return fs.writeFileSync(path.resolve(__dirname, filePath), ...args);
}

export function readdirSync(filePath, ...args) {
  return fs.readdirSync(path.resolve(__dirname, filePath), ...args);
}
