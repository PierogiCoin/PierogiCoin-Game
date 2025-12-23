import { FiSettings } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
// components/dashboard/widgets/QuickActionsWidget.js

const QuickActionsWidget = () => {
    const actions = [
        { label: 'Kup PRG', href: '/buy-tokens', icon: FiPlusCircle, color: 'bg-yellow-500 hover:bg-yellow-600' },
        // { label: 'Stakuj Tokeny', href: '/staking', icon: FiBarChart2, color: 'bg-green-500 hover:bg-green-600' }, // Jeśli masz staking
        { label: 'Ustawienia Konta', href: '/dashboard/settings', icon: FiSettings, color: 'bg-blue-500 hover:bg-blue-600' },
    ];

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-yellow-500/20 h-full">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">Szybkie Akcje</h3>
            <div className="space-y-3">
                {actions.map((action, index) => (
                    <Link href={action.href} key={index} passHref>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className={`w-full flex items-center justify-start p-3 rounded-md text-white font-medium text-sm transition-colors ${action.color}`}
                        >
                            <action.icon className="mr-3 text-lg" />
                            {action.label}
                        </motion.button>
                    </Link>
                ))}
            </div>
        </div>
    );
};
export default QuickActionsWidget;