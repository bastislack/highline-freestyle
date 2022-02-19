import { Trans, defineMessage } from '@lingui/macro'

defineMessage({ id: "links.tricks", message: "Tricks" });
defineMessage({ id: "links.combos", message: "Combos" });
defineMessage({ id: "links.comboGenerator", message: "Combo Generator" });

export const links = [
  {
    name: <Trans id="links.tricks" />,
    url: "/",
    isActive: (path) => path === "/" || path.includes("tricks") || path === "/posttrick"
  },
  {
    name: <Trans id="links.combos" />,
    url: "/combos",
    isActive: (path) => path.includes("/combos") || path === "/postcombo"
  },
  {
    name: <Trans id="links.comboGenerator" />,
    url: "/generator",
    isActive: (path) => path === "/generator" || path === "/random-combo",
  },
];

