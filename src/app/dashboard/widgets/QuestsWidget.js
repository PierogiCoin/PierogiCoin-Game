import { FiCheckCircle } from 'react-icons/fi';
import { FiList } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
// components/dashboard/widgets/QuestsWidget.js

const QuestsWidget = ({ completed, total }) => {
  const progress = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-yellow-500/20 h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-yellow-400">Zadania i Osiągnięcia</h3>
        <FiCheckCircle className="text-yellow-500 text-2xl" />
      </div>
      <p className="text-sm text-gray-300 mb-1">Ukończono: <span className="font-bold text-white">{completed} z {total}</span> zadań.</p>
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
        <motion.div
          className="bg-green-500 h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <Link href="/dashboard/quests" passHref>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
        >
          <FiList className="inline mr-1 mb-0.5" /> Zobacz Wszystkie Zadania
        </motion.button>
      </Link>
    </div>
  );
};
export default QuestsWidget;