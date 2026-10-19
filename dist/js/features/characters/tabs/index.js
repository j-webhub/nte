import { state } from "../../../core/state.js?v=20261020-reorganized";
import { renderOverview } from "./passives.js?v=20261020-reorganized";
import { renderSkills } from "./skills.js?v=20261020-reorganized";
import { renderAwakening } from "./awakening.js?v=20261020-reorganized";
import { renderArcs } from "./arcs.js?v=20261020-reorganized";
import { renderConsole } from "./console.js?v=20261020-reorganized";
import { renderGrowth } from "./growth.js?v=20261020-reorganized";

export function renderTab(p) {
  if (state.activeTab === "skills") return renderSkills(p);

  if (state.activeTab === "awakening") return renderAwakening(p);

  if (state.activeTab === "arcs") return renderArcs(p);

  if (state.activeTab === "console") return renderConsole(p);
  if (state.activeTab === "growth") return renderGrowth(p);

  return p.roster?.released
    ? renderOverview(p)
    : renderOverview(p, {
        includeSources: false,
        passiveHeading: "패시브",
        includeUniquePlaceholder: true
      });
}
