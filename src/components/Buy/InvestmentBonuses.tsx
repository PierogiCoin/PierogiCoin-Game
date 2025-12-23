

"use client";

import React from "react";

interface InvestmentBonusesProps {
  t: (k: string, opts?: Record<string, unknown>) => string;
  usd0: Intl.NumberFormat;
}

export default function InvestmentBonuses({ t, usd0 }: InvestmentBonusesProps) {
  const tiers = [
    { usd: 100, bonus: 5 },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 sm:p-5">
      <h4 className="font-semibold text-white mb-3 text-base sm:text-lg">
        💎 {t("buy_section.investment_bonuses", { defaultValue: "Investment size bonuses" })}
      </h4>
      <div className="flex flex-wrap gap-2">
        {tiers.map((row) => (
          <div
            key={row.usd}
            className="rounded-xl border border-gold-400/30 bg-gold-400/10 px-3 py-2 text-sm text-gold-100 shadow-[inset_0_0_0_1px_rgba(250,204,21,0.15)]"
          >
            <div className="font-semibold">{usd0.format(row.usd)}</div>
            <div className="text-[12px] opacity-90">
              {row.bonus}% {t("buy_section.bonus", { defaultValue: "bonus" })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-white/70">
        {t("buy_section.bonus_calc_hint", {
          defaultValue:
            "Your total bonus = Stage Bonus + Investment Bonus. Both stack on top of the base PRG rate.",
        })}
      </p>
    </div>
  );
}