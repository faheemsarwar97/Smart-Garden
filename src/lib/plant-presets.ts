export type PlantPreset = {
  id: string;
  name: string;
  species: string;
  emoji: string;
  category: "Foliage" | "Succulent" | "Edible" | "Flowering" | "Herb";
  ranges: {
    moisture: [number, number];
    temperature: [number, number];
    light: [number, number];
    lightHours: number;
  };
  notes: string;
};

export const PLANT_PRESETS: PlantPreset[] = [
  {
    id: "pothos",
    name: "Pothos",
    species: "Epipremnum aureum",
    emoji: "🌿",
    category: "Foliage",
    ranges: { moisture: [45, 65], temperature: [18, 26], light: [400, 900], lightHours: 12 },
    notes: "Tolerant, fast-growing trailing vine. Let top inch dry between waterings.",
  },
  {
    id: "monstera",
    name: "Monstera Deliciosa",
    species: "Monstera deliciosa",
    emoji: "🌱",
    category: "Foliage",
    ranges: { moisture: [50, 70], temperature: [20, 27], light: [600, 1100], lightHours: 12 },
    notes: "Loves bright indirect light. Provide a moss pole for support.",
  },
  {
    id: "snake",
    name: "Snake Plant",
    species: "Dracaena trifasciata",
    emoji: "🪴",
    category: "Foliage",
    ranges: { moisture: [20, 40], temperature: [18, 28], light: [200, 800], lightHours: 10 },
    notes: "Very low water needs. Overwatering causes root rot.",
  },
  {
    id: "succulent",
    name: "Echeveria",
    species: "Echeveria elegans",
    emoji: "🌵",
    category: "Succulent",
    ranges: { moisture: [15, 30], temperature: [18, 30], light: [800, 1500], lightHours: 10 },
    notes: "Soak-and-dry watering. Bright direct light keeps colors vivid.",
  },
  {
    id: "tomato",
    name: "Cherry Tomato",
    species: "Solanum lycopersicum",
    emoji: "🍅",
    category: "Edible",
    ranges: { moisture: [55, 75], temperature: [20, 28], light: [1200, 2000], lightHours: 14 },
    notes: "Needs consistent moisture and at least 8h direct sun for fruit set.",
  },
  {
    id: "basil",
    name: "Basil",
    species: "Ocimum basilicum",
    emoji: "🌿",
    category: "Herb",
    ranges: { moisture: [55, 70], temperature: [20, 28], light: [800, 1400], lightHours: 12 },
    notes: "Pinch flower buds to keep leaves tender. Loves warmth.",
  },
  {
    id: "orchid",
    name: "Phalaenopsis Orchid",
    species: "Phalaenopsis spp.",
    emoji: "🌸",
    category: "Flowering",
    ranges: { moisture: [40, 55], temperature: [18, 26], light: [300, 700], lightHours: 12 },
    notes: "Water weekly. Avoid direct sun on leaves.",
  },
  {
    id: "fiddle",
    name: "Fiddle Leaf Fig",
    species: "Ficus lyrata",
    emoji: "🌳",
    category: "Foliage",
    ranges: { moisture: [45, 60], temperature: [18, 24], light: [800, 1200], lightHours: 12 },
    notes: "Hates being moved. Bright indirect light, even watering schedule.",
  },
];