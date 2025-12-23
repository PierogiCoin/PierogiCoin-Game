'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGift } from 'react-icons/fi';

type CryptoOption = 'SOL' | 'USDC';

interface CryptoPrices {
  SOL: number;
  USDC: number;
}

interface AmountInputProps {
  amountUSD: number;
  setAmountUSD: (value: number) => void;
  selectedCrypto: CryptoOption;
  liveCryptoPrices: CryptoPrices | null;
  disabled?: boolean;
}

const bonusTiers = [
  { threshold: 100, percent: 5 },
];

const MAX_SLIDER_VALUE = 5000;
const MIN_VALUE = 1;

// Skala logarytmiczna
const valueToPosition = (value: number) => {
  if (value <= MIN_VALUE) return 0;
  const normalized = (value - MIN_VALUE) / (MAX_SLIDER_VALUE - MIN_VALUE);
  return Math.pow(normalized, 1 / 2) * 100;
};

const positionToValue = (pos: number) => {
  const normalized = pos / 100;
  const value = Math.pow(normalized, 2) * (MAX_SLIDER_VALUE - MIN_VALUE) + MIN_VALUE;
  return Math.round(value);
};

const BonusTierMarkers: React.FC<{ amountUSD: number }> = ({ amountUSD }) => (
  <>
    {bonusTiers.map((tier) => {
      const tierPosition = valueToPosition(tier.threshold);
      const isAchieved = amountUSD >= tier.threshold;
      return (
        <div
          key={tier.threshold}
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: `${tierPosition}%` }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gray-600">
            <div
              className={`w-full h-full rounded-full transition-all duration-300 ${isAchieved ? 'bg-gold-400 scale-125' : 'bg-gray-600'
                }`}
            />
          </div>
          <span
            className={`absolute -bottom-7 -translate-x-1/2 text-xs transition-colors duration-300 whitespace-nowrap ${isAchieved ? 'text-gold-400 font-bold' : 'text-gray-400'
              }`}
          >
            ${tier.threshold >= 1000 ? `${tier.threshold / 1000}k` : tier.threshold}
          </span>
        </div>
      );
    })}
  </>
);

const QuickAmountButtons: React.FC<{
  setAmountUSD: (value: number) => void;
  disabled?: boolean;
}> = ({ setAmountUSD, disabled }) => (
  <div className="flex items-center justify-center space-x-2">
    {bonusTiers.map((tier) => (
      <motion.button
        key={tier.threshold}
        onClick={() => setAmountUSD(tier.threshold)}
        className="text-xs font-semibold text-gold-400 bg-gold-500/10 px-3 py-1 rounded-full hover:bg-gold-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        disabled={disabled}
      >
        ${tier.threshold}
      </motion.button>
    ))}
  </div>
);

const AmountInput: React.FC<AmountInputProps> = ({
  amountUSD,
  setAmountUSD,
  selectedCrypto,
  liveCryptoPrices,
  disabled = false,
}) => {
  const { t } = useTranslation('buy-tokens-page');
  const [showTooltip, setShowTooltip] = useState(false);

  const isAmountInvalid = amountUSD < MIN_VALUE && amountUSD !== 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) setAmountUSD(positionToValue(parseFloat(e.target.value)));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const parsedValue = parseFloat(e.target.value);
    setAmountUSD(
      isNaN(parsedValue) || parsedValue < 0
        ? 0
        : Math.min(parsedValue, MAX_SLIDER_VALUE)
    );
  };

  const sliderPosition = valueToPosition(amountUSD > 0 ? amountUSD : 0);
  const sliderStyle = {
    background: `linear-gradient(to right, #FBBF24 ${sliderPosition}%, #374151 ${sliderPosition}%)`,
  };

  const nextBonus = useMemo(
    () => bonusTiers.find((tier) => amountUSD < tier.threshold) || null,
    [amountUSD]
  );

  const cryptoCost = useMemo(() => {
    if (!liveCryptoPrices || amountUSD <= 0) return 0;
    const rate =
      selectedCrypto === 'SOL'
        ? liveCryptoPrices.SOL
        : liveCryptoPrices.USDC;
    return rate > 0 ? amountUSD / rate : 0;
  }, [amountUSD, selectedCrypto, liveCryptoPrices]);

  return (
    <div className="space-y-4">
      <label
        htmlFor="amount-usd"
        className="block text-sm font-medium text-gray-300"
      >
        {t('buy_section.amount_input.label')}
      </label>
      <div className="relative">
        {/* Prefix $ */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <span className="text-gray-400 text-lg">$</span>
        </div>
        <input
          type="number"
          inputMode="decimal"
          step="1"
          id="amount-usd"
          className={`block w-full rounded-lg border-2 bg-gray-700/50 py-3 pl-8 pr-16 text-white text-xl font-semibold placeholder:text-gray-400 focus:ring-2 focus:ring-inset outline-none transition-colors ${isAmountInvalid
              ? 'border-red-500 focus:ring-red-500'
              : 'border-transparent focus:ring-gold-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder="100"
          value={amountUSD || ''}
          onChange={handleInputChange}
          min={MIN_VALUE}
          max={MAX_SLIDER_VALUE}
          disabled={disabled}
        />
        {/* Suffix USD */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
          <span className="text-gray-400 sm:text-sm">USD</span>
        </div>
      </div>

      {cryptoCost > 0 && (
        <p className="text-center text-sm text-gray-400">
          {t('buy_section.amount_input.you_will_spend_label')} ≈{' '}
          <span className="font-bold text-white">
            {cryptoCost.toFixed(selectedCrypto === 'SOL' ? 4 : 2)}{' '}
            {selectedCrypto}
          </span>
        </p>
      )}

      <div className="relative pt-8 pb-4 px-2">
        <div className="relative h-2">
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full mb-3 -translate-x-1/2 bg-[#0a0a12] text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg"
                style={{ left: `${sliderPosition}%` }}
              >
                ${amountUSD}
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={sliderPosition}
            onChange={handleSliderChange}
            style={sliderStyle}
            onMouseDown={() => setShowTooltip(true)}
            onTouchStart={() => setShowTooltip(true)}
            onMouseUp={() => setShowTooltip(false)}
            onTouchEnd={() => setShowTooltip(false)}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gray-900 ${disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={disabled}
          />
          <BonusTierMarkers amountUSD={amountUSD} />
        </div>
      </div>

      <QuickAmountButtons setAmountUSD={setAmountUSD} disabled={disabled} />

      <AnimatePresence mode="wait">
        {nextBonus ? (
          <motion.div
            key={nextBonus.threshold}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 text-center text-xs text-green-300 bg-green-500/10 p-2 rounded-md"
          >
            <FiGift />
            <span>
              {t('buy_section.bonus_slider.unlock_next_bonus', {
                amount: Math.max(0, Math.ceil(nextBonus.threshold - amountUSD)).toString(),
                currency: 'USD',
                percent: nextBonus.percent,
              })}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="max-bonus"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 text-center text-xs text-gold-300 bg-gold-500/10 p-2 rounded-md"
          >
            <FiGift className="text-gold-400" />
            <span>{t('buy_section.bonus_slider.congrats_max_bonus')}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AmountInput;
