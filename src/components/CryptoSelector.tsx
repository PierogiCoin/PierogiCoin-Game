// Plik: src/components/CryptoSelector.tsx
'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
// ULEPSZENIE: Importujemy ikony z odpowiednich pakietów
import { FaCircleDollarToSlot } from 'react-icons/fa6';
import { SiSolana } from 'react-icons/si';

// Definiujemy typ dla opcji kryptowalut
type CryptoOption = 'SOL' | 'USDC';

// Interfejs propsów komponentu
interface CryptoSelectorProps {
  selectedCrypto: CryptoOption;
  onSelect: (crypto: CryptoOption) => void;
  // POPRAWKA: Przywracamy prop 'disabled', aby uniknąć błędów typu
  disabled: boolean;
}

const CryptoSelector: React.FC<CryptoSelectorProps> = ({ selectedCrypto, onSelect, disabled }) => {
  const { t } = useTranslation('buy-tokens-page');

  // Definiujemy opcje z ikonami dla lepszego UX
  const options: { id: CryptoOption; name: string; icon: React.ReactNode }[] = [
    { id: 'SOL', name: 'Solana', icon: <SiSolana /> },
    { id: 'USDC', name: 'USDC', icon: <FaCircleDollarToSlot /> },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {t('buy_section.crypto_selector_label')}
      </label>
      <div className="grid grid-cols-2 gap-4">
        {options.map(option => {
          const isSelected = selectedCrypto === option.id;
          return (
            <motion.button
              key={option.id}
              onClick={() => onSelect(option.id)}
              // POPRAWKA: Przekazujemy stan 'disabled' do przycisku
              disabled={disabled}
              className={`flex items-center justify-center space-x-2 w-full rounded-lg p-3 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected 
                  ? 'bg-gold-500 text-gray-900 shadow-lg' 
                  : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700'
                }`}
              whileHover={{ scale: isSelected || disabled ? 1 : 1.05 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
            >
              <span className="text-xl">{option.icon}</span>
              <span>{option.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CryptoSelector;