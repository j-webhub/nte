import { state } from "../../../core/state.js?v=20261020-searchable-pages";
import { renderOverview } from "./passives.js?v=20261020-searchable-pages";
import { renderSkills } from "./skills.js?v=20261020-searchable-pages";
import { renderAwakening } from "./awakening.js?v=20261020-searchable-pages";
import { renderArcs } from "./arcs.js?v=20261020-searchable-pages";
import { renderConsole } from "./console.js?v=20261020-searchable-pages";
import { renderGrowth } from "./growth.js?v=20261020-searchable-pages";

export function renderTab(p) {
  if (state.activeTab === "skills") return renderSkills(p);

  if (state.activeTab === "awakening") return renderAwakening(p);

  if (state.activeTab === "arcs") return renderArcs(p);

  if (state.activeTab === "console") return renderConsole(p);
  if (state.activeTab === "growth") return renderGrowth(p);

  return p.roster?.released
    ? renderOverview(p)
    : renderOverview(p, {
        includeSources: false
      });
}
