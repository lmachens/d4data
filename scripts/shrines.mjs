import { readFileSync, readdirSync, writeFileSync } from "./fs.mjs";
import { normalizePoint } from "./lib.mjs";

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
    if (!marker.snoname?.name?.includes("_Shrine_")) {
      return;
    }
    const point = normalizePoint(marker.transform.wp);
    const node = {
      x: point[0] / 1.65,
      y: point[1] / 1.65,
    };
    nodes.push(node);
  });
});

writeFileSync("../out/shrines.json", JSON.stringify(nodes, null, 2));
