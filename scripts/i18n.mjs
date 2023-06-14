import { readFileSync, writeFileSync } from "./fs.mjs";

export const LOCALES = ["enUS", "deDE", "frFR", "ruRU"];
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

export function readTerm(name, locale = LOCALES[0]) {
  try {
    const stringList = JSON.parse(
      readFileSync(`../json/${locale}_Text/meta/StringList/${name}.stl.json`)
    );
    if (!stringList.arStrings[0]?.szText) {
      return null;
    }
    return stringList.arStrings[0].szText;
  } catch (err) {
    return null;
  }
}
