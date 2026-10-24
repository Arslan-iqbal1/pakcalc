/* Known-answer test cases for PakCalc calculators. Run: node tests/calc-tests.js
   Covers: published examples, minimum/zero, negative, huge and decimal inputs. */
const c = require('../assets/js/calc.js');
let pass = 0, fail = 0;
function eq(name, got, want, tol) {
  tol = tol || 0.01;
  const ok = Math.abs(got - want) <= tol;
  if (ok) pass++; else { fail++; console.log('FAIL:', name, 'got', got, 'want', want); }
}
function isFiniteNum(name, v) { if (Number.isFinite(v)) pass++; else { fail++; console.log('FAIL (not finite):', name, v); } }

// Tax FY 2026-27 (Finance Act 2026) - published examples
eq('tax 2026-27: 150k/mo -> 72000/yr', c.taxCalc(1800000).tax, 72000);
eq('tax 2026-27: 250k/mo -> 276000/yr', c.taxCalc(3000000).tax, 276000);
eq('tax 2026-27: monthly of 250k case', c.taxCalc(3000000).monthly, 23000);
// Tax FY 2025-26 (legacy)
eq('tax 2025-26: 150k/mo -> 72000/yr', c.taxCalc(1800000, '2025-26').tax, 72000);
eq('tax 2025-26: 3M -> 300000', c.taxCalc(3000000, '2025-26').tax, 300000);
eq('tax 2025-26: 12M incl 9% surcharge', c.taxCalc(12000000, '2025-26').tax, 3685290, 1);
eq('tax 2026-27: 12M, surcharge abolished', c.taxCalc(12000000).tax, 3174000, 1);
// Tax edges
eq('tax: zero income', c.taxCalc(0).tax, 0);
eq('tax: negative income clamped to 0', c.taxCalc(-50000).tax, 0);
eq('tax: exactly at 600k threshold', c.taxCalc(600000).tax, 0);
eq('tax: just above threshold', c.taxCalc(600001).tax, 0.01);
eq('tax: decimal salary', c.taxCalc(1800000.50).tax, 72000.055, 0.01);
eq('tax: huge 1e12 finite', c.taxCalc(1e12).tax, 1424000 + 0.35 * (1e12 - 7000000), 1);
isFiniteNum('tax: huge finite', c.taxCalc(1e12).tax);
// EMI - known answer: 1,000,000 @12% 1yr = 88,849
eq('emi: 1M @12% 1yr', c.emiCalc(1000000, 12, 1).emi, 88849, 1);
eq('emi: zero principal', c.emiCalc(0, 12, 5).emi, 0);
eq('emi: zero rate', c.emiCalc(120000, 0, 1).emi, 10000);
eq('emi: negative principal clamped', c.emiCalc(-5, 12, 1).emi, 0);
isFiniteNum('emi: huge finite', c.emiCalc(1e12, 15, 30).emi);
// Compound - known answer: 100k @10% 10y annual = 259,374
eq('compound: 100k @10% 10y annual', c.compoundCalc(100000, 10, 10, 1, 0).final, 259374, 1);
eq('compound: zero principal', c.compoundCalc(0, 10, 10, 12, 0).final, 0);
eq('compound: negative principal clamped', c.compoundCalc(-100, 10, 10, 1, 0).final, 0);
eq('compound: decimals', c.compoundCalc(100000.50, 10, 1, 1, 0).final, 110000.55, 0.01);
// Zakat
eq('zakat: 3M assets -> 75000', c.zakatCalc({cash:3000000,bank:0,goldGrams:0,goldPrice:32000,silverGrams:0,silverPrice:3500,goods:0,invest:0,debts:0}).zakat, 75000);
eq('zakat: below nisab -> 0', c.zakatCalc({cash:100000,bank:0,goldGrams:0,goldPrice:32000,silverGrams:0,silverPrice:3500,goods:0,invest:0,debts:0}).zakat, 0);
eq('zakat: debts remove liability', c.zakatCalc({cash:3000000,bank:0,goldGrams:0,goldPrice:32000,silverGrams:0,silverPrice:3500,goods:0,invest:0,debts:3000000}).zakat, 0);
eq('zakat: zero everything', c.zakatCalc({cash:0,bank:0,goldGrams:0,goldPrice:32000,silverGrams:0,silverPrice:3500,goods:0,invest:0,debts:0}).zakat, 0);
// Salary
eq('salary: 150k/mo monthly tax 6000', c.salaryCalc(150000, 0).monthlyTax, 6000);
eq('salary: zero salary', c.salaryCalc(0, 0).netMonthly, 0);
eq('salary: negative clamped', c.salaryCalc(-1000, 0).netMonthly, 0);
// Freelancer
eq('freelancer: $1000 Fiverr 20% +$2 @280', c.freelancerCalc(1000, 20, 2, 280).netPKR, 223440);
eq('freelancer: zero amount', c.freelancerCalc(0, 20, 2, 280).netPKR, 0);
eq('freelancer: negative clamped to 0', c.freelancerCalc(-50, 20, 2, 280).netPKR, 0);
eq('freelancer: decimal amount', c.freelancerCalc(100.50, 10, 0, 280).netPKR, 100.50 * 0.9 * 280, 0.01);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
