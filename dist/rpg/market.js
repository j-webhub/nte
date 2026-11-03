import {CHARACTERS} from './data.js?v=1.8.1';
import {SLOTS,createGear} from './equipment.js?v=1.8.1';

export const BANNERS=CHARACTERS.filter(c=>!['jin','seo'].includes(c.id));
export const MARKET_RATES={featured:.03,mint:.01,zero:.01,fons:.45,sp:.45,uq:.05};
export const SHARDS_PER_DUPLICATE=1,SHARDS_PER_LEVEL=1,MAX_AWAKENING=6;
const integer=n=>Number.isFinite(Number(n))?Math.min(Number.MAX_SAFE_INTEGER,Math.max(0,Math.floor(Number(n)))):0;
const unit=random=>Math.min(1-Number.EPSILON,Math.max(0,Number(random())||0));
export function normalizeMarket(save){
 const raw=save.market||{};
 save.market={tickets:integer(raw.tickets),banners:Object.fromEntries(BANNERS.map(c=>{const b=raw.banners?.[c.id]||{};return [c.id,{total:integer(b.total),pity:Math.min(49,integer(b.pity)),tickets:integer(b.tickets)}];})),characters:Object.fromEntries(CHARACTERS.map(c=>[c.id,{shards:integer(raw.characters?.[c.id]?.shards),level:Math.min(6,integer(raw.characters?.[c.id]?.level))}]))};
 return save.market;
}
export function ticketQuote(save,id,count){
 const b=save.market?.banners?.[id];
 if(!b||!Number.isInteger(count)||count<1||count>100)return null;
 const discounted=Math.min(count,Math.max(0,50-b.total-b.tickets));
 return {count,discounted,regular:count-discounted,cost:discounted*1000+(count-discounted)*5000};
}
// Apply only after one successful durable write; a failed write never mutates live state.
function transact(save,commit,operation){
 const draft=structuredClone(save),result=operation(draft);
 if(!result.ok)return result;
 try{if(commit(draft)!==true)return {ok:false,error:'저장에 실패했습니다. 재화는 차감되지 않았습니다.'};}catch{return {ok:false,error:'저장에 실패했습니다. 재화는 차감되지 않았습니다.'};}
 Object.assign(save,draft);return result;
}
export function buyMarketTickets(save,id,count,commit){
 return transact(save,commit,draft=>{const quote=ticketQuote(draft,id,count);if(!quote)return {ok:false,error:'구매 수량을 확인하세요.'};if(draft.credits<quote.cost)return {ok:false,error:'에테르가 부족합니다.'};draft.credits-=quote.cost;draft.market.banners[id].tickets+=count;return {ok:true,...quote};});
}
export function drawMarket(save,id,count,commit,random=Math.random){
 return transact(save,commit,draft=>{
  const b=draft.market?.banners?.[id];if(!b||![1,10].includes(count))return {ok:false,error:'배너와 횟수를 확인하세요.'};
  if(b.tickets+draft.market.tickets<count)return {ok:false,error:'마켓 이용권이 부족합니다.'};
  const paid=Math.min(count,b.tickets);b.tickets-=paid;draft.market.tickets-=count-paid;
  const results=[];
  for(let i=0;i<count;i++){
   const guaranteed=b.pity===49,n=guaranteed?0:unit(random);let result;
   if(n<.05){
    const character=guaranteed||n<.03?id:n<.04?'jin':'seo',state=draft.market.characters[character],duplicate=draft.unlocked.includes(character);
    const compensation=duplicate&&state.level===MAX_AWAKENING;
    if(!duplicate)draft.unlocked.push(character);else if(compensation)draft.credits+=50000;else state.shards+=SHARDS_PER_DUPLICATE;
    result={type:'character',character,duplicate,guaranteed,shards:duplicate&&!compensation?1:0,ether:compensation?50000:0};
    b.pity=character===id?0:b.pity+1;
   }else{
    b.pity++;
    if(n<.50){const amount=2000+Math.floor(unit(random)*3001);draft.fons+=amount;result={type:'fons',amount};}
    else{const rarity=n<.95?'sp':'uq',slot=SLOTS[Math.floor(unit(random)*SLOTS.length)].id,item=createGear(`gear-${draft.nextGearId++}`,slot,rarity,random);draft.gear.push(item);result={type:'gear',item};}
   }
   b.total++;results.push(result);
  }
  return {ok:true,results};
 });
}
