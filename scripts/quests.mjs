import { readFileSync, readdirSync, writeFileSync } from "./fs.mjs";
import { LOCALES, readTerms } from "./i18n.mjs";
import { normalizePoint } from "./lib.mjs";

export default () => {
  const sideQuests = [];
  const campaignQuests = [];
  const bounties = [];
  const sideQuestsDict = LOCALES.reduce((acc, locale) => {
    acc[locale] = {};
    return acc;
  }, {});
  const campaignQuestsDict = LOCALES.reduce((acc, locale) => {
    acc[locale] = {};
    return acc;
  }, {});
  const bountiesDict = LOCALES.reduce((acc, locale) => {
    acc[locale] = {};
    return acc;
  }, {});

  readdirSync("../json/base/meta/Quest").forEach((fileName) => {
    if (fileName.endsWith(".qst.json") === false) {
      return;
    }
    const markerSet = JSON.parse(
      readFileSync("../json/base/meta/Quest/" + fileName)
    );

    let point;
    if (
      markerSet.vecStartLocation.x !== 0 &&
      markerSet.vecStartLocation.y !== 0
    ) {
      point = normalizePoint(markerSet.vecStartLocation);
    } else if (
      markerSet.vecDevStartLocation.x !== 0 &&
      markerSet.vecDevStartLocation.y !== 0
    ) {
      point = normalizePoint(markerSet.vecDevStartLocation);
    } else {
      return;
    }
    const stringId = fileName.replace(".qst.json", "");
    const id = `quests:${stringId}@${point[0]},${point[1]}`;
    if (
      stringId.includes("_Template_") ||
      stringId.includes("_Test_") ||
      stringId.endsWith("_hidden")
    ) {
      return;
    }

    const isBounty =
      stringId.startsWith("Bounty_") &&
      markerSet.arQuestPhases.some(
        (questPhase) => questPhase.snoReward?.groupName === "TreasureClass"
      );
    const isSideQuest =
      !stringId.startsWith("Bounty_") && markerSet.eQuestType === 0;
    const isCampaignQuest =
      !stringId.startsWith("Bounty_") && markerSet.eQuestType === 2;

    let hasTerms = false;
    LOCALES.forEach((locale) => {
      const terms = readTerms(`Quest_${stringId}`, locale);
      const name = terms.find((term) => term.szLabel === "Name");
      const toast =
        terms.find((term) => term.szLabel === "Toast") ||
        terms.find((term) => term.szLabel !== "Name");
      if (name && toast) {
        hasTerms = true;
        if (isBounty) {
          bountiesDict[locale][id] = {
            name: name.szText,
            description: toast.szText,
          };
        } else if (isSideQuest) {
          sideQuestsDict[locale][id] = {
            name: name.szText,
            description: toast.szText,
          };
        } else if (isCampaignQuest) {
          campaignQuestsDict[locale][id] = {
            name: name.szText,
            description: toast.szText,
          };
        }
      }
    });

    if (!hasTerms) {
      console.log(`Missing terms for ${stringId}`);
      return;
    }

    const quest = {
      id,
      x: point[0],
      y: point[1],
    };
    if (isBounty) {
      bounties.push(quest);
    } else if (isSideQuest) {
      sideQuests.push(quest);
    } else if (isCampaignQuest) {
      campaignQuests.push(quest);
    } else {
      console.log(`Unknown quest type ${markerSet.eQuestType} for ${id}`);
    }
  });

  return {
    sideQuests: {
      nodes: sideQuests,
      dict: sideQuestsDict,
    },
    campaignQuests: {
      nodes: campaignQuests,
      dict: campaignQuestsDict,
    },
    bounties: {
      nodes: bounties,
      dict: bountiesDict,
    },
  };
};
