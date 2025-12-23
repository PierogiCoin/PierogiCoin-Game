"use client";

import { useState, useEffect } from 'react';
import { FiZap, FiGift } from 'react-icons/fi';
import { motion, useAnimation } from 'framer-motion';

interface PrizeValue {
  type: "tokens" | "purchase_bonus" | "try_again" | "nft" | "free_spin";
  amount?: number;
  percentage?: number;
  id?: string;
}

interface Prize {
  label: string;
  value: PrizeValue;
  color: string;
}

interface WheelOfFortuneProps {
  onSpinComplete?: (prize: Prize) => void;
}

const WheelOfFortune = ({ onSpinComplete }: WheelOfFortuneProps) => {
  const segments = [
    { label: "500 PRG", value: { type: "tokens", amount: 500 }, color: "#34D399" },
    { label: "Bonus 5%", value: { type: "purchase_bonus", percentage: 5 }, color: "#A78BFA" },
    { label: "2000 PRG", value: { type: "tokens", amount: 2000 }, color: "#FBBF24" },
    { label: "Try Again", value: { type: "try_again" }, color: "#6B7280" },
    { label: "Bonus 15%", value: { type: "purchase_bonus", percentage: 15 }, color: "#EC4899" },
    { label: "Special NFT", value: { type: "nft", id: "pierogi_chef_nft" }, color: "#60A5FA" },
    { label: "10,000 PRG", value: { type: "tokens", amount: 10000 }, color: "#F59E0B" },
    { label: "Next Spin Free", value: { type: "free_spin" }, color: "#84CC16" }
  ];

  const numSegments = segments.length;
  const anglePerSegment = 360 / numSegments;

  const wheelRadius = 150;
  const textRadius = wheelRadius * 0.7;
  // const pointerOffset = 10; // USUNIĘTO - nieużywane

  const controls = useAnimation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);

  const spinWheel = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setCurrentPrize(null);

    const targetSegmentIndex = Math.floor(Math.random() * numSegments);
    const targetSegment = segments[targetSegmentIndex] as Prize;

    const rotationToTarget = -(targetSegmentIndex * anglePerSegment + anglePerSegment / 2);
    const randomSpins = 5 + Math.floor(Math.random() * 3);
    const totalRotation = rotationToTarget + 360 * randomSpins;

    await controls.start({
      rotate: totalRotation,
      transition: {
        duration: 6 + Math.random() * 2,
        ease: "circOut",
      },
    });

    setCurrentPrize(targetSegment as Prize);
    setIsSpinning(false);
    if (onSpinComplete) {
      onSpinComplete(targetSegment as Prize);
    }
  };

  useEffect(() => {
    controls.set({ rotate: 0 });
  }, [controls]);

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-[#0d0d14]/80 rounded-xl shadow-2xl my-10 border border-gold-500/30">
      <h2 className="text-3xl md:text-4xl font-bold text-gold-400 mb-8 text-gradient-gold">
        Zakręć Kołem Szczęścia PierogiCoin!
      </h2>
      <div
        className="relative"
        style={{
          width: `${wheelRadius * 2}px`,
          height: `${wheelRadius * 2}px`,
        }}
      >
        <div
          className="absolute top-[-14px] left-1/2 transform -translate-x-1/2 z-20"
          style={{
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: `24px solid #F59E0B`,
            filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))'
          }}
        />
        <motion.div
          animate={controls}
          className="w-full h-full rounded-full"
          style={{
             boxShadow: '0 0 15px rgba(250,204,21,0.3)',
          }}
        >
          <svg
            viewBox={`-${wheelRadius + 5} -${wheelRadius + 5} ${(wheelRadius + 5) * 2} ${(wheelRadius + 5) * 2}`}
            className="w-full h-full"
          >
            <defs>
                <filter id="innerShadowWheel" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                    <feOffset in="blur" dy="2" dx="0" result="offsetBlur" />
                    <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lightingColor="#bbbbbb" result="specOut">
                        <fePointLight x="-5000" y="-10000" z="20000" />
                    </feSpecularLighting>
                    <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
                    <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
                    <feMorphology operator="erode" radius="1" in="SourceAlpha" result="eroded" />
                    <feGaussianBlur in="eroded" stdDeviation="2" result="blurred_eroded" />
                    <feFlood floodColor="rgba(0,0,0,0.5)" result="shadow_color" />
                    <feComposite in="shadow_color" in2="blurred_eroded" operator="in" result="inner_shadow_shape" />
                    <feOffset in="inner_shadow_shape" dx="0" dy="2" result="moved_inner_shadow" />
                    <feMerge>
                        <feMergeNode in="litPaint" />
                        <feMergeNode in="moved_inner_shadow" />
                    </feMerge>
                </filter>
            </defs>
            <circle cx="0" cy="0" r={wheelRadius} fill="#1F2937" stroke="#FBBF24" strokeWidth="3" filter="url(#innerShadowWheel)" />
            {segments.map((segment, index) => {
              const startAngleDeg = index * anglePerSegment;
              const endAngleDeg = (index + 1) * anglePerSegment;
              const startAngleRad = (startAngleDeg - 90) * (Math.PI / 180);
              const endAngleRad = (endAngleDeg - 90) * (Math.PI / 180);
              const x1 = wheelRadius * Math.cos(startAngleRad);
              const y1 = wheelRadius * Math.sin(startAngleRad);
              const x2 = wheelRadius * Math.cos(endAngleRad);
              const y2 = wheelRadius * Math.sin(endAngleRad);
              const largeArcFlag = anglePerSegment > 180 ? 1 : 0;
              const pathData = `M 0 0 L ${x1} ${y1} A ${wheelRadius} ${wheelRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              const midAngleDeg = startAngleDeg + anglePerSegment / 2;
              const midAngleRadText = midAngleDeg * (Math.PI / 180);
              const currentTextRadius = textRadius * (segment.label.length > 10 ? 0.85 : (segment.label.length > 7 ? 0.9 : 1));
              const textX = currentTextRadius * Math.cos(midAngleRadText);
              const textY = currentTextRadius * Math.sin(midAngleRadText);
              let textAngle = midAngleDeg;
              if (textAngle > 90 && textAngle < 270) {
                textAngle += 180;
              }
              const hexToRgb = (hex: string) => {
                const bigint = parseInt(hex.slice(1), 16);
                return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
              };
              const segmentRgb = hexToRgb(segment.color);
              const brightness = (segmentRgb.r * 299 + segmentRgb.g * 587 + segmentRgb.b * 114) / 1000;
              const textColor = brightness > 128 ? '#111827' : '#FFFFFF';

              return (
                <g key={index}>
                  <path d={pathData} fill={segment.color} stroke="#000000" strokeWidth="1" />
                  <text
                    x={textX}
                    y={textY}
                    dy="0.35em"
                    textAnchor="middle"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                    fill={textColor}
                    fontSize={segment.label.length > 12 ? "8" : (segment.label.length > 9 ? "9" : "10")}
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                    paintOrder="stroke"
                    stroke={textColor === "#111827" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
                    strokeWidth="0.25px"
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}
            <circle cx="0" cy="0" r={wheelRadius * 0.15} fill="#F59E0B" stroke="#FBBF24" strokeWidth="2" />
            <circle cx="0" cy="0" r={wheelRadius * 0.1} fill="#111827" />
          </svg>
        </motion.div>
      </div>

      <motion.button
        onClick={spinWheel}
        disabled={isSpinning}
        className="mt-10 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-gray-900 font-semibold py-4 px-12 rounded-lg shadow-xl text-xl
                   transform transition-all duration-300 ease-in-out
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
        whileHover={{ scale: isSpinning ? 1 : 1.08, boxShadow: isSpinning ? "none" : "0px 0px 25px rgba(250, 204, 21, 0.8)" }}
        whileTap={{ scale: isSpinning ? 1 : 0.92 }}
      >
        {isSpinning ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-4 border-gray-900 border-t-transparent rounded-full"
            />
            Kręci się...
          </>
        ) : (
          <>
            <FiZap className="text-2xl" /> Zakręć Mocno!
          </>
        )}
      </motion.button>

      {currentPrize && !isSpinning && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="mt-8 p-6 bg-[#0a0a12] rounded-xl shadow-lg text-center border border-gold-500/50"
        >
          <p className="text-gray-300 text-lg">Twoja nagroda to:</p>
          <p className="text-3xl font-bold text-gold-400 flex items-center justify-center gap-3 mt-2">
            <FiGift className="text-gold-300" /> {currentPrize.label}
          </p>
          {currentPrize.value.type === "purchase_bonus" && (
            <p className="text-sm text-gray-400 mt-1">Bonus {currentPrize.value.percentage}% zostanie zastosowany przy następnym zakupie.</p>
          )}
           {currentPrize.value.type === "nft" && (
            // POPRAWKA TUTAJ: Usunięto cudzysłowy lub można użyć encji
            <p className="text-sm text-gray-400 mt-1">Gratulacje! NFT {currentPrize.value.id} zostanie wkrótce przesłane na Twój portfel!</p>
            // Alternatywa z encjami, jeśli cudzysłowy są pożądane:
            // <p className="text-sm text-gray-400 mt-1">Gratulacje! NFT “{currentPrize.value.id}” zostanie wkrótce przesłane na Twój portfel!</p>
          )}
           {currentPrize.value.type === "tokens" && (
            <p className="text-sm text-gray-400 mt-1">Tokeny {currentPrize.value.amount} PRG zostały dodane do Twojego salda!</p>
          )}
          {currentPrize.value.type === "free_spin" && (
            <p className="text-sm text-gray-400 mt-1">Masz darmowy zakręt! Spróbuj szczęścia ponownie!</p>
          )}
           {currentPrize.value.type === "try_again" && (
            <p className="text-sm text-gray-400 mt-1">Niestety, tym razem nic. Spróbuj ponownie!</p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default WheelOfFortune;