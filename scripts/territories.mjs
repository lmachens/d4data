import continent from "../json/base/meta/World/Sanctuary_Eastern_Continent.wrl.json" assert { type: "json" };
import { normalizePoint } from "./lib.mjs";
import { readFileSync, writeFileSync } from "./fs.mjs";
import { LOCALES, readTerm } from "./i18n.mjs";

export default () => {
  const terms = LOCALES.reduce((acc, locale) => {
    acc[locale] = {};
    return acc;
  }, {});

  const territories = continent.unk_675bda3.map((camp) => {
    LOCALES.forEach((locale) => {
      const term = readTerm(`Territory_${camp.snoTerritory.name}`, locale);
      terms[locale][camp.snoTerritory.name] = term;
    });
    const territory = {
      id: camp.snoTerritory.name,
      points: camp.arPoints.map((vector) => normalizePoint(vector)),
    };

    const parts = camp.snoTerritory.name.split("_");
    parts[0] = parts[0].slice(0, 4);
    const filename = `../json/base/meta/Subzone/${parts.join("_")}.sbz.json`;
    try {
      const subzone = JSON.parse(readFileSync(filename));
      if (subzone) {
        const { nLevelScalingMin, nLevelScalingMax } = subzone.unk_496a122;
        territory.levelMin = nLevelScalingMin;
        territory.levelMax = nLevelScalingMax;
      }
    } catch (err) {
      console.log(filename);
    }
    return territory;
  });

  const production = territories.map((territory) => ({
    ...territory,
    points: territory.points.map((point) => [point[0] / 1.65, point[1] / 1.65]),
  }));

  return {
    nodes: production,
    dict: terms,
  };
};
