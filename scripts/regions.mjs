import fs from "fs";
import continent from "../json/base/meta/World/Sanctuary_Eastern_Continent.wrl.json" assert { type: "json" };
import { normalizePoint } from "./lib.mjs";

const camps = continent.unk_675bda3.map((camp) => {
  // return camp.arPoints;
  return camp.arPoints.map(normalizePoint);
  // return {
  //   name: camp.snoTerritory.value.toString(),
  //   parent: null,
  //   coordinates: camp.arPoints.map(normalizePoint),
  // };
});

fs.writeFileSync("out/camps.json", JSON.stringify(camps, null, 2));
console.log("done", camps.length);
