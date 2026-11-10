import { state } from "../../../core/state.js?v=20261110-version-15-notice";
import { renderOverview } from "./passives.js?v=20261110-version-15-notice";
import { renderSkills } from "./skills.js?v=20261110-version-15-notice";
import { renderAwakening } from "./awakening.js?v=20261110-version-15-notice";
import { renderArcs } from "./arcs.js?v=20261110-version-15-notice";
import { renderConsole } from "./console.js?v=20261110-version-15-notice";
import { renderGrowth } from "./growth.js?v=20261110-version-15-notice";

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
