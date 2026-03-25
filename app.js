var DB={get:function(k){return JSON.parse(localStorage.getItem(k)||'[]');},set:function(k,v){localStorage.setItem(k,JSON.stringify(v));}};

if(!localStorage.getItem('watchlist')){DB.set('watchlist',[
  {id:1,symbol:'CSCO',company:'Cisco Systems',current_price:78.90,alert_price:76.50,status:'\u0642\u0631\u064a\u0628',halal_musaffa:1,halal_zoya:1},
  {id:2,symbol:'MRK',company:'Merck & Co',current_price:119.83,alert_price:112.00,status:'\u0627\u0646\u062a\u0638\u0627\u0631',halal_musaffa:1,halal_zoya:1},
  {id:3,symbol:'ABT',company:'Abbott Labs',current_price:113.50,alert_price:108.00,status:'\u0627\u0646\u062a\u0638\u0627\u0631',halal_musaffa:1,halal_zoya:1},
  {id:4,symbol:'COP',company:'ConocoPhillips',current_price:117.64,alert_price:107.00,status:'\u0627\u0646\u062a\u0638\u0627\u0631',halal_musaffa:1,halal_zoya:1},
  {id:5,symbol:'QCOM',company:'Qualcomm',current_price:152.36,alert_price:128.00,status:'\u0627\u0646\u062a\u0638\u0627\u0631',halal_musaffa:1,halal_zoya:1},
  {id:6,symbol:'EOG',company:'EOG Resources',current_price:128.00,alert_price:115.00,status:'\u0627\u0646\u062a\u0638\u0627\u0631',halal_musaffa:1,halal_zoya:1},
  {id:7,symbol:'JNJ',company:'Johnson & Johnson',current_price:148.00,alert_price:132.00,status:'\u0627\u0646\u062a\u0638\u0627\u0631',halal_musaffa:1,halal_zoya:1},
  {id:8,symbol:'HON',company:'Honeywell',current_price:245.39,alert_price:225.00,status:'\u0627\u0646\u062a\u0638\u0627\u0631',halal_musaffa:1,halal_zoya:1},
  {id:9,symbol:'PG',company:'Procter & Gamble',current_price:160.04,alert_price:150.00,status:'\u0642\u0631\u064a\u0628',halal_musaffa:1,halal_zoya:1},
  {id:10,symbol:'NVO',company:'Novo Nordisk',current_price:36.66,alert_price:36.00,status:'\u0639\u0646\u062f \u0627\u0644\u062d\u062f',halal_musaffa:1,halal_zoya:0},
  {id:11,symbol:'NVDA',company:'Nvidia',current_price:179.86,alert_price:170.00,status:'\u0642\u0631\u064a\u0628',halal_musaffa:1,halal_zoya:1},
  {id:12,symbol:'RBRK',company:'Rubrik Inc',current_price:53.67,alert_price:50.00,status:'\u0645\u0631\u0627\u0642\u0628\u0629 \u0645\u0634\u062f\u062f\u0629',halal_musaffa:0,halal_zoya:0},
  {id:13,symbol:'ZETA',company:'Zeta Global',current_price:15.60,alert_price:15.00,status:'\u062a\u0623\u0643\u062f Zoya',halal_musaffa:1,halal_zoya:0}
]);}
if(!localStorage.getItem('capital')){DB.set('capital',[{id:1,record_date:new Date().toISOString().split('T')[0],capital:25000,cycle_number:0,description:'\u0631\u0623\u0633 \u0627\u0644\u0645\u0627\u0644 \u0627\u0644\u0627\u0628\u062a\u062f\u0627\u0626\u064a'}]);}

var closingTrade=null;
function openM(id){document.getElementById(id).classList.add('open');}
function closeM(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.mo').forEach(function(o){o.addEventListener('click',function(e){if(e.target===o)o.classList.remove('open');});});
function nav(n,el){
  document.querySelectorAll('.pg').forEach(function(p){p.classList.remove('active');});
  document.querySelectorAll('.ni').forEach(function(x){x.classList.remove('active');});
  document.getElementById('pg-'+n).classList.add('active');
  if(el) el.classList.add('active');
  var a={dashboard:loadDash,watchlist:loadWL,trades:function(){loadTrades('all');},capital:loadCap};
  if(a[n])a[n]();
}
function notify(msg,type){
  type=type||'ok';
  var el=document.getElementById('notif');
  document.getElementById('notif-txt').textContent=msg;
  document.getElementById('notif-ic').textContent=type==='ok'?'\u2705':'\u274c';
  el.className='notif show '+(type==='ok'?'ok':'err');
  setTimeout(function(){el.classList.remove('show');},3000);
}
function f$(s,n){n=n===undefined?2:n;return '$'+parseFloat(s||0).toLocaleString('en-US',{minimumFractionDigits:n,maximumFractionDigits:n});}
function pct(v){var x=parseFloat(v||0);return(x>=0?'+':'')+x.toFixed(2)+'%';}
function dtf(d){return d?new Date(d).toLocaleDateString('ar-SA'):'--';}
function sbadge(s){var m={'\u0645\u0641\u062a\u0648\u062d\u0629':'bs-o','\u0645\u063a\u0644\u0642\u0629':'bs-c','\u062e\u0631\u062c\u062a \u0647\u062f\u0641\u06462':'bs-w','\u062e\u0631\u062c\u062a \u0647\u062f\u0641\u06461':'bs-n','\u0648\u0642\u0641 \u062e\u0633\u0627\u0631\u0629':'bs-l'};return '<span class="bs '+(m[s]||'bs-c')+'">'+s+'</span>';}
function hb(v){return v?'<span class="hy">\u2713</span>':'<span class="hu">\u061f</span>';}
function stcls(st){var m={'\u0642\u0631\u064a\u0628':'bs-n','\u0639\u0646\u062f \u0627\u0644\u062d\u062f':'bs-h','\u0645\u0631\u0627\u0642\u0628\u0629 \u0645\u0634\u062f\u062f\u0629':'bs-h','\u0627\u0646\u062a\u0638\u0627\u0631':'bs-c','\u062a\u0623\u0643\u062f Zoya':'bs-l'};return m[st]||'bs-c';}

function loadDash(){
  var t=DB.get('trades'),op=t.filter(function(x){return x.status==='\u0645\u0641\u062a\u0648\u062d\u0629';}).length;
  var cl=t.filter(function(x){return x.status!=='\u0645\u0641\u062a\u0648\u062d\u0629';});
  var wi=cl.filter(function(x){return x.profit_loss>0;}).length;
  var tpl=cl.reduce(function(s,x){return s+(x.profit_loss||0);},0);
  var sc=t.filter(function(x){return x.score;});
  var avg=sc.length?Math.round(sc.reduce(function(a,b){return a+b.score;},0)/sc.length):0;
  var caps=DB.get('capital'),cap=caps.length?caps[caps.length-1].capital:25000;
  document.getElementById('d-open').textContent=op;
  document.getElementById('d-wr').textContent=cl.length?((wi/cl.length)*100).toFixed(1)+'%':'0%';
  document.getElementById('d-closed').textContent=cl.length+' \u0645\u063a\u0644\u0642\u0629';
  var pe=document.getElementById('d-pl');pe.textContent=f$(tpl);pe.style.color=tpl>=0?'var(--green)':'var(--red)';
  document.getElementById('d-sc').textContent=avg;
  document.getElementById('open-badge').textContent=op;
  document.getElementById('sb-cap').textContent=f$(cap,0);
  document.getElementById('d-cap').textContent=f$(cap,0);
  var prog=Math.max(0,Math.min(100,((cap-25000)/(34500-25000))*100));
  document.getElementById('d-prog').style.width=prog+'%';
  var rc=t.slice().reverse().slice(0,6),html='';
  if(rc.length){rc.forEach(function(x){var pc=x.profit_loss>0?'pr-u':x.profit_loss<0?'pr-d':'pr-n';html+='<tr><td><strong style="font-family:var(--mono);color:var(--acc)">'+x.symbol+'</strong></td><td style="color:var(--muted);font-size:12px">'+dtf(x.entry_date)+'</td><td><span style="font-family:var(--mono)">'+(x.score||'--')+'</span></td><td>'+sbadge(x.status)+'</td><td class="pr '+pc+'">'+(x.profit_loss!=null?pct(x.profit_loss_pct):'--')+'</td></tr>';});}
  else{html='<tr><td colspan="5" class="empty"><div class="ei">\ud83d\udce3</div><p>\u0644\u0627 \u062a\u0648\u062c\u062f \u0635\u0641\u0642\u0627\u062a</p></td></tr>';}
  document.getElementById('d-recent').innerHTML=html;
}

function loadWL(){
  var data=DB.get('watchlist'),html='';
  document.getElementById('wl-cnt').textContent=data.length;
  data.forEach(function(s){
    html+='<tr>';
    html+='<td><strong style="font-family:var(--mono);color:var(--acc)">'+s.symbol+'</strong></td>';
    html+='<td>'+s.company+'</td>';
    html+='<td class="pr">'+(s.current_price?f$(s.current_price):'--')+'</td>';
    html+='<td class="pr pr-n">'+(s.alert_price?f$(s.alert_price):'--')+'</td>';
    html+='<td>'+hb(s.halal_musaffa)+'</td><td>'+hb(s.halal_zoya)+'</td>';
    html+='<td><span class="bs '+stcls(s.status)+'">'+s.status+'</span></td>';
    html+='<td><button class="btn btn-p btn-sm" onclick="quickTrade(\'"+ s.symbol +"\',\'"+ s.company +"\',"+ s.current_price +")">\u062f\u062e\u0648\u0644</button> <button class="btn btn-d btn-sm" onclick="delWL('+s.id+')">\u2715</button></td>';
    html+='</tr>';
  });
  document.getElementById('wl-body').innerHTML=html;
}
function quickTrade(sym,co,pr){document.getElementById('t-sym').value=sym;document.getElementById('t-co').value=co;document.getElementById('t-ep').value=pr||'';document.getElementById('t-dt').value=new Date().toISOString().split('T')[0];calcTrade();openM('m-trade');}
function saveWL(){var sym=document.getElementById('w-sym').value.trim().toUpperCase(),co=document.getElementById('w-co').value.trim();if(!sym||!co){notify('\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0631\u0645\u0632 \u0648\u0627\u0644\u0634\u0631\u0643\u0629','err');return;}var data=DB.get('watchlist'),id=data.length?Math.max.apply(null,data.map(function(d){return d.id;}))+1:1;data.push({id:id,symbol:sym,company:co,current_price:parseFloat(document.getElementById('w-pr').value)||null,alert_price:parseFloat(document.getElementById('w-al').value)||null,status:document.getElementById('w-st').value,halal_musaffa:document.getElementById('w-mus').checked?1:0,halal_zoya:document.getElementById('w-zoy').checked?1:0});DB.set('watchlist',data);closeM('m-wl');notify('\u062a\u0645\u062a\u0629 \u0625\u0636\u0627\u0641\u0629 '+sym);loadWL();}
function delWL(id){if(!confirm('\u062d\u0630\u0641\u061f'))return;DB.set('watchlist',DB.get('watchlist').filter(function(w){return w.id!==id;}));notify('\u062a\u0645 \u0627\u0644\u062d\u0630\u0641');loadWL();}
function calcSc(){var a=+document.getElementById('a1').value + +document.getElementById('a2').value + +document.getElementById('a3').value,b=+document.getElementById('b1').value + +document.getElementById('b2').value + +document.getElementById('b3').value,c=+document.getElementById('c1s').value + +document.getElementById('c2s').value + +document.getElementById('c3s').value,d=+document.getElementById('d1s').value + +document.getElementById('d2s').value,total=a+b+c+d,d2=+document.getElementById('d2s').value,passed=total>=70&&d2===10;document.getElementById('sc-total').textContent=total;document.getElementById('sb-a').textContent=a+'/30';document.getElementById('sb-b').textContent=b+'/25';document.getElementById('sb-c').textContent=c+'/25';document.getElementById('sb-d').textContent=d+'/20';var card=document.getElementById('sc-card'),vrd=document.getElementById('sc-verdict');if(d2===0){card.className='stotal fail';vrd.textContent='\u26d4 \u0645\u0631\u0641\u0648\u0636';}else if(passed){card.className='stotal pass';vrd.textContent='\u2705 \u0645\u0642\u0628\u0648\u0644';}else{card.className='stotal fail';vrd.textContent='\u274c \u0623\u0642\u0644 \u0645\u0646 70';}}
function saveSc(){notify('\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u062a\u0642\u064a\u064a\u0645 \u2014 '+document.getElementById('sc-total').textContent+' \u0646\u0642\u0637\u0629');}
var trFilter='all';
function loadTrades(f){trFilter=f||trFilter;var trades=DB.get('trades');if(trFilter==='open')trades=trades.filter(function(t){return t.status==='\u0645\u0641\u062a\u0648\u062d\u0629';});else if(trFilter==='closed')trades=trades.filter(function(t){return t.status!=='\u0645\u0641\u062a\u0648\u062d\u0629';});trades=trades.slice().reverse();var html='';if(trades.length){trades.forEach(function(t){var pc=t.profit_loss>0?'pr-u':t.profit_loss<0?'pr-d':'pr-n';html+='<tr><td><strong style="font-family:var(--mono);color:var(--acc)">'+t.symbol+'</strong></td><td style="font-size:12px;color:var(--muted)">'+dtf(t.entry_date)+'</td><td class="pr pr-d">'+f$(t.stop_loss_price)+'</td><td class="pr pr-u">'+f$(t.target1_price)+'</td><td class="pr" style="color:var(--acc)">'+f$(t.target2_price)+'</td><td style="font-family:var(--mono)">'+(t.score||'--')+'</td><td>'+sbadge(t.status)+'</td><td class="pr '+pc+'">'+(t.profit_loss!=null?f$(t.profit_loss):'--')+'</td><td>'+(t.status==='\u0645\u0641\u062a\u0648\u062d\u0629'?'<button class="btn btn-s btn-sm" onclick="openClose('+t.id+','+t.entry_price+','+t.shares+',''+t.symbol+'')">\u0625\u063a\u0644\u0627\u0642</button> ':'')+' <button class="btn btn-d btn-sm" onclick="delTrade('+t.id+')">\u2715</button></td></tr>';});}else{html='<tr><td colspan="9" class="empty"><div class="ei">\ud83d\udce3</div><p>\u0644\u0627 \u062a\u0648\u062c\u062f \u0635\u0641\u0642\u0627\u062a</p></td></tr>';}document.getElementById('tr-body').innerHTML=html;}
function ftrades(f,el){document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});el.classList.add('active');loadTrades(f);}
function calcTrade(){var ep=parseFloat(document.getElementById('t-ep').value)||0,sh=parseInt(document.getElementById('t-sh').value)||0;document.getElementById('tc-inv').textContent=f$(ep*sh);document.getElementById('tc-sl').textContent=f$(ep*0.93);document.getElementById('tc-t1').textContent=f$(ep*1.05);document.getElementById('tc-t2').textContent=f$(ep*1.08);}
function saveTrade(){var sym=document.getElementById('t-sym').value.trim().toUpperCase(),ep=parseFloat(document.getElementById('t-ep').value),sh=parseInt(document.getElementById('t-sh').value);if(!sym||!ep||!sh){notify('\u064a\u0631\u062c\u0649 \u0645\u0644\u0621 \u0627\u0644\u062d\u0642\u0648\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629','err');return;}var trades=DB.get('trades');if(trades.filter(function(t){return t.status==='\u0645\u0641\u062a\u0648\u062d\u0629';}).length>=4){notify('\u26a0\ufe0f \u0627\u0644\u062d\u062f \u0627\u0644\u0623\u0642\u0635\u0649 4 \u0635\u0641\u0642\u0627\u062a','err');return;}var id=trades.length?Math.max.apply(null,trades.map(function(d){return d.id;}))+1:1;trades.push({id:id,symbol:sym,company:document.getElementById('t-co').value,entry_price:ep,shares:sh,total_investment:ep*sh,target1_price:+(ep*1.05).toFixed(2),target2_price:+(ep*1.08).toFixed(2),stop_loss_price:+(ep*0.93).toFixed(2),entry_date:document.getElementById('t-dt').value||new Date().toISOString().split('T')[0],status:'\u0645\u0641\u062a\u0648\u062d\u0629',score:parseInt(document.getElementById('t-sc').value)||null,rsi_entry:parseFloat(document.getElementById('t-rsi').value)||null,vix_entry:parseFloat(document.getElementById('t-vix').value)||null,musaffa_pass:document.getElementById('t-mus').checked?1:0,zoya_pass:document.getElementById('t-zoy').checked?1:0});DB.set('trades',trades);closeM('m-trade');notify('\u2705 \u062a\u0645 \u062a\u0633\u062c\u064a\u0644 '+sym);loadTrades();loadDash();}
function openClose(id,ep,sh,sym){closingTrade={id:id,ep:ep,sh:sh,sym:sym};document.getElementById('m-close-info').innerHTML='<strong style="color:var(--acc);font-family:var(--mono)">'+sym+'</strong> \u00b7 '+f$(ep)+' \u00b7 '+sh+' \u0633\u0647\u0645';document.getElementById('cl-ep').value='';document.getElementById('cl-result').textContent='--';document.getElementById('cl-lesson').value='';openM('m-close');}
function calcClose(){if(!closingTrade)return;var xp=parseFloat(document.getElementById('cl-ep').value)||0;if(!xp)return;var pl=(xp-closingTrade.ep)*closingTrade.sh,plp=((xp-closingTrade.ep)/closingTrade.ep)*100,el=document.getElementById('cl-result');el.textContent=f$(pl)+' ('+pct(plp)+')';el.style.color=pl>=0?'var(--green)':'var(--red)';}
function confirmClose(){if(!closingTrade)return;var xp=parseFloat(document.getElementById('cl-ep').value);if(!xp){notify('\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0633\u0639\u0631 \u0627\u0644\u062e\u0631\u0648\u062c','err');return;}var pl=(xp-closingTrade.ep)*closingTrade.sh,plp=((xp-closingTrade.ep)/closingTrade.ep)*100,trades=DB.get('trades');for(var i=0;i<trades.length;i++){if(trades[i].id===closingTrade.id){trades[i].status=pl>=0?'\u062e\u0631\u062c\u062a \u0647\u062f\u0641\u06462':'\u0648\u0642\u0641 \u062e\u0633\u0627\u0631\u0629';trades[i].exit_date=new Date().toISOString().split('T')[0];trades[i].exit_price=xp;trades[i].profit_loss=+pl.toFixed(2);trades[i].profit_loss_pct=+plp.toFixed(2);trades[i].lesson=document.getElementById('cl-lesson').value;break;}}DB.set('trades',trades);closeM('m-close');notify((pl>=0?'\u2705 \u0631\u0628\u062d ':'\u274c \u062e\u0633\u0627\u0631\u0629 ')+f$(Math.abs(pl)),pl>=0?'ok':'err');loadTrades();loadDash();}
function delTrade(id){if(!confirm('\u062d\u0630\u0641\u061f'))return;DB.set('trades',DB.get('trades').filter(function(t){return t.id!==id;}));notify('\u062a\u0645 \u0627\u0644\u062d\u0630\u0641');loadTrades();loadDash();}
function loadCap(){var data=DB.get('capital'),html='';if(data.length){var l=data[data.length-1].capital,gr=((l-25000)/25000*100).toFixed(1);document.getElementById('cap-now').textContent=f$(l,0);document.getElementById('cap-gr').textContent=(gr>=0?'+':'')+gr+'%';}data.slice().reverse().forEach(function(r){html+='<tr><td style="color:var(--muted);font-size:12px">'+dtf(r.record_date)+'</td><td class="pr" style="font-weight:700;font-size:15px">'+f$(r.capital,0)+'</td><td><span class="bs bs-c">\u062f\u0648\u0631\u0629 '+(r.cycle_number||0)+'</span></td><td>'+(r.description||'--')+'</td></tr>';});document.getElementById('cap-body').innerHTML=html;}
function addCap(){var cap=parseFloat(prompt('\u0631\u0623\u0633 \u0627\u0644\u0645\u0627\u0644 \u0627\u0644\u062c\u062f\u064a\u062f ($):'));if(!cap)return;var cycle=parseInt(prompt('\u0631\u0642\u0645 \u0627\u0644\u062f\u0648\u0631\u0629:')||'1'),desc=prompt('\u0627\u0644\u0648\u0635\u0641:')||'';var data=DB.get('capital'),id=data.length?Math.max.apply(null,data.map(function(d){return d.id;}))+1:1;data.push({id:id,record_date:new Date().toISOString().split('T')[0],capital:cap,cycle_number:cycle,description:desc});DB.set('capital',data);notify('\u2705 \u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0631\u0623\u0633 \u0627\u0644\u0645\u0627\u0644');loadCap();loadDash();}
function updateCL(){var n=0;for(var i=1;i<=16;i++){var el=document.getElementById('cl'+i);if(el&&el.checked)n++;}document.getElementById('cl-score').textContent=n+'/16';var vrd=document.getElementById('cl-verdict');if(n===16){vrd.textContent='\u2705 \u062c\u0627\u0647\u0632 \u0644\u0644\u062a\u062f\u0627\u0648\u0644';vrd.style.color='var(--green)';}else if(n>=12){vrd.textContent='\u26a0\ufe0f \u0631\u0627\u062c\u0639 \u0627\u0644\u0646\u0627\u0642\u0635';vrd.style.color='var(--gold)';}else{vrd.textContent='\u274c \u0644\u0645 \u062a\u0633\u062a\u0648\u0641\u0650 \u0627\u0644\u0634\u0631\u0648\u0637';vrd.style.color='var(--red)';}}
function saveCL(){notify('\u2705 \u062a\u0645 \u062d\u0641\u0638 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062a\u062d\u0642\u0642 \u0644\u064a\u0648\u0645 '+new Date().toLocaleDateString('ar-SA'));}
document.addEventListener('DOMContentLoaded',function(){loadDash();for(var i=1;i<=16;i++){var el=document.getElementById('cl'+i);if(el)el.addEventListener('change',updateCL);}});
