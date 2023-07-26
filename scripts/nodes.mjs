import { readFileSync, readdirSync, writeFileSync } from "./fs.mjs";
import { LOCALES, readTerm } from "./i18n.mjs";
import { normalizePoint } from "./lib.mjs";

const markerSets = [];
const actors = [];
const worlds = [];

// const nodes = markers.ptContent[0].arGlobalMarkerActors.map((marker) => {
//   const point = normalizePoint(marker.tWorldTransform.wp);

//   if (
//     markerSets.some(
//       (markerSet) => markerSet.id === marker.snoMarkerSet.value
//     ) === false
//   ) {
//     markerSets.push({
//       id: marker.snoMarkerSet.value,
//       name: marker.snoMarkerSet.name,
//     });
//   }
//   if (actors.some((actor) => actor.id === marker.snoActor.value) === false) {
//     actors.push({
//       id: marker.snoActor.value,
//       name: marker.snoActor.name || "Unknown",
//     });
//   }

//   if (worlds.some((world) => world.id === marker.snoWorld.value) === false) {
//     worlds.push({
//       id: marker.snoWorld.value,
//       name: marker.snoWorld.name || "Unknown",
//     });
//   }

//   return {
//     id: marker.unk_770f3b7,
//     name: marker.snoMarkerSet.name,
//     point,
//     actor: marker.snoActor.name || "Unknown",
//     world: marker.snoWorld.name || "Unknown",
//   };
// });

const nodes = [];
const spawnNodes = [];
const terms = LOCALES.reduce((acc, locale) => {
  acc[locale] = {
    zones: {},
    markers: {},
    spawnMarkers: {},
  };
  return acc;
}, {});

readdirSync("../json/base/meta/MarkerSet").forEach((fileName) => {
  if (fileName.endsWith(".json") === false) {
    return;
  }
  const markerSet = JSON.parse(
    readFileSync("../json/base/meta/MarkerSet/" + fileName)
  );
  const id = fileName.split(" ")[0];
  if (markerSet.__type__ === "MarkerSetDefinition") {
    LOCALES.forEach((locale) => {
      const term = readTerm(`LevelArea_${id}`, locale);
      if (term) {
        terms[locale].zones[`LevelArea_${id}`] = term;
      }
    });
  }

  markerSet.tMarkerSet.forEach((marker) => {
    const spawnLocType = marker.ptBase[0]?.gbidSpawnLocType;

    const point = normalizePoint(marker.transform.wp);
    if (!marker.snoname) {
      return;
    }
    const stringId = `${marker.snoname.groupName}_${marker.snoname.name}`;
    try {
      LOCALES.forEach((locale) => {
        const term = readTerm(stringId, locale);
        if (!term) {
          return;
        }
        if (spawnLocType) {
          terms[locale].spawnMarkers[stringId] = term;
        } else {
          terms[locale].markers[stringId] = term;
        }
      });
    } catch (e) {
      //
    }
    const node = {
      id: spawnLocType ? marker.dwHash : stringId,
      point,
      actor: marker.snoname.name,
      zone: id,
    };

    if (spawnLocType) {
      node.spawnType = spawnLocType.name;
      spawnNodes.push(node);
    } else {
      nodes.push(node);
    }
  });
});
const sanctuaryNodes = nodes.filter((node) => node.worldId === 69068);
const lilithShrines = nodes.filter((node) =>
  node.actor?.startsWith("LilithShrine")
);

writeFileSync(
  "../out/sanctuaryNodes.json",
  JSON.stringify(sanctuaryNodes, null, 2)
);
writeFileSync(
  "../out/lilithShrines.json",
  JSON.stringify(lilithShrines, null, 2)
);
writeFileSync("../out/nodes.json", JSON.stringify(nodes, null, 2));
writeFileSync("../out/spawnNodes.json", JSON.stringify(spawnNodes, null, 2));
writeFileSync("../out/markerSets.json", JSON.stringify(markerSets, null, 2));
writeFileSync("../out/actors.json", JSON.stringify(actors, null, 2));
writeFileSync("../out/worlds.json", JSON.stringify(worlds, null, 2));

writeFileSync("../out/nodes.terms.json", JSON.stringify(terms, null, 2));

console.log("sanctuaryNodes", sanctuaryNodes.length);
console.log("lilithShrines", lilithShrines.length);
console.log("nodes", nodes.length);
console.log("markerSets", markerSets.length);
console.log("actors", actors.length);
console.log("worlds", worlds.length);
