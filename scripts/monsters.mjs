import { readFileSync, readdirSync, writeFileSync } from "./fs.mjs";
import { LOCALES, readTerm } from "./i18n.mjs";
import { normalizePoint } from "./lib.mjs";

const families = [
  "Bandit",
  "Cannibal",
  "Cultists",
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
    if (
      !snoNameName ||
      !families.some((family) => `${snoNameName}_`.startsWith(family)) ||
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
      family: families.find((family) => snoNameName.startsWith(family)),
      x: point[0] / 1.65,
      y: point[1] / 1.65,
    };
    nodes.push(node);
  });
});

const names = nodes.reduce((acc, node) => {
  acc[node.snoName] = acc[node.snoName] ? acc[node.snoName] + 1 : 1;
  return acc;
}, {});

console.log(names);

const prod = nodes.map((node) => {
  return {
    name: node.term,
    type: node.type,
    family: node.family,
    x: node.x,
    y: node.y,
  };
});
writeFileSync("../out/monsters.prod.json", JSON.stringify(prod, null, 2));

writeFileSync("../out/monsters.json", JSON.stringify(nodes, null, 2));
