import { LOCALES, readTerm } from "./i18n.mjs";
import { normalizePoint, toCamelCase } from "./lib.mjs";
import { readFileSync, readdirSync } from "./fs.mjs";

export default () => {
  const dict = LOCALES.reduce((acc, locale) => {
    acc[locale] = {};
    return acc;
  }, {});

  const healers = [];
  const stableMasters = [];
  const jewelers = [];
  const alchemists = [];
  const occultists = [];

  const nodes = [];
  readdirSync("../json/base/meta/MarkerSet").forEach((fileName) => {
    if (fileName.endsWith(".json") === false) {
      return;
    }
    const markerSet = JSON.parse(
      readFileSync("../json/base/meta/MarkerSet/" + fileName)
    );
    markerSet.tMarkerSet.forEach((marker) => {
      if (!marker.snoname?.name?.startsWith("TWN")) {
        return;
      }
      const point = normalizePoint(marker.transform.wp);
      const id = fileName.split(" ")[0];
      const stringId = `${marker.snoname.groupName}_${marker.snoname.name}`;
      const node = {
        id: id,
        x: point[0] / 1.65,
        y: point[1] / 1.65,
      };

      // TWN_Frac_Nevesk_Service_Healer
      const matched = marker.snoname.name.match(
        /TWN_(?<name>.*)_(?<type>.*)_(?<role>.*)/
      );
      const type = matched?.groups?.type;
      const role = matched?.groups?.role;

      let hasTerms = false;
      LOCALES.forEach((locale) => {
        const term = readTerm(stringId, locale);
        if (term && role) {
          const camelCaseRole = toCamelCase(role);
          if (!dict[locale][camelCaseRole]) {
            dict[locale][camelCaseRole] = {};
          }
          dict[locale][camelCaseRole][id] = {
            name: term.szText,
          };

          hasTerms = true;
        }
      });
      if (!hasTerms) {
        return;
      }

      if (
        nodes.some(
          (t) =>
            t.id === node.id &&
            // t.type === node.type &&
            t.x === node.x &&
            t.y === node.y
        )
      ) {
        return;
      }
      nodes.push(node);

      if (role === "Healer") {
        healers.push(node);
      } else if (role === "StableMaster") {
        stableMasters.push(node);
      } else if (role === "Jeweler") {
        jewelers.push(node);
      } else if (role === "Alchemist") {
        alchemists.push(node);
      } else if (role === "Occultist") {
        occultists.push(node);
      } else {
        return;
      }
    });
  });

  return {
    nodes: {
      healers,
      stableMasters,
      jewelers,
      alchemists,
      occultists,
    },
    dict,
  };
};
