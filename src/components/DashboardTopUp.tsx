'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FaCreditCard, FaSpinner } from 'react-icons/fa';
import { Loader2, Zap } from 'lucide-react';

export default function DashboardTopUp({ user }: { user: any }) {
    const { t } = useTranslation(['common']);
    const [amountUSD, setAmountUSD] = useState<number>(50);
    const [loading, setLoading] = useState(false);

    const handleTopUp = async () => {
        if (!user) {
            toast.error('Please login first');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amountUSD,
                    productType: 'token', // Using 'token' product type for generic Top-Up
                    successUrl: `${window.location.origin}/dashboard?success=topup`,
                    cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
                    walletAddress: user.id, // Using user ID as wallet/account identifier
                    metadata: {
                        userId: user.id,
                        source: 'dashboard_topup',
                        isBundle: true
                    }
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Checkout initialization failed');

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Payment initialization failed');
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0d0d12] border border-gold-500/20 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/5 blur-[80px] -mr-40 -mt-40 rounded-full group-hover:bg-gold-500/10 transition-colors duration-1000"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gold-500/10 rounded-xl text-gold-500 border border-gold-500/20">
                        <FaCreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Szybkie Doładowanie</h3>
                        <p className="text-xs text-gray-400">Bezpieczna płatność kartą (Stripe)</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {[50, 100, 250, 500, 1000, 2500].map((val) => (
                        <button
                            key={val}
                            onClick={() => setAmountUSD(val)}
                            className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${amountUSD === val
                                ? 'border-gold-500 bg-gold-500/10 text-white shadow-lg shadow-gold-500/10 scale-[1.02]'
                                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10'
                                }`}
                        >
                            <span className="font-black text-xl text-white">${val}</span>
                            <span className="text-[10px] uppercase font-bold text-gold-500/80">
                                Bundle
                            </span>
                            {amountUSD === val && (
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_5px_#4ade80]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-6 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                        <div className="text-sm font-bold text-blue-100 mb-1">Natychmiastowa Dostawa</div>
                        <p className="text-xs text-blue-200/60 leading-relaxed">
                            Pakiety doładowań są automatycznie przeliczane na PRG + Bonusy i dodawane do Twojego konta.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleTopUp}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 text-black font-black text-lg hover:shadow-lg hover:shadow-gold-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <>
                            Doładuj ${amountUSD} <FaCreditCard className="w-5 h-5 opacity-75" />
                        </>
                    )}
                </button>
                <p className="text-center text-[10px] text-gray-500 mt-3">
                    Transakcje obsługiwane przez Stripe. SSL Secured.
                </p>
            </div>
        </div>
    );
}
