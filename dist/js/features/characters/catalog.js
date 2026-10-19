export const elem = (id) => ELEMENTS[id] || { name: id || "—", color: "#aab5bf" };

export const ELEMENTS = {
  Anima: { name: "령", color: "#9fe6aa" },
  Chaos: { name: "암", color: "#c797ff" },

  Cosmos: { name: "빛", color: "#f2d876" },
  Incantation: { name: "주", color: "#ef9b85" },

  Lakshana: { name: "상", color: "#f1a0cb" },
  Psyche: { name: "혼", color: "#86c8ff" }
};

export const ELEMENT_ORDER = [
  "Cosmos",
  "Chaos",
  "Anima",
  "Incantation",
  "Lakshana",
  "Psyche"
];
export const ELEMENT_ICON_FILES = {
  Anima: "령.webp",
  Chaos: "암.webp",
  Cosmos: "빛.webp",
  Incantation: "주.webp",
  Lakshana: "상.webp",
  Psyche: "혼.webp"
};
export const assetUrl = (file) =>
  "./img/character/" + encodeURIComponent(file);
export const elementIconUrl = (element) =>
  "./img/icon/" + encodeURIComponent(ELEMENT_ICON_FILES[element]);
export const ARC_TYPE_ICON_FILES = {
  Solid: "solid.webp",
  Gas: "gas.webp",
  Liquid: "liquid.webp",
  Plasma: "plasma.webp",
  Condensate: "boson.webp"
};
export const arcTypeIconUrl = type => "./img/arc-type/" + ARC_TYPE_ICON_FILES[type];
export const ARC_TYPES = {
  Condensate: "결합",
  Gas: "기체",
  Liquid: "액체",
  Plasma: "플라스마",
  Solid: "고체"
};

export const SKILLS = [
  ["일반 공격", "basic"],
  ["바이레일 스킬", "skill"],
  ["울티메이트", "ultimate"],
  ["지원 스킬", "support"]
];

export const TABS = [
  ["overview", "패시브"],
  ["skills", "기술표"],
  ["awakening", "돌파·각성"],
  ["arcs", "전용 아크"],
  ["console", "콘솔·카트리지"],
  ["growth", "성장"]
];
