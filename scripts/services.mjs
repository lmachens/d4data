import { LOCALES, readTerm } from "./i18n.mjs";
import { toCamelCase } from "./lib.mjs";
import globalMarkers from "../json/base/meta/Global/global_markers.glo.json" assert { type: "json" };

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
globalMarkers.ptContent[0].arGlobalMarkerActors.forEach((actor) => {
  if (!actor.snoActor.name?.startsWith("TWN")) {
    return;
  }
  const point = normalizePoint(actor.tWorldTransform.wp);
  const id = actor.snoLevelArea.name;
  let hasTerms = false;
  LOCALES.forEach((locale) => {
    const term = readTerm(node.id, locale);
    if (term) {
      const role = toCamelCase(node.role);
      if (!dict[locale][role]) {
        dict[locale][role] = {};
      }
      dict[locale][role][id] = {
        name: term.szText,
      };

      hasTerms = true;
    }
  });
  if (!hasTerms) {
    console.log("No terms for", id);
    return;
  }
  const node = {
    id: id,
    x: point[0] / 1.65,
    y: point[1] / 1.65,
  };

  // TWN_Frac_Nevesk_Service_Healer
  const matched = actor.snoActor.name.match(
    /TWN_(?<name>.*)_(?<type>.*)_(?<role>.*)/
  );
  node.type = matched?.groups?.type;
  node.role = matched?.groups?.role;

  if (
    nodes.some(
      (t) =>
        t.id === node.id &&
        t.type === node.type &&
        t.point[0] === node.point[0] &&
        t.point[1] === node.point[1]
    )
  ) {
    return;
  }
  nodes.push(node);

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
});

export default {
  nodes: {
    healers,
    stableMasters,
    jewelers,
    alchemists,
    occultists,
  },
  dict,
};
