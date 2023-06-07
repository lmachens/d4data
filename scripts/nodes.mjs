import markers from "../json/base/meta/Global/global_markers.glo.json" assert { type: "json" };
import { writeFileSync } from "./fs.mjs";
import { normalizePoint } from "./lib.mjs";

const markerSets = [];
const actors = [];
const worlds = [];

const nodes = markers.ptContent[0].arGlobalMarkerActors.map((marker) => {
  const point = normalizePoint(marker.tWorldTransform.wp);

  if (
    markerSets.some(
      (markerSet) => markerSet.id === marker.snoMarkerSet.value
    ) === false
  ) {
    markerSets.push({
      id: marker.snoMarkerSet.value,
      name: marker.snoMarkerSet.name,
    });
  }
  if (actors.some((actor) => actor.id === marker.snoActor.value) === false) {
    actors.push({
      id: marker.snoActor.value,
      name: marker.snoActor.name || "Unknown",
    });
  }

  if (worlds.some((world) => world.id === marker.snoWorld.value) === false) {
    worlds.push({
      id: marker.snoWorld.value,
      name: marker.snoWorld.name || "Unknown",
    });
  }

  return {
    id: marker.unk_770f3b7,
    name: marker.snoMarkerSet.name,
    point,
    actor: marker.snoActor.name || "Unknown",
    world: marker.snoWorld.name || "Unknown",
  };
});

const sanctuaryNodes = nodes.filter((node) => node.worldId === 69068);

writeFileSync(
  "../out/sanctuaryNodes.json",
  JSON.stringify(sanctuaryNodes, null, 2)
);
writeFileSync("../out/nodes.json", JSON.stringify(nodes, null, 2));
writeFileSync("../out/markerSets.json", JSON.stringify(markerSets, null, 2));
writeFileSync("../out/actors.json", JSON.stringify(actors, null, 2));
writeFileSync("../out/worlds.json", JSON.stringify(worlds, null, 2));
console.log("sanctuaryNodes", sanctuaryNodes.length);
console.log("nodes", nodes.length);
console.log("markerSets", markerSets.length);
console.log("actors", actors.length);
console.log("worlds", worlds.length);
