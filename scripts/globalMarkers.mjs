import globalMarkers from "../json/base/meta/Global/global_markers.glo.json" assert { type: "json" };
import { writeFileSync } from "./fs.mjs";
import { normalizePoint } from "./lib.mjs";

const names = {};
const nodes = [];
globalMarkers.ptContent[0].arGlobalMarkerActors.forEach((actor) => {
  names[actor.snoActor.name] = names[actor.snoActor.name]
    ? names[actor.snoActor.name] + 1
    : 1;

  const point = normalizePoint(actor.tWorldTransform.wp);
  const id = actor.szMarkerName.toString();

  const node = {
    name: id,
    x: point[0] / 1.65,
    y: point[1] / 1.65,
  };
  nodes.push(node);
});

console.log(names);

writeFileSync("../out/globalMarkers.json", JSON.stringify(nodes, null, 2));
