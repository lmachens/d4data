import continent from "../json/base/meta/World/Sanctuary_Eastern_Continent.wrl.json" assert { type: "json" };
import { normalizePoint } from "./lib.mjs";
import { readFileSync } from "./fs.mjs";
import { LOCALES, readTerm } from "./i18n.mjs";

export default () => {
  const dict = LOCALES.reduce((acc, locale) => {
    acc[locale] = {};
    return acc;
  }, {});

  const territories = continent.unk_675bda3.map((camp) => {
    const stringId = camp.snoTerritory.name;
    const id = `territories:${stringId}`;
    LOCALES.forEach((locale) => {
      const term = readTerm(`Territory_${stringId}`, locale);
      dict[locale][id] = {
        name: term.szText,
      };
    });
    const territory = {
      id,
      points: camp.arPoints.map((vector) => normalizePoint(vector)),
    };

    const parts = stringId.split("_");
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

  return {
    nodes: territories,
    dict: dict,
  };
};
