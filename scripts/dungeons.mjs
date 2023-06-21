import { LOCALES, readTerms } from "./i18n.mjs";
import { readFileSync, writeFileSync } from "./fs.mjs";
import { normalizePoint } from "./lib.mjs";
import globalMarkers from "../json/base/meta/Global/global_markers.glo.json" assert { type: "json" };

const dungeonsDict = LOCALES.reduce((acc, locale) => {
  acc[locale] = {};
  return acc;
}, {});
const cellarsDict = LOCALES.reduce((acc, locale) => {
  acc[locale] = {};
  return acc;
}, {});
const aspectsDict = LOCALES.reduce((acc, locale) => {
  acc[locale] = {};
  return acc;
}, {});

const dungeons = [];
const sideQuestDungeons = [];
const campaignDungeons = [];
const cellars = [];

const DUNGEON_TYPES = ["Portal_Dungeon_Generic", "Portal_Dungeon_Cellar"];
const CELLAR_TYPES = ["Portal_Cellar_Generic", "Portal_Cellar_Flat"];
globalMarkers.ptContent[0].arGlobalMarkerActors.forEach((actor) => {
  if (
    DUNGEON_TYPES.includes(actor.snoActor.name) === false &&
    CELLAR_TYPES.includes(actor.snoActor.name) === false
  ) {
    return;
  }
  const point = normalizePoint(actor.tWorldTransform.wp);
  const id = actor.ptData[0].unk_c420444.name;
  // if (id.includes("Prologue")) {
  //   return;
  // }
  const rewardName = actor.ptData[0].unk_4908570.name;
  const isCellar =
    !id.startsWith("DGN_") && CELLAR_TYPES.includes(actor.snoActor.name);

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
    const worldTerms = readTerms(`World_${id}`, locale);
    if (worldTerms.length > 0) {
      hasTerms = true;
      if (isCellar) {
        cellarsDict[locale][`${id}_name`] = worldTerms
          .find((term) => term.szLabel === "Name")
          .szText.trim();
        cellarsDict[locale][`${id}_description`] = worldTerms.find(
          (term) => term.szLabel === "Desc"
        )?.szText;
      } else {
        dungeonsDict[locale][`${id}_name`] = worldTerms
          .find((term) => term.szLabel === "Name")
          .szText.trim();
        dungeonsDict[locale][`${id}_description`] = worldTerms.find(
          (term) => term.szLabel === "Desc"
        )?.szText;
      }
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
    console.log("No terms for", id);
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

  if (isCellar) {
    cellars.push(node);
  } else {
    if (id.startsWith("DGN_")) {
      if (!dungeons.some((d) => d.x === node.x && d.y === node.y)) {
        dungeons.push(node);
      }
    } else if (id.startsWith("QST_")) {
      if (!sideQuestDungeons.some((d) => d.x === node.x && d.y === node.y)) {
        sideQuestDungeons.push(node);
      }
    } else if (id.startsWith("CSD")) {
      if (!campaignDungeons.some((d) => d.x === node.x && d.y === node.y)) {
        campaignDungeons.push(node);
      }
    } else {
      console.log("Unknown dungeon type", id);
    }
  }
});

writeFileSync("../out/dungeons.json", JSON.stringify(dungeons, null, 2));
writeFileSync(
  "../out/sideQuestDungeons.json",
  JSON.stringify(sideQuestDungeons, null, 2)
);
writeFileSync(
  "../out/campaignDungeons.json",
  JSON.stringify(campaignDungeons, null, 2)
);
writeFileSync(
  "../out/dungeons.dict.json",
  JSON.stringify(dungeonsDict, null, 2)
);
writeFileSync("../out/cellars.json", JSON.stringify(cellars, null, 2));
writeFileSync(
  "../out/cellars.dict.json",
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

const prodSideQuestDungeons = sideQuestDungeons.map((dungeon) => {
  const node = {
    name: dungeonsDict["enUS"][`${dungeon.id}_name`],
    description: dungeonsDict["enUS"][`${dungeon.id}_description`],
    x: dungeon.x,
    y: dungeon.y,
  };
  if (
    prodDungeons.some(
      (d) =>
        Math.abs(d.x - dungeon.x) < 0.05 && Math.abs(d.y - dungeon.y) < 0.05
    )
  ) {
    node.offset = true;
  }
  if (dungeon.aspectId) {
    node.aspect = "Aspect " + aspectsDict["enUS"][`${dungeon.aspectId}_name`];
  }
  return node;
});
writeFileSync(
  "../out/sideQuestDungeons.prod.json",
  JSON.stringify(prodSideQuestDungeons, null, 2)
);

const prodCampaignDungeons = campaignDungeons.map((dungeon) => {
  const node = {
    name: dungeonsDict["enUS"][`${dungeon.id}_name`],
    description: dungeonsDict["enUS"][`${dungeon.id}_description`],
    x: dungeon.x,
    y: dungeon.y,
  };
  if (
    prodDungeons.some(
      (d) =>
        Math.abs(d.x - dungeon.x) < 0.05 && Math.abs(d.y - dungeon.y) < 0.05
    )
  ) {
    node.offset = true;
  }
  if (dungeon.aspectId) {
    node.aspect = "Aspect " + aspectsDict["enUS"][`${dungeon.aspectId}_name`];
  }
  return node;
});
writeFileSync(
  "../out/campaignDungeons.prod.json",
  JSON.stringify(prodCampaignDungeons, null, 2)
);

const prodCellars = cellars.map((cellar) => {
  const node = {
    name: cellarsDict["enUS"][`${cellar.id}_name`],
    description: cellarsDict["enUS"][`${cellar.id}_description`],
    x: cellar.x,
    y: cellar.y,
  };

  if (cellar.aspectId) {
    node.aspect = "Aspect " + aspectsDict["enUS"][`${cellar.aspectId}_name`];
  }
  return node;
});
writeFileSync("../out/cellars.prod.json", JSON.stringify(prodCellars, null, 2));
