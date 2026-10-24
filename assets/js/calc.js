/* Pure calculation functions - shared by all tool pages, tested with Node. */
function fmt(n){return "Rs " + Math.round(n).toLocaleString("en-US");}
function emiCalc(P, annualRate, years){
  P = Math.max(0,P); annualRate = Math.max(0,annualRate); years = Math.max(0,years);
  var r = annualRate/12/100, n = years*12;
  var emi = r === 0 ? P/n : P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
  var bal = P, sched = [], totInt = 0;
  for(var y=1;y<=years;y++){
    var pY=0,iY=0;
    for(var m=0;m<12;m++){
      var intr = bal*r, princ = emi-intr;
      if(princ>bal) princ=bal;
      bal-=princ; pY+=princ; iY+=intr;
    }
    totInt+=iY;
    sched.push({year:y, principal:Math.round(pY), interest:Math.round(iY), balance:Math.max(0,Math.round(bal))});
  }
  return {emi:emi, total:emi*n, interest:totInt, schedule:sched};
}
function compoundCalc(P, rate, years, freq, monthly){
  P = Math.max(0,P); rate = Math.max(0,rate); years = Math.max(0,years);
  freq = freq||12; monthly = Math.max(0, monthly||0);
  var bal=P, out=[{year:0,balance:Math.round(P)}];
  var r=rate/100/freq;
  for(var y=1;y<=years;y++){
    for(var m=0;m<freq;m++){ bal = bal*(1+r) + (freq===12 ? monthly : 0); }
    out.push({year:y, balance:Math.round(bal)});
  }
  return {final:bal, interest:bal-P-monthly*12*years, yearly:out};
}
var TAX_SLABS_2025_26=[
  {upto:600000, rate:0, fixed:0},
  {upto:1200000, rate:0.01, fixed:0},
  {upto:2200000, rate:0.11, fixed:6000},
  {upto:3200000, rate:0.23, fixed:116000},
  {upto:4100000, rate:0.30, fixed:346000},
  {upto:Infinity, rate:0.35, fixed:616000}
];
/* FY 2026-27 (Tax Year 2027, Finance Act 2026): surcharge on salaried income abolished. */
var TAX_SLABS_2026_27=[
  {upto:600000, rate:0, fixed:0},
  {upto:1200000, rate:0.01, fixed:0},
  {upto:2200000, rate:0.11, fixed:6000},
  {upto:3200000, rate:0.20, fixed:116000},
  {upto:4100000, rate:0.25, fixed:316000},
  {upto:5600000, rate:0.29, fixed:541000},
  {upto:7000000, rate:0.32, fixed:976000},
  {upto:Infinity, rate:0.35, fixed:1424000}
];
function taxCalc(annual, year){
  var SLABS = (year === '2025-26') ? TAX_SLABS_2025_26 : TAX_SLABS_2026_27;
  var prev=0, tax=0, breakdown=[];
  for(var i=0;i<SLABS.length;i++){
    var s=SLABS[i];
    if(annual>prev){
      breakdown.push({from:prev+1, upto:Math.min(annual,s.upto), rate:s.rate, inSlab:Math.min(annual,s.upto)-prev});
    }
    prev=s.upto;
    if(annual<=s.upto) break;
  }
  // progressive computation: fixed amount of the applicable slab + rate on excess over previous slab
  var idx=0;
  for(var j=0;j<SLABS.length;j++){ if(annual>SLABS[j].upto) idx=j+1; else break; }
  if(idx>=SLABS.length) idx=SLABS.length-1;
  var s2=SLABS[idx];
  var lower = idx===0?0:SLABS[idx-1].upto;
  tax = idx===0?0 : s2.fixed + s2.rate*(annual-lower);
  if(year === '2025-26' && annual>10000000) tax *= 1.09;
  return {tax:tax, monthly:tax/12, effective:annual>0?tax/annual:0, breakdown:breakdown};
}
function zakatCalc(o){
  var goldVal=o.goldGrams*o.goldPrice, silverVal=o.silverGrams*o.silverPrice;
  var nisabGold=87.48*o.goldPrice, nisabSilver=612.36*o.silverPrice;
  var nisab=Math.min(nisabGold, nisabSilver);
  var total=o.cash+o.bank+goldVal+silverVal+o.goods+o.invest;
  var net=Math.max(0,total-o.debts);
  var zakat = net>=nisab ? net*0.025 : 0;
  return {goldVal:goldVal, silverVal:silverVal, nisabGold:nisabGold, nisabSilver:nisabSilver, nisab:nisab, total:total, net:net, zakat:zakat, due:net>=nisab};
}
function salaryCalc(monthlyGross, otherDed){
  monthlyGross = Math.max(0,monthlyGross); otherDed = Math.max(0, otherDed||0);
  var annual=monthlyGross*12;
  var t=taxCalc(annual);
  var netAnnual=annual-t.tax-(otherDed||0)*12;
  return {annual:annual, tax:t.tax, monthlyTax:t.monthly, netMonthly:netAnnual/12, netAnnual:netAnnual, effective:t.effective};
}
function freelancerCalc(amount, feePct, withdrawFee, rate){
  amount = Math.max(0,amount); feePct = Math.max(0,feePct); withdrawFee = Math.max(0,withdrawFee); rate = Math.max(0,rate);
  var fee=amount*feePct/100, after=amount-fee;
  var netUSD=Math.max(0, after-withdrawFee);
  return {fee:fee, afterFee:after, netUSD:netUSD, netPKR:netUSD*rate};
}
if (typeof module !== "undefined") module.exports={fmt:fmt,emiCalc:emiCalc,compoundCalc:compoundCalc,taxCalc:taxCalc,zakatCalc:zakatCalc,salaryCalc:salaryCalc,freelancerCalc:freelancerCalc};
