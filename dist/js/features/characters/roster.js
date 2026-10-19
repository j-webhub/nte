import { state } from "../../core/state.js?v=20261020-type-opacity";
import { $, esc } from "../../core/dom.js?v=20261020-type-opacity";
import { elem, elementIconUrl } from "./catalog.js?v=20261020-type-opacity";

export function renderRoster() {
  const CHARACTER_DISPLAY_ORDER = state.db.index.displayCharacterIds || state.db.index.releasedCharacterIds;
  const term = $("#character-search").value.trim().toLowerCase(),
    filter = state.rosterElements;
  $("#roster-element-filters").querySelectorAll("[data-roster-element]").forEach(button => {
    button.setAttribute("aria-pressed", String(filter.includes(button.dataset.rosterElement)));
  });
  const matches = (c) => {
    const searchable = [c.names.ko, c.names.en, c.names.zhHans]
      .join(" ")
      .toLowerCase();
    return (
      (!term || searchable.includes(term)) &&
      (!filter.length || filter.includes(c.element))
    );
  };
  const characters = state.db.roster.characters
    .filter((c) => c.released && matches(c))
    .sort((a, b) => {
      const aIsA = a.rarity === "A",
        bIsA = b.rarity === "A";
      if (aIsA !== bIsA) return aIsA ? 1 : -1;
      if (aIsA) return a.names.ko.localeCompare(b.names.ko, "ko");
      const aOrder = CHARACTER_DISPLAY_ORDER.indexOf(a.id);
      const bOrder = CHARACTER_DISPLAY_ORDER.indexOf(b.id);
      if (aOrder < 0 && bOrder >= 0) return 1;
      if (aOrder >= 0 && bOrder < 0) return -1;
      if (aOrder < 0 && bOrder < 0)
        return a.names.ko.localeCompare(b.names.ko, "ko");
      return aOrder - bOrder;
    });
  const upcoming = (state.db.roster.confirmedUpcoming || [])
    .filter(matches)
    .sort((a, b) =>
      String(a.plannedGlobalAvailability || "").localeCompare(
        String(b.plannedGlobalAvailability || "")
      )
    );
  const renderCharacterRow = (c, isUpcoming = false) => {
    const e = elem(c.element);
    const dateLabel = String(c.plannedGlobalAvailability || "")
      .slice(5)
      .replace("-", ".");
    return (
      '<button class="character-row rarity-' +
      esc(c.rarity) +
      (isUpcoming ? " is-upcoming" : "") +
      '" role="option" aria-selected="' +
      (c.id === state.selectedId) +
      '" data-id="' +
      esc(c.id) +
      '"' +
      (isUpcoming
        ? ' aria-label="' +
          esc(c.names.ko + " · " + dateLabel + " 출시 예정") +
          '"'
        : "") +
      ' style="--row-color:' +
      e.color +
      '"><span class="row-mark"><img class="element-icon element-icon-row" src="' +
      esc(elementIconUrl(c.element)) +
      '" alt=""></span>' +
      '<span class="row-copy"><strong>' +
      esc(c.names.ko) +
      "</strong>" +
      (isUpcoming ? "<small>출시 예정</small>" : "") +
      '</span><span class="rarity-mark">' +
      (isUpcoming ? esc(dateLabel) : esc(c.rarity) + "급") +
      "</span></button>"
    );
  };
  const sections = [];
  if (upcoming.length)
    sections.push(
      '<p class="roster-section-label">출시 예정</p>' +
        upcoming.map((c) => renderCharacterRow(c, true)).join("")
    );
  if (characters.length)
    sections.push(
      '<p class="roster-section-label">출시 완료</p>' +
        characters.map((c) => renderCharacterRow(c)).join("")
    );
  $("#roster-list").innerHTML = sections.length
    ? sections.join("")
    : '<div class="roster-empty">조건에 맞는 캐릭터가 없습니다.<br>검색어나 속성 필터를 바꿔 보세요.</div>';
}
