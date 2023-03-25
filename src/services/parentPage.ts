import {Page} from "../types/enums";

export function parentPageOf(path: string): Page | undefined {
  if (path === "/" || path.includes("tricks") || path === "/posttrick") {
    return "TrickList";
  } else if (path.includes("/combos") || path === "/postcombo") {
    return "ComboList";
  } else if (path === "/generator" || path === "/random-combo") {
    return "ComboGenerator";
  } else {
    return undefined;
  }
}

export function parentPageMatches(parentPage: string, path: string) {
  return parentPage === parentPageOf(path);
}
