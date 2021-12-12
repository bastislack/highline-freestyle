export const links = [
  {
    name: "Tricks",
    url: "/",
    isActive: (path) => path === "/" || path.includes("tricks") || path === "/posttrick"
  },
  {
    name: "Combos",
    url: "/combos",
    isActive: (path) => path.includes("/combos") || path === "/postcombo"
  },
  {
    name: "Combo Generator",
    url: "/generator",
    isActive: (path) => path === "/generator" || path === "/random-combo",
  },
];

