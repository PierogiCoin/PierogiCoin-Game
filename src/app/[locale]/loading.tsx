'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030014]">
            {/* Background ambient effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Spinner Container */}
                <div className="relative w-32 h-32">
                    {/* Outer spinning ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-gold-400 border-r-amber-500"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Inner counter-spinning ring */}
                    <motion.div
                        className="absolute inset-3 rounded-full border-4 border-transparent border-b-cyber-400 border-l-blue-500"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Center logo with pulse */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gold-500/50 shadow-lg shadow-gold-500/20">
                            <Image
                                src="/images/logo.png"
                                alt="PierogiCoin"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </motion.div>

                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gold-500/10 blur-xl animate-pulse" />
                </div>

                {/* Loading Text */}
                <motion.div
                    className="mt-10 flex flex-col items-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-400 to-gold-500">
                        PierogiCoin
                    </span>
                    <div className="mt-2 flex items-center gap-1">
                        <span className="text-sm text-gray-400">Loading</span>
                        <motion.span
                            className="text-gold-400"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
                        >
                            .
                        </motion.span>
                        <motion.span
                            className="text-gold-400"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.2 }}
                        >
                            .
                        </motion.span>
                        <motion.span
                            className="text-gold-400"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.4 }}
                        >
                            .
                        </motion.span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

