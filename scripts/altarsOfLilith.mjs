import { LOCALES, readTerms } from "./i18n.mjs";
import { readFileSync, writeFileSync } from "./fs.mjs";
import { normalizePoint } from "./lib.mjs";
import globalMarkers from "../json/base/meta/Global/global_markers.glo.json" assert { type: "json" };

const altarsOfLilith = [];
const dict = LOCALES.reduce((acc, locale) => {
  acc[locale] = {};
  return acc;
}, {});

globalMarkers.ptContent[0].arGlobalMarkerActors.forEach((actor) => {
  if (!actor.snoActor.name?.includes("LilithShrine")) {
    return;
  }
  const point = normalizePoint(actor.tWorldTransform.wp);
  const id = actor.snoLevelArea.name;
  let hasTerms = false;
  LOCALES.forEach((locale) => {
    const worldTerms = readTerms(`LevelArea_${id}`, locale);
    if (worldTerms.length > 0) {
      dict[locale][id] = worldTerms[0].szText;
      hasTerms = true;
    }
  });
  if (!hasTerms) {
    console.log("No terms for", id);
    return;
  }
  const node = {
    id: id,
    x: point[0] / 1.65,
    y: point[1] / 1.65,
  };
  altarsOfLilith.push(node);
});

writeFileSync(
  "../out/altarsOfLilith.json",
  JSON.stringify(altarsOfLilith, null, 2)
);
writeFileSync("../out/altarsOfLilith.dict.json", JSON.stringify(dict, null, 2));
