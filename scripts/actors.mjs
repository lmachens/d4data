import { readFileSync, readdirSync } from "./fs.mjs";
import { LOCALES, readTerm } from "./i18n.mjs";
import { normalizePoint, toCamelCase } from "./lib.mjs";

export default () => {
  const cows = [];
  const dict = LOCALES.reduce((acc, locale) => {
    acc[locale] = {};
    return acc;
  }, {});

  LOCALES.forEach((locale) => {
    const term = readTerm(`Actor_ambient_cow_scosglen`, locale);
    if (term) {
      dict[locale].cow = {
        name: term.szText,
      };
    }
  });

  readdirSync("../json/base/meta/MarkerSet").forEach((fileName) => {
    if (fileName.endsWith(".json") === false) {
      return;
    }
    const markerSet = JSON.parse(
      readFileSync("../json/base/meta/MarkerSet/" + fileName)
    );
    markerSet.tMarkerSet.forEach((marker) => {
      if (!marker.snoname?.name?.startsWith("ambient_cow")) {
        return;
      }
      const point = normalizePoint(marker.transform.wp);
      const node = {
        id: `cow@${point[0]},${point[1]}`,
        x: point[0],
        y: point[1],
      };

      cows.push(node);
    });
  });

  return {
    cows,
    // dict,
  };
};
