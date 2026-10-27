// Offensive scaling uses diminishing returns so equipment upgrades do not
// multiply attack, ability and attack frequency at full strength simultaneously.
export const ATTACK_SKILLS=new Set(['kinetic','orbit','nova','lance','satellitebarrier']);
export const MAGIC_SKILLS=new Set(['fire','lightning','frost','gravity','pulse','sun','tempest','rift','gravityshot']);
export const PHYSICAL_COEFFICIENTS={kinetic:17,orbit:29,nova:44,lance:96};
export const MAGIC_COEFFICIENTS={fire:190,lightning:160,frost:150,gravity:55,pulse:200,sunFire:500,sunNova:280,tempest:600,rift:200,gravityshot:220};
export function skillPower(save,stats,id){const research=1+(save.research[id]?.power||0)*.12;if(['time','chronos'].includes(id))return 1;if(['shield','haste'].includes(id))return research;return research*((ATTACK_SKILLS.has(id)||MAGIC_SKILLS.has(id))?Math.sqrt(stats.ability):stats.ability);}
export const physicalScale=stats=>1+.5*Math.log2(1+stats.attack/20);
export const magicScale=stats=>Math.sqrt(stats.magic);
export const physicalRate=stats=>Math.sqrt(stats.rate);
