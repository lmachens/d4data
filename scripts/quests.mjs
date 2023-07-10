import { readFileSync, readdirSync, writeFileSync } from "./fs.mjs";
import { readTerms } from "./i18n.mjs";
import { normalizePoint } from "./lib.mjs";

const sideQuests = [];
const campaignQuests = [];
const bounties = [];
readdirSync("../json/base/meta/Quest").forEach((fileName) => {
  if (fileName.endsWith(".qst.json") === false) {
    return;
  }
  const markerSet = JSON.parse(
    readFileSync("../json/base/meta/Quest/" + fileName)
  );
  const id = fileName.replace(".qst.json", "");
  if (id.includes("_Template_") || id.includes("_Test_")) {
    return;
  }

  let point;
  if (markerSet.unk_ff5c704.x === 0 && markerSet.unk_ff5c704.y === 0) {
    point = normalizePoint(markerSet.vecStartLocation);
  } else {
    point = normalizePoint(markerSet.unk_ff5c704);
  }
  const terms = readTerms(`Quest_${id}`, "enUS");
  const name = terms.find((term) => term.szLabel === "Name");
  const toast =
    terms.find((term) => term.szLabel === "Toast") ||
    terms.find((term) => term.szLabel !== "Name");
  if (!name || !toast) {
    console.log(`Missing terms for ${id}`);
    return;
  }
  const quest = {
    id,
    x: point[0] / 1.65,
    y: point[1] / 1.65,
    name: name.szText,
    description: toast.szText,
  };
  if (id.startsWith("Bounty_")) {
    if (
      markerSet.arQuestPhases.some(
        (questPhase) => questPhase.snoReward.value === 1236629
      )
    ) {
      bounties.push(quest);
    }
  } else if (markerSet.eQuestType === 0) {
    sideQuests.push(quest);
  } else if (markerSet.eQuestType === 2) {
    campaignQuests.push(quest);
  } else {
    console.log(`Unknown quest type ${markerSet.eQuestType} for ${id}`);
  }
});

writeFileSync(
  `../out/quests.sideQuests.json`,
  JSON.stringify(
    sideQuests.sort((a, b) => a.name.localeCompare(b.name)),
    null,
    2
  )
);
writeFileSync(
  `../out/quests.campaignQuests.json`,
  JSON.stringify(
    campaignQuests.sort((a, b) => a.name.localeCompare(b.name)),
    null,
    2
  )
);
writeFileSync(
  `../out/quests.bounties.json`,
  JSON.stringify(
    bounties.sort((a, b) => a.name.localeCompare(b.name)),
    null,
    2
  )
);
console.log(
  `Processed ${sideQuests.length} side quests and ${campaignQuests.length} campaign quests and ${bounties.length} bounties.`
);
