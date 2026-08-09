/* ============================================================
   COCINEROY · app.js — sin JSX (React.createElement puro)
   Funciona en local (doble clic) y publicada. Uso personal privado.
   Datos: window.RECETAS_EMBED (modo local) o fetch("recetas.json").
   Favoritos/config en localStorage. Estética blanco/negro/gris.
============================================================ */
(function(){
"use strict";
var h = React.createElement;
var useState = React.useState, useMemo = React.useMemo, useEffect = React.useEffect;

var INK="#111", MUT="#8a8a8e", LINE="#e5e5e5", SOFT="#f4f4f5", SELBG="#f0f0f0", DARK="#1c1c1e";

var CAT = {
  rapido:{label:"Rápido y fácil",emoji:"⚡"}, proteina:{label:"Alto en proteína",emoji:"💪"},
  keto:{label:"Keto",emoji:"🥑"}, carbos:{label:"Alto en carbohidratos",emoji:"🍚"},
  mediterraneo:{label:"Mediterráneo",emoji:"🫒"}, familia:{label:"Para toda la familia",emoji:"👨‍👩‍👧‍👦"},
  ligero:{label:"Ligero",emoji:"🥗"}, equilibrado:{label:"Equilibrado",emoji:"⚖️"},
  vegetariano:{label:"Vegetariano",emoji:"🥦"}, vegano:{label:"Vegano",emoji:"🌿"}
};
var DIETAS = ["rapido","proteina","keto","carbos","mediterraneo","familia","ligero","equilibrado","vegetariano","vegano"];
var APARATOS = {fuegos:"🍳 Fuegos", horno:"🔥 Horno", microondas:"📻 Microondas", airfryer:"🌪️ Air fryer", sandwichera:"🥪 Sandwichera", thermomix:"🥣 Thermomix"};
var ALERGENOS = {gluten:"Gluten", lactosa:"Lactosa", "frutos-secos":"Frutos secos", pescado:"Pescado y marisco", huevo:"Huevo", soja:"Soja"};
var SEC_ORDEN = ["Frutería y verdura","Pescadería","Carnicería","Congelados","Lácteos y huevos","Panadería","Despensa"];
var SEC_EMOJI = {"Frutería y verdura":"🥬","Pescadería":"🐟","Carnicería":"🥩","Congelados":"❄️","Lácteos y huevos":"🥛","Panadería":"🍞","Despensa":"🛒"};
var SUPERS=["Mercadona","Carrefour","DIA","Alcampo","Eroski","Consum","Ahorramás","Gadis","Caprabo","HiperDino"];
var DIAS=["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
var COMIDAS=[["desayuno","Desayuno","🥐"],["comida","Comida","🍽️"],["cena","Cena","🌙"]];
var PREFS_DIET=["rapido","proteina","keto","carbos","mediterraneo","familia"];

function seccionDe(nombre){
  var n=(nombre||"").toLowerCase();
  if(/pollo|pavo|ternera|cerdo|lomo|jamón|jamon|chorizo|salchich|bacon|carne|solomillo|secreto|cordero|conejo|pato|magro|albóndig|hamburgues|filete|pechuga|panceta|butifarra/.test(n))return"Carnicería";
  if(/salm|merluz|bacala|atun|atún|gamba|langostino|marisco|pescado|sardin|trucha|dorada|lubina|calamar|pulpo|mejill|almej|anchoa|boquerón|sepia|rape|lenguado|caballa|tinta/.test(n))return"Pescadería";
  if(/congel|guisantes|edamame/.test(n))return"Congelados";
  if(/leche|yogur|queso|mantequilla|nata|huevo|crema|requesón|mozzarella|feta|parmesano|mascarpone|ricotta|kefir|kéfir/.test(n))return"Lácteos y huevos";
  if(/pan|tostada|molde|biscote|brioche|baguette|chapata|wrap|oblea|masa|hojaldre|pizza/.test(n))return"Panadería";
  if(/tomate|cebolla|ajo|pimiento|patata|lechuga|espinac|brócoli|brocoli|calabac|zanahoria|champiñ|pepino|aguacate|limón|limon|manzana|plátano|platano|fruta|verdura|espárrago|esparrago|kiwi|fresa|arándano|naranja|maíz|maiz|apio|puerro|berenjena|coliflor|seta|rúcula|rucula|hierba|perejil|cilantro|menta|jengibre|remolacha|calabaza|judía verde|judias verdes/.test(n))return"Frutería y verdura";
  return"Despensa";
}
function mapReceta(r,idx){
  var dietas=r.dietas||[];
  var categoria=DIETAS.filter(function(d){return dietas.indexOf(d)>=0;})[0]||"equilibrado";
  var dieta=dietas.indexOf("vegano")>=0?"vegano":dietas.indexOf("vegetariano")>=0?"vegetariano":"omnivoro";
  var ings=(r.recipe_ingredients||[]).slice().sort(function(a,b){return (a.orden||0)-(b.orden||0);}).map(function(ri){
    return {nombre:(ri.ingredients&&ri.ingredients.nombre)||"ingrediente", emoji:(ri.ingredients&&ri.ingredients.emoji)||"•",
      cantidadBase:ri.cantidad_base, cantidadTxt:ri.cantidad||"", unidad:ri.unidad||"", seccion:seccionDe(ri.ingredients&&ri.ingredients.nombre)};
  });
  return {id:r.id||idx, nombre:r.nombre||"Receta", emoji:r.emoji||"🍽️",
    imagen:r.imagenPropia||"", imagenFull:r.imagenPropia||"",
    categoria:categoria, dieta:dieta, dietas:dietas, base:r.raciones_base||2,
    tiempoMin:r.minutos||0, kcal:Math.round(r.kcal||0), prot:Math.round(r.proteina||0),
    carbs:Math.round(r.carbohidratos||0), grasas:Math.round(r.grasas||0), coste:r.coste_estimado,
    aparatos:r.aparatos||[], alergenos:r.alergias_sin||[], ingredientes:ings,
    pasos:r.pasos||[], pasosPorAparato:r.pasos_por_aparato||null};
}
function escala(cb,personas,base){ if(cb==null)return null; var c=(cb/(base||2))*personas; if(c===0)return""; return String(Math.round(c*100)/100).replace(".",","); }
var LS={ get:function(k,def){try{var v=localStorage.getItem("cocineroy_"+k);return v?JSON.parse(v):def;}catch(e){return def;}},
         set:function(k,v){try{localStorage.setItem("cocineroy_"+k,JSON.stringify(v));}catch(e){}} };

var S = {
  ob:{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:SOFT,display:"flex",flexDirection:"column",padding:8},
  obTop:{display:"flex",alignItems:"center",gap:10,padding:"8px"},
  obBack:{background:"#e5e5e5",border:"none",borderRadius:8,width:32,height:32,fontSize:20,cursor:"pointer"},
  barBg:{flex:1,height:6,background:"#e0e0e0",borderRadius:4}, bar:{height:6,background:INK,borderRadius:4},
  obBody:{background:"#fff",borderRadius:20,padding:20,margin:"8px 4px",flex:1,overflow:"auto",border:"1px solid "+LINE},
  h1:{fontSize:23,fontWeight:800,margin:"4px 0 14px"},
  primary:{background:INK,color:"#fff",border:"none",borderRadius:14,padding:16,fontWeight:700,fontSize:16,margin:"4px",cursor:"pointer",width:"calc(100% - 8px)"},
  box:{padding:15,border:"1px solid "+LINE,borderRadius:12,background:"#fff",cursor:"pointer",fontWeight:600,fontSize:14},
  selBox:{padding:15,border:"2px solid "+INK,borderRadius:12,background:SELBG,cursor:"pointer",fontWeight:700,fontSize:14},
  boxSm:{padding:"0 14px",border:"1px solid "+LINE,borderRadius:12,background:"#fff",cursor:"pointer",fontWeight:600,fontSize:13},
  selBoxSm:{padding:"0 14px",border:"2px solid "+INK,borderRadius:12,background:SELBG,cursor:"pointer",fontWeight:700,fontSize:13},
  row:{display:"flex",alignItems:"center",gap:12,width:"100%",padding:14,border:"1px solid "+LINE,borderRadius:14,background:"#fff",cursor:"pointer",marginBottom:8},
  rowSel:{display:"flex",alignItems:"center",gap:12,width:"100%",padding:14,border:"2px solid "+INK,borderRadius:14,background:SELBG,cursor:"pointer",marginBottom:8},
  mini:{fontSize:11,color:MUT,fontWeight:700,letterSpacing:.5,margin:"16px 0 8px"},
  card:{background:"#fff",border:"1px solid "+LINE,borderRadius:14,padding:14,marginBottom:8},
  step:{width:34,height:34,borderRadius:"50%",border:"1px solid "+LINE,background:SOFT,cursor:"pointer",fontSize:18},
  resRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid "+SOFT},
  appHead:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:16},
  avatar:{width:34,height:34,borderRadius:"50%",background:INK,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700},
  ghost:{padding:"11px 16px",borderRadius:12,border:"1px solid "+LINE,background:"#fff",cursor:"pointer",fontWeight:600},
  toggle:{display:"flex",gap:6,background:SOFT,borderRadius:12,padding:4,marginBottom:14},
  tg:{flex:1,padding:10,border:"none",background:"transparent",borderRadius:8,cursor:"pointer",color:MUT,fontWeight:600},
  tgSel:{flex:1,padding:10,border:"none",background:INK,color:"#fff",borderRadius:8,cursor:"pointer",fontWeight:700},
  dayCard:{minWidth:180,background:"#fff",border:"1px solid "+LINE,borderRadius:14,overflow:"hidden"},
  tiny:{width:"100%",padding:"6px",border:"1px solid "+LINE,borderRadius:8,background:SOFT,cursor:"pointer",fontSize:12},
  pill:{background:SELBG,color:INK,borderRadius:20,padding:"8px 14px",display:"inline-block",fontSize:13,fontWeight:600},
  secTit:{fontWeight:800,borderBottom:"2px solid "+SELBG,paddingBottom:4,marginBottom:6,fontSize:14},
  itemC:{display:"flex",gap:10,alignItems:"center",padding:"6px 0",cursor:"pointer",fontSize:15},
  search:{flex:1,padding:"12px 14px",borderRadius:12,border:"1px solid "+LINE,fontSize:15},
  chip:{padding:"8px 12px",borderRadius:20,border:"1px solid "+LINE,background:"#fff",cursor:"pointer",fontSize:13,whiteSpace:"nowrap"},
  chipSel:{padding:"8px 12px",borderRadius:20,border:"1px solid "+INK,background:SELBG,cursor:"pointer",fontSize:13,fontWeight:600,whiteSpace:"nowrap"},
  rec:{background:"#fff",border:"1px solid "+LINE,borderRadius:14,overflow:"hidden",cursor:"pointer"},
  recImg:{width:"100%",height:110,objectFit:"cover"},
  favBtn:{position:"absolute",top:6,right:6,border:"none",background:"rgba(255,255,255,.85)",borderRadius:"50%",width:30,height:30,cursor:"pointer",fontSize:14},
  tag:{background:SELBG,borderRadius:20,padding:"6px 10px",fontSize:12,fontWeight:600},
  nutri:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,background:SOFT,borderRadius:12,padding:12,margin:"8px 0",textAlign:"center"},
  modalBg:{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:50},
  modal:{background:"#fff",borderRadius:"20px 20px 0 0",padding:20,maxWidth:480,width:"100%",maxHeight:"92vh",overflow:"auto"},
  iconBtn:{border:"none",background:SOFT,borderRadius:"50%",width:38,height:38,cursor:"pointer",fontSize:16},
  nav:{position:"fixed",bottom:12,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4,background:"#fff",borderRadius:30,padding:6,boxShadow:"0 4px 20px rgba(0,0,0,.12)",border:"1px solid "+LINE},
  navBtn:{border:"none",background:"transparent",padding:"8px 20px",borderRadius:24,cursor:"pointer",fontSize:11,color:MUT,textAlign:"center"},
  navSel:{border:"none",background:SELBG,padding:"8px 20px",borderRadius:24,cursor:"pointer",fontSize:11,color:INK,fontWeight:700,textAlign:"center"},
  cocBg:{position:"fixed",inset:0,background:DARK,zIndex:60,display:"flex",flexDirection:"column",padding:20,maxWidth:480,margin:"0 auto"},
  cocIcon:{width:36,height:36,borderRadius:"50%",border:"none",background:"rgba(255,255,255,.15)",color:"#fff",cursor:"pointer",fontSize:16},
  cocBack:{width:48,height:48,borderRadius:"50%",border:"none",background:"rgba(255,255,255,.15)",color:"#fff",cursor:"pointer",fontSize:20},
  cocNext:{flex:1,padding:16,borderRadius:30,border:"none",background:"#fff",color:INK,fontWeight:700,fontSize:16,cursor:"pointer"},
  apBtn:{padding:"6px 12px",borderRadius:20,border:"1px solid rgba(255,255,255,.3)",background:"transparent",color:"#fff",cursor:"pointer",fontSize:13},
  apSel:{padding:"6px 12px",borderRadius:20,border:"none",background:"#fff",color:INK,cursor:"pointer",fontSize:13,fontWeight:700}
};

function Centro(msg){ return h("div",{style:{display:"flex",minHeight:"100vh",alignItems:"center",justifyContent:"center",textAlign:"center",padding:24}},msg); }

function App(){
  var rec=useState(null), recetas=rec[0], setRecetas=rec[1];
  var er=useState(null), error=er[0], setError=er[1];
  var pf=useState(function(){return LS.get("prefs",null);}), prefs=pf[0], setPrefsRaw=pf[1];
  var tb=useState("inicio"), tab=tb[0], setTab=tb[1];
  function setPrefs(p){ LS.set("prefs",p); setPrefsRaw(p); }

  useEffect(function(){
    if(typeof window.RECETAS_EMBED!=="undefined"){ setRecetas(window.RECETAS_EMBED.map(mapReceta)); return; }
    fetch("recetas.json").then(function(r){ if(!r.ok)throw new Error("No se pudo cargar recetas.json"); return r.json(); })
      .then(function(d){ setRecetas(d.map(mapReceta)); })
      .catch(function(e){ setError(e.message); });
  },[]);

  if(error) return Centro(h("div",null,"⚠️ "+error,h("br"),h("small",{style:{color:MUT}},"Comprueba recetas.json.")));
  if(!recetas) return Centro("Cargando recetas… 🍳");
  if(!prefs) return h(Onboarding,{onFinish:setPrefs});
  return h(Main,{recetas:recetas,prefs:prefs,setPrefs:setPrefs,tab:tab,setTab:setTab});
}

function Onboarding(props){
  var ps=useState(1), paso=ps[0], setPaso=ps[1];
  var st=useState({super:"Mercadona",dias:DIAS.slice(),comidas:["comida"],dieta:"omnivoro",preferencias:[],presupuesto:40,personas:1,alergias:[],aparatos:["microondas","fuegos"]});
  var p=st[0], setP=st[1];
  function set(k,v){ var o={}; for(var x in p)o[x]=p[x]; o[k]=v; setP(o); }
  function tog(k,v,max){ var a=p[k].slice(); var i=a.indexOf(v); if(i>=0)a.splice(i,1); else a.push(v); if(max&&a.length>max)a=a.slice(1); set(k,a); }
  var T=7;
  function next(){ paso<T?setPaso(paso+1):setPaso("res"); }
  function back(){ paso==="res"?setPaso(T):paso>1?setPaso(paso-1):null; }

  function W(n,tit,sub,cont,btn){
    return h("div",{style:S.ob},
      h("div",{style:S.obTop}, h("button",{style:S.obBack,onClick:back},"‹"), h("div",{style:S.barBg},h("div",{style:Object.assign({},S.bar,{width:(n/T*100)+"%"})})), h("span",{style:{color:MUT,fontSize:13}},n+"/"+T)),
      h("div",{style:S.obBody}, h("h1",{style:S.h1},tit), sub?h("p",{style:{color:MUT,margin:"0 0 16px"}},sub):null, cont),
      h("button",{style:S.primary,onClick:next}, btn||"Continuar"));
  }
  function opt(active,onClick,label,extra){ return h("button",{key:label,onClick:onClick,style:active?S.selBox:S.box},label); }

  if(paso===1) return W(1,"¿Dónde haces la compra?","Adaptamos el plan a tu súper",
    h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}, SUPERS.map(function(s){return opt(p.super===s,function(){set("super",s);},s);})));
  if(paso===2) return W(2,"¿Qué días cocinas?","Elige entre 3 y 7 días",
    h("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}, DIAS.map(function(d){return h("button",{key:d,onClick:function(){tog("dias",d);},style:Object.assign({},p.dias.indexOf(d)>=0?S.selBox:S.box,{aspectRatio:"1"})},(p.dias.indexOf(d)>=0?"✓ ":"")+d);})));
  if(paso===3) return W(3,"¿Qué comidas planificamos?","Elige las franjas de tu semana",
    h("div",null, COMIDAS.map(function(c){var k=c[0]; return h("button",{key:k,onClick:function(){tog("comidas",k);},style:p.comidas.indexOf(k)>=0?S.rowSel:S.row}, h("span",{style:{fontSize:22}},c[2]), h("b",{style:{flex:1,textAlign:"left"}},c[1]), h("span",null,p.comidas.indexOf(k)>=0?"✓":"○"));})));
  if(paso===4) return W(4,"¿Cómo quieres comer?","Dieta + hasta 2 preferencias",
    h("div",null,
      h("p",{style:S.mini},"TIPO DE DIETA"),
      [["omnivoro","🍽️","Como de todo"],["vegetariano","🥦","Sin carne ni pescado"],["vegano","🌿","Solo vegetal"]].map(function(o){return h("button",{key:o[0],onClick:function(){set("dieta",o[0]);},style:p.dieta===o[0]?S.rowSel:S.row}, h("span",{style:{fontSize:22}},o[1]), h("div",{style:{flex:1,textAlign:"left"}}, h("b",{style:{textTransform:"capitalize"}},o[0]), h("br"), h("small",{style:{color:MUT}},o[2])), h("span",null,p.dieta===o[0]?"✓":"○"));}),
      h("p",{style:S.mini},"PREFERENCIAS (hasta 2)"),
      PREFS_DIET.map(function(k){return h("button",{key:k,onClick:function(){tog("preferencias",k,2);},style:p.preferencias.indexOf(k)>=0?S.rowSel:S.row}, h("span",{style:{fontSize:22}},CAT[k].emoji), h("b",{style:{flex:1,textAlign:"left"}},CAT[k].label), h("span",null,p.preferencias.indexOf(k)>=0?"✓":"○"));})));
  if(paso===5) return W(5,"¿Cuánto te quieres gastar?","Ajustaremos la compra a ese máximo",
    h("div",null,
      h("p",{style:S.mini},"PRESUPUESTO"),
      h("div",{style:{fontSize:34,fontWeight:800}}, p.presupuesto+"€ ", h("small",{style:{fontSize:14,color:MUT,fontWeight:400}},"esta semana")),
      h("input",{type:"range",min:"20",max:"120",value:p.presupuesto,onChange:function(e){set("presupuesto",+e.target.value);},style:{width:"100%",accentColor:INK,margin:"12px 0 20px"}}),
      h("div",{style:S.card}, h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"}}, h("b",null,"¿Para cuántas personas?"), h("div",{style:{display:"flex",gap:12,alignItems:"center"}}, h("button",{style:S.step,onClick:function(){set("personas",Math.max(1,p.personas-1));}},"–"), h("b",{style:{fontSize:18}},"👤 "+p.personas), h("button",{style:Object.assign({},S.step,{background:INK,color:"#fff"}),onClick:function(){set("personas",p.personas+1);}},"+"))))));
  if(paso===6) return W(6,"¿Alguna alergia?","Quitaremos del plan lo que no puedas comer",
    h("div",null,
      h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}, Object.keys(ALERGENOS).map(function(k){return opt(p.alergias.indexOf(k)>=0,function(){tog("alergias",k);},ALERGENOS[k]);})),
      h("button",{onClick:function(){set("alergias",[]);},style:p.alergias.length===0?S.selBox:S.box},"✓ Ninguna")));
  if(paso===7) return W(7,"¿Qué hay en tu cocina?","Toca tus aparatos",
    h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}, Object.keys(APARATOS).map(function(k){return opt(p.aparatos.indexOf(k)>=0,function(){tog("aparatos",k);},APARATOS[k]);})), "Empezar");

  var resumen=[["SÚPER",p.super],["DÍAS",p.dias.join(", ")],["PRESUPUESTO",p.presupuesto+"€ · "+p.personas+" pers."],["DIETA",[p.dieta].concat(p.preferencias.map(function(x){return CAT[x].label;})).join(", ")],["ALERGIAS",p.alergias.length?p.alergias.map(function(a){return ALERGENOS[a];}).join(", "):"Ninguna"],["APARATOS",p.aparatos.length]];
  return h("div",{style:S.ob},
    h("div",{style:S.obTop}, h("button",{style:S.obBack,onClick:back},"‹")),
    h("div",{style:S.obBody}, h("h1",{style:S.h1},"Tu resumen"),
      h("div",{style:S.card}, resumen.map(function(r){return h("div",{key:r[0],style:S.resRow}, h("span",{style:{fontSize:11,color:MUT,fontWeight:700}},r[0]), h("b",{style:{fontSize:14}},r[1]));}))),
    h("button",{style:S.primary,onClick:function(){props.onFinish(p);}},"Generar mi plan →"));
}

function Chip(pr){ return h("button",{onClick:pr.on,style:pr.a?S.chipSel:S.chip},pr.children); }

function Main(props){
  var recetas=props.recetas, prefs=props.prefs, tab=props.tab, setTab=props.setTab;
  var Q=useState(""),q=Q[0],setQ=Q[1];
  var F=useState("todas"),filtro=F[0],setFiltro=F[1];
  var SF=useState(false),soloFav=SF[0],setSoloFav=SF[1];
  var D=useState(null),detalle=D[0],setDetalle=D[1];
  var C=useState(null),cocina=C[0],setCocina=C[1];
  var PL=useState(null),plan=PL[0],setPlan=PL[1];
  var V=useState("semana"),vista=V[0],setVista=V[1];
  var FV=useState(function(){return LS.get("fav",[]);}),fav=FV[0],setFav=FV[1];
  var MK=useState({}),marcados=MK[0],setMarcados=MK[1];
  var VI=useState(60),visibles=VI[0],setVisibles=VI[1];

  useEffect(function(){LS.set("fav",fav);},[fav]);
  useEffect(function(){ if(plan)LS.set("plan",plan.map(function(r){return r.id;})); },[plan]);
  useEffect(function(){ var ids=LS.get("plan",null); if(ids&&!plan){ var rs=ids.map(function(id){return recetas.filter(function(r){return r.id===id;})[0];}).filter(Boolean); if(rs.length)setPlan(rs);} },[]);

  function toggleFav(id){ var i=fav.indexOf(id); var n=fav.slice(); if(i>=0)n.splice(i,1); else n.push(id); setFav(n); }

  var compatibles=useMemo(function(){ return recetas.filter(function(r){
    if(prefs.dieta==="vegano"&&r.dieta!=="vegano")return false;
    if(prefs.dieta==="vegetariano"&&r.dieta==="omnivoro")return false;
    for(var i=0;i<prefs.alergias.length;i++){ if(r.alergenos.indexOf(prefs.alergias[i])<0)return false; }
    return true;
  }); },[recetas,prefs]);

  function generar(){ var pool=compatibles.slice().sort(function(){return Math.random()-0.5;}); var n=prefs.dias.length*prefs.comidas.length; var sel=[]; for(var i=0;i<n;i++)sel.push(pool[i%(pool.length||1)]); setPlan(sel.filter(Boolean)); setVista("semana"); }
  function cambiar(idx){ var pool=compatibles.filter(function(r){return !plan.filter(function(x){return x.id===r.id;}).length;}); var nv=pool[Math.floor(Math.random()*pool.length)]||plan[idx]; var c=plan.slice(); c[idx]=nv; setPlan(c); }

  var lista=useMemo(function(){ return recetas.filter(function(r){
    var okF=filtro==="todas"||r.dietas.indexOf(filtro)>=0;
    var okQ=!q.trim()||r.nombre.toLowerCase().indexOf(q.toLowerCase())>=0||r.ingredientes.filter(function(i){return i.nombre.toLowerCase().indexOf(q.toLowerCase())>=0;}).length>0;
    var okFav=!soloFav||fav.indexOf(r.id)>=0;
    return okF&&okQ&&okFav;
  }); },[recetas,q,filtro,soloFav,fav]);

  var ticket=useMemo(function(){ if(!plan)return{secc:{},total:0,n:0}; var prod={}; plan.forEach(function(r){ r.ingredientes.forEach(function(i){ if(i.unidad==="al gusto"||/pizca|gusto/.test(i.cantidadTxt))return; var k=i.nombre+"|"+i.seccion; if(!prod[k])prod[k]=i; }); }); var items=Object.keys(prod).map(function(k){return prod[k];}); var secc={}; items.forEach(function(i){ (secc[i.seccion]=secc[i.seccion]||[]).push(i); }); var total=plan.reduce(function(a,r){return a+(r.coste||0);},0); return{secc:secc,total:total,n:items.length}; },[plan]);

  var children=[];
  children.push(h("header",{key:"hd",style:S.appHead}, h("b",{style:{fontSize:19}},"◍ CocineRoy"), h("div",{style:S.avatar},"R")));

  var main=[];
  if(tab==="inicio"){
    main.push(h("p",{key:"g",style:{color:MUT,fontSize:14,margin:"4px 0 0"}},"Hola 👋"));
    main.push(h("h1",{key:"t",style:S.h1},"Tu cocina de la semana"));
    if(!plan) main.push(h("button",{key:"gen",style:S.primary,onClick:generar},"✨ Generar plan de esta semana"));
    else {
      main.push(h("div",{key:"sl",style:{color:MUT,fontSize:14,marginBottom:10}},"Tu semana en ",h("b",{style:{color:INK}},prefs.super), ticket.total?(" · "+ticket.total.toFixed(2)+" €"):""));
      main.push(h("div",{key:"nb",style:{display:"flex",gap:8,marginBottom:12}}, h("button",{style:S.ghost,onClick:generar},"🔄 Nuevo")));
      main.push(h("div",{key:"tg",style:S.toggle}, h("button",{style:vista==="semana"?S.tgSel:S.tg,onClick:function(){setVista("semana");}},"📅 Mi semana"), h("button",{style:vista==="ticket"?S.tgSel:S.tg,onClick:function(){setVista("ticket");}},"🧾 Ticket")));
      if(vista==="semana"){
        main.push(h("div",{key:"car",style:{display:"flex",gap:12,overflowX:"auto",paddingBottom:8}}, plan.map(function(r,i){
          return h("div",{key:i,className:"c2",style:S.dayCard}, r.imagen?h("img",{src:r.imagen,style:{width:"100%",height:100,objectFit:"cover"}}):null,
            h("div",{style:{padding:10}}, h("div",{style:{fontSize:11,fontWeight:800,color:MUT}},prefs.dias[i%prefs.dias.length]),
              h("div",{style:{fontWeight:700,fontSize:14,margin:"4px 0 6px",lineHeight:1.25,cursor:"pointer"},onClick:function(){setDetalle(r);}},r.nombre),
              h("div",{style:{fontSize:12,color:MUT,marginBottom:6}},"⏱ "+r.tiempoMin+"′ · 🔥 "+r.kcal),
              h("button",{style:S.tiny,onClick:function(){cambiar(i);}},"🔀 Cambiar")));
        })));
        if(ticket.total>0) main.push(h("div",{key:"bo",style:Object.assign({},S.pill,{marginTop:12})}, ticket.total.toFixed(2)+" € · "+(ticket.total<=prefs.presupuesto?"dentro de presupuesto ✓":"por encima ⚠️")));
      } else {
        var tk=[h("div",{key:"th",style:{textAlign:"center",borderBottom:"2px dashed "+LINE,paddingBottom:10,marginBottom:12}}, h("b",{style:{letterSpacing:1}},prefs.super.toUpperCase()), h("div",{style:{color:MUT,fontSize:12}},prefs.personas+" PERS · "+ticket.n+" artículos"))];
        SEC_ORDEN.filter(function(s){return ticket.secc[s];}).forEach(function(s){
          tk.push(h("div",{key:s,style:{marginBottom:14}}, h("div",{style:S.secTit},SEC_EMOJI[s]+" "+s.toUpperCase()),
            ticket.secc[s].map(function(i,n){ var k=s+i.nombre+n; return h("label",{key:k,style:S.itemC}, h("input",{type:"checkbox",checked:!!marcados[k],onChange:function(){var m={};for(var x in marcados)m[x]=marcados[x];m[k]=!m[k];setMarcados(m);}}), h("span",{style:{flex:1,textDecoration:marcados[k]?"line-through":"none",opacity:marcados[k]?.5:1}},i.emoji+" "+i.nombre)); })));
        });
        if(ticket.total>0) tk.push(h("div",{key:"tot",style:{display:"flex",justifyContent:"space-between",borderTop:"2px dashed "+LINE,paddingTop:12,marginTop:8}}, h("b",null,"Total aprox."), h("b",{style:{fontSize:20}},ticket.total.toFixed(2)+" €")));
        tk.push(h("small",{key:"nt",style:{color:MUT}},"Coste orientativo · puede variar en tienda."));
        main.push(h("div",{key:"tk",style:{marginTop:12}},tk));
      }
    }
  }
  else if(tab==="recetas"){
    main.push(h("div",{key:"hh",style:{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}, h("h1",{style:S.h1},"Recetas"), h("span",{style:{color:MUT,fontSize:13}},recetas.length+" recetas")));
    main.push(h("div",{key:"sr",style:{display:"flex",gap:8,marginBottom:10}}, h("input",{style:S.search,placeholder:"🔍 Buscar receta o ingrediente…",value:q,onChange:function(e){setQ(e.target.value);setVisibles(60);}}), h("button",{style:soloFav?S.selBoxSm:S.boxSm,onClick:function(){setSoloFav(!soloFav);setVisibles(60);}},"🔖 "+fav.length)));
    var chips=[h(Chip,{key:"todas",a:filtro==="todas",on:function(){setFiltro("todas");}},"🍽️ Todas")];
    DIETAS.forEach(function(k){ chips.push(h(Chip,{key:k,a:filtro===k,on:function(){setFiltro(k);setVisibles(60);}},CAT[k].emoji+" "+CAT[k].label)); });
    main.push(h("div",{key:"ch",style:{display:"flex",gap:8,overflowX:"auto",marginBottom:12,paddingBottom:4}},chips));
    main.push(h("div",{key:"cnt",style:{color:MUT,fontSize:13,marginBottom:10}},lista.length+" resultado(s)"+(soloFav?" · guardadas":"")));
    main.push(h("div",{key:"gr",style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}, lista.slice(0,visibles).map(function(r){
      return h("div",{key:r.id,className:"c2",style:S.rec,onClick:function(){setDetalle(r);}},
        h("div",{style:{position:"relative"}}, r.imagen?h("img",{src:r.imagen,style:S.recImg}):h("div",{style:Object.assign({},S.recImg,{background:"linear-gradient(135deg,#f4f4f5,#e9e9ec)"})}),
          h("button",{style:S.favBtn,onClick:function(e){e.stopPropagation();toggleFav(r.id);}},fav.indexOf(r.id)>=0?"🔖":"🏷️")),
        h("div",{style:{padding:"8px 10px 12px"}}, h("div",{style:{fontSize:11,color:MUT,fontWeight:600}},(CAT[r.categoria]?CAT[r.categoria].emoji+" "+CAT[r.categoria].label:"")),
          h("div",{style:{fontWeight:700,fontSize:13.5,margin:"4px 0",lineHeight:1.25}},r.nombre),
          h("div",{style:{fontSize:12,color:MUT}},"⏱ "+r.tiempoMin+"′ · 🔥 "+r.kcal+" · 💪 "+r.prot+"g")));
    })));
    if(lista.length>visibles) main.push(h("button",{key:"more",style:Object.assign({},S.ghost,{width:"100%",marginTop:14}),onClick:function(){setVisibles(visibles+60);}},"Ver más ("+(lista.length-visibles)+" restantes)"));
  }
  else if(tab==="perfil"){
    main.push(h("h1",{key:"t",style:S.h1},"Perfil"));
    main.push(h("div",{key:"st",style:{display:"flex",gap:10,margin:"0 0 12px"}}, h("div",{style:Object.assign({},S.card,{flex:1,textAlign:"center"})}, h("div",{style:{fontSize:26,fontWeight:800}},fav.length), h("small",{style:{color:MUT}},"guardadas 🔖")), h("div",{style:Object.assign({},S.card,{flex:1,textAlign:"center"})}, h("div",{style:{fontSize:26,fontWeight:800}},plan?1:0), h("small",{style:{color:MUT}},"plan activo"))));
    main.push(h("p",{key:"m",style:S.mini},"CÓMO COCINAS"));
    main.push(h("div",{key:"c",style:S.card}, h("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}}, h("span",{style:S.tag},"🛒 "+prefs.super), h("span",{style:S.tag},"💰 "+prefs.presupuesto+"€"), h("span",{style:S.tag},"🥗 "+prefs.dieta), h("span",{style:S.tag},"👤 "+prefs.personas))));
    main.push(h("button",{key:"rc",style:Object.assign({},S.primary,{marginTop:14}),onClick:function(){ if(confirm("¿Reconfigurar preferencias?")){ LS.set("prefs",null); location.reload(); } }},"⚙️ Reconfigurar preferencias"));
    main.push(h("p",{key:"ft",style:{color:MUT,fontSize:12,marginTop:16,textAlign:"center"}},"CocineRoy · app privada · tus datos solo en este dispositivo"));
  }
  children.push(h("main",{key:"mn",style:{padding:"0 16px",paddingBottom:86}},main));

  if(detalle) children.push(h(Detalle,{key:"det",r:detalle,personas:prefs.personas,fav:fav.indexOf(detalle.id)>=0,onFav:function(){toggleFav(detalle.id);},onCocina:function(){setCocina(detalle);setDetalle(null);},onClose:function(){setDetalle(null);}}));
  if(cocina) children.push(h(Cocina,{key:"coc",r:cocina,personas:prefs.personas,onClose:function(){setCocina(null);}}));

  children.push(h("nav",{key:"nav",style:S.nav},
    h("button",{style:tab==="recetas"?S.navSel:S.navBtn,onClick:function(){setTab("recetas");}}, "📖",h("br"),"Recetas"),
    h("button",{style:tab==="inicio"?S.navSel:S.navBtn,onClick:function(){setTab("inicio");}}, "◍",h("br"),"Inicio"),
    h("button",{style:tab==="perfil"?S.navSel:S.navBtn,onClick:function(){setTab("perfil");}}, "👤",h("br"),"Perfil")));

  return h("div",null,children);
}

function Detalle(pr){
  var r=pr.r, personas=pr.personas;
  var nutri=[["Proteína",r.prot+"g"],["Carbos",r.carbs+"g"],["Grasas",r.grasas+"g"],["Kcal","~"+r.kcal],["Personas",personas],["Tiempo",r.tiempoMin+"′"]];
  return h("div",{style:S.modalBg,onClick:pr.onClose}, h("div",{style:S.modal,onClick:function(e){e.stopPropagation();}},
    r.imagenFull?h("img",{src:r.imagenFull,style:{width:"100%",height:200,objectFit:"cover",borderRadius:14,marginBottom:12}}):null,
    h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}, h("div",null, h("div",{style:{fontSize:12,color:MUT,fontWeight:600}},(CAT[r.categoria]?CAT[r.categoria].emoji+" "+CAT[r.categoria].label:"")), h("h2",{style:{margin:"4px 0"}},r.nombre)), h("button",{style:S.iconBtn,onClick:pr.onFav},pr.fav?"🔖":"🏷️")),
    h("div",{style:S.nutri}, nutri.map(function(x){return h("div",{key:x[0]}, h("b",null,x[1]), h("br"), h("small",{style:{color:MUT}},x[0]));})),
    h("h3",{style:{marginBottom:6}},"Ingredientes ", h("small",{style:{fontWeight:400,color:MUT}},"· "+personas+" pers. (base "+r.base+")")),
    h("ul",{style:{paddingLeft:18,margin:"0 0 8px"}}, r.ingredientes.map(function(i,n){ var e=escala(i.cantidadBase,personas,r.base); return h("li",{key:n,style:{marginBottom:3}}, i.emoji+" "+i.nombre+" — "+((e!=null&&e!=="")?(e+" "+i.unidad):(i.cantidadTxt||"al gusto"))); })),
    h("h3",{style:{marginBottom:6}},"Cómo se cocina"),
    h("ol",{style:{paddingLeft:18,margin:0}}, r.pasos.map(function(p,n){return h("li",{key:n,style:{marginBottom:5}},p);})),
    h("button",{style:Object.assign({},S.primary,{marginTop:14}),onClick:pr.onCocina},"👨‍🍳 Modo cocina paso a paso"),
    h("button",{style:Object.assign({},S.ghost,{width:"100%",marginTop:8}),onClick:pr.onClose},"Cerrar")));
}

function Cocina(pr){
  var r=pr.r, personas=pr.personas;
  var aparatosDisp=r.pasosPorAparato?Object.keys(r.pasosPorAparato):[];
  var AP=useState(aparatosDisp[0]||null),ap=AP[0],setAp=AP[1];
  var pasos=(ap&&r.pasosPorAparato&&r.pasosPorAparato[ap])?r.pasosPorAparato[ap]:r.pasos;
  var I=useState(0),i=I[0],setI=I[1];
  var VE=useState(false),ver=VE[0],setVer=VE[1];
  var total=pasos.length;
  useEffect(function(){setI(0);},[ap]);
  var body;
  if(!ver) body=h("div",{style:{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",textAlign:"center"}}, h("div",{style:{color:"#9ca3af",fontSize:13,marginBottom:16}},"Paso "+(i+1)+" de "+total), h("div",{style:{color:"#fff",fontSize:24,fontWeight:700,lineHeight:1.4}},pasos[i]));
  else body=h("div",{style:{flex:1,overflow:"auto",paddingTop:16}}, h("b",{style:{color:"#fff"}},"Ingredientes · "+personas+" pers."), r.ingredientes.map(function(ing,n){ var e=escala(ing.cantidadBase,personas,r.base); return h("div",{key:n,style:{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.1)",color:"#fff"}}, h("span",null,ing.emoji+" "+ing.nombre), h("span",{style:{color:"#c7c7cc"}},(e!=null&&e!=="")?(e+" "+ing.unidad):(ing.cantidadTxt||"al gusto"))); }));
  return h("div",{style:S.cocBg},
    h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}, h("div",null, h("div",{style:{color:"#9ca3af",fontSize:12}},"👨‍🍳 MODO COCINA"), h("b",{style:{color:"#fff"}},r.nombre)), h("div",{style:{display:"flex",gap:8}}, h("button",{style:S.cocIcon,onClick:function(){setVer(!ver);}},"≣"), h("button",{style:S.cocIcon,onClick:pr.onClose},"✕"))),
    aparatosDisp.length>1?h("div",{style:{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}, aparatosDisp.map(function(a){return h("button",{key:a,onClick:function(){setAp(a);},style:ap===a?S.apSel:S.apBtn},APARATOS[a]||a);})):null,
    h("div",{style:{height:5,background:"rgba(255,255,255,.2)",borderRadius:4,marginTop:16}}, h("div",{style:{height:5,background:"#fff",borderRadius:4,width:((i+1)/total*100)+"%"}})),
    body,
    h("div",{style:{display:"flex",gap:12,alignItems:"center"}}, h("button",{style:S.cocBack,disabled:i===0,onClick:function(){setI(i-1);}},"‹"), (i<total-1)?h("button",{style:S.cocNext,onClick:function(){setI(i+1);}},"Siguiente →"):h("button",{style:S.cocNext,onClick:pr.onClose},"✓ Terminar")));
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
