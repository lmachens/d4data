import { readFileSync, readdirSync, writeFileSync } from "./fs.mjs";
import { LOCALES, readTerm } from "./i18n.mjs";
import { normalizePoint } from "./lib.mjs";

export default () => {
  const spawnNodes = [];
  const dict = LOCALES.reduce((acc, locale) => {
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
        dict[locale].zones[`LevelArea_${id}`] = term;
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
        spawnType: spawnLocType.name.replace("UberSubzone_", ""),
      };
      if (spawnLocType.name.includes("Chest_t3")) {
        const [zone, subzone] = id.split("_");
        node.zone = zone;
        node.subzone = subzone;
      }
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

  return {
    nodes,
    // dict,
  };
};
