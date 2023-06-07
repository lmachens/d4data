import { readFileSync, writeFileSync } from "./fs.mjs";

export function addTerms(obj, locale = "en") {
  const pathName = `../out/${locale}.json`;
  let dict;
  try {
    dict = JSON.parse(readFileSync(pathName));
  } catch (err) {
    dict = {};
  }
  dict = Object.assign(dict, obj);
  writeFileSync(pathName, JSON.stringify(dict, null, 2));
}
