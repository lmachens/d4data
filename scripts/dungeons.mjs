import { LOCALES, readTerms } from "./i18n.mjs";
import { readFileSync, readdirSync, writeFileSync } from "./fs.mjs";
import { normalizePoint } from "./lib.mjs";
import globalMarkers from "../json/base/meta/Global/global_markers.glo.json" assert { type: "json" };

const dungeonsDict = LOCALES.reduce((acc, locale) => {
  acc[locale] = {};
  return acc;
}, {});
const aspectsDict = LOCALES.reduce((acc, locale) => {
  acc[locale] = {};
  return acc;
}, {});

const dungeons = [];
globalMarkers.ptContent[0].arGlobalMarkerActors.forEach((actor) => {
  if (
    actor.snoActor.name !== "Portal_Dungeon_Generic" &&
    actor.snoActor.name !== "Portal_Dungeon_Cellar"
  ) {
    return;
  }
  const point = normalizePoint(actor.tWorldTransform.wp);
  const id = actor.ptData[0].unk_c420444.name;
  const rewardName = actor.ptData[0].unk_4908570.name;
  let aspectId = null;
  if (rewardName) {
    const trackedReward = JSON.parse(
      readFileSync(`../json/base/meta/TrackedReward/${rewardName}.trd.json`)
    );
    const aspect = trackedReward.snoAspect;
    aspectId = aspect.name.replace("Asp_", "");
  }

  let hasTerms = false;
  LOCALES.forEach((locale) => {
    const dungeonTerms = readTerms(`World_${id}`, locale);
    if (dungeonTerms.length > 0) {
      hasTerms = true;
      dungeonsDict[locale][`${id}_name`] = dungeonTerms
        .find((term) => term.szLabel === "Name")
        .szText.trim();
      dungeonsDict[locale][`${id}_description`] = dungeonTerms.find(
        (term) => term.szLabel === "Desc"
      )?.szText;
    }
    if (aspectId) {
      const aspectTerms = readTerms(`Affix_${aspectId.toLowerCase()}`, locale);
      aspectsDict[locale][`${aspectId}_name`] = aspectTerms.find(
        (term) => term.szLabel === "Name"
      ).szText;
    }
    // aspectsDict[locale][`${aspectId}_description`] = aspectTerms[1];
  });
  if (!hasTerms) {
    return;
  }

  const node = {
    id: id,
    x: point[0] / 1.65,
    y: point[1] / 1.65,
  };
  if (aspectId) {
    node.aspectId = aspectId;
  }

  dungeons.push(node);
});

writeFileSync("../out/dungeons.json", JSON.stringify(dungeons, null, 2));
writeFileSync(
  "../out/dungeons.dict.json",
  JSON.stringify(dungeonsDict, null, 2)
);
writeFileSync("../out/aspects.dict.json", JSON.stringify(aspectsDict, null, 2));

// Only for production without dicts

const prodDungeons = dungeons.map((dungeon) => {
  const node = {
    name: dungeonsDict["enUS"][`${dungeon.id}_name`],
    description: dungeonsDict["enUS"][`${dungeon.id}_description`],
    x: dungeon.x,
    y: dungeon.y,
  };
  if (dungeon.aspectId) {
    node.aspect = "Aspect " + aspectsDict["enUS"][`${dungeon.aspectId}_name`];
  }
  return node;
});
writeFileSync(
  "../out/dungeons.prod.json",
  JSON.stringify(prodDungeons, null, 2)
);
