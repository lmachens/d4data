import { readFileSync, readdirSync, writeFileSync } from "./fs.mjs";
import { LOCALES, readTerm } from "./i18n.mjs";
import { normalizePoint } from "./lib.mjs";

const spawnNodes = [];
const terms = LOCALES.reduce((acc, locale) => {
  acc[locale] = {
    zones: {},
    nodes: {},
  };
  return acc;
}, {});

readdirSync("../json/base/meta/MarkerSet").forEach((fileName) => {
  if (fileName.endsWith("(UberSubzone).mrk.json") === false) {
    return;
  }
  const markerSet = JSON.parse(
    readFileSync("../json/base/meta/MarkerSet/" + fileName)
  );
  const id = fileName.split(" ")[0];
  LOCALES.forEach((locale) => {
    const term = readTerm(`LevelArea_${id}`, locale);
    if (term) {
      terms[locale].zones[`LevelArea_${id}`] = term;
    }
  });

  markerSet.tMarkerSet.forEach((marker) => {
    const spawnLocType = marker.ptBase[0]?.gbidSpawnLocType;
    if (!spawnLocType) {
      return;
    }
    const point = normalizePoint(marker.transform.wp);

    const node = {
      // id: id + "_" + marker.nID,
      x: point[0] / 1.65,
      y: point[1] / 1.65,
      spawnType: spawnLocType.name,
      // zone: id,
    };
    spawnNodes.push(node);
  });
});

const nodes = spawnNodes.reduce((acc, { spawnType, ...node }) => {
  if (!acc[spawnType]) {
    acc[spawnType] = [];
  }
  acc[spawnType].push(node);
  return acc;
}, {});

Object.entries(nodes).forEach(([spawnType, nodes]) => {
  writeFileSync(
    `../out/spawn_${spawnType}.json`,
    JSON.stringify(nodes, null, 2)
  );
});
writeFileSync("../out/spawnNodes.terms.json", JSON.stringify(terms, null, 2));

console.log("spawnNodes", spawnNodes.length);
