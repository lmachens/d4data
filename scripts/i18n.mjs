import { readFileSync } from "./fs.mjs";

export const LOCALES = ["enUS", "deDE", "frFR", "ruRU", "esES", "ptBR"];

export function readTerms(name, locale = LOCALES[0]) {
  try {
    const stringList = JSON.parse(
      readFileSync(`../json/${locale}_Text/meta/StringList/${name}.stl.json`)
    );
    return stringList.arStrings;
  } catch (err) {
    return [];
  }
}

export function readTerm(name, locale = LOCALES[0]) {
  const terms = readTerms(name, locale);
  return terms[0];
}
