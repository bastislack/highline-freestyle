import {Trans} from "@lingui/macro";

export const links = [
  {
    name: <Trans id="links.tricks">Tricks</Trans>,
    url: "/",
    isActive: (path) => path === "/" || path.includes("tricks") || path === "/posttrick",
  },
  {
    name: <Trans id="links.combos">Combos</Trans>,
    url: "/combos",
    isActive: (path) => path.includes("/combos") || path === "/postcombo",
  },
  {
    name: <Trans id="links.comboGenerator">Combo Generator</Trans>,
    url: "/generator",
    isActive: (path) => path === "/generator" || path === "/random-combo",
  },
];
