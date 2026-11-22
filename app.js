// ONE BANK COOPERATIVE - OBC - STEP 1 + 2 ONLY - MANUAL LAUNCH
// STEP 1: Pan-African + Country Switch + Hidden Referral
// STEP 2: Banks + Plans + Prices auto-switch by country
// STEP 3+4 (Next): Supabase DB + 3 Admins isolation

let COUNTRY = localStorage.getItem("ob_country") || "Nigeria";
const RATES = { "Nigeria": 1353, "Ghana": 11.79, "South Africa": 17.59 };
const SYM = { "Nigeria": "₦", "Ghana": "GH₵", "South Africa": "R" };
const MIN_LOCAL = { "Nigeria": 2710, "Ghana": 30, "South Africa": 40 };

const BANKS = {
  "Nigeria": ["Access Bank","GTBank","First Bank","UBA","Zenith Bank","OPay","Moniepoint MFB","PalmPay","Kuda MFB","Fidelity Bank","Union Bank","Stanbic IBTC","Wema Bank"],
  "Ghana": ["MTN MoMo","Telecel Cash","AirtelTigo Money","GCB Bank","Ecobank Ghana","Absa Ghana","Stanbic Ghana","Fidelity Ghana","CalBank","Zenith Ghana"],
  "South Africa": ["Capitec","FNB","Standard Bank","ABSA","Nedbank","TymeBank","Discovery Bank","African Bank"]
};
const PHONE_HINT = {
  "Nigeria": ["080... (e.g 08031234567)","10-digit NUBAN Account Number","Select Your Bank / Wallet (Nigeria)"],
  "Ghana": ["024... / 055... (e.g 0241234567)","10-digit MoMo / Account Number","Select Your Bank / MoMo (Ghana)"],
  "South Africa": ["082... (e.g 0821234567)","10-digit Account Number","Select Your Bank (South Africa)"]
};
const PLANS_NGN = [
  {amt:10000,tier:1,d:25,i:10},{amt:15000,tier:1,d:25,i:10},{amt:20000,tier:1,d:25,i:10},
  {amt:25000,tier:1,d:25,i:10},{amt:30000,tier:1,d:25,i:10},{amt:35000,tier:1,d:25,i:10},
  {amt:40000,tier:2,d:30,i:10},{amt:50000,tier:2,d:30,i:10},{amt:60000,tier:2,d:30,i:10},{amt:70000,tier:2,d:30,i:10},
  {amt:80000,tier:3,d:35,i:15},{amt:90000,tier:3,d:35,i:15},{amt:100000,tier:3,d:35,i:15},{amt:120000,tier:3,d:35,i:15}
];
function round10(n){ return Math.round(n/10)*10; }
function convertNGN(ngn,c){ if(c==="Nigeria") return ngn; return round10(ngn / RATES["Nigeria"] * RATES[c]); }
function fmt(n,c){ c=c||COUNTRY; return SYM[c] + Number(n).toLocaleString(); }
function fmtUSD(ngn){ return "$" + (ngn / RATES["Nigeria"]).toFixed(2); }
function getMembers(){ try{return JSON.parse(localStorage.getItem("ob_members")||"[]")}catch(e){return[]} }
function setMembers(m){ localStorage.setItem("ob_members",JSON.stringify(m)); }
function getWds(){ try{return JSON.parse(localStorage.getItem("ob_withdrawals")||"[]")}catch(e){return[]} }
function setWds(w){ localStorage.setItem("ob_withdrawals",JSON.stringify(w)); }
function getOrders(){ try{return JSON.parse(localStorage.getItem("ob_orders")||"[]")}catch(e){return[]} }
function setOrders(o){ localStorage.setItem("ob_orders",JSON.stringify(o)); }

// NAV
function toggleDrawer(){ document.getElementById('drawer').classList.toggle('open'); }
function showPage(p){ ['home','shop','join','login','savings','profile','admin'].forEach(x=>{ const el=document.getElementById('page-'+x); if(el) el.classList.toggle('hidden',x!==p); }); document.getElementById('drawer').classList.remove('open'); window.scrollTo(0,0); if(p==='shop') renderShop(); if(p==='profile') renderMemberWallet(); if(p==='admin') renderAdmin(); }

// STEP 1+2 - COUNTRY SWITCH - updates EVERYTHING
function setCountry(c){
  COUNTRY=c; localStorage.setItem("ob_country",c);
  ['Nigeria','Ghana','South Africa'].forEach(cc=>{
    const b=document.getElementById(cc==='Nigeria'?'cNG':cc==='Ghana'?'cGH':'cZA');
    if(b) b.classList.toggle('active',cc===c);
  });
  const rs=document.getElementById('rateStrip');
  if(rs) rs.innerText=`You are in ${c} • 1 USD = ${SYM[c]}${RATES[c]} • Min Withdrawal ${SYM[c]}${MIN_LOCAL[c]} ($2)`;
  const t=document.getElementById('countryFormTitle'); if(t) t.innerText=`You are joining in ${c}`;
  const h=document.getElementById('countryFormHint'); if(h) h.innerText=`Your payment will go to ${c} Admin. Your wallet will be in ${SYM[c]}.`;
  const bl=document.getElementById('jBankLabel'); if(bl) bl.innerText=PHONE_HINT[c][2];
  const jp=document.getElementById('jPhone'); if(jp) jp.placeholder=PHONE_HINT[c][0];
  const ja=document.getElementById('jAcct'); if(ja) ja.placeholder=PHONE_HINT[c][1];
  const cs=document.getElementById('calcSym'); if(cs) cs.innerText=SYM[c];
  const m1=document.getElementById('minLabel1'); if(m1) m1.innerText=`${SYM[c]}${MIN_LOCAL[c].toLocaleString()}`;
  const sc=document.getElementById('shopCountryNote'); if(sc) sc.innerText=`Prices in ${c} • Min Withdrawal ${SYM[c]}${MIN_LOCAL[c]} ($2)`;
  fillBanks(); fillPlans(); renderShop(); calcSavings(); loadPaySettingsForCountry();
}
function fillBanks(){ const s=document.getElementById('jBank'); if(!s) return; s.innerHTML=`<option value="">-- ${PHONE_HINT[COUNTRY][2]} --</option>`+BANKS[COUNTRY].map(b=>`<option>${b}</option>`).join(''); }
function fillPlans(){ const s=document.getElementById('jPlan'); if(!s) return; s.innerHTML=PLANS_NGN.map(p=>{ const local=convertNGN(p.amt,COUNTRY); return `<option value="${p.amt}|${p.tier}|${p.d}|${p.i}">${fmt(local,COUNTRY)} • Tier ${p.tier} • Direct ${p.d}% / Indirect ${p.i}% • ≈ ${fmtUSD(p.amt)}</option>`; }).join(''); }

// SHOP
const PRODUCTS=[
 {id:'gen1',name:'5.5KVA Generator',price:450000,old:520000,cat:'gen',img:'https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?w=600'},
 {id:'gen2',name:'7KVA Generator',price:680000,old:750000,cat:'gen',img:'https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?w=600'},
 {id:'fr1',name:'Double Door Fridge',price:380000,old:420000,cat:'fridge',img:'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'},
 {id:'fr2',name:'Single Door Fridge',price:220000,old:260000,cat:'fridge',img:'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'},
 {id:'fz1',name:'Chest Freezer 200L',price:310000,old:350000,cat:'freezer',img:'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'},
 {id:'fz2',name:'Chest Freezer 300L',price:420000,old:480000,cat:'freezer',img:'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'},
 {id:'tv1',name:'43" Smart TV',price:280000,old:320000,cat:'tv',img:'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'},
 {id:'tv2',name:'55" Smart TV',price:450000,old:520000,cat:'tv',img:'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'},
 {id:'h1',name:'Standing Fan',price:65000,old:80000,cat:'home',img:'https://images.unsplash.com/photo-1565151443833-29bfb2d5a3c6?w=600'},
 {id:'h2',name:'Rice Cooker',price:45000,old:55000,cat:'home',img:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'},
 {id:'h3',name:'Electric Kettle',price:35000,old:45000,cat:'home',img:'https://images.unsplash.com/photo-1594213114663-d94db9b17125?w=600'},
 {id:'h4',name:'Blender Set',price:55000,old:65000,cat:'home',img:'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600'}
];
let CUR_CAT='All';
function setCat(c){ CUR_CAT=c; renderShop(); }
function renderShop(){
  const box=document.getElementById('shopProducts'); if(!box) return;
  const q=(document.getElementById('searchInput')?.value||'').toLowerCase();
  const list=PRODUCTS.filter(p=>(CUR_CAT==='All'||p.cat===CUR_CAT)&&p.name.toLowerCase().includes(q));
  box.innerHTML=list.map(p=>{ const local=convertNGN(p.price,COUNTRY); const inst=round10(local/4);
    return `<div class="prod"><img src="${p.img}"><div style="padding:10px"><span style="background:#FFF3CD;font-size:10px;padding:3px 8px;border-radius:99px">IN STOCK - PAY SMALL SMALL • ${COUNTRY}</span><br><b>${p.name}</b><p>⭐⭐⭐⭐⭐ (128)</p><b>${fmt(local,COUNTRY)}</b> <s style="font-size:11px;color:#999">${fmt(convertNGN(p.old,COUNTRY),COUNTRY)}</s><p>or 4 x ${fmt(inst,COUNTRY)} - Pay via ${BANKS[COUNTRY][0]}</p><button class="btnNavy" onclick="startOrder('${p.id}')">Pay Small Small →</button></div></div>`; }).join('');
}
function startOrder(id){
  const cur=JSON.parse(localStorage.getItem("ob_current")||"null");
  if(!cur) return alert("Please Login first with your Phone + Password"), showPage('login');
  const p=PRODUCTS.find(x=>x.id===id); const total=convertNGN(p.price,COUNTRY);
  const orders=getOrders(); orders.push({id:Date.now(),user:cur.phone,product:p.name,total,paid:0,status:'installment',country:COUNTRY}); setOrders(orders);
  alert("✅ Order started: "+p.name+" — Pay in 4 x "+fmt(round10(total/4),COUNTRY)); renderMemberWallet();
}

// JOIN - Hidden Referral
function joinMember(){
  const name=jName.value.trim(), phone=jPhone.value.trim(), pass=jPass.value, bank=jBank.value, acct=jAcct.value.trim(), acctName=jAcctName.value.trim(), plan=jPlan.value;
  if(!name||!phone||!pass||!bank||!acct||!acctName||!plan){ joinErr.innerText="Please fill ALL fields."; return; }
  if(acct.length!==10){ joinErr.innerText="Account / MoMo must be 10 digits."; return; }
  const members=getMembers(); if(members.find(m=>m.phone===phone)){ joinErr.innerText="Phone already registered. Please login."; return; }
  const [amt,tier,d,i]=plan.split('|').map(Number);
  const ref=(document.getElementById('jRef').value||'ONEBANK').toUpperCase();
  const code='OB-'+(1001+members.length);
  const m={code,name,phone,pass,country:COUNTRY,bank,acct,acctName,plan:amt,planLocal:convertNGN(amt,COUNTRY),tier,directPct:d,indirectPct:i,referral:ref,status:'pending_payment',paymentStatus:'none',directEarn:0,indirectEarn:0,saved:0,goal:200000};
  members.push(m); setMembers(members);
  localStorage.setItem("ob_current",JSON.stringify({phone,code}));
  // Show Pay Card
  document.getElementById('payCard').style.display='block';
  payCountryLabel.innerText=COUNTRY; payAmount.innerText=fmt(convertNGN(amt,COUNTRY),COUNTRY)+" (≈ "+fmtUSD(amt)+")";
  loadPaySettingsForCountry();
  alert("✅ Welcome "+name+"! Your code is "+code+". Now pay "+fmt(convertNGN(amt,COUNTRY),COUNTRY)+" to "+COUNTRY+" Admin, then enter Sender + Ref.");
  window.scrollTo(0,document.getElementById('payCard').offsetTop);
}
function loadPaySettingsForCountry(){
  const s=JSON.parse(localStorage.getItem("ob_pay_"+COUNTRY)||"null");
  if(s){ payToBank.innerText=s.bank; payToName.innerText=s.name; payToNumber.innerText=s.number; payToInstr.innerText=s.instr||""; }
  else { payToBank.innerText=COUNTRY+" Admin Account"; payToName.innerText="ONE BANK COOPERATIVE"; payToNumber.innerText="To be set by "+COUNTRY+" Admin"; }
}
function submitPayment(){
  const sender=paySender.value.trim(), ref=payRef.value.trim();
  if(!sender||!ref) return alert("Enter Sender Name + Payment Reference");
  const cur=JSON.parse(localStorage.getItem("ob_current")||"null"); if(!cur) return alert("Please join first");
  const members=getMembers(); const m=members.find(x=>x.phone===cur.phone); if(!m) return;
  m.paymentSender=sender; m.paymentRef=ref; m.paymentStatus='submitted'; m.status='pending_payment'; setMembers(members);
  alert("✅ Payment submitted — "+m.country+" Admin will confirm. Your wallet activates after approval."); showPage('profile');
}

// MEMBER LOGIN / WALLET
function memberLogin(){
  const members=getMembers(); const m=members.find(x=>x.phone===mPhone.value.trim()&&x.pass===mPass.value);
  if(!m){ loginErr.innerText="Wrong phone or password"; return; }
  localStorage.setItem("ob_current",JSON.stringify({phone:m.phone,code:m.code})); showPage('profile'); renderMemberWallet();
}
function memberLogout(){ localStorage.removeItem("ob_current"); showPage('login'); }
function copyLink(){ const cur=JSON.parse(localStorage.getItem("ob_current")||"null"); if(!cur) return; const link=location.origin+location.pathname+"?ref="+cur.code; navigator.clipboard?.writeText(link); alert("Copied: "+link); }
function renderMemberWallet(){
  const cur=JSON.parse(localStorage.getItem("ob_current")||"null"); if(!cur) return;
  const members=getMembers(); const m=members.find(x=>x.phone===cur.phone); if(!m) return;
  const earn=m.directEarn+m.indirectEarn; const avail=earn+m.saved - getWds().filter(w=>w.phone===m.phone&&w.status==='pending').reduce((a,w)=>a+w.amount,0) - getWds().filter(w=>w.phone===m.phone&&w.status==='paid').reduce((a,w)=>a+w.amount,0);
  // Note: avail calc uses stored earn; pending/paid from withdrawals
  const pending=getWds().filter(w=>w.phone===m.phone&&w.status==='pending').reduce((a,w)=>a+w.amount,0);
  const paid=getWds().filter(w=>w.phone===m.phone&&w.status==='paid').reduce((a,w)=>a+w.amount,0);
  const realAvail = earn + m.saved - pending - paid;
  memName.innerText=m.name; memCode.innerText=m.code; memPlan.innerText=fmt(m.planLocal,m.country)+" • Tier "+m.tier+" • "+m.status;
  walletMain.innerText=fmt(realAvail,m.country); walletOther.innerText=`Earnings ${fmt(earn,m.country)} • Savings ${fmt(m.saved,m.country)} • Pending ${fmt(pending,m.country)} • Paid ${fmt(paid,m.country)}`;
  walletMin.innerText=`Min Withdrawal ${SYM[m.country]}${MIN_LOCAL[m.country].toLocaleString()} ($2) • Available ${fmt(realAvail,m.country)}`;
  walletLiveNote.innerText=`Country: ${m.country} • Live: 1 USD = ${SYM[m.country]}${RATES[m.country]} • Status: ${m.paymentStatus==='submitted'?'Payment Submitted - Awaiting '+m.country+' Admin':m.status}`;
  memLink.innerText=location.origin+location.pathname+"?ref="+m.code;
  memWithdrawals.innerHTML=getWds().filter(w=>w.phone===m.phone).map(w=>`<p>${fmt(w.amount,m.country)} — ${w.status} • ${w.bank}</p>`).join('')||'<p>No withdrawals yet</p>';
  memOrdersList.innerHTML=getOrders().filter(o=>o.user===m.phone).map(o=>`<p>${o.product} — Paid ${fmt(o.paid,m.country)} / ${fmt(o.total,m.country)} — ${o.status}</p>`).join('')||'<p>No orders yet</p>';
}
function requestWithdrawal(){
  const cur=JSON.parse(localStorage.getItem("ob_current")||"null"); if(!cur) return alert("Please Login first"), showPage('login');
  const members=getMembers(); const m=members.find(x=>x.phone===cur.phone);
  const amt=round10(Number(wAmount.value||0));
  const earn=m.directEarn+m.indirectEarn;
  const pending=getWds().filter(w=>w.phone===m.phone&&w.status==='pending').reduce((a,w)=>a+w.amount,0);
  const paid=getWds().filter(w=>w.phone===m.phone&&w.status==='paid').reduce((a,w)=>a+w.amount,0);
  const avail=earn+m.saved-pending-paid;
  if(amt < MIN_LOCAL[m.country]) return alert(`⛔ Min withdrawal is ${SYM[m.country]}${MIN_LOCAL[m.country]} ($2)`);
  if(amt > avail) return alert(`⛔ You only have ${fmt(avail,m.country)} available`);
  const wds=getWds(); wds.push({id:Date.now(),phone:m.phone,name:m.name,country:m.country,amount:amt,bank:m.bank,acct:m.acct,status:'pending'}); setWds(wds);
  alert("✅ Withdrawal requested — "+m.country+" Admin will pay you."); renderMemberWallet();
}

// ADMIN - STEP 3+4 will replace with Supabase. For now: country filter via email.
let ADMIN_COUNTRY=null;
function adminLogin(){
  const email=aEmail.value.trim().toLowerCase(), pass=aPass.value;
  // Temp mapping - Supabase will replace in Step 3+4
  const map={'eagleeyesight4@gmail.com':'Nigeria','about2blowent@gmail.com':'Ghana','wonderfreeman9@gmail.com':'South Africa'};
  if(!map[email]){ adminLoginErr.innerText="⛔ Not a country admin email"; return; }
  // Passwords are checked in Supabase in Step 3+4. For Step 1+2, store admin country in session.
  ADMIN_COUNTRY=map[email]; localStorage.setItem("ob_admin_country",ADMIN_COUNTRY);
  adminLoginBox.style.display='none'; adminDash.style.display='block';
  adminTitle.innerText=(ADMIN_COUNTRY==='Nigeria'?'🇳🇬':ADMIN_COUNTRY==='Ghana'?'🇬🇭':'🇿🇦')+' '+ADMIN_COUNTRY+' Admin Dashboard';
  adminSub.innerText='You see ONLY '+ADMIN_COUNTRY+' • No other country';
  renderAdmin();
}
function adminLogout(){ localStorage.removeItem("ob_admin_country"); location.reload(); }
function savePaySettings(){
  if(!ADMIN_COUNTRY) return alert("Login as admin first");
  localStorage.setItem("ob_pay_"+ADMIN_COUNTRY,JSON.stringify({bank:psBank.value,name:psName.value,number:psNumber.value,instr:psInstr.value}));
  alert("✅ Saved — "+ADMIN_COUNTRY+" members will now see this account at checkout"); loadPaySettingsForCountry();
}
function publishAnnouncement(){
  localStorage.setItem("ob_ann_"+ADMIN_COUNTRY,adminAnnInput.value); homeAnnouncement.innerText=adminAnnInput.value; alert("✅ Published for "+ADMIN_COUNTRY);
}
function renderAdmin(){
  ADMIN_COUNTRY=ADMIN_COUNTRY||localStorage.getItem("ob_admin_country"); if(!ADMIN_COUNTRY) return;
  const members=getMembers().filter(m=>m.country===ADMIN_COUNTRY);
  adminStats.innerText=`${ADMIN_COUNTRY}: Members ${members.length} • Pending Payment ${members.filter(m=>m.paymentStatus==='submitted').length}`;
  adminLiveNote.innerText=`Live: You see ONLY ${ADMIN_COUNTRY}`;
  adminPending.innerHTML=members.filter(m=>m.paymentStatus==='submitted').map(m=>`<div style="border:1px solid #eee;padding:10px;border-radius:10px;margin:6px 0"><b>${m.name}</b> • ${m.code} • ${fmt(m.planLocal,m.country)} • Sender: ${m.paymentSender} • Ref: ${m.paymentRef}<br><button class="btnGold" onclick="approveMember('${m.phone}')">Confirm Payment + Approve + Pay Split</button></div>`).join('')||'<p>No pending payments</p>';
  adminWithdrawals.innerHTML=getWds().filter(w=>w.country===ADMIN_COUNTRY&&w.status==='pending').map(w=>`<p>${w.name} — ${fmt(w.amount,ADMIN_COUNTRY)} — ${w.bank} ${w.acct} <button onclick="payWithdrawal(${w.id})">Mark as Paid</button></p>`).join('')||'<p>No pending withdrawals</p>';
  adminAll.innerHTML=members.map(m=>`<p>${m.code} • ${m.name} • ${fmt(m.planLocal,m.country)} • Earnings ${fmt(m.directEarn+m.indirectEarn,m.country)} • ${m.status}</p>`).join('')||'<p>No members yet in '+ADMIN_COUNTRY+'</p>';
}
function approveMember(phone){
  const members=getMembers(); const m=members.find(x=>x.phone===phone); if(!m) return;
  if(m.paymentStatus!=='submitted') return alert("⛔ CANNOT APPROVE - No payment submitted yet. Ask member to submit Sender + Ref.");
  if(!confirm(`Confirm payment from ${m.name}? Amount ${fmt(m.planLocal,m.country)} • Sender ${m.paymentSender} • Ref ${m.paymentRef}`)) return;
  m.paymentStatus='confirmed'; m.status='approved';
  // SPLIT - Direct + Indirect
  const direct=members.find(x=>x.code===m.referral);
  if(direct){ const bonus=round10(m.plan * m.directPct/100); const bonusLocal = direct.country===m.country ? bonus : convertNGN(bonus, direct.country); direct.directEarn+=bonusLocal; }
  if(direct){ const ind=members.find(x=>x.code===direct.referral); if(ind && ind.code!=='ONEBANK'){ const bonus2=round10(m.plan * m.indirectPct/100); const b2 = ind.country===m.country ? bonus2 : convertNGN(bonus2, ind.country); ind.indirectEarn+=b2; } }
  setMembers(members); alert("✅ Approved + Split Paid — Referrer wallet updated"); renderAdmin();
}
function payWithdrawal(id){ const wds=getWds(); const w=wds.find(x=>x.id===id); if(!w) return; w.status='paid'; setWds(wds); alert("✅ Marked as Paid — Member wallet updated"); renderAdmin(); renderMemberWallet(); }

// CALC + INIT
function calcSavings(){ const w=Number(calcWeekly.value||0); const yearly=round10(w*52); const local = COUNTRY==="Nigeria" ? yearly : convertNGN(yearly,COUNTRY); calcResult.innerText=`Save ${fmt(w,COUNTRY)} weekly = ${fmt(local,COUNTRY)} in 1 year (≈ $${(yearly/RATES["Nigeria"]).toFixed(2)})`; }
(function init(){
  const ref=new URLSearchParams(location.search).get('ref');
  if(ref){ const el=document.getElementById('jRef'); if(el) el.value=ref.toUpperCase(); const d=document.getElementById('refDisplay'); if(d) d.innerText=ref.toUpperCase()+' (Member)'; }
  setCountry(COUNTRY);
  const ann=localStorage.getItem("ob_ann_"+COUNTRY); if(ann) homeAnnouncement.innerText=ann;
})();
