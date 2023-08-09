import { readFileSync, readdirSync, writeFileSync } from "./fs.mjs";
import { LOCALES, readTerm } from "./i18n.mjs";
import { normalizePoint } from "./lib.mjs";

const nodes = [];
readdirSync("../json/base/meta/MarkerSet").forEach((fileName) => {
  if (fileName.endsWith(".json") === false) {
    return;
  }
  const markerSet = JSON.parse(
    readFileSync("../json/base/meta/MarkerSet/" + fileName)
  );
  markerSet.tMarkerSet.forEach((marker) => {
    if (!marker.snoname) {
      return;
    }
    const point = normalizePoint(marker.transform.wp);
    const id = marker.dwHash.toString();
    const stringId = `${marker.snoname.groupName}_${marker.snoname.name}`;
    const term = readTerm(stringId, LOCALES[0])?.szText;
    const node = {
      name: `${stringId}-${id}`,
      // fileName: "../json/base/meta/MarkerSet/" + fileName,
      snoName: marker.snoname.name,
      term,
      x: point[0] / 1.65,
      y: point[1] / 1.65,
    };
    nodes.push(node);
  });
});

function isNearNode(node, other) {
  const dx = node.x - other.x;
  const dy = node.y - other.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < 5;
}

const filtered = nodes.filter((node) => {
  return isNearNode(node, { x: -78.25262571314818, y: 46.273008483273294 });
});
const names = filtered.reduce((acc, node) => {
  acc[node.snoName] = acc[node.snoName] ? acc[node.snoName] + 1 : 1;
  return acc;
}, {});

console.log(names);
writeFileSync("../out/markerSets.json", JSON.stringify(filtered, null, 2));
