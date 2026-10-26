const CONCEPTS=[
 {id:0,name:'모던 미니멀',en:'MODERN MINIMAL',image:'natural',desc:'절제된 라인과 차분한 뉴트럴 톤. 여백이 주는 편안함을 담은 공간입니다.',tags:['미니멀','뉴트럴','정돈된'],colors:['#d9d6ce','#999a96','#d0bea4','#4e504c'],factor:.92},
 {id:1,name:'내추럴 우드',en:'NATURAL WOOD',image:'industrial',desc:'자연 소재와 우드톤의 따뜻한 조화. 편안하게 머물고 싶은 공간을 제안합니다.',tags:['따뜻한','자연 소재','편안한'],colors:['#c9b395','#926c48','#e3d8c9','#b6aa98'],factor:1},
 {id:2,name:'스칸디 내추럴',en:'SCANDI NATURAL',image:'scandi',desc:'밝고 가벼운 컬러에 실용적인 가구를 더해 자연스럽고 여유로운 일상을 만듭니다.',tags:['밝은','실용적인','아늑한'],colors:['#ededdf','#a4b1b9','#b99a72','#70776b'],factor:.86},
 {id:3,name:'소프트 럭셔리',en:'SOFT LUXURY',image:'modern',desc:'부드러운 곡선과 섬세한 질감. 은은한 고급스러움을 일상 가까이에 두세요.',tags:['우아한','섬세한','곡선'],colors:['#d1c6b4','#a98c6a','#e5ded2','#7c7f6d'],factor:1.12},
 {id:4,name:'모던 인더스트리얼',en:'MODERN INDUSTRIAL',image:'soft',desc:'콘크리트의 담백함과 짙은 금속의 대비. 선명한 취향이 느껴지는 도시적인 공간입니다.',tags:['도시적인','대비감','간결한'],colors:['#a8a8a2','#555753','#bca389','#d6d5cf'],factor:1.04},
 {id:5,name:'웜 클래식',en:'WARM CLASSIC',image:'living',desc:'시간이 쌓인 듯한 우드와 포근한 패브릭. 익숙함 속에 새로운 감각을 더합니다.',tags:['포근한','클래식','우드'],colors:['#ba8e60','#e1d5bf','#777b5d','#b7a594'],factor:.97}
];
const FLOOR='https://www.lxzin.com/zin/category/a060000?mcate=a060100&page=1',WALL='https://m.lxzin.com/search?currentTab=인테리어제품&searchKeyword=디아망';
const MATERIALS=[
 {id:0,brand:'LX Z:IN',name:'에디톤 마루 · 브리즈 오크',code:'EDW7776',category:'마루',texture:'oak',color:'#c7ae8b',score:96,source:FLOOR},
 {id:1,brand:'LX Z:IN',name:'디아망 · 마르모아 / 포세린 화이트',code:'PR048-02',category:'벽지',texture:'plaster',color:'#e4dfd5',score:94,source:WALL},
 {id:2,brand:'LX Z:IN',name:'빅우드 · 오크 (방염)',code:'BW004',category:'필름',texture:'slat',color:'#b08b62',score:93,source:'https://www.lxzin.com/styling/house/detail/4844'},
 {id:3,brand:'IKEA',name:'SÖDERHAMN 쇠데르함 · 3인용섹션',code:'693.056.16',category:'가구',texture:'sofa',color:'#d5cec0',score:92,source:'https://www.ikea.com/kr/ko/p/soederhamn-3-seat-section-viarp-beige-brown-s69305616/'},
 {id:4,brand:'LX Z:IN',name:'에디톤 마루 · 클린 애쉬',code:'EDW7771',category:'마루',texture:'oak pale',color:'#d7cebb',score:95,source:FLOOR},
 {id:5,brand:'LX Z:IN',name:'디아망 · 샌드 스타코 / 라이트 그레이',code:'PR044-02',category:'벽지',texture:'plaster grey',color:'#b9b9b2',score:91,source:WALL},
 {id:6,brand:'IKEA',name:'NYMÅNE 뉘모네 · 펜던트등',code:'004.071.46',category:'조명',texture:'lamp',color:'#e5e2d9',score:93,source:'https://www.ikea.com/kr/ko/p/nymane-pendant-lamp-white-00407146/'},
 {id:7,brand:'LX Z:IN',name:'에디톤 마루 · 스모크 오크',code:'EDW7782',category:'마루',texture:'oak dark',color:'#938576',score:90,source:FLOOR},
 {id:8,brand:'LX Z:IN',name:'디아망 · 마띠에르 / 순백',code:'PR043-01',category:'벽지',texture:'plaster white',color:'#eeece6',score:95,source:WALL}
];
const BASE_ROOMS=[{name:'거실',area:26},{name:'주방',area:12},{name:'안방',area:16},{name:'침실 2',area:10},{name:'욕실',area:5},{name:'현관·복도',area:15}];
function demoProject(id,name,concept=1,type='plan',owner='b2b'){return{id,name,concept,sourceType:type,owner,fileName:type==='plan'?'84m2_sample_plan.svg':'living_sketchup.png',sample:true,budget:5000,height:2400,spaceType:'주거 공간 · 아파트',brief:'밝고 편안한 자연 소재의 공간',rooms:structuredClone(BASE_ROOMS),created:'2026-09-09',status:'시안 검토',saved:[],applied:null,client:'데모 고객',notes:''}}
function seed(){return[demoProject('demo1','잠실 아파트 32평',0),demoProject('demo2','성수 오피스텔',1),demoProject('demo3','성북동 상가',4,'screenshot'),demoProject('demo4','판교 단독주택',3)]}
