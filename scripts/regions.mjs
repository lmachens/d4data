import fs from "fs";
import continent from "../json/base/meta/World/Sanctuary_Eastern_Continent.wrl.json" assert { type: "json" };

const camps = continent.unk_675bda3.map((camps) => {
  const angle = Math.PI / 4; // 45 degrees in radians

  const rotatedCoordinates = camps.arPoints.map(({ x, y }) => {
    const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
    const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
    return [-rotatedY, -rotatedX];
  });

  return {
    name: camps.snoTerritory.value.toString(),
    parent: null,
    coordinates: rotatedCoordinates,
  };
});

fs.writeFileSync("camps.json", JSON.stringify(camps));
