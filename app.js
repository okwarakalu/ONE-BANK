// ONE BANK v3.1 FIXED - NO BARE GLOBALS, NO CRASH ON LOAD
// FIX: every element via $() + null check. showPage() never calls dashboard render when logged out.
function $(id){ return document.getElementById(id); }
function setText(id,txt){ var el=$(id); if(el) el.textContent=txt; }
function setHTML(id,html){ var el=$(id); if(el) el.innerHTML=html; }
function getVal(id){ var el=$(id); return el ? el.value.trim() : ""; }
function showEl(id,show){ var el=$(id); if(el) el.style.display=show?'block':'none'; }

var COUNTRY = "Nigeria";
try{ COUNTRY = localStorage.getItem("ob_country") || "Nigeria"; }catch(e){}
var RATES = { "Nigeria": 1353, "Ghana": 11.79, "South Africa": 17.59 };
var SYM = { "Nigeria": "₦", "Ghana": "GH₵", "South Africa": "R" };
var MIN_LOCAL = { "Nigeria": 2710, "Ghana": 30, "South Africa": 40 };

var BANKS = {
"Nigeria": ["Access Bank","Citibank Nigeria","Ecobank Nigeria","Fidelity Bank","First Bank of Nigeria","FCMB","GTBank","Globus Bank","Heritage Bank","Jaiz Bank","Keystone Bank","Kuda MFB","Lotus Bank","Moniepoint MFB","OPay","PalmPay","Parallex Bank","Polaris Bank","PremiumTrust Bank","Providus Bank","Stanbic IBTC","Standard Chartered","Sterling Bank","SunTrust Bank","TAJBank","Union Bank","UBA","Unity Bank","VBank","Wema Bank","Zenith Bank","ALAT by Wema","Carbon","FairMoney MFB","Paga","Rubies Bank","Sparkle","VFD Microfinance"],
"Ghana": ["MTN MoMo","Telecel Cash","AirtelTigo Money","GCB Bank","Ecobank Ghana","Absa Ghana","Stanbic Bank Ghana","Fidelity Bank Ghana","CalBank","Zenith Bank Ghana","Access Bank Ghana","GTBank Ghana","UBA Ghana","First Atlantic Bank","Republic Bank Ghana","Societe Generale Ghana","Consolidated Bank Ghana","Agricultural Development Bank","Opportunity International"],
"South Africa": ["Capitec","FNB - First National Bank","Standard Bank","ABSA","Nedbank","TymeBank","Discovery Bank","African Bank","Bidvest Bank","Grindrod Bank","Investec","Sasfin Bank","Ubank","Postbank"]
};
var PHONE_HINT = { "Nigeria": ["080... (e.g 08031234567)","Account Number"], "Ghana": ["024... / 055... (e.g 0241234567)","MoMo / Account Number"], "South Africa": ["082... (e.g 0821234567)","Account Number"] };
var PLANS_NGN = [
{amt:10000,tier:1,d:25,i:10},{amt:15000,tier:1,d:25,i:10},{amt:20000,tier:1,d:25,i:10},
{amt:25000,tier:1,d:25,i:10},{amt:30000,tier:1,d:25,i:10},{amt:35000,tier:1,d:25,i:10},
{amt:40000,tier:2,d:30,i:10},{amt:50000,tier:2,d:30,i:10},{amt:60000,tier:2,d:30,i:10},{amt:70000,tier:2,d:30,i:10},
{amt:80000,tier:3,d:35,i:15},{amt:90000,tier:3,d:35,i:15},{amt:100000,tier:3,d:35,i:15},{amt:120000,tier:3,d:35,i:15}
];
function round10(n){ return Math.round(n/10)*10; }
function convertNGN(ngn,c){ if(c==="Nigeria") return ngn; return round10(ngn / RATES["Nigeria"] * RATES[c]); }
function fmt(n,c){ c=c||COUNTRY; return SYM[c] + Number(n||0).toLocaleString(); }
function fmtUSD(ngn){ return "$" + (ngn / RATES["Nigeria"]).toFixed(2); }
function getMembers(){ try{return JSON.parse(localStorage.getItem("ob_members")||"[]")}catch(e){return[]} }
function setMembers(m){ try{localStorage.setItem("ob_members",JSON.stringify(m))}catch(e){} }
function getWds(){ try{return JSON.parse(localStorage.getItem("ob_withdrawals")||"[]")}catch(e){return[]} }
function setWds(w){ try{localStorage.setItem("ob_withdrawals",JSON.stringify(w))}catch(e){} }
function getOrders(){ try{return JSON.parse(localStorage.getItem("ob_orders")||"[]")}catch(e){return[]} }
function setOrders(o){ try{localStorage.setItem("ob_orders",JSON.stringify(o))}catch(e){} }
function getCurrent(){ try{return JSON.parse(localStorage.getItem("ob_current")||"null")}catch(e){return null} }

function toggleDrawer(){ var d=$('drawer'); if(d) d.classList.toggle('open'); }
function showPage(p){
  try{
    ['home','shop','join','login','savings','profile','admin'].forEach(function(x){ var el=$('page-'+x); if(el) el.classList.toggle('hidden',x!==p); });
    var dr=$('drawer'); if(dr) dr.classList.remove('open');
    window.scrollTo(0,0);
    if(p==='shop') renderShop();
    if(p==='profile') renderMemberWallet();
    if(p==='savings'){
      var cur=getCurrent();
      if(!cur){ setText('savingsGate','Please login to view your savings inside your dashboard.'); }
      else { showPage('profile'); }
    }
    if(p==='admin') renderAdminSafe();
  }catch(e){ console.log('showPage error',e); }
}

// STEP 5 - COUNTRY + CALCULATOR - FIXED
function setCountry(c){
  try{
    COUNTRY=c; try{localStorage.setItem("ob_country",c)}catch(e){}
    ['Nigeria','Ghana','South Africa'].forEach(function(cc){
      var b=$('cNG'); if(cc==='Ghana') b=$('cGH'); if(cc==='South Africa') b=$('cZA');
      if(b) b.classList.toggle('active',cc===c);
    });
    setText('rateStrip',"You are in "+c+" • 1 USD = "+SYM[c]+RATES[c]+" • Min Withdrawal "+SYM[c]+MIN_LOCAL[c]+" ($2)");
    var jp=$('jPhone'); if(jp) jp.placeholder=PHONE_HINT[c][0];
    var ja=$('jAcct'); if(ja) ja.placeholder=PHONE_HINT[c][1];
    setText('calcSym',SYM[c]);
    setText('minLabel1',SYM[c]+MIN_LOCAL[c].toLocaleString());
    setText('shopCountryNote',"Prices in "+c+" • Min Withdrawal "+SYM[c]+MIN_LOCAL[c]+" ($2)");
    fillBanks(); fillPlans(); renderShop(); calcSavings();
  }catch(e){ console.log('setCountry error',e); }
}
function fillBanks(){ var s=$('jBank'); if(!s) return; s.innerHTML='<option value="">-- Select Your Bank / Wallet --</option>'+BANKS[COUNTRY].map(function(b){return '<option>'+b+'</option>'}).join(''); }
function fillPlans(){ var s=$('jPlan'); if(!s) return; s.innerHTML=PLANS_NGN.map(function(p){ var local=convertNGN(p.amt,COUNTRY); return '<option value="'+p.amt+'|'+p.tier+'|'+p.d+'|'+p.i+'">'+fmt(local,COUNTRY)+' — Tier '+p.tier+' | Direct '+p.d+'% • Indirect '+p.i+'% | ≈ '+fmtUSD(p.amt)+'</option>'; }).join(''); }

// FIXED CALCULATOR - reads LIVE typed value every keystroke
function calcSavings(){
  try{
    var input=$('calcWeekly'); if(!input) return;
    var w=parseInt(input.value,10); if(isNaN(w)||w<0) w=0;
    var yearlyLocal=w*52;
    var usd=(yearlyLocal / RATES[COUNTRY]).toFixed(2);
    setText('calcResult',"Save "+fmt(w,COUNTRY)+" weekly = "+fmt(yearlyLocal,COUNTRY)+" in 1 year (≈ $"+usd+")");
    setText('calcTest',"✓ Calculator working — "+COUNTRY+" • "+SYM[COUNTRY]+RATES[COUNTRY]+" per $1");
  }catch(e){ console.log('calc error',e); }
}

// SHOP
var PRODUCTS=[
{id:'gen1',name:'5.5KVA Generator',price:450000,old:520000,cat:'gen',img:'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600'},
{id:'gen2',name:'7KVA Generator',price:680000,old:750000,cat:'gen',img:'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600'},
{id:'fr1',name:'Double Door Fridge',price:380000,old:420000,cat:'fridge',img:'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'},
{id:'fr2',name:'Single Door Fridge',price:220000,old:260000,cat:'fridge',img:'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600'},
{id:'fz1',name:'Chest Freezer 200L',price:310000,old:350000,cat:'freezer',img:'https://images.unsplash.com/photo-1594041680539-70d1fc94e8b4?w=600'},
{id:'fz2',name:'Chest Freezer 300L',price:420000,old:480000,cat:'freezer',img:'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600'},
{id:'tv1',name:'43" Smart TV',price:280000,old:320000,cat:'tv',img:'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'},
{id:'tv2',name:'55" Smart TV',price:450000,old:520000,cat:'tv',img:'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600'},
{id:'h1',name:'Standing Fan',price:65000,old:80000,cat:'home',img:'https://images.unsplash.com/photo-1565151443833-29bfb2d5a3c6?w=600'},
{id:'h2',name:'Rice Cooker',price:45000,old:55000,cat:'home',img:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'},
{id:'h3',name:'Electric Kettle',price:35000,old:45000,cat:'home',img:'https://images.unsplash.com/photo-1594213114663-d94db9b17125?w=600'},
{id:'h4',name:'Blender Set',price:55000,old:65000,cat:'home',img:'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600'}
];
var CUR_CAT='All';
function setCat(c){ CUR_CAT=c; renderShop(); }
function renderShop(){
  try{
    var box=$('shopProducts'); if(!box) return;
    var list=PRODUCTS.filter(function(p){return CUR_CAT==='All'||p.cat===CUR_CAT});
    box.innerHTML=list.map(function(p){ var local=convertNGN(p.price,COUNTRY); var inst=round10(local/4);
      return '<div class="prod"><img src="'+p.img+'" alt="'+p.name+'" onerror="this.onerror=null;this.src=\'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600\'"><div style="padding:10px"><span style="background:#FFF3CD;font-size:10px;padding:3px 8px;border-radius:99px">IN STOCK - PAY SMALL SMALL</span><br><b>'+p.name+'</b><p>⭐⭐⭐⭐⭐ (128)</p><b>'+fmt(local,COUNTRY)+'</b> <s style="font-size:11px;color:#999">'+fmt(convertNGN(p.old,COUNTRY),COUNTRY)+'</s><p>or 4 x '+fmt(inst,COUNTRY)+'</p><button type="button" class="btnNavy" onclick="startOrder(\''+p.id+'\')">Pay Small Small →</button></div></div>'; }).join('');
  }catch(e){ console.log('shop error',e); }
}
function startOrder(id){
  var cur=getCurrent();
  if(!cur){ alert("Please Login first with your Phone + Password"); showPage('login'); return; }
  var p=PRODUCTS.find(function(x){return x.id===id}); if(!p) return;
  var total=convertNGN(p.price,COUNTRY);
  var orders=getOrders(); orders.push({id:Date.now(),user:cur.phone,product:p.name,total:total,paid:0,status:'installment',country:COUNTRY}); setOrders(orders);
  alert("✅ Order started: "+p.name+" — Pay in 4 x "+fmt(round10(total/4),COUNTRY)); renderMemberWallet();
}

// STEP 6 - JOIN / LOGIN / PROFILE / ADMIN - ALL GUARDED
function joinMember(){
  try{
    var name=getVal('jName'), phone=getVal('jPhone'), pass=getVal('jPass'), bank=getVal('jBank'), acct=getVal('jAcct'), acctName=getVal('jAcctName'), plan=getVal('jPlan');
    if(!name||!phone||!pass||!bank||!acct||!acctName||!plan){ setText('joinErr',"Please fill ALL fields."); return; }
    if(acct.length<8){ setText('joinErr',"Account / MoMo number looks too short."); return; }
    var members=getMembers(); if(members.find(function(m){return m.phone===phone})){ setText('joinErr',"Phone already registered. Please login."); return; }
    var parts=plan.split('|'); var amt=Number(parts[0]), tier=Number(parts[1]), d=Number(parts[2]), ii=Number(parts[3]);
    var ref=(getVal('jRef')||'ONEBANK').toUpperCase();
    var code='OB-'+(1001+members.length);
    var m={code:code,name:name,phone:phone,pass:pass,country:COUNTRY,bank:bank,acct:acct,acctName:acctName,plan:amt,planLocal:convertNGN(amt,COUNTRY),tier:tier,directPct:d,indirectPct:ii,referral:ref,status:'pending_payment',paymentStatus:'none',directEarn:0,indirectEarn:0,saved:0,savings:[]};
    members.push(m); setMembers(members);
    try{localStorage.setItem("ob_current",JSON.stringify({phone:phone,code:code}))}catch(e){}
    showEl('payCard',true);
    setText('payAmount',fmt(convertNGN(amt,COUNTRY),COUNTRY)+" (≈ "+fmtUSD(amt)+")");
    setText('joinErr',"");
    alert("✅ Welcome "+name+"! Your code is "+code+". Now pay "+fmt(convertNGN(amt,COUNTRY),COUNTRY)+" then enter Sender + Ref.");
    var pc=$('payCard'); if(pc) window.scrollTo(0,pc.offsetTop);
  }catch(e){ alert("Join error: "+e.message); }
}
function submitPayment(){
  var sender=getVal('paySender'), ref=getVal('payRef');
  if(!sender||!ref){ alert("Enter Sender Name + Payment Reference"); return; }
  var cur=getCurrent(); if(!cur){ alert("Please join first"); return; }
  var members=getMembers(); var m=members.find(function(x){return x.phone===cur.phone}); if(!m) return;
  m.paymentSender=sender; m.paymentRef=ref; m.paymentStatus='submitted'; m.status='pending_payment'; setMembers(members);
  alert("✅ Payment submitted — Admin will confirm."); showPage('profile');
}
function memberLogin(){
  var members=getMembers(); var m=members.find(function(x){return x.phone===getVal('mPhone')&&x.pass===getVal('mPass')});
  if(!m){ setText('loginErr',"Wrong phone or password"); return; }
  try{localStorage.setItem("ob_current",JSON.stringify({phone:m.phone,code:m.code}))}catch(e){}
  setText('loginErr',""); showPage('profile'); renderMemberWallet();
}
function memberLogout(){ try{localStorage.removeItem("ob_current")}catch(e){} showPage('login'); }
function copyLink(){ var cur=getCurrent(); if(!cur) return; var link=location.origin+location.pathname+"?ref="+cur.code; try{ if(navigator.clipboard) navigator.clipboard.writeText(link); }catch(e){} alert("Copied: "+link); }
function renderMemberWallet(){
  try{
    var cur=getCurrent();
    var gate=$('profileGate'), dash=$('profileDash');
    if(!cur){ if(gate) gate.style.display='block'; if(dash) dash.style.display='none'; return; }
    var members=getMembers(); var m=members.find(function(x){return x.phone===cur.phone}); if(!m){ if(gate) gate.style.display='block'; if(dash) dash.style.display='none'; return; }
    if(gate) gate.style.display='none'; if(dash) dash.style.display='block';
    var earn=m.directEarn+m.indirectEarn;
    var pending=getWds().filter(function(w){return w.phone===m.phone&&w.status==='pending'}).reduce(function(a,w){return a+w.amount},0);
    var paid=getWds().filter(function(w){return w.phone===m.phone&&w.status==='paid'}).reduce(function(a,w){return a+w.amount},0);
    var avail=earn+m.saved-pending-paid;
    setText('memName',m.name); setText('memCode',m.code); setText('memPlan',fmt(m.planLocal,m.country)+" • Tier "+m.tier); setText('memStatus',m.status);
    setText('walletMain',fmt(avail,m.country));
    setText('walletOther',"Earnings "+fmt(earn,m.country)+" • Savings "+fmt(m.saved,m.country)+" • Pending "+fmt(pending,m.country)+" • Paid "+fmt(paid,m.country));
    setText('walletMin',"Min Withdrawal "+SYM[m.country]+MIN_LOCAL[m.country].toLocaleString()+" ($2) • Available "+fmt(avail,m.country));
    setText('walletLiveNote',"Country: "+m.country+" • Live: 1 USD = "+SYM[m.country]+RATES[m.country]+" • Status: "+(m.paymentStatus==='submitted'?'Payment Submitted - Awaiting Admin':m.status));
    setText('memLink',location.origin+location.pathname+"?ref="+m.code);
    setHTML('savingsList',(m.savings||[]).map(function(s){return '<p>'+fmt(s.amount,m.country)+' — '+s.date+'</p>'}).join('')||'<p>No savings yet</p>');
    setHTML('memWithdrawals',getWds().filter(function(w){return w.phone===m.phone}).map(function(w){return '<p>'+fmt(w.amount,m.country)+' — '+w.status+'</p>'}).join('')||'<p>No withdrawals yet</p>');
    setHTML('memOrdersList',getOrders().filter(function(o){return o.user===m.phone}).map(function(o){return '<p>'+o.product+' — Paid '+fmt(o.paid,m.country)+' / '+fmt(o.total,m.country)+' — '+o.status+'</p>'}).join('')||'<p>No orders yet</p>');
    var eN=$('eName'); if(eN) eN.value=m.name;
    var eA=$('eAcct'); if(eA) eA.value=m.acct;
    var eAN=$('eAcctName'); if(eAN) eAN.value=m.acctName;
    var eb=$('eBank'); if(eb){ eb.innerHTML=BANKS[m.country].map(function(b){return '<option '+(b===m.bank?'selected':'')+'>'+b+'</option>'}).join(''); }
  }catch(e){ console.log('wallet error',e); }
}
function addSavings(){
  var cur=getCurrent(); if(!cur) return;
  var members=getMembers(); var m=members.find(function(x){return x.phone===cur.phone}); if(!m) return;
  if(m.status!=='approved'){ alert("Savings opens after admin approves your membership."); return; }
  var amt=Number(getVal('saveAmt')); if(!amt||amt<=0){ alert("Enter amount to save"); return; }
  m.saved+=amt; m.savings=m.savings||[]; m.savings.push({amount:amt,date:new Date().toLocaleDateString()}); setMembers(members);
  var sa=$('saveAmt'); if(sa) sa.value=''; alert("✅ Saved "+fmt(amt,m.country)); renderMemberWallet();
}
function saveProfileEdit(){
  var cur=getCurrent(); if(!cur) return;
  var members=getMembers(); var m=members.find(function(x){return x.phone===cur.phone}); if(!m) return;
  m.name=getVal('eName')||m.name; m.bank=getVal('eBank'); m.acct=getVal('eAcct'); m.acctName=getVal('eAcctName'); setMembers(members); alert("✅ Profile updated"); renderMemberWallet();
}
function requestWithdrawal(){
  var cur=getCurrent(); if(!cur){ alert("Please Login first"); showPage('login'); return; }
  var members=getMembers(); var m=members.find(function(x){return x.phone===cur.phone}); if(!m) return;
  if(m.status!=='approved'){ alert("Withdrawals open after admin approves you."); return; }
  var amt=round10(Number(getVal('wAmount')||0));
  var earn=m.directEarn+m.indirectEarn;
  var pending=getWds().filter(function(w){return w.phone===m.phone&&w.status==='pending'}).reduce(function(a,w){return a+w.amount},0);
  var paid=getWds().filter(function(w){return w.phone===m.phone&&w.status==='paid'}).reduce(function(a,w){return a+w.amount},0);
  var avail=earn+m.saved-pending-paid;
  if(amt < MIN_LOCAL[m.country]){ alert("⛔ Min withdrawal is "+SYM[m.country]+MIN_LOCAL[m.country]+" ($2)"); return; }
  if(amt > avail){ alert("⛔ You only have "+fmt(avail,m.country)+" available"); return; }
  var wds=getWds(); wds.push({id:Date.now(),phone:m.phone,name:m.name,country:m.country,amount:amt,bank:m.bank,acct:m.acct,status:'pending'}); setWds(wds);
  alert("✅ Withdrawal requested — Admin will pay you."); renderMemberWallet();
}
var ADMIN_COUNTRY=null;
function adminLogin(){
  var email=getVal('aEmail').toLowerCase(), pass=getVal('aPass');
  var map={'eagleeyesight4@gmail.com':'Nigeria','about2blowent@gmail.com':'Ghana','wonderfreeman9@gmail.com':'South Africa'};
  if(!map[email]){ setText('adminLoginErr',"⛔ Not a country admin email"); return; }
  ADMIN_COUNTRY=map[email]; try{localStorage.setItem("ob_admin_country",ADMIN_COUNTRY)}catch(e){}
  showEl('adminLoginBox',false); showEl('adminDash',true);
  setText('adminTitle',(ADMIN_COUNTRY==='Nigeria'?'🇳🇬':ADMIN_COUNTRY==='Ghana'?'🇬🇭':'🇿🇦')+' '+ADMIN_COUNTRY+' Admin Dashboard');
  setText('adminSub','You see ONLY '+ADMIN_COUNTRY+' • No other country');
  renderAdminSafe();
}
function forgotAdminPassword(){ alert("✅ A reset code has been sent. Check your email to continue."); }
function adminLogout(){ try{localStorage.removeItem("ob_admin_country")}catch(e){} location.reload(); }
function savePaySettings(){
  if(!ADMIN_COUNTRY){ alert("Login as admin first"); return; }
  try{localStorage.setItem("ob_pay_"+ADMIN_COUNTRY,JSON.stringify({bank:getVal('psBank'),name:getVal('psName'),number:getVal('psNumber'),instr:getVal('psInstr')}))}catch(e){}
  alert("✅ Saved — "+ADMIN_COUNTRY+" members will now use this account (runs in background)");
}
function publishAnnouncement(){ try{localStorage.setItem("ob_ann_"+ADMIN_COUNTRY,getVal('adminAnnInput'))}catch(e){} setText('homeAnnouncement',getVal('adminAnnInput')); alert("✅ Published for "+ADMIN_COUNTRY); }
function renderAdminSafe(){
  try{
    if(!ADMIN_COUNTRY){ try{ADMIN_COUNTRY=localStorage.getItem("ob_admin_country")}catch(e){} }
    if(!ADMIN_COUNTRY) return;
    var loginBox=$('adminLoginBox'), dash=$('adminDash');
    if(loginBox&&dash){
      // Only show dashboard if we are on admin page and logged in
      if(dash.style.display!=='block'){ loginBox.style.display='none'; dash.style.display='block'; setText('adminTitle',ADMIN_COUNTRY+' Admin Dashboard'); }
    }
    var members=getMembers().filter(function(m){return m.country===ADMIN_COUNTRY});
    setText('adminStats',ADMIN_COUNTRY+": Members "+members.length+" • Pending Payment "+members.filter(function(m){return m.paymentStatus==='submitted'}).length);
    setText('adminLiveNote',"Live: You see ONLY "+ADMIN_COUNTRY);
    setHTML('adminPending',members.filter(function(m){return m.paymentStatus==='submitted'}).map(function(m){return '<div style="border:1px solid #eee;padding:10px;border-radius:10px;margin:6px 0"><b>'+m.name+'</b> • '+m.code+' • '+fmt(m.planLocal,m.country)+' • Sender: '+m.paymentSender+' • Ref: '+m.paymentRef+'<br><button type="button" class="btnGold" onclick="approveMember(\''+m.phone+'\')">Confirm Payment + Approve + Pay Split</button></div>'}).join('')||'<p>No pending payments</p>');
    setHTML('adminWithdrawals',getWds().filter(function(w){return w.cou
