import { readFileSync, readdirSync } from "./fs.mjs";
import { LOCALES, readTerm } from "./i18n.mjs";
import { normalizePoint, toCamelCase } from "./lib.mjs";

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
    const stringId = fileName.split(" ")[0];
    const id = `spawnNodes$${stringId}`;
    LOCALES.forEach((locale) => {
      const term = readTerm(`LevelArea_${stringId}`, locale);
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

      const spawnType = toCamelCase(
        spawnLocType.name.replace("UberSubzone_", "")
      );
      const node = {
        id: `${spawnType}:${spawnType}@${point[0]},${point[1]}`,
        x: point[0],
        y: point[1],
        spawnType,
      };
      if (spawnLocType.name.includes("3")) {
        const [zone, subzone] = stringId.split("_");
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
