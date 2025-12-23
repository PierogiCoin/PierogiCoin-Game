'use client';

import React, { useState, useEffect } from 'react';


export default function TimeLimitedBonus() {
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  return (
    <section className="text-center mt-4">
      <p className="text-lg text-green-400 font-bold">🎁 +10% BONUSU przez: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s</p>
    </section>
  );
}