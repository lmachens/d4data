import { readFileSync, readdirSync, writeFileSync } from "./fs.mjs";
import { LOCALES, readTerm } from "./i18n.mjs";
import { normalizePoint } from "./lib.mjs";

const families = [
  "Bandit",
  "Cannibal",
  "Cultist",
  "Demon",
  "Drown",
  "Fallen",
  "Ghost",
  "Goatman",
  "Knight",
  "Skeleton",
  "Snake",
  "Spider",
  "Vampire",
  "Werewolf",
  "Wildlife",
  "Zombie",
].map((family) => family.toLowerCase());
const skippable = [
  "Arrangement",
  "Chest",
  "Cluster",
  "Collection",
  "Intro",
  "prologue",
  "Wall",
].map((skip) => skip.toLowerCase());
const nodes = [];
readdirSync("../json/base/meta/MarkerSet").forEach((fileName) => {
  if (fileName.endsWith(".json") === false) {
    return;
  }
  const markerSet = JSON.parse(
    readFileSync("../json/base/meta/MarkerSet/" + fileName)
  );
  markerSet.tMarkerSet.forEach((marker) => {
    const snoNameName = marker.snoname?.name?.toLowerCase();
    const family = families.find((family) =>
      `${snoNameName}_`.startsWith(family)
    );
    if (
      !snoNameName ||
      !family ||
      skippable.some((skip) => snoNameName.includes(skip))
    ) {
      return;
    }
    const stringId = `${marker.snoname.groupName}_${marker.snoname.name}`;
    const term = readTerm(stringId, LOCALES[0])?.szText;
    if (!term) {
      return;
    }
    const point = normalizePoint(marker.transform.wp);
    const id = marker.dwHash.toString();
    let type;
    if (snoNameName.includes("boss")) {
      type = "boss";
    } else {
      type = snoNameName.split("_")[1];
    }
    const node = {
      name: `${stringId}-${id}`,
      snoName: snoNameName,
      term,
      type,
      family,
      x: point[0] / 1.65,
      y: point[1] / 1.65,
    };
    if (
      nodes.some(
        (n) => n.term === node.term && n.x === node.x && n.y === node.y
      )
    ) {
      return;
    }
    nodes.push(node);
  });
});

// const names = nodes.reduce((acc, node) => {
//   acc[node.snoName] = acc[node.snoName] ? acc[node.snoName] + 1 : 1;
//   return acc;
// }, {});

// console.log(names);

const grouped = nodes.reduce((acc, { family, ...node }) => {
  if (!acc[family]) {
    acc[family] = [];
  }
  acc[family].push(node);
  return acc;
}, {});

Object.entries(grouped).forEach(([family, nodes]) => {
  const prod = nodes.map((node) => {
    return {
      name: node.term,
      x: node.x,
      y: node.y,
    };
  });

  writeFileSync(
    `../out/monsters_${family}.ts`,
    `export const ${family}Monsters = ${JSON.stringify(prod, null, 2)};`
  );
  console.log(family, prod.length);
});

writeFileSync("../out/monsters.json", JSON.stringify(nodes, null, 2));
