'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// NOTE: This file handles 404s within the [locale] route segments
export default function NotFound() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-center text-white">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

            <div className="relative z-10 px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20, rotate: -10 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="mb-8 text-9xl"
                >
                    🥟
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-4 text-5xl font-black md:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-600"
                >
                    404
                </motion.h1>

                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6 text-2xl font-bold md:text-3xl text-gray-200"
                >
                    Lost in the Galaxy?
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-10 max-w-md mx-auto text-gray-400"
                >
                    It seems this dumpling has rolled off the table. The page you are looking for does not exist or has been eaten.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-8 py-4 font-bold text-black transition-transform hover:scale-105 hover:bg-gold-400"
                    >
                        Return to Base
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
