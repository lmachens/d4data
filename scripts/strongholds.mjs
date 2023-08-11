import { readFileSync, readdirSync } from "./fs.mjs";
import { normalizePoint } from "./lib.mjs";

export default () => {
  const nodes = [];
  readdirSync("../json/base/meta/MarkerSet").forEach((fileName) => {
    if (fileName.endsWith(".json") === false) {
      return;
    }
    if (fileName.includes("Private")) {
      return;
    }
    const markerSet = JSON.parse(
      readFileSync("../json/base/meta/MarkerSet/" + fileName)
    );
    markerSet.tMarkerSet.forEach((marker) => {
      if (!marker.snoname?.name?.includes("CampIcon")) {
        return;
      }
      const point = normalizePoint(marker.transform.wp);
      const node = {
        id: `strongholds:${fileName.split(" ")[0]}@${point[0]},${point[1]}`,
        x: point[0],
        y: point[1],
      };
      nodes.push(node);
    });
  });

  return {
    nodes,
  };
};
