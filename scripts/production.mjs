import getAltars from "./altarsOfLilith.mjs";
import getBounties from "./bounties.mjs";
import getDungeons from "./dungeons.mjs";
import getMonsters from "./monsters.mjs";
import getSpawnNodes from "./spawn_nodes.mjs";
import getQuests from "./quests.mjs";
import getServices from "./services.mjs";
import getStrongholds from "./strongholds.mjs";
import getTerritories from "./territories.mjs";

import { writeFileSync } from "./fs.mjs";
import { LOCALES } from "./i18n.mjs";
import { toCamelCase } from "./lib.mjs";

const SCRIPT = process.argv[2];
console.log(`Running ${SCRIPT ?? "all"} script`);
const EMPTY = {
  nodes: [],
  dict: LOCALES.reduce((acc, locale) => {
    acc[locale] = {};
    return acc;
  }, {}),
};
const altars = !SCRIPT || SCRIPT === "altars" ? getAltars() : EMPTY;
const bounties = !SCRIPT || SCRIPT === "bounties" ? getBounties() : EMPTY;
const dungeons =
  !SCRIPT || SCRIPT === "dungeons"
    ? getDungeons()
    : {
        dungeons: EMPTY,
        sideQuestDungeons: EMPTY,
        campaignDungeons: EMPTY,
        cellars: EMPTY,
        aspects: EMPTY,
      };
const monsters = !SCRIPT || SCRIPT === "monsters" ? getMonsters() : EMPTY;
const spawnNodes =
  !SCRIPT || SCRIPT === "spawn_nodes" ? getSpawnNodes() : EMPTY;
const quests = !SCRIPT || SCRIPT === "quests" ? getQuests() : EMPTY;
const services = !SCRIPT || SCRIPT === "services" ? getServices() : EMPTY;
const strongholds =
  !SCRIPT || SCRIPT === "strongholds" ? getStrongholds() : EMPTY;
const territories =
  !SCRIPT || SCRIPT === "territories" ? getTerritories() : EMPTY;

writeFileSync(
  `../out/nodes/altars.ts`,
  `export const altars = ${JSON.stringify(altars.nodes, null, 2)};`
);

writeFileSync(
  `../out/nodes/events.ts`,
  `export const events = ${JSON.stringify(bounties.nodes, null, 2)};`
);
writeFileSync(
  `../out/nodes/dungeons.ts`,
  `export const dungeons = ${JSON.stringify(dungeons.dungeons.nodes, null, 2)};`
);
writeFileSync(
  `../out/nodes/sideQuestDungeons.ts`,
  `export const sideQuestDungeons = ${JSON.stringify(
    dungeons.sideQuestDungeons.nodes,
    null,
    2
  )};`
);
writeFileSync(
  `../out/nodes/campaignDungeons.ts`,
  `export const campaignDungeons = ${JSON.stringify(
    dungeons.campaignDungeons.nodes,
    null,
    2
  )};`
);
writeFileSync(
  `../out/nodes/cellars.ts`,
  `export const cellars = ${JSON.stringify(dungeons.cellars.nodes, null, 2)};`
);
Object.entries(monsters.nodes).forEach(([key, value]) => {
  writeFileSync(
    `../out/nodes/monsters_${key}.ts`,
    `export const ${key}Monsters = ${JSON.stringify(value, null, 2)};`
  );
});
writeFileSync(
  `../out/nodes/campaignQuests.ts`,
  `export const campaignQuests = ${JSON.stringify(
    quests.campaignQuests.nodes,
    null,
    2
  )};`
);
writeFileSync(
  `../out/nodes/events.ts`,
  `export const events = ${JSON.stringify(quests.bounties.nodes, null, 2)};`
);
writeFileSync(
  `../out/nodes/sideQuests.ts`,
  `export const sideQuests = ${JSON.stringify(
    quests.sideQuests.nodes,
    null,
    2
  )};`
);

Object.entries(spawnNodes.nodes).forEach(([key, value]) => {
  const name = toCamelCase(key);
  writeFileSync(
    `../out/nodes/${name}.ts`,
    `export const ${name} = ${JSON.stringify(value, null, 2)};`
  );
});
writeFileSync(
  `../out/nodes/strongholds.ts`,
  `export const strongholds = ${JSON.stringify(strongholds.nodes, null, 2)};`
);
writeFileSync(
  `../out/territories.ts`,
  `export const territories = ${JSON.stringify(territories.nodes, null, 2)};`
);
Object.entries(services.nodes).forEach(([key, value]) => {
  writeFileSync(
    `../out/nodes/${key}.ts`,
    `export const ${key} = ${JSON.stringify(value, null, 2)};`
  );
});

LOCALES.forEach((locale) => {
  const dict = {
    altars: altars.dict[locale],
    events: bounties.dict[locale],
    dungeons: dungeons.dungeons.dict[locale],
    sideQuestDungeons: dungeons.sideQuestDungeons.dict[locale],
    campaignDungeons: dungeons.campaignDungeons.dict[locale],
    cellars: dungeons.cellars.dict[locale],
    aspects: dungeons.aspects.dict[locale],
    territories: territories.dict[locale],
    campaignQuests: quests.campaignQuests.dict[locale],
    events: quests.bounties.dict[locale],
    sideQuests: quests.sideQuests.dict[locale],
  };
  Object.entries(monsters.dict[locale]).forEach(([key, value]) => {
    dict[`monsters_${key}`] = value;
  });
  Object.entries(services.dict[locale]).forEach(([key, value]) => {
    dict[key] = value;
  });

  writeFileSync(
    `../out/dictionaries/${locale.slice(0, 2)}.json`,
    JSON.stringify(dict, null, 2)
  );
});
