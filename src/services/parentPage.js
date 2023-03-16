import {pages} from "./enums";

export function parentPageOf(path) {
  if (path === "/" || path.includes("tricks") || path === "/posttrick") {
    return pages["TRICKLIST"];
  } else if (path.includes("/combos") || path === "/postcombo") {
    return pages["COMBOLIST"];
  } else if (path === "/generator" || path === "/random-combo") {
    return pages["GENERATOR"];
  } else {
    return null;
  }
}

export function parentPageMatches(parentPage, path) {
  return parentPage == parentPageOf(path);
}
