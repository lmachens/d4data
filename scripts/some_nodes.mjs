import nodes from "../out/nodes.json" assert { type: "json" };
import { writeFileSync } from "./fs.mjs";
import { toCamelCase } from "./lib.mjs";
import en from "../out/en.json" assert { type: "json" };
import de from "../out/de.json" assert { type: "json" };

// const lilithShrines = nodes.filter((node) =>
//   node.actor?.startsWith("LilithShrine")
// );

// writeFileSync(
//   "../out/lilithShrines.json",
//   JSON.stringify(lilithShrines, null, 2)
// );
// console.log("lilithShrines", lilithShrines.length);

const healers = [];
const stableMasters = [];
const jewelers = [];
const alchemists = [];
const occultists = [];

let services = nodes
  .filter((node) => node.actor?.startsWith("TWN") && node.name !== "Unknown")
  .map((node) => {
    // TWN_Frac_Nevesk_Service_Healer
    const matched = node.actor.match(/TWN_(?<name>.*)_(?<type>.*)_(?<role>.*)/);
    return {
      ...node,
      type: matched?.groups?.type,
      role: matched?.groups?.role,
    };
  })
  .filter(
    (node, index, self) =>
      index ===
      self.findIndex(
        (t) =>
          t.id === node.id &&
          t.type === node.type &&
          t.point[0] === node.point[0] &&
          t.point[1] === node.point[1]
      )
  );

// .filter((node) => node.type === "Service");
const enTerms = {};
const deTerms = {};
services.forEach((node) => {
  const result = {
    id: node.id,
    x: node.point[0] / 1.65,
    y: node.point[1] / 1.65,
  };
  if (node.role === "Healer") {
    healers.push(result);
  } else if (node.role === "StableMaster") {
    stableMasters.push(result);
  } else if (node.role === "Jeweler") {
    jewelers.push(result);
  } else if (node.role === "Alchemist") {
    alchemists.push(result);
  } else if (node.role === "Occultist") {
    occultists.push(result);
  } else {
    return;
  }
  enTerms[node.id] = en.nodes[node.id] || "Unknown";
  deTerms[node.id] = de.nodes[node.id] || "Unknown";
});

// console.log(new Set(services.map((node) => node.role)));

writeFileSync("../out/services.json", JSON.stringify(services, null, 2));
writeFileSync("../out/healers.json", JSON.stringify(healers, null, 2));
writeFileSync("../out/jewelers.json", JSON.stringify(jewelers, null, 2));
writeFileSync("../out/alchemists.json", JSON.stringify(alchemists, null, 2));
writeFileSync("../out/occultists.json", JSON.stringify(occultists, null, 2));
writeFileSync("../out/en.some-nodes.json", JSON.stringify(enTerms, null, 2));
writeFileSync("../out/de.some-nodes.json", JSON.stringify(enTerms, null, 2));
writeFileSync(
  "../out/stableMasters.json",
  JSON.stringify(stableMasters, null, 2)
);
console.log("services", services.length);
