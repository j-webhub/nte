export const SKILLS = [
  {id:'kinetic',name:'염동 탄환',en:'KINETIC',icon:'◎',color:'#a4e774',type:'공격',desc:'정신력을 탄환으로 응축해 가까운 적을 관통합니다.',detail:'레벨마다 탄환 피해 +24%. 3레벨마다 발사체 +1.',weight:12},
  {id:'fire',name:'홍련의 구',en:'PYROKINESIS',icon:'✺',color:'#ff9868',type:'마법',desc:'적에게 폭발하는 화염구를 발사합니다.',detail:'레벨마다 폭발 피해 +30%, 폭발 반경 +8.',weight:10},
  {id:'lightning',name:'연쇄 번개',en:'CHAIN LIGHTNING',icon:'ϟ',color:'#b7b1ff',type:'마법',desc:'번개가 가까운 적 사이를 연쇄 이동합니다.',detail:'레벨마다 피해 +24%, 연쇄 대상 +1.',weight:9},
  {id:'orbit',name:'위성 파편',en:'ORBITAL',icon:'◌',color:'#71daca',type:'공격',desc:'몸 주위를 회전하는 파편이 적을 밀어냅니다.',detail:'레벨마다 파편 +1, 접촉 피해 +18%.',weight:10},
  {id:'regen',name:'초재생',en:'REGENERATION',icon:'✚',color:'#9bdfac',type:'생존',desc:'상처를 회복하는 초능력. 체력이 서서히 재생됩니다.',detail:'레벨마다 초당 최대 체력의 0.35% 회복.',weight:12},
  {id:'haste',name:'신경 가속',en:'ACCELERATION',icon:'»',color:'#8dcdf9',type:'강화',desc:'신경 반응을 가속해 이동과 공격이 빨라집니다.',detail:'레벨마다 이동 속도 +7%, 공격 속도 +6%.',weight:11},
  {id:'time',name:'시간 정지',en:'TIME STOP',icon:'◷',color:'#ded1ff',type:'특수',desc:'주기적으로 일반 적과 그 탄환의 시간을 멈춥니다. 보스와 보스 탄환은 면역입니다.',detail:'기본 주기 21초. 지속 1초 + 레벨당 0.2초. 성능 연구 및 장비 강화 불가.',weight:5},
  {id:'frost',name:'절대 영도',en:'ABSOLUTE ZERO',icon:'❄',color:'#a0e5ff',type:'마법',desc:'냉기의 파동으로 주변 적을 얼리고 둔화시킵니다.',detail:'레벨마다 피해 +25%, 범위 +16.',weight:9},
  {id:'gravity',name:'중력 붕괴',en:'SINGULARITY',icon:'◉',color:'#bf9bff',type:'마법',desc:'가까운 적 아래에 중력장을 생성해 적을 끌어당깁니다.',detail:'레벨마다 피해 +25%, 중력장 반경 +10.',weight:6},
  {id:'shield',name:'정신 장벽',en:'PSYCHIC BARRIER',icon:'⬡',color:'#78c8e5',type:'생존',desc:'정신 에너지를 둘러 받는 피해를 줄입니다.',detail:'레벨마다 받는 피해 감소. 최대 65%.',weight:10},
  {id:'nova',name:'에너지 폭주',en:'NOVA',icon:'✧',color:'#ffd788',type:'공격',desc:'사방으로 에너지 탄환을 방출합니다.',detail:'레벨마다 탄환 +2, 피해 +22%.',weight:8},
  {id:'vampire',name:'생명 흡수',en:'LIFE DRAIN',icon:'♢',color:'#f794b3',type:'생존',desc:'적을 처치하면 생명 에너지를 흡수합니다.',detail:'레벨마다 처치 시 체력 0.6 회복.',weight:7},
];
SKILLS.push(
  {id:'sun',name:'인공 태양',en:'ARTIFICIAL SUN',icon:'☀',color:'#ffd18a',type:'융합',fusion:true,desc:'거대한 화염구와 사방으로 터지는 태양탄을 방출합니다.',detail:'홍련의 구 Lv.10 + 에너지 폭주 Lv.10. 두 능력을 소비해 자동 융합합니다.',weight:0},
  {id:'chronos',name:'크로노스 엔진',en:'CHRONOS ENGINE',icon:'◴',color:'#c9bcff',type:'융합',fusion:true,desc:'가속된 신체로 전장을 누비며 일반 적의 시간을 정지시킵니다. 보스는 면역입니다.',detail:'시간 정지 Lv.10 + 신경 가속 Lv.10. 주기 13.5초, 정지 3초. 성능 연구 및 장비 강화 불가.',weight:0},
);
export const RECIPES = [
  {id:'sun',ingredients:['fire','nova'],level:10},
  {id:'chronos',ingredients:['time','haste'],level:10},
];
export const CHARACTERS = [
  {id:'jin',name:'강시온',tag:'신체 강화자',code:'AW—01',sex:'male',color:'#ade778',skill:null,desc:'균열에서 살아 돌아온 첫 번째 각성자. 강화된 신체로 도시의 밤에 맞섭니다.',stats:'최대 체력 120 · 공격력 20',hp:120,attack:20,speed:220},
  {id:'seo',name:'윤서하',tag:'신체 강화자',code:'AW—02',sex:'female',color:'#93d8e4',skill:null,desc:'전직 특수기동대 요원. 날카로운 반사 신경과 기동력으로 전장을 돌파합니다.',stats:'최대 체력 105 · 이동 속도 +10%',hp:105,attack:20,speed:242},
  {id:'ember',name:'한이솔',tag:'발화 능력자',code:'AW—03',sex:'female',color:'#ffad79',skill:'fire',quest:'hunter',desc:'스스로 불꽃이 되기로 한 소방관. 강화된 신체와 홍련의 구를 지닌 채 출격합니다.',stats:'홍련의 구 Lv.1 보유 · 마력 +15%',hp:110,attack:18,speed:225},
  {id:'zero',name:'백시우',tag:'시간 조율자',code:'AW—04',sex:'male',color:'#c5afff',skill:'time',quest:'breaker',desc:'멈춘 시간 속에서 눈을 뜬 연구원. 강화된 신체와 시간 정지 능력을 지닙니다.',stats:'시간 정지 Lv.1 보유 · 최대 체력 100',hp:100,attack:20,speed:225},
];
export const STAGES = [
  {id:1,name:'침묵의 교차로',area:'SECTOR 01 · 도심 외곽',desc:'검게 물든 도심. 첫 번째 균열이 관측된 구역에 진입하세요.',difficulty:'위험도 I',color:'#ace879',bosses:['균열의 파수꾼','공허의 집행자'],reward:180},
  {id:2,name:'네온의 잔해',area:'SECTOR 02 · 상업 지구',desc:'꺼지지 않는 네온 아래, 변이체들이 더 빠르게 움직입니다.',difficulty:'위험도 II',color:'#8cd9ea',bosses:['네온 포식자','심연의 추적자'],reward:320},
  {id:3,name:'제로 그라운드',area:'SECTOR 03 · 균열 중심',desc:'현실과 이계의 경계. 도시의 마지막 밤을 끝낼 시간입니다.',difficulty:'위험도 III',color:'#c8afff',bosses:['시간의 감시자','균열의 군주'],reward:520},
];
export const UPGRADES = [
  {id:'body',name:'신체 적응',icon:'⬡',desc:'최대 체력 +15',max:8,base:45},
  {id:'power',name:'출력 증폭',icon:'ϟ',desc:'공격력 · 마력 +8%',max:8,base:60},
  {id:'choices',name:'가능성 확장',icon:'◇',desc:'선택지 3 → 4 → 5개',max:2,base:220},
  {id:'double',name:'이중 각성',icon:'✧',desc:'레벨 상승 시 초능력 2개 선택',max:1,base:650,requires:'choices'},
  {id:'reroll',name:'운명 재설계',icon:'↻',desc:'출격당 새로고침 +1회',max:5,base:100},
];
export const QUESTS = [
  {id:'hunter',title:'불꽃을 찾는 사람',desc:'변이체를 누적 300마리 처치하세요.',stat:'kills',target:300,character:'ember',reward:120},
  {id:'breaker',title:'멈춰 버린 순간',desc:'보스를 누적 3마리 처치하세요.',stat:'bosses',target:3,character:'zero',reward:180},
  {id:'archivist',title:'각성의 기록',desc:'서로 다른 초능력 8개를 도감에 등록하세요.',stat:'discovered',target:8,reward:150},
  {id:'survivor',title:'밤을 넘어',desc:'첫 번째 스테이지를 클리어하세요.',stat:'clears',target:1,reward:200},
];
export const byId = (list,id) => list.find(v=>v.id===id);
export const upgradeCost = (u,level) => Math.round(u.base * Math.pow(1.65,level));

SKILLS.push(
 {id:'lance',name:'공간 창',en:'SPACE LANCE',icon:'➶',color:'#79e8d4',type:'공격',desc:'공간을 꿰뚫는 빠른 관통 창을 발사합니다.',detail:'1.4초마다 발사. 피해 45 × (1 + 레벨 × 28%), 관통 5.',weight:9},
 {id:'pulse',name:'충격파',en:'SHOCKWAVE',icon:'◍',color:'#e9b8ff',type:'마법',desc:'주변 적을 밀어내는 정신 충격파를 방출합니다.',detail:'4초마다 발동. 피해 40 × (1 + 레벨 × 25%), 반경 170 + 레벨 × 12.',weight:9},
 {id:'tempest',name:'극지 폭풍',en:'POLAR TEMPEST',icon:'✵',color:'#a0e5ff',type:'융합',fusion:true,desc:'광역 번개 폭풍으로 주변 적을 공격하고 둔화시킵니다.',detail:'연쇄 번개 Lv.10 + 절대 영도 Lv.10. 2초마다 반경 420에 피해 240, 둔화 3초.',weight:0},
 {id:'rift',name:'차원 파쇄',en:'DIMENSION RIFT',icon:'✥',color:'#e9b8ff',type:'융합',fusion:true,desc:'여러 겹의 공간 창이 폭발하며 적진을 파괴합니다.',detail:'공간 창 Lv.10 + 충격파 Lv.10. 1.2초마다 창 5개, 피해 210, 폭발 반경 95.',weight:0}
);
RECIPES.push({id:'tempest',ingredients:['lightning','frost'],level:10},{id:'rift',ingredients:['lance','pulse'],level:10});
STAGES.push(
 {id:4,name:'침수된 연구소',area:'SECTOR 04 · 지하 연구소',desc:'버려진 실험체가 깨어나는 지하 시설.',difficulty:'위험도 IV',color:'#79e8d4',bosses:['변이 실험체','심해의 관측자'],reward:760},
 {id:5,name:'월식의 첨탑',area:'SECTOR 05 · 이계 관문',desc:'도시 위에 열린 관문에서 마지막 침공이 시작됩니다.',difficulty:'위험도 V',color:'#e9b8ff',bosses:['월식의 사도','차원의 지배자'],reward:1050}
);
UPGRADES.push(
 {id:'pickup',name:'에테르 감응',icon:'◎',desc:'경험치·아이템 획득 범위 +15%',max:8,base:55},
 {id:'speed',name:'기동 신경',icon:'»',desc:'이동 속도 +5%',max:8,base:65},
 {id:'rate',name:'전투 반사',icon:'ϟ',desc:'공격 속도 +5%',max:8,base:80},
 {id:'cooldown',name:'시간 압축',icon:'◷',desc:'초능력 재사용시간 -4% (최대 32%)',max:8,base:95}
);
export const MODES={normal:{name:'일반',speed:1,desc:'10분 · 보스 5체 처치'},accelerated:{name:'가속',speed:2,desc:'전투 전체 2배속 · 실제 약 5분'},endless:{name:'무한',speed:1,desc:'시간 제한 없음 · 2분마다 보스 · 클리어 보너스 없음'}};

STAGES.push(
 {id:6,name:'잿빛 환승역',area:'SECTOR 06 · 지하 철도',desc:'멈춘 열차 사이로 균열의 그림자가 퍼집니다.',difficulty:'위험도 VI',color:'#a0b9b6',bosses:['철로의 포식자','종착역의 망령'],reward:1400},
 {id:7,name:'서리의 방벽',area:'SECTOR 07 · 봉쇄 구역',desc:'얼어붙은 검문소 너머로 이계의 한기가 밀려옵니다.',difficulty:'위험도 VII',color:'#a0e5ff',bosses:['빙결의 수문장','동토의 군주'],reward:1800},
 {id:8,name:'폭풍 관측소',area:'SECTOR 08 · 고층 지구',desc:'끝없이 번개가 내리치는 관측소를 돌파하세요.',difficulty:'위험도 VIII',color:'#b7b1ff',bosses:['낙뢰의 사냥꾼','폭풍의 눈'],reward:2250},
 {id:9,name:'뒤틀린 성역',area:'SECTOR 09 · 차원 경계',desc:'도시와 이계가 겹쳐진 경계에서 중력이 뒤집힙니다.',difficulty:'위험도 IX',color:'#bf9bff',bosses:['경계의 심판자','허공의 수호자'],reward:2750},
 {id:10,name:'밤의 심장',area:'SECTOR 10 · 균열 최심부',desc:'모든 균열이 이어지는 근원. 마지막 심장을 멈추세요.',difficulty:'위험도 X',color:'#ffb5a2',bosses:['종말의 전령','밤의 심장'],reward:3400}
);
CHARACTERS.push(
 {id:'frostwalker',name:'차서린',tag:'냉기 조율자',code:'AW—05',sex:'female',color:'#a0e5ff',skill:'frost',quest:'unlock_frost',desc:'봉쇄 구역에서 살아남은 구조대원. 차가운 파동으로 적을 늦춥니다.',stats:'절대 영도 Lv.1 보유 · 최대 체력 115',hp:115,attack:19,speed:225},
 {id:'storm',name:'도현우',tag:'전격 능력자',code:'AW—06',sex:'male',color:'#b7b1ff',skill:'lightning',quest:'unlock_storm',desc:'폭풍의 중심에서 각성한 전기 기술자. 연쇄 번개로 무리를 제압합니다.',stats:'연쇄 번개 Lv.1 보유 · 공격력 21',hp:105,attack:21,speed:225},
 {id:'guardian',name:'서가온',tag:'정신 수호자',code:'AW—07',sex:'female',color:'#78c8e5',skill:'shield',quest:'unlock_guardian',desc:'동료를 지키기 위해 정신 장벽을 펼치는 의료 지원 요원.',stats:'정신 장벽 Lv.1 보유 · 최대 체력 135',hp:135,attack:18,speed:210},
 {id:'riftwalker',name:'강태윤',tag:'공간 추적자',code:'AW—08',sex:'male',color:'#79e8d4',skill:'lance',quest:'unlock_rift',desc:'뒤틀린 경계를 추적하는 정찰자. 공간을 꿰뚫는 창을 다룹니다.',stats:'공간 창 Lv.1 보유 · 이동 속도 235',hp:110,attack:20,speed:235}
);
QUESTS.push(
 {id:'unlock_frost',title:'서리 속의 구조 신호',desc:'3스테이지를 클리어하세요.',stat:'maxStage',target:4,character:'frostwalker',reward:250},
 {id:'unlock_storm',title:'폭풍을 향하여',desc:'5스테이지를 클리어하세요.',stat:'maxStage',target:6,character:'storm',reward:350},
 {id:'unlock_guardian',title:'끝까지 지키는 사람',desc:'7스테이지를 클리어하세요.',stat:'maxStage',target:8,character:'guardian',reward:450},
 {id:'unlock_rift',title:'경계의 추적자',desc:'9스테이지를 클리어하세요.',stat:'maxStage',target:10,character:'riftwalker',reward:550}
);
