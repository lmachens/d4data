import bounties from "../json/base/meta/Global/bounties.glo.json" assert { type: "json" };
import { readFileSync, writeFileSync } from "./fs.mjs";
import { readTerms } from "./i18n.mjs";
import { normalizePoint } from "./lib.mjs";

const HELLTIDE_WORLD_STATES = [
  "Bounty_LE_Tier1_Frac_Tundra",
  "Bounty_LE_Tier1_Scos_Coast",
  "Bounty_LE_Tier1_Scos_DeepForest",
  "Bounty_LE_Tier1_Step_Central",
  "Bounty_LE_Tier1_Step_South",
  "Bounty_LE_Tier1_Hawe_Verge",
  "Bounty_LE_Tier1_Hawe_Wetland",
  "Bounty_LE_Tier1_Kehj_HighDesert",
  "Bounty_LE_Tier1_Kehj_LowDesert",
  "Bounty_LE_Tier1_Kehj_Oasis",
];
const bountiesEvents = [];
bounties.ptContent[0].arBountyZones.forEach((bountyZone) => {
  bountyZone.arBounties.forEach((bounty) => {
    const isHelltide = HELLTIDE_WORLD_STATES.some((worldState) =>
      bounty.snoWorldState.name.startsWith(worldState)
    );
    const [, , , zone, subzone] = bounty.snoWorldState.name.split("_");
    const terms = readTerms(`Quest_${bounty.snoQuest.name}`);
    const name = terms
      .find((term) => term.szLabel === "Name")
      .szText.replace("{c_red}", "")
      .replace("{/c}", "");
    const description = terms.find((term) => term.szLabel === "Toast").szText;

    const quest = JSON.parse(
      readFileSync(
        "../json/base/meta/Quest/" + bounty.snoQuest.name + ".qst.json"
      )
    );
    const position = normalizePoint(quest.vecStartLocation);
    const event = {
      // id: bounty.snoQuest.name,
      name,
      description,
      zone,
      // subzone,
      // isHelltide,
      x: position[0] / 1.65,
      y: position[1] / 1.65,
    };
    if (
      !bountiesEvents.some(
        (bounty) =>
          bounty.name === event.name &&
          bounty.x === event.x &&
          bounty.y === event.y
      )
    ) {
      bountiesEvents.push(event);
    }
  });
});

writeFileSync(
  `../out/bounties.json`,
  JSON.stringify(
    bountiesEvents.sort((a, b) => a.zone.localeCompare(b.zone)),
    null,
    2
  )
);
console.log(`Processed ${bountiesEvents.length} bountiesEvents`);
