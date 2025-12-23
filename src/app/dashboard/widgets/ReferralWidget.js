import { motion } from 'framer-motion';
import { FiShare2 } from 'react-icons/fi';
import Link from 'next/link';
// components/dashboard/widgets/ReferralWidget.js

const ReferralWidget = ({ referrals }) => {
  return (
    <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-yellow-500/20 h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-yellow-400">Program Poleceń</h3>
        <FiShare2 className="text-yellow-500 text-2xl" />
      </div>
      <p className="text-sm text-gray-300 mb-1">Poleciłeś już <span className="font-bold text-white">{referrals}</span> znajomych!</p>
      <p className="text-xs text-gray-400 mb-4">Zarabiaj PRG za każdego nowego użytkownika.</p>
      <Link href="/dashboard/referrals" passHref> {/* Załóżmy, że pełna strona poleceń jest pod tym adresem */}
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold py-2 px-4 rounded-md text-sm transition-colors"
        >
          Zobacz Szczegóły Poleceń
        </motion.button>
      </Link>
    </div>
  );
};
export default ReferralWidget;