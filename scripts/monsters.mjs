import { readFileSync, readdirSync, writeFileSync } from "./fs.mjs";
import { LOCALES, readTerm } from "./i18n.mjs";
import { normalizePoint } from "./lib.mjs";

const dict = LOCALES.reduce((acc, locale) => {
  acc[locale] = {};
  return acc;
}, {});

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
    // const id = marker.dwHash.toString();

    let hasTerms = false;
    LOCALES.forEach((locale) => {
      const term = readTerm(stringId, locale);
      if (term) {
        if (!dict[locale][family]) {
          dict[locale][family] = {};
        }

        dict[locale][family][stringId] = term.szText;
        hasTerms = true;
      }
    });
    if (!hasTerms) {
      // console.log("No terms for", id);
      return;
    }

    const point = normalizePoint(marker.transform.wp);
    let type;
    if (snoNameName.includes("boss")) {
      type = "boss";
    } else {
      type = snoNameName.split("_")[1];
    }
    const node = {
      id: stringId,
      type,
      family,
      x: point[0] / 1.65,
      y: point[1] / 1.65,
    };
    if (
      nodes.some(
        (n) => n.stringId === node.stringId && n.x === node.x && n.y === node.y
      )
    ) {
      return;
    }
    nodes.push(node);
  });
});

const grouped = nodes.reduce((acc, { family, ...node }) => {
  if (!acc[family]) {
    acc[family] = [];
  }
  acc[family].push(node);
  return acc;
}, {});

const result = {
  nodes: {},
  dict,
};
Object.entries(grouped).map(([family, nodes]) => {
  const prod = nodes.map((node) => {
    return {
      id: node.id,
      x: node.x,
      y: node.y,
    };
  });
  result.nodes[family] = prod;
});

export default result;
