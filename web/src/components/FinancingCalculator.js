import React, { useMemo, useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';

const TERMS = [12, 24, 36, 48, 60, 72];

// Estimate a monthly car-loan repayment with the standard amortization formula.
// All maths is done in KES (the DB base currency); display goes through format().
export default function FinancingCalculator({ price }) {
  const { format } = useCurrency();
  const [depositPct, setDepositPct] = useState(20);
  const [rate, setRate] = useState(14); // typical KE asset-finance APR
  const [termMonths, setTermMonths] = useState(48);

  const { deposit, principal, monthly, totalRepayment, totalInterest } = useMemo(() => {
    const p = Number(price) || 0;
    const dep = Math.round(p * (depositPct / 100));
    const loan = p - dep;
    const r = (Number(rate) || 0) / 100 / 12;
    const n = termMonths;
    const m = r > 0
      ? (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : loan / n;
    const total = m * n;
    return {
      deposit: dep,
      principal: loan,
      monthly: Math.round(m),
      totalRepayment: Math.round(total),
      totalInterest: Math.round(total - loan),
    };
  }, [price, depositPct, rate, termMonths]);

  return (
    <div className="card p-5 space-y-5">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h3 className="text-white font-bold">Financing calculator</h3>
      </div>

      {/* Deposit */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#8b949e]">Deposit ({depositPct}%)</span>
          <span className="text-white font-medium">{format(deposit)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={90}
          step={5}
          value={depositPct}
          onChange={e => setDepositPct(Number(e.target.value))}
          className="w-full accent-accent cursor-pointer"
          aria-label="Deposit percentage"
        />
      </div>

      {/* Rate + term */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-[#8b949e] mb-1.5">Interest rate (% p.a.)</label>
          <input
            type="number"
            min={0}
            max={40}
            step={0.5}
            value={rate}
            onChange={e => setRate(e.target.value)}
            className="input-field text-sm py-2"
            aria-label="Annual interest rate"
          />
        </div>
        <div>
          <label className="block text-sm text-[#8b949e] mb-1.5">Term</label>
          <select
            value={termMonths}
            onChange={e => setTermMonths(Number(e.target.value))}
            className="bg-dark-surface border border-dark-border text-[#e6edf3] text-sm rounded-lg px-3 py-2 w-full outline-none focus:border-accent cursor-pointer"
            aria-label="Loan term in months"
          >
            {TERMS.map(t => <option key={t} value={t}>{t} months</option>)}
          </select>
        </div>
      </div>

      {/* Result */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4">
        <div className="text-sm text-[#8b949e] mb-1">Estimated monthly payment</div>
        <div className="text-3xl font-black text-accent">{format(monthly)}<span className="text-base font-medium text-[#6e7681]">/mo</span></div>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div>
            <div className="text-[11px] text-[#6e7681] uppercase tracking-wide">Loan</div>
            <div className="text-sm text-white font-medium mt-0.5">{format(principal)}</div>
          </div>
          <div>
            <div className="text-[11px] text-[#6e7681] uppercase tracking-wide">Interest</div>
            <div className="text-sm text-white font-medium mt-0.5">{format(totalInterest)}</div>
          </div>
          <div>
            <div className="text-[11px] text-[#6e7681] uppercase tracking-wide">Total</div>
            <div className="text-sm text-white font-medium mt-0.5">{format(totalRepayment)}</div>
          </div>
        </div>
      </div>

      <p className="text-xs text-[#6e7681] leading-relaxed">
        Estimate only — actual terms depend on your lender and credit profile. Not a loan offer.
      </p>
    </div>
  );
}
