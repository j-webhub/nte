import { state } from "../../../core/state.js?v=20261020-home-shuffle-button";
import { renderOverview } from "./passives.js?v=20261020-home-shuffle-button";
import { renderSkills } from "./skills.js?v=20261020-home-shuffle-button";
import { renderAwakening } from "./awakening.js?v=20261020-home-shuffle-button";
import { renderArcs } from "./arcs.js?v=20261020-home-shuffle-button";
import { renderConsole } from "./console.js?v=20261020-home-shuffle-button";
import { renderGrowth } from "./growth.js?v=20261020-home-shuffle-button";

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
