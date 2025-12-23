'use client';

import React from 'react';

export default function ExchangesSection() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 text-center">
      <h2 className="text-3xl font-extrabold text-gold-300">Kup PRG na giełdach</h2>
      <p className="mt-2 text-gray-400">
        Wybierz swoją ulubioną platformę i rozpocznij handel PierogiCoin.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a
          href="https://raydium.io/swap/?inputCurrency=sol&outputCurrency=PRG_MINT"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-gray-700 bg-[#0d0d14] px-5 py-3 text-gold-300 hover:border-gold-400 hover:bg-[#0a0a12]"
        >
          Raydium
        </a>
        <a
          href="https://jup.ag/swap/SOL-PRG_MINT"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-gray-700 bg-[#0d0d14] px-5 py-3 text-gold-300 hover:border-gold-400 hover:bg-[#0a0a12]"
        >
          Jupiter
        </a>
        {/* Dodaj kolejne giełdy tutaj */}
      </div>
    </div>
  );
}
