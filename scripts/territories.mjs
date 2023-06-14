import continent from "../json/base/meta/World/Sanctuary_Eastern_Continent.wrl.json" assert { type: "json" };
import { normalizePoint } from "./lib.mjs";
import { writeFileSync } from "./fs.mjs";
import { LOCALES, readTerm } from "./i18n.mjs";

const terms = LOCALES.reduce((acc, locale) => {
  acc[locale] = {};
  return acc;
}, {});

const territories = continent.unk_675bda3.map((camp) => {
  LOCALES.forEach((locale) => {
    const term = readTerm(`Territory_${camp.snoTerritory.name}`, locale);
    terms[locale][camp.snoTerritory.name] = term;
  });

  return {
    id: camp.snoTerritory.name,
    points: camp.arPoints.map((vector) => normalizePoint(vector)),
  };
});

writeFileSync("../out/territories.json", JSON.stringify(territories, null, 2));
writeFileSync(
  "../out/territories_old.json",
  JSON.stringify(
    territories.map((territory) => ({
      ...territory,
      points: territory.points.map((point) => [
        point[0] / 1.65,
        point[1] / 1.65,
      ]),
    })),
    null,
    2
  )
);
writeFileSync("../out/territories.terms.json", JSON.stringify(terms, null, 2));
console.log("done", territories.length);
