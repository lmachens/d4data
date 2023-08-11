import { normalizePoint } from "./lib.mjs";
import globalMarkers from "../json/base/meta/Global/global_markers.glo.json" assert { type: "json" };
import { LOCALES, readTerm } from "./i18n.mjs";

export default () => {
  const dict = LOCALES.reduce((acc, locale) => {
    acc[locale] = {};
    return acc;
  }, {});
  const nodes = [];
  globalMarkers.ptContent[0].arGlobalMarkerActors.forEach((actor) => {
    if (actor.snoActor.name !== "Waypoint_Temp") {
      return;
    }
    const point = normalizePoint(actor.tWorldTransform.wp);

    const stringId = `${actor.snoLevelArea.groupName}_${actor.snoLevelArea.name}`;
    const id = `waypoints:${stringId}@${point[0]},${point[1]}`;
    LOCALES.forEach((locale) => {
      const term = readTerm(stringId, locale);
      dict[locale][id] = {
        name: term.szText,
      };
    });

    const node = {
      id,
      x: point[0],
      y: point[1],
    };
    nodes.push(node);
  });

  return {
    nodes,
    dict,
  };
};
