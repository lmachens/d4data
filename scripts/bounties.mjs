import bounties from "../json/base/meta/Global/bounties.glo.json" assert { type: "json" };
import { readFileSync } from "./fs.mjs";
import { LOCALES, readTerms } from "./i18n.mjs";
import { normalizePoint } from "./lib.mjs";

export default () => {
  const dict = LOCALES.reduce((acc, locale) => {
    acc[locale] = {};
    return acc;
  }, {});

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
  [
    ...bounties.ptContent[0].arBountyZones,
    ...bounties.ptContent[0].unk_1ecd814,
  ].forEach((bountyZone) => {
    bountyZone.arBounties.forEach((bounty) => {
      const isHelltide = HELLTIDE_WORLD_STATES.some((worldState) =>
        bounty.snoWorldState.name.startsWith(worldState)
      );
      const [, , , zone, subzone] = bounty.snoWorldState.name.split("_");
      const stringId = bounty.snoQuest.name;
      const quest = JSON.parse(
        readFileSync("../json/base/meta/Quest/" + stringId + ".qst.json")
      );
      const point = normalizePoint(quest.vecStartLocation);
      const id = `events:${bounty.snoQuest.name}@${point[0]},${point[1]}`;
      let hasTerms = false;
      LOCALES.forEach((locale) => {
        const terms = readTerms(`Quest_${stringId}`, locale);
        const name =
          terms
            .find((term) => term.szLabel === "Name")
            ?.szText.replace("{c_red}", "")
            .replace("{/c}", "") || dict.enUS[id].name;
        const description =
          terms.find((term) => term.szLabel === "Toast")?.szText ||
          dict.enUS[id].description;

        dict[locale][id] = {
          name,
          description,
        };
        hasTerms = true;
      });
      if (!hasTerms) {
        console.log("No terms for", id);
        return;
      }

      const event = {
        id,
        zone,
        // subzone,
        // isHelltide,
        x: point[0],
        y: point[1],
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
  return {
    nodes: bountiesEvents.sort((a, b) => a.zone.localeCompare(b.zone)),
    dict,
  };
};
