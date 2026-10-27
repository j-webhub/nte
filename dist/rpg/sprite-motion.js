import {SPRITE_FRAMES} from './sprite-frames.js?v=1.7.18';

// Four complete poses, evenly spaced: left step, passing, right step, passing.
export const WALK_FRAME_SECONDS=.18;
export const walkFrame=seconds=>Math.floor((seconds+1e-8)/WALK_FRAME_SECONDS)%4;
export function characterSpriteScale(id,row,walking,size=60){
  const directions=SPRITE_FRAMES[id+(id==='hotori'?'-directions-v2':'-directions')];
  if(walking)return size/directions.extent;
  const actions=SPRITE_FRAMES[id+'-actions'];
  const walkingHeight=Math.max(...directions.frames[0].map(f=>f[3]));
  const standingHeight=Math.max(...actions.frames[0].map(f=>f[3]));
  // Keep each action's scale stable across frames, with feet on the same baseline.
  const actionHeight=Math.max(...actions.frames[row===2?2:0].map(f=>f[3]));
  return size*Math.max(walkingHeight/directions.extent,standingHeight/actions.extent)/actionHeight;
}
