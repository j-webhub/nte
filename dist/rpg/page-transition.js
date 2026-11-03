export function createPageTransition(root,{duration=180}={}){
 let active=false,pending=null;
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 return async function navigate(update){
  pending=update;if(active)return;active=true;
  const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  root.inert=true;root.classList.add('page-leaving');
  try{await wait(reduced?0:duration);while(pending){const task=pending;pending=null;await task();}root.classList.remove('page-leaving');await wait(reduced?0:duration);}
  finally{active=false;root.inert=false;root.classList.remove('page-leaving');if(pending)navigate(pending);}
 };
}
