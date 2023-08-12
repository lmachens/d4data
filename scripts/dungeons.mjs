import { LOCALES, readTerms } from "./i18n.mjs";
import { readFileSync } from "./fs.mjs";
import { normalizePoint } from "./lib.mjs";
import globalMarkers from "../json/base/meta/Global/global_markers.glo.json" assert { type: "json" };

export default () => {
  const dungeonsDict = LOCALES.reduce((acc, locale) => {
    acc[locale] = {};
    return acc;
  }, {});
  const sideQuestDungeonsDict = LOCALES.reduce((acc, locale) => {
    acc[locale] = {};
    return acc;
  }, {});
  const campaignDungeonsDict = LOCALES.reduce((acc, locale) => {
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
    const stringId = actor.ptData[0].snoSpecifiedWorld.name;
    // if (id.includes("Prologue")) {
    //   return;
    // }
    const isCellar =
      !stringId.startsWith("DGN_") &&
      CELLAR_TYPES.includes(actor.snoActor.name);
    const isDungeon = stringId.startsWith("DGN_");
    const isSideQuestDungeon = stringId.startsWith("QST_");
    const isCampaignDungeon = stringId.startsWith("CSD");
    let id;
    if (isCellar) {
      id = "cellars";
    } else if (isDungeon) {
      id = "dungeons";
    } else if (isSideQuestDungeon) {
      id = "sideQuestDungeons";
    } else if (isCampaignDungeon) {
      id = "campaignDungeons";
    }

    id += `:${stringId}@${point[0]},${point[1]}`;

    let aspectId = null;
    const rewardName = actor.ptData[0].unk_4908570?.name;
    if (rewardName) {
      const trackedReward = JSON.parse(
        readFileSync(`../json/base/meta/TrackedReward/${rewardName}.trd.json`)
      );
      const aspect = trackedReward.snoAspect;
      aspectId = aspect.name.replace("Asp_", "");
    }

    let hasTerms = false;
    LOCALES.forEach((locale) => {
      const worldTerms = readTerms(`World_${stringId}`, locale);
      if (worldTerms.length > 0) {
        hasTerms = true;
        const name = worldTerms
          .find((term) => term.szLabel === "Name")
          .szText.trim();
        const description = worldTerms.find(
          (term) => term.szLabel === "Desc"
        )?.szText;
        if (isCellar) {
          cellarsDict[locale][id] = {
            name,
            description,
          };
        } else {
          if (isDungeon) {
            dungeonsDict[locale][id] = {
              name,
              description,
            };
          } else if (isSideQuestDungeon) {
            sideQuestDungeonsDict[locale][id] = {
              name,
              description,
            };
          } else if (isCampaignDungeon) {
            campaignDungeonsDict[locale][id] = {
              name,
              description,
            };
          }
        }
      }
      if (aspectId) {
        const aspectTerms = readTerms(
          `Affix_${aspectId.toLowerCase()}`,
          locale
        );
        aspectsDict[locale][aspectId] = {
          name: aspectTerms.find((term) => term.szLabel === "Name").szText,
        };
      }
      // aspectsDict[locale][`${aspectId}_description`] = aspectTerms[1];
    });
    if (!hasTerms) {
      console.log("No terms for", stringId);
      return;
    }

    const node = {
      id: id,
      x: point[0],
      y: point[1],
    };
    if (aspectId) {
      node.aspectId = aspectId;
      let className = "";
      if (aspectId.includes("Barb")) {
        className = "Barbarian";
      } else if (aspectId.includes("Druid")) {
        className = "Druid";
      } else if (aspectId.includes("Necro")) {
        className = "Necromancer";
      } else if (aspectId.includes("Sorc")) {
        className = "Sorcerer";
      } else if (aspectId.includes("Rogue")) {
        className = "Rogue";
      } else if (aspectId.includes("Generic")) {
        className = "Generic";
      }
      node.className = className;
    }

    if (isCellar) {
      cellars.push(node);
    } else {
      if (stringId.startsWith("DGN_")) {
        if (!dungeons.some((d) => d.x === node.x && d.y === node.y)) {
          dungeons.push(node);
        }
      } else if (stringId.startsWith("QST_")) {
        if (!sideQuestDungeons.some((d) => d.x === node.x && d.y === node.y)) {
          sideQuestDungeons.push(node);
        }
      } else if (stringId.startsWith("CSD")) {
        if (!campaignDungeons.some((d) => d.x === node.x && d.y === node.y)) {
          campaignDungeons.push(node);
        }
      } else {
        console.log("Unknown dungeon type", stringId);
      }
    }
  });

  return {
    dungeons: {
      nodes: dungeons,
      dict: dungeonsDict,
    },
    sideQuestDungeons: {
      nodes: sideQuestDungeons,
      dict: sideQuestDungeonsDict,
    },
    campaignDungeons: {
      nodes: campaignDungeons,
      dict: campaignDungeonsDict,
    },
    cellars: {
      nodes: cellars,
      dict: cellarsDict,
    },
    aspects: {
      dict: aspectsDict,
    },
  };
};
