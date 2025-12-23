import { FiRotateCw } from 'react-icons/fi';
import { FiGift } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
// components/dashboard/widgets/WheelOfFortuneWidget.js

const WheelOfFortuneWidget = ({ spinsLeft }) => {
  return (
    <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-yellow-500/20 h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-yellow-400">Koło Fortuny</h3>
        <FiGift className="text-yellow-500 text-2xl" />
      </div>
      {spinsLeft > 0 ? (
        <p className="text-sm text-gray-300 mb-4">Masz <span className="font-bold text-white">{spinsLeft}</span> {spinsLeft === 1 ? 'darmowy spin' : 'darmowe spiny'}! Zakręć teraz!</p>
      ) : (
        <p className="text-sm text-gray-300 mb-4">Brak darmowych spinów. Wróć jutro lub zdobądź więcej!</p>
      )}
      <Link href="/wheel-of-fortune" passHref> {/* Link do pełnej strony Koła Fortuny */}
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className={`w-full font-semibold py-2 px-4 rounded-md text-sm transition-colors ${spinsLeft > 0 ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
          disabled={spinsLeft <= 0}
        >
          <FiRotateCw className="inline mr-1 mb-0.5" /> Zakręć Kołem
        </motion.button>
      </Link>
    </div>
  );
};
export default WheelOfFortuneWidget;