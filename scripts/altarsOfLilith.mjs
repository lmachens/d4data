import { LOCALES, readTerms } from "./i18n.mjs";
import { readFileSync, writeFileSync } from "./fs.mjs";
import { normalizePoint } from "./lib.mjs";
import globalMarkers from "../json/base/meta/Global/global_markers.glo.json" assert { type: "json" };
import hiddenCaches from "../json/base/meta/GameBalance/HiddenCaches.gam.json" assert { type: "json" };

const altarsOfLilith = [];
const dict = LOCALES.reduce((acc, locale) => {
  acc[locale] = {};
  return acc;
}, {});

function normalize(str) {
  return str.replace(/.*]/, "").replace(/.*}/, "").replace(".", "").trim();
}
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
      dict[locale][id] = {
        name: worldTerms[0].szText,
      };
      hasTerms = true;
    }
  });
  if (!hasTerms) {
    console.log("No terms for", id);
    return;
  }

  const pData = actor.ptData.find((data) => data.gbidHiddenCache);
  const hiddenCache = hiddenCaches.ptData[0].tEntries.find(
    (entry) => entry.tHeader?.szName === pData.gbidHiddenCache.name
  );

  const trackedReward = JSON.parse(
    readFileSync(
      `../json/base/meta/TrackedReward/${hiddenCache.snoTrackedReward.name}.trd.json`
    )
  );

  const attribute = hiddenCache.snoTrackedReward.name.match(/TR_(.*)_/)[1];

  LOCALES.forEach((locale) => {
    if (attribute === "Obol_Cap") {
      const attributeDescriptions = readTerms(`Map`, locale);
      const term = attributeDescriptions.find(
        (term) => term.szLabel === "RegionProgress_Reward_GamblingCurrency"
      );
      dict[locale][id].description = normalize(term.szText);
    } else if (attribute === "Cache_Paragon") {
      const attributeDescriptions = readTerms(`SkillsUI`, locale);
      const term = attributeDescriptions.find(
        (term) => term.szLabel === "ParagonPointsAvailable"
      );
      dict[locale][id].description = normalize(term.szText);
    } else {
      const attributeDescriptions = readTerms(`AttributeDescriptions`, locale);
      const term = attributeDescriptions.find(
        (term) => term.szLabel === attribute
      );
      dict[locale][id].description = normalize(term.szText);
    }
  });

  const node = {
    id: id,
    name: dict["enUS"][id].name,
    description: `${hiddenCache.snoTrackedReward.name} +${trackedReward.flAmount}`,
    attribute: attribute,
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
