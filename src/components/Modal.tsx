'use client';

import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';


interface ModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Modal({ title, message, onConfirm, onCancel }: ModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[#0a0a12] text-gray-200 p-6 rounded-lg shadow-lg max-w-sm w-full text-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        >
          <h3 className="text-xl font-bold text-gold-400">{title}</h3>
          <p className="text-gray-300 mt-2">{message}</p>

          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-400 transition-all text-gray-900 font-bold"
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}