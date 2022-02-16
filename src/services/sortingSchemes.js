import { Trans, defineMessage } from '@lingui/macro'

defineMessage({ id: "sortingCategory.level", message: "Level" });
defineMessage({ id: "sortingScheme.levelUpwards", message: "Level Upwards" });
defineMessage({ id: "sortingScheme.levelDownwards", message: "Level Downwards" });

defineMessage({ id: "sortingCategory.stickFrequency", message: "StickFrequency" });
defineMessage({ id: "sortingScheme.stickFrequencyUpwards" , message: "StickFrequency Upwards" });
defineMessage({ id: "sortingScheme.stickFrequencyDownwards" , message: "StickFrequency Downwards" });

defineMessage({ id: "sortingCategory.trickCombos", message: "Trick Combos" });
defineMessage({ id: "sortingScheme.lengthUpwards", message: "Length Upwards" });
defineMessage({ id: "sortingScheme.lengthDownwards", message: "Length Downwards" });


export const trickSortingSchemes = [
  {"name": <Trans id="sortingScheme.levelUpwards" />,
    "id": 0,
    "sortFunc": (a, b) => (a.difficultyLevel - b.difficultyLevel),
    "catName": <Trans id="sortingCategory.level" />,
    "attributeFunc": (a) => a.difficultyLevel,
    "showCategory": true,
  },
  {"name": <Trans id="sortingScheme.levelDownwards" />,
    "id": 1,
    "sortFunc": (a, b) => (b.difficultyLevel - a.difficultyLevel),
    "catName": <Trans id="sortingCategory.level" />,
    "attributeFunc": (a) => a.difficultyLevel,
    "showCategory": true,
  },
  {"name": <Trans id="sortingScheme.stickFrequencyUpwards" />,
    "id": 2,
    "sortFunc": (a, b) => {if (a.stickFrequency >= 0) return (a.stickFrequency - b.stickFrequency);return 0.1;},
    "catName": <Trans id="sortingCategory.stickFrequency" />,
    "attributeFunc": (a) => a.stickFrequency,
    "showCategory": false,
  },
  {"name": <Trans id="sortingScheme.stickFrequencyDownwards" />,
    "id": 3,
    "sortFunc": (a, b) => {if (a.stickFrequency >= 0) return (b.stickFrequency - a.stickFrequency);return 1;},
    "catName": <Trans id="sortingCategory.stickFrequency" />,
    "attributeFunc": (a) => a.stickFrequency,
    "showCategory": false,
  },
];

export const comboSortingSchemes = [
  {"name": <Trans id="sortingScheme.lengthUpwards" />,
    "id": 0,
    "sortFunc": (a, b) => (a.numberOfTricks - b.numberOfTricks),
    "catName": <Trans id="sortingCategory.trickCombos" />,
    "attributeFunc": (a) => a.numberOfTricks,
    "showCategory": true,
  },
  {"name": <Trans id="sortingScheme.lengthDownwards" />,
    "id": 1,
    "sortFunc": (a, b) => (b.numberOfTricks - a.numberOfTricks),
    "catName": <Trans id="sortingCategory.trickCombos" />,
    "attributeFunc": (a) => a.numberOfTricks,
    "showCategory": true,
  },
  {"name": <Trans id="sortingScheme.stickFrequencyUpwards" />,
    "id": 2,
    "sortFunc": (a, b) => {if (a.stickFrequency >= 0) return (a.stickFrequency - b.stickFrequency);return 0.1;},
    "catName": <Trans id="sortingCategory.stickFrequency" />,
    "attributeFunc": (a) => a.stickFrequency,
    "showCategory": false,
  },
  {"name": <Trans id="sortingScheme.stickFrequencyDownwards" />,
    "id": 3,
    "sortFunc": (a, b) => {if (a.stickFrequency >= 0) return (b.stickFrequency - a.stickFrequency);return 1;},
    "catName": <Trans id="sortingCategory.stickFrequency" />,
    "attributeFunc": (a) => a.stickFrequency,
    "showCategory": false,
  },
];
