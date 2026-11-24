(function(){
"use strict";
var T=window.TOPICS, LSP="tefillin611:", $=function(id){return document.getElementById(id);};
var QS={};T.forEach(function(t){t.qs.forEach(function(q,i){q.id=t.id+"-"+i;q.topic=t.id;QS[q.id]=q;});});
var TN={mc:"רב־ברירה",tf:"נכון / לא נכון",bank:"מחסן מילים",match:"התאמה",sort:"מיון",order:"סידור",open:"כתיבה",fill:"השלמה",memory:"משחק זיכרון",scramble:"סדרו את המילים",letters:"אותיות מבולבלות"};
var GAMES={memory:1,scramble:1,letters:1};
var S=null;
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){var x=seed||1;return function(){x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function shuf(a,key){a=a.slice();var r=rng(hash(key+"|"+S.seed));for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function shufNot(a,key){var b=shuf(a,key);if(a.length>1&&b.every(function(x,i){return x===a[i];})){b.push(b.shift());}return b;}
var FIN={"ך":"כ","ם":"מ","ן":"נ","ף":"פ","ץ":"צ"};
function nz(s){return String(s||"").replace(/[\u0591-\u05C7]/g,"").replace(/[ךםןףץ]/g,function(c){return FIN[c];}).replace(/['"`׳״’“”.,:;!?()\-–—־]/g," ").replace(/\s+/g," ").trim();}
function toast(t){var e=$("toast");e.textContent=t;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove("show");},1800);}
function confetti(){var c=["#ffd166","#1f7a4d","#1f4e8c","#c2410c","#7c3aed"];for(var i=0;i<24;i++){var e=document.createElement("i");e.className="confetti";e.style.left=Math.random()*100+"vw";e.style.background=c[i%5];e.style.animationDelay=Math.random()*.4+"s";document.body.appendChild(e);setTimeout(function(x){return function(){x.remove();};}(e),2000);}}
/* ---------- state ---------- */
function key(n){return LSP+nz(n);}
function save(){if(!S)return;try{localStorage.setItem(key(S.name),JSON.stringify(S));localStorage.setItem(LSP+"last",S.name);}catch(e){}}
function newSeed(){return (Date.now()^Math.floor(Math.random()*1e9))>>>0;}
function login(name){name=name.trim();if(!name){toast("כתבו את השם שלכם");return;}var st=null;try{st=JSON.parse(localStorage.getItem(key(name))||"null");}catch(e){}
  S=st||{name:name,seed:newSeed(),run:[],pos:0,ans:{},mode:"home",attempt:1};S.name=name;S.mode="home";save();shell();render();}
function rec(id){return S.ans[id]||(S.ans[id]={tries:0,done:false,sc:null,pts:0,hint:0});}
function topicStats(tid){var t=T.filter(function(x){return x.id===tid;})[0],n=t.qs.length,done=0,pts=0;t.qs.forEach(function(q){var a=S.ans[q.id];if(a&&a.done){done++;pts+=a.pts;}});return {n:n,done:done,pts:pts,max:n*10,pct:Math.round(100*pts/(n*10))};}
function allStats(){var n=0,done=0,pts=0;T.forEach(function(t){var s=topicStats(t.id);n+=s.n;done+=s.done;pts+=s.pts;});return {n:n,done:done,pts:pts,pct:Math.round(100*pts/(n*10))};}
function runStats(){var n=0,done=0,pts=0;S.run.forEach(function(r){if(r.k==="q"){n++;var a=S.ans[r.id];if(a&&a.done){done++;pts+=a.pts;}}});return {n:n,done:done,pts:pts,pct:n?Math.round(100*pts/(n*10)):0};}
function buildRun(tids){var run=[];tids.forEach(function(tid){var t=T.filter(function(x){return x.id===tid;})[0];run.push({k:"learn",t:tid});var qs=shuf(t.qs.map(function(q){return q.id;}),"run-"+tid);qs.forEach(function(id){run.push({k:"q",t:tid,id:id});});});return run;}
function startRun(tids,fresh){S.seed=newSeed();S.attempt=(S.attempt||1)+(fresh?1:0);tids.forEach(function(tid){T.filter(function(x){return x.id===tid;})[0].qs.forEach(function(q){delete S.ans[q.id];});});S.run=buildRun(tids);S.pos=0;S.mode="run";save();closeMenu();render();}
function weak(){var w=T.filter(function(t){var s=topicStats(t.id);return s.done<s.n||s.pct<75;}).map(function(t){return t.id;});return w.length?w:T.map(function(t){return t.id;});}
function restartAll(){if(!confirm("להתחיל הכול מחדש? ההתקדמות תימחק, והשאלות יעורבבו מחדש."))return;S.ans={};S.run=[];S.pos=0;S.mode="home";S.seed=newSeed();S.attempt=(S.attempt||1)+1;save();render();toast("מתחילים מחדש! בהצלחה 💪");}
/* ---------- shell ---------- */
function shell(){$("topbar").hidden=false;$("side").hidden=false;$("whoName").textContent="👤 "+S.name;}
function updateTop(){var st=S.mode==="run"?runStats():allStats();$("progFill").style.width=(st.n?Math.round(100*st.done/st.n):0)+"%";$("progText").textContent=(st.n?Math.round(100*st.done/st.n):0)+"%";$("points").textContent=allStats().pts;}
function renderSide(){var cur=S.mode==="run"&&S.run[S.pos]?S.run[S.pos].t:null,h='<h3>הסוגיות</h3>';
  T.forEach(function(t){var s=topicStats(t.id),cls=s.done===s.n?"done":s.done?"part":"",p=Math.round(100*s.done/s.n);
   h+='<button class="top'+(cur===t.id?" cur":"")+'" data-t="'+t.id+'"><span class="ring '+cls+'" style="--p:'+p+'%">'+(cls==="done"?"✓":"")+'</span><span>'+(t.id==="z"?"":"סוגיה "+t.num+" – ")+esc(t.title)+' '+t.icon+'</span></button>';});
  h+='<div class="home-link"><button class="top" id="sideHome">🏠 מסך הבית</button><button class="top" id="sideRestart">🔄 התחל מחדש</button></div>';
  $("side").innerHTML=h;
  $("side").querySelectorAll("button[data-t]").forEach(function(b){b.onclick=function(){var tid=b.getAttribute("data-t");var i=S.run.findIndex?S.run.findIndex(function(r){return r.t===tid&&r.k==="learn";}):-1;if(i>=0){S.mode="run";go(i);closeMenu();}else startRun([tid]);};});
  $("sideHome").onclick=function(){S.mode="home";save();closeMenu();render();};$("sideRestart").onclick=function(){closeMenu();restartAll();};}
function openMenu(){$("side").classList.add("open");$("scrim").hidden=false;}
function closeMenu(){$("side").classList.remove("open");$("scrim").hidden=true;}
function go(i){closeGloss();S.pos=Math.max(0,Math.min(S.run.length,i));save();render();window.scrollTo(0,0);}
function render(){if(!S)return showLogin();updateTop();renderSide();if(S.mode==="home")return renderHome();if(S.pos>=S.run.length)return renderEnd();var r=S.run[S.pos];if(r.k==="learn")renderLearn(r);else renderQ(QS[r.id]);}
/* ---------- login / home / end ---------- */
function showLogin(){$("topbar").hidden=true;$("side").hidden=true;var last="";try{last=localStorage.getItem(LSP+"last")||"";}catch(e){}
  $("view").innerHTML='<div class="card login"><div class="brand-mark" style="margin:0 auto 10px;width:60px;height:60px;font-size:2rem">ת</div><h1>לומדה: זמן התפילין ויד שמאל</h1><p class="sub">מנחות לו ע״ב – לז ע״א · סוגיות ו–יא · חזרה עצמית למבחן</p>'+
  '<p>כתבו את השם שלכם — ההתקדמות תישמר במחשב הזה, ותוכלו לחזור אליה.</p><input id="nm" placeholder="שם פרטי ומשפחה" value="'+esc(last)+'" autocomplete="off"><div class="act" style="justify-content:center"><button class="btn primary" id="enter">כניסה ←</button></div></div>';
  $("enter").onclick=function(){login($("nm").value);};$("nm").onkeydown=function(e){if(e.key==="Enter")login($("nm").value);};}
function renderHome(){var st=allStats(),inRun=S.run.length&&S.pos<S.run.length;
  var h='<div class="card"><h1>שלום '+esc(S.name)+'! 👋</h1><p class="sub">בחרו סוגיה, או עברו על הכול. לפני כל סוגיה יש כרטיס תזכורת עם לשון הגמרא. אפשר לחזור על הלומדה כמה פעמים — בכל פעם השאלות והתשובות מתערבבות מחדש.</p>';
  h+='<div class="modes">'+(inRun?'<button class="btn gold" id="cont">▶ המשך מאיפה שעצרתי</button>':'')+'<button class="btn primary" id="all">📚 כל הסוגיות</button><button class="btn" id="weak"'+(st.done?'':' disabled')+'>🎯 רק נושאים חלשים</button><button class="btn" id="rs">🔄 התחל מחדש</button></div>';
  h+='<div class="tgrid">';T.forEach(function(t){var s=topicStats(t.id);h+='<button class="tcard" data-t="'+t.id+'"><span class="ic">'+t.icon+'</span><span class="nm">'+(t.id==="z"?"":"סוגיה "+t.num+" · ")+esc(t.title)+'</span><span class="sb">'+esc(t.sub)+' · '+t.daf+'</span><span class="sb">'+s.done+'/'+s.n+' שאלות · '+s.pct+'%</span><div class="bar"><i style="width:'+s.pct+'%"></i></div></button>';});
  h+='</div><p class="sub" style="text-align:center">⭐ '+st.pts+' נקודות עד עכשיו · ניסיון מס׳ '+(S.attempt||1)+'</p></div>';
  $("view").innerHTML=h;
  if(inRun)$("cont").onclick=function(){S.mode="run";render();};
  $("all").onclick=function(){startRun(T.map(function(t){return t.id;}),true);};$("weak").onclick=function(){startRun(weak(),true);};$("rs").onclick=restartAll;
  $("view").querySelectorAll(".tcard").forEach(function(b){b.onclick=function(){startRun([b.getAttribute("data-t")]);};});}
function renderEnd(){var st=runStats(),stars=Math.max(1,Math.round(5*st.pct/100)),tids=[];S.run.forEach(function(r){if(tids.indexOf(r.t)<0)tids.push(r.t);});
  var msg=st.pct>=90?"מצוין! אתם מוכנים למבחן 🏆":st.pct>=70?"יפה מאוד! עוד קצת חזרה על הנושאים החלשים":"כדאי לחזור שוב — אפשר להתחיל מחדש בכל רגע 💪";
  var h='<div class="card"><h1 style="text-align:center">סיימתם! 🎉</h1><div class="stars">'+"⭐".repeat(stars)+'<span style="opacity:.25">'+"⭐".repeat(5-stars)+'</span></div><div class="big">'+st.pct+'%</div><p class="sub" style="text-align:center">'+st.done+' מתוך '+st.n+' שאלות · '+st.pts+' נקודות · '+msg+'</p><div class="tstat">';
  tids.forEach(function(tid){var t=T.filter(function(x){return x.id===tid;})[0],s=topicStats(tid);h+='<b>'+(t.id==="z"?"":"סוגיה "+t.num+" · ")+esc(t.title)+'</b><div class="bar" style="height:14px"><i style="width:'+s.pct+'%;background:'+(s.pct>=75?"var(--ok)":s.pct>=50?"var(--gold2)":"var(--bad)")+'"></i></div><span>'+s.pct+'%</span>';});
  h+='</div><div class="modes"><button class="btn gold" id="weak">🎯 חזרה על נושאים חלשים</button><button class="btn primary" id="again">🔄 עוד פעם — הכול מעורבב מחדש</button><button class="btn" id="home">🏠 מסך הבית</button></div></div>';
  $("view").innerHTML=h;if(st.pct>=70)confetti();
  $("weak").onclick=function(){startRun(weak(),true);};$("again").onclick=function(){startRun(tids,true);};$("home").onclick=function(){S.mode="home";save();render();};}
/* ---------- learn ---------- */
function topicOf(id){return T.filter(function(x){return x.id===id;})[0];}
function crumb(r,kind){var t=topicOf(r.t);var p=kind==="learn"?'<span class="pill">תזכורת</span>':GAMES[kind]?'<span class="pill g">משחק</span>':kind==="open"?'<span class="pill w">כתיבה</span>':'<span class="pill q">'+TN[kind]+'</span>';return '<div class="crumb">'+p+'<span>'+(t.id==="z"?"":"סוגיה "+t.num+" · ")+esc(t.title)+'</span></div>';}
function navRow(){var n=S.run.length,i=S.pos;return '<div class="navrow"><button class="btn" id="prev"'+(i===0?" disabled":"")+'>→ הקודם</button><span class="step">שלב '+(i+1)+' מתוך '+n+'</span><button class="btn primary" id="next">'+(i===n-1?"לסיום ←":"הבא ←")+'</button></div>';}
function bindNav(){$("prev").onclick=function(){go(S.pos-1);};$("next").onclick=function(){go(S.pos+1);};}
function gemHTML(rows){return '<div class="gem">'+rows.map(function(r){return '<p><span class="tg">'+esc(r[0])+'</span>'+esc(r[1])+'</p>';}).join("")+'</div>';}
function renderLearn(r){var t=topicOf(r.t),L=t.learn;$("view").innerHTML='<article class="card">'+crumb(r,"learn")+'<h1>'+t.icon+' '+esc(L.title)+'</h1><p class="sub">'+(t.id==="z"?"":"סוגיה "+t.num+" · ")+t.daf+' — קראו את לשון הגמרא ואת ההסבר, ואז נתחיל.</p>'+gemHTML(L.gemara)+GHINT+'<ul class="points">'+L.points.map(function(p){return "<li>"+p+"</li>";}).join("")+'</ul>'+navRow()+'</article>';bindNav();$("next").textContent="לשאלות ←";applyGloss($("view").querySelector(".gem"),t.id);}
/* ---------- questions ---------- */
function fb(kind,html){var e=$("fb");e.className="feedback "+kind;e.innerHTML=html;e.hidden=false;}
function whyH(q){return q.why?'<span class="why">💬 '+esc(q.why)+'</span>':"";}
function finish(q,a,sc){a.done=true;a.sc=sc;a.pts=Math.max(0,Math.round(sc*10)-(a.hint?3:0));save();updateTop();renderSide();if(sc===1)confetti();var n=$("next");if(n)n.classList.add("primary");}
function okMsg(a){return a.sc===1?"✔ נכון מאוד! +"+a.pts+" ⭐":a.sc>0?"✔ נכון — בניסיון השני. +"+a.pts+" ⭐":"✘ הפעם לא. הנה התשובה הנכונה.";}
function renderQ(q){var r=S.run[S.pos],a=rec(q.id);
  var h='<article class="card">'+crumb(r,q.k)+(q.quote?'<div class="quote">'+esc(q.quote)+'</div>':'')+'<div class="qtext">'+esc(q.q)+'</div><div id="body"></div><div class="act" id="act"></div><div id="fb" class="feedback" hidden></div>'+navRow()+'</article>';
  $("view").innerHTML=h;bindNav();if(q.quote&&!q.noGloss&&!GAMES[q.k]){var gq=$("view").querySelector(".quote");if(applyGloss(gq,q.topic,[].concat(q.opts||[],q.why?[]:[])))gq.classList.add("has-gw");}({mc:qMC,tf:qMC,bank:qBank,match:qMatch,sort:qSort,order:qOrder,open:qOpen,fill:qFill,memory:gMem,scramble:gScr,letters:gLet})[q.k](q,a,$("body"),$("act"));}
/* multiple choice + true/false */
function qMC(q,a,body,act){var tf=q.k==="tf",opts,correct;
  if(tf){opts=["נכון","לא נכון"];correct=q.a?0:1;}else{var o=shuf(q.opts.map(function(x,i){return i;}),"o-"+q.id);opts=o.map(function(i){return q.opts[i];});correct=o.indexOf(0);}
  a.wrongs=a.wrongs||[];
  body.innerHTML=(tf?'<div class="tfrow">':'<div class="opts">')+opts.map(function(o,i){return '<button class="opt" data-i="'+i+'">'+(tf?'':'<span class="L">'+"אבגד"[i]+'</span>')+'<span>'+(tf?(i?"✘ ":"✔ "):"")+esc(o)+'</span></button>';}).join("")+'</div>';
  var bs=body.querySelectorAll(".opt");
  function paint(){bs.forEach(function(b,i){b.classList.toggle("wrong",a.wrongs.indexOf(i)>=0);if(a.wrongs.indexOf(i)>=0)b.disabled=true;if(a.gone===i)b.classList.add("gone");if(a.done){b.disabled=true;if(i===correct)b.classList.add("right");}});}
  if(!tf&&!a.done&&opts.length>2){act.innerHTML='<button class="btn small" id="hint"'+(a.hint?" disabled":"")+'>💡 רמז — הורד תשובה אחת (−3)</button>';$("hint").onclick=function(){if(a.hint||a.done)return;var c=[];for(var i=0;i<opts.length;i++)if(i!==correct&&a.wrongs.indexOf(i)<0)c.push(i);if(!c.length)return;a.hint=1;a.gone=c[Math.floor(Math.random()*c.length)];save();paint();this.disabled=true;if(q.hint)fb("info","💡 "+esc(q.hint));};}
  paint();if(a.done)fb(a.sc>0?"ok":"bad",okMsg(a)+whyH(q));
  bs.forEach(function(b,i){b.onclick=function(){if(a.done)return;a.tries++;if(i===correct){finish(q,a,a.tries===1?1:.5);paint();fb("ok",okMsg(a)+whyH(q));act.innerHTML="";}else{a.wrongs.push(i);if(a.tries>=2||tf){finish(q,a,0);paint();fb("bad",okMsg(a)+whyH(q));act.innerHTML="";}else{save();paint();fb("warn","✘ לא נכון. נסו שוב — תשובה נכונה עכשיו שווה חצי נקודות."+(q.hint&&!a.hint?' <span class="why">💡 רמז: '+esc(q.hint)+'</span>':''));}}};});}
/* generic two-try checker for multi-part questions */
function twoTry(q,a,act,isOk,mark,reveal,redraw){act.innerHTML=a.done?"":'<button class="btn primary" id="chk">✔ בדיקה</button>';if(a.done){mark(true);reveal();fb(a.sc>0?"ok":"bad",okMsg(a)+whyH(q));return;}
  $("chk").onclick=function(){var res=isOk();if(res===null){toast("השלימו את כל החלקים קודם");return;}a.tries++;if(res){finish(q,a,a.tries===1?1:.5);mark(true);fb("ok",okMsg(a)+whyH(q));act.innerHTML="";}else if(a.tries>=2){finish(q,a,0);reveal();mark(true);fb("bad",okMsg(a)+whyH(q));act.innerHTML="";}else{save();mark(false);fb("warn","✘ יש טעויות (מסומנות באדום). תקנו ובדקו שוב — עכשיו שווה חצי נקודות.");}};}
/* word bank */
function qBank(q,a,body,act){var ans=[];var parts=q.text.split(/\[([^\]]+)\]/);for(var i=1;i<parts.length;i+=2)ans.push(parts[i]);
  var chips=shuf(ans.concat(q.extra||[]),"b-"+q.id);a.v=a.v||ans.map(function(){return null;});var sel=a.v.indexOf(null);var marks=null;
  function draw(){var h='<div class="banktext">',k=0;for(var i=0;i<parts.length;i++){if(i%2===0)h+=esc(parts[i]);else{var v=a.v[k];var cls="slot"+(sel===k&&!a.done?" sel":"")+(marks&&marks[k]!==undefined?(marks[k]?" ok":" bad"):"");h+='<span class="'+cls+'" data-k="'+k+'">'+(v===null?"&nbsp;":esc(chips[v]))+'</span>';k++;}}
    h+='</div><div class="chips"><span class="lbl">מחסן מילים:</span>'+chips.map(function(c,i){return '<button class="chip'+(a.v.indexOf(i)>=0?" used":"")+'" data-c="'+i+'">'+esc(c)+'</button>';}).join("")+'</div>';body.innerHTML=h;
    body.querySelectorAll(".slot").forEach(function(s){s.onclick=function(){if(a.done)return;var k=+s.getAttribute("data-k");if(a.v[k]!==null){a.v[k]=null;}sel=k;marks=null;save();draw();};});
    body.querySelectorAll(".chip").forEach(function(c){c.onclick=function(){if(a.done)return;var i=+c.getAttribute("data-c");if(sel<0||sel===undefined||a.v[sel]!==null)sel=a.v.indexOf(null);if(sel<0)return;a.v[sel]=i;sel=a.v.indexOf(null);marks=null;save();draw();};});}
  draw();
  twoTry(q,a,act,function(){if(a.v.indexOf(null)>=0)return null;return a.v.every(function(v,k){return chips[v]===ans[k];});},
   function(final){marks=a.v.map(function(v,k){return v!==null&&chips[v]===ans[k];});draw();},
   function(){a.v=ans.map(function(x){return chips.indexOf(x);});draw();});}
/* matching */
var PC=["#1f4e8c","#c2410c","#7c3aed","#0f766e","#b91c1c","#a16207","#be185d"];
function qMatch(q,a,body,act){var n=q.pairs.length,rights=shufNot(q.pairs.map(function(p,i){return i;}),"m-"+q.id),lefts=shuf(q.pairs.map(function(p,i){return i;}),"ml-"+q.id);a.p=a.p||{};var selL=null,marks=null;
  var arL=/[\u0591-\u05C7]/.test(q.pairs[0][0]),arR=/[\u0591-\u05C7]/.test(q.pairs[0][1]);
  function color(l){return PC[Object.keys(a.p).map(Number).sort().indexOf(l)%PC.length];}
  function draw(){var h='<div class="match"><div class="head">'+esc(q.heads[0])+'</div><div class="head">'+esc(q.heads[1])+'</div>';
    for(var r=0;r<n;r++){var l=lefts[r],ri=rights[r],own=Object.keys(a.p).filter(function(x){return a.p[x]===ri;})[0];
      var lm=marks&&a.p[l]!==undefined?(marks[l]?" ok":" bad"):"",rm=marks&&own!==undefined?(marks[own]?" ok":" bad"):"";
      h+='<button class="mi'+(arL?" ar":"")+(selL===l?" sel":"")+lm+'" data-l="'+l+'">'+(a.p[l]!==undefined?'<span class="n" style="background:'+PC[l%PC.length]+'">'+(l+1)+'</span>':'')+esc(q.pairs[l][0])+'</button>';
      h+='<button class="mi'+(arR?" ar":"")+rm+'" data-r="'+ri+'">'+(own!==undefined?'<span class="n" style="background:'+PC[own%PC.length]+'">'+(+own+1)+'</span>':'')+esc(q.pairs[ri][1])+'</button>';}
    body.innerHTML=h+'</div><p class="sub" style="margin-top:8px">לחצו על פריט בעמודה הימנית, ואז על המתאים לו בשמאלית.</p>';
    body.querySelectorAll("[data-l]").forEach(function(b){b.onclick=function(){if(a.done)return;var l=+b.getAttribute("data-l");delete a.p[l];selL=l;marks=null;draw();};});
    body.querySelectorAll("[data-r]").forEach(function(b){b.onclick=function(){if(a.done)return;if(selL===null){toast("קודם בחרו פריט בעמודה הימנית");return;}var ri=+b.getAttribute("data-r");Object.keys(a.p).forEach(function(x){if(a.p[x]===ri)delete a.p[x];});a.p[selL]=ri;selL=null;for(var k=0;k<n;k++){if(a.p[lefts[k]]===undefined){selL=lefts[k];break;}}marks=null;save();draw();};});}
  selL=a.done?null:lefts.filter(function(l){return a.p[l]===undefined;})[0];if(selL===undefined)selL=null;draw();
  twoTry(q,a,act,function(){if(Object.keys(a.p).length<n)return null;return q.pairs.every(function(p,i){return a.p[i]===i;});},
   function(){marks={};for(var i=0;i<n;i++)marks[i]=a.p[i]===i;draw();},
   function(){a.p={};for(var i=0;i<n;i++)a.p[i]=i;draw();});}
/* sorting */
function qSort(q,a,body,act){var order=shuf(q.items.map(function(x,i){return i;}),"s-"+q.id);a.v=a.v||{};var marks=null;
  function draw(){body.innerHTML=order.map(function(i){var it=q.items[i],m=marks?(a.v[i]===it[1]?" ok":" bad"):"";return '<div class="srow'+m+'"><span class="t">'+esc(it[0])+'</span><span class="cats">'+q.cats.map(function(c,ci){return '<button class="cb'+(a.v[i]===ci?" on":"")+'" data-i="'+i+'" data-c="'+ci+'">'+esc(c)+'</button>';}).join("")+'</span></div>';}).join("");
    body.querySelectorAll(".cb").forEach(function(b){b.onclick=function(){if(a.done)return;a.v[+b.getAttribute("data-i")]=+b.getAttribute("data-c");marks=null;save();draw();};});}
  draw();twoTry(q,a,act,function(){if(Object.keys(a.v).length<q.items.length)return null;return q.items.every(function(it,i){return a.v[i]===it[1];});},function(){marks=1;draw();},function(){q.items.forEach(function(it,i){a.v[i]=it[1];});draw();});}
/* ordering */
function qOrder(q,a,body,act){a.o=a.o||shufNot(q.items.map(function(x,i){return i;}),"or-"+q.id);var marks=null,from=null;
  function draw(){body.innerHTML=a.o.map(function(ix,p){var m=marks?(ix===p?" ok":" bad"):"";return '<div class="oitem'+m+'" draggable="'+(!a.done)+'" data-p="'+p+'"><span class="num">'+(p+1)+'</span><span class="t">'+esc(q.items[ix])+'</span>'+(a.done?'':'<span class="mv"><button data-u="'+p+'" aria-label="למעלה">▲</button><button data-d="'+p+'" aria-label="למטה">▼</button></span>')+'</div>';}).join("")+(a.done?'':'<p class="sub">גררו, או השתמשו בחצים ▲▼.</p>');
    body.querySelectorAll("[data-u]").forEach(function(b){b.onclick=function(){mv(+b.getAttribute("data-u"),-1);};});
    body.querySelectorAll("[data-d]").forEach(function(b){b.onclick=function(){mv(+b.getAttribute("data-d"),1);};});
    body.querySelectorAll(".oitem").forEach(function(el){el.ondragstart=function(){from=+el.getAttribute("data-p");el.classList.add("drag");};el.ondragend=function(){el.classList.remove("drag");};el.ondragover=function(e){e.preventDefault();el.classList.add("over");};el.ondragleave=function(){el.classList.remove("over");};el.ondrop=function(e){e.preventDefault();var to=+el.getAttribute("data-p");if(from===null||from===to)return draw();var x=a.o.splice(from,1)[0];a.o.splice(to,0,x);from=null;marks=null;save();draw();};});}
  function mv(p,d){if(a.done)return;var t=p+d;if(t<0||t>=a.o.length)return;var x=a.o[p];a.o[p]=a.o[t];a.o[t]=x;marks=null;save();draw();}
  draw();twoTry(q,a,act,function(){return a.o.every(function(ix,p){return ix===p;});},function(){marks=1;draw();},function(){a.o=q.items.map(function(x,i){return i;});draw();});}
/* fill-in */
function qFill(q,a,body,act){body.innerHTML='<div class="fillrow"><span>'+esc(q.before)+'</span><input id="fin" autocomplete="off" value="'+esc(a.v||"")+'"'+(a.done?" disabled":"")+'><span>'+esc(q.after||"")+'</span></div>';var inp=$("fin");
  function ok(v){var n=nz(v).replace(/ /g,"");return q.alts.some(function(x){return nz(x).replace(/ /g,"")===n;});}
  twoTry(q,a,act,function(){a.v=inp.value;if(!nz(a.v))return null;return ok(a.v);},function(){inp.style.borderColor=a.done&&a.sc>0||ok(inp.value)?"var(--ok)":"var(--bad)";if(a.done)inp.disabled=true;},function(){inp.value=q.alts[0]==="ה"?"ה׳":q.alts[0];inp.disabled=true;});
  inp.onkeydown=function(e){if(e.key==="Enter"&&$("chk"))$("chk").click();};}
/* open writing */
function qOpen(q,a,body,act){body.innerHTML='<textarea id="otx" placeholder="כתבו כאן את התשובה שלכם..."'+(a.shown?" disabled":"")+'>'+esc(a.v||"")+'</textarea><div id="omodel"></div>';var tx=$("otx");tx.oninput=function(){a.v=tx.value;save();};
  function show(){var t=nz(a.v),hits=q.kw.map(function(g){return g.some(function(k){return t.indexOf(nz(k))>=0;});});var hc=hits.filter(Boolean).length;
    $("omodel").innerHTML='<div class="kw">'+q.kw.map(function(g,i){return '<span class="'+(hits[i]?"y":"n")+'">'+(hits[i]?"✔ ":"○ ")+esc(g[0])+'</span>';}).join("")+'</div><div class="model"><b>תשובה לדוגמה:</b> '+esc(q.model)+'</div>'+(a.done?'':'<p style="margin:10px 0 0;font-weight:800">השוו את התשובה שלכם לתשובה לדוגמה — איך הלך?</p><div class="self"><button class="btn" data-s="1">✅ הבנתי</button><button class="btn" data-s=".5">🤏 חלקית</button><button class="btn" data-s="0">🔁 עוד לא</button></div>');
    fb(hc===q.kw.length?"ok":hc?"warn":"info",hc===q.kw.length?"👍 כל מילות המפתח מופיעות בתשובה שלכם.":hc?"כתבתם חלק ממילות המפתח ("+hc+" מתוך "+q.kw.length+"). בדקו מה חסר.":"לא מצאתי מילות מפתח בתשובה — השוו לתשובה לדוגמה.");
    if(a.done){fb(a.sc===1?"ok":a.sc>0?"warn":"info","הערכה עצמית: "+(a.sc===1?"✅ הבנתי":a.sc>0?"🤏 חלקית":"🔁 עוד לא")+" · +"+a.pts+" ⭐");}
    $("omodel").querySelectorAll("[data-s]").forEach(function(b){b.onclick=function(){finish(q,a,+b.getAttribute("data-s"));show();};});}
  if(a.shown){show();return;}
  act.innerHTML='<button class="btn primary" id="shw">📖 הצג תשובה לדוגמה</button>';$("shw").onclick=function(){a.v=tx.value;if(nz(a.v).length<8){toast("כתבו קודם תשובה (לפחות משפט קצר)");return;}a.shown=1;tx.disabled=true;save();act.innerHTML="";show();};}
/* memory game */
function gMem(q,a,body,act,practice){var cards=[];q.pairs.forEach(function(p,i){cards.push([i,0]);cards.push([i,1]);});cards=shuf(cards,"mem-"+q.id+"-"+(a.round||0));var up=[],got=a.done&&!practice?q.pairs.map(function(p,i){return i;}):[],miss=0,busy=false;
  function draw(){body.innerHTML='<div class="mem">'+cards.map(function(c,k){var isUp=up.indexOf(k)>=0||got.indexOf(c[0])>=0;return '<button class="mc'+(c[1]===0?" ar":"")+(isUp?" up":"")+(got.indexOf(c[0])>=0?" got":"")+'" data-k="'+k+'">'+(isUp?esc(q.pairs[c[0]][c[1]]):"")+'</button>';}).join("")+'</div><p class="sub" style="margin-top:8px">הפכו שני קלפים: ביטוי בארמית והתרגום שלו. טעויות: '+miss+'</p>';
    body.querySelectorAll(".mc").forEach(function(b){b.onclick=function(){if(busy||(a.done&&!practice))return;var k=+b.getAttribute("data-k");if(up.indexOf(k)>=0||got.indexOf(cards[k][0])>=0)return;up.push(k);draw();if(up.length===2){var x=cards[up[0]],y=cards[up[1]];if(x[0]===y[0]&&x[1]!==y[1]){got.push(x[0]);up=[];draw();if(got.length===q.pairs.length){if(!a.done)finish(q,a,miss<=q.pairs.length?1:.5);fb("ok","🎉 כל הזוגות נמצאו! "+miss+" טעויות · +"+a.pts+" ⭐");act.innerHTML='<button class="btn" id="again">🔄 עוד סיבוב</button>';$("again").onclick=again;}}else{miss++;busy=true;setTimeout(function(){up=[];busy=false;draw();},900);}}};});}
  function again(){a.round=(a.round||0)+1;save();$("fb").hidden=true;act.innerHTML="";gMem(q,a,body,act,true);}
  draw();if(a.done&&!practice){fb("ok","✔ המשחק הושלם · +"+a.pts+" ⭐");act.innerHTML='<button class="btn" id="again">🔄 עוד סיבוב</button>';$("again").onclick=again;}}
/* word scramble */
function gScr(q,a,body,act){var pool=shufNot(q.words.map(function(w,i){return i;}),"sc-"+q.id);a.b=a.b||[];var marks=null;
  function draw(){var left=pool.filter(function(i){return a.b.indexOf(i)<0;});body.innerHTML='<p class="lhint">לחצו על המילים לפי הסדר. לחיצה על מילה שבחרתם — מחזירה אותה.</p><div class="tiles built">'+a.b.map(function(i,p){return '<button class="tile" data-b="'+p+'" style="'+(marks?(i===p||q.words[i]===q.words[p]?"border-color:var(--ok);background:var(--okbg)":"border-color:var(--bad);background:var(--badbg)"):"")+'">'+esc(q.words[i])+'</button>';}).join("")+'</div><div class="tiles">'+left.map(function(i){return '<button class="tile" data-w="'+i+'">'+esc(q.words[i])+'</button>';}).join("")+'</div>'+(a.done?'<div class="model"><b>תרגום:</b> '+esc(q.tr)+'</div>':'');
    body.querySelectorAll("[data-w]").forEach(function(b){b.onclick=function(){if(a.done)return;a.b.push(+b.getAttribute("data-w"));marks=null;save();draw();};});
    body.querySelectorAll("[data-b]").forEach(function(b){b.onclick=function(){if(a.done)return;a.b.splice(+b.getAttribute("data-b"),1);marks=null;save();draw();};});}
  draw();twoTry(q,a,act,function(){if(a.b.length<q.words.length)return null;return a.b.every(function(i,p){return q.words[i]===q.words[p];});},function(){marks=1;draw();},function(){a.b=q.words.map(function(w,i){return i;});draw();});}
/* letter scramble */
function gLet(q,a,body,act){a.w=a.w||0;a.err=a.err||0;
  function draw(){if(a.done||a.w>=q.items.length){body.innerHTML='<div class="model"><b>כל המילים:</b> '+q.items.map(function(it){return esc(it[0])+" = "+esc(it[1]);}).join(" · ")+'</div>';return;}
    var it=q.items[a.w],L=it[0].split(""),ord=shufNot(L.map(function(x,i){return i;}),"lt-"+q.id+a.w);a.cur=a.cur||[];
    body.innerHTML='<p class="lhint">מילה '+(a.w+1)+' מתוך '+q.items.length+' · רמז: <b>'+esc(it[1])+'</b> · טעויות: '+a.err+'</p><div class="tiles built">'+L.map(function(ch,i){return '<span class="tile l">'+(i<a.cur.length?esc(ch):"&nbsp;")+'</span>';}).join("")+'</div><div class="tiles">'+ord.map(function(i){return '<button class="tile l" data-i="'+i+'"'+(a.cur.indexOf(i)>=0?' style="visibility:hidden"':'')+'>'+esc(L[i])+'</button>';}).join("")+'</div>';
    body.querySelectorAll("[data-i]").forEach(function(b){b.onclick=function(){var i=+b.getAttribute("data-i");var need=L[a.cur.length];if(L[i]===need){a.cur.push(i);if(a.cur.length===L.length){a.w++;a.cur=[];toast("✔ "+it[0]+" = "+it[1]);if(a.w>=q.items.length){finish(q,a,a.err<=3?1:.5);fb("ok","🎉 כל המילים סודרו! "+a.err+" טעויות · +"+a.pts+" ⭐");}}save();draw();}else{a.err++;b.animate([{transform:"translateX(-6px)"},{transform:"translateX(6px)"},{transform:"none"}],{duration:250});save();var p=body.querySelector(".lhint");if(p)p.innerHTML=p.innerHTML.replace(/טעויות: \d+/,"טעויות: "+a.err);}};});}
  draw();if(a.done)fb("ok","✔ המשחק הושלם · +"+a.pts+" ⭐");}

/* ---------- click-to-translate (מותאם מהמנגנון שבאתר: .gw + בועת תרגום) ---------- */
function isL(c){return !!c&&/[\u05D0-\u05EA\u0591-\u05C7]/.test(c);}
function glossList(tid,guard){var g=(window.GLOSS||[]).filter(function(e){if(e.t&&e.t.indexOf(tid)<0)return false;if(guard&&guard.some(function(x){var h=nz(e.he);return h.length>1&&nz(x).indexOf(h)>=0;}))return false;return true;});return g.sort(function(a,b){return b.ar.length-a.ar.length;});}
function applyGloss(root,tid,guard){if(!root)return 0;var list=glossList(tid,guard),n=0;
  list.forEach(function(e){var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(x){return x.parentElement.closest(".gw,.tg")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}}),nodes=[];while(w.nextNode())nodes.push(w.currentNode);
    nodes.forEach(function(node){var text=node.nodeValue,from=0,idx;while((idx=text.indexOf(e.ar,from))>=0){var end=idx+e.ar.length;if(isL(text.charAt(idx-1))||isL(text.charAt(end))){from=end;continue;}
      var sp=document.createElement("span");sp.className="gw";sp.tabIndex=0;sp.setAttribute("role","button");sp.dataset.he=e.he;if(e.ex)sp.dataset.ex=e.ex;sp.textContent=e.ar;
      var rest=document.createTextNode(text.slice(end));node.nodeValue=text.slice(0,idx);node.parentNode.insertBefore(sp,node.nextSibling);sp.parentNode.insertBefore(rest,sp.nextSibling);n++;node=rest;text=rest.nodeValue;from=0;}});});
  return n;}
function closeGloss(){var p=$("gpop");if(p)p.hidden=true;document.querySelectorAll(".gw.on").forEach(function(x){x.classList.remove("on");});}
function openGloss(el){var was=el.classList.contains("on");closeGloss();if(was)return;el.classList.add("on");var p=$("gpop");
  p.innerHTML='<b>'+esc(el.dataset.he)+'</b>'+(el.dataset.ex?'<small>'+esc(el.dataset.ex)+'</small>':'');p.hidden=false;p.classList.remove("below");
  var r=el.getClientRects(),rc=r.length?r[0]:el.getBoundingClientRect(),vw=document.documentElement.clientWidth;p.style.maxWidth=Math.min(420,vw-20)+"px";p.style.left="0px";p.style.top="0px";
  var pw=p.offsetWidth,ph=p.offsetHeight,x=rc.left+rc.width/2-pw/2;x=Math.max(10,Math.min(vw-pw-10,x));var y=rc.top-ph-10;if(y<60){y=rc.bottom+10;p.classList.add("below");}
  p.style.left=x+"px";p.style.top=y+"px";p.style.setProperty("--ax",(rc.left+rc.width/2-x)+"px");}
document.addEventListener("click",function(ev){var g=ev.target.closest&&ev.target.closest(".gw");if(g){ev.preventDefault();ev.stopPropagation();openGloss(g);}else closeGloss();},true);
document.addEventListener("keydown",function(ev){if(ev.key==="Escape")closeGloss();if((ev.key==="Enter"||ev.key===" ")&&ev.target.classList&&ev.target.classList.contains("gw")){ev.preventDefault();openGloss(ev.target);}});
window.addEventListener("scroll",closeGloss,true);window.addEventListener("resize",closeGloss);
var GHINT='<p class="ghint">👆 לחצו על מילה בארמית (מסומנת בקו נקודות צהוב) — ויופיע התרגום.</p>';
/* ---------- boot ---------- */
$("menuBtn").onclick=openMenu;$("scrim").onclick=closeMenu;
window.LOMDA={applyGloss:applyGloss,get S(){return S;},go:go,startRun:startRun,login:login,render:render,QS:QS};
showLogin();
})();
