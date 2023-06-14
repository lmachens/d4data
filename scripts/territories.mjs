import continent from "../json/base/meta/World/Sanctuary_Eastern_Continent.wrl.json" assert { type: "json" };
import { normalizePoint } from "./lib.mjs";
import { readFileSync, writeFileSync } from "./fs.mjs";
import { addTerms } from "./i18n.mjs";

const terms = {};
const territories = continent.unk_675bda3.value.map((camp) => {
  const stringList = JSON.parse(
    readFileSync(
      `../json/enUS_Text/meta/StringList/Territory_${camp.snoTerritory.name}.stl.json`
    )
  );

  terms[camp.snoTerritory.name] = stringList.arStrings[0].szText;

  return {
    id: camp.snoTerritory.name,
    points: camp.arPoints.value.map((vector) => normalizePoint(vector.value)),
  };
});

writeFileSync("../out/territories.json", JSON.stringify(territories, null, 2));
writeFileSync(
  "../out/territories_old.json",
  JSON.stringify(
    territories.map((territory) => ({
      ...territory,
      points: territory.points.map((point) => [
        point[0] / 1.65,
        point[1] / 1.65,
      ]),
    })),
    null,
    2
  )
);

addTerms(
  {
    territories: terms,
  },
  "en"
);
console.log("done", territories.length);
