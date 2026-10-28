export const ARENA_WIDTH=5200;
export const ARENA_HEIGHT=3600;
export function stageBackgroundKey(stageId){return `stage-background-${stageId}`;}
export function stageBackgroundPath(stageId){return `./backgrounds/stage-${String(stageId).padStart(2,'0')}.png`;}
