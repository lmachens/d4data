import fs from "fs";
import markers from "../json/base/meta/Global/global_markers.glo.json" assert { type: "json" };
import globals from "../json/base/meta/Global/globals.glo.json" assert { type: "json" };
import { normalizePoint } from "./lib.mjs";

const nodes = markers.ptContent[0].arGlobalMarkerActors.map((marker) => {
  const { x, y } = normalizePoint(marker.tWorldTransform.wp);
  //   const { x, y } = marker.tWorldTransform.wp;
  const data = marker.ptData[0];
  const guid = data?.dwEntranceName;
  const locationName = globals.ptContent[0].arStartLocationNames.find(
    (locationName) => locationName.uGUID === guid
  );
  return {
    x,
    y,
    name: locationName?.szName,
  };
});
fs.writeFileSync("out/nodes.json", JSON.stringify(nodes, null, 2));
console.log("done", nodes.length);
