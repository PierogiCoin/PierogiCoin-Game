'use client';

import React from 'react';
import { USDC_MINT_ADDRESS } from '@/lib/solanaConfig';
import { useTranslation } from 'react-i18next';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { QRCodeSVG } from 'qrcode.react';
import { FiCheck, FiClipboard } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface ManualPaymentSectionProps {
  cryptoType: 'SOL' | 'USDC';
  paymentAddress: string;
  usdAmount: number;
  tokensToCredit: number;
}

export default function ManualPaymentSection({
  cryptoType,
  paymentAddress,
  usdAmount,
  tokensToCredit,
}: ManualPaymentSectionProps) {
  const { t } = useTranslation(['buy-tokens-page', 'common']);
  const [copiedAddress, copyAddress] = useCopyToClipboard();
  const [copiedAmount, copyAmount] = useCopyToClipboard();

  const usdFormatter = React.useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }), []);
  const tokensFormatter = React.useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);

  const paymentText =
    cryptoType === 'USDC'
      ? `solana:${paymentAddress}?amount=${usdAmount}&spl-token=${USDC_MINT_ADDRESS.toBase58()}&label=PierogiCoin%20Presale&message=Purchase%20of%20${tokensToCredit}%20PRG%20tokens`
      : `solana:${paymentAddress}?amount=${usdAmount}&label=PierogiCoin%20Presale&message=Purchase%20of%20${tokensToCredit}%20PRG%20tokens`;

  const handleCopyAddress = () => copyAddress(paymentAddress);
  const handleCopyAmount = () => copyAmount(usdAmount.toString());

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white">{t('buy_section.manual_payment_title', 'Manual Payment')}</h3>
        <p className="mt-2 text-white/70">
          {t('buy_section.manual_payment_desc', 'Send precisely the specified amount to the address below to complete the transaction.')}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="relative p-2 rounded-lg bg-white/90">
          <QRCodeSVG value={paymentText} size={160} />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: copiedAddress ? 1 : 0, scale: copiedAddress ? 1 : 0.5 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg"
          >
            <FiCheck className="text-green-500" size={50} />
          </motion.div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">{t('buy_section.payment_address_label', 'Payment address:')}</label>
        <div className="flex items-center space-x-2 rounded-lg bg-[#0d0d14] p-2">
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-white">
            {paymentAddress}
          </span>
          <button
            onClick={handleCopyAddress}
            className="rounded-lg p-2 transition-colors hover:bg-white/20"
            aria-label={t('common:copy_to_clipboard', 'Copy to clipboard')}
          >
            {copiedAddress ? <FiCheck className="text-green-400" /> : <FiClipboard className="text-white" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">{t('buy_section.required_amount_label', 'Required amount:')}</label>
        <div className="flex items-center space-x-2 rounded-lg bg-[#0d0d14] p-2">
          <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-white font-mono">
            {usdFormatter.format(usdAmount)} {cryptoType}
          </span>
          <button
            onClick={handleCopyAmount}
            className="rounded-lg p-2 transition-colors hover:bg-white/20"
            aria-label={t('common:copy_to_clipboard', 'Copy to clipboard')}
          >
            {copiedAmount ? <FiCheck className="text-green-400" /> : <FiClipboard className="text-white" />}
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-[#0d0d14] p-4">
        <p className="text-sm text-white/70">
          {t('buy_section.manual_payment_tokens_note', {
            defaultValue: 'You will receive {{amount}} PRG. Transaction processing may take up to a few minutes.',
            amount: tokensFormatter.format(tokensToCredit)
          })}
        </p>
      </div>
    </div>
  );
}