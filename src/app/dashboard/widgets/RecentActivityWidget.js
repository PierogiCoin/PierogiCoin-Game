import { FiList } from 'react-icons/fi';
import { motion } from 'framer-motion';
// components/dashboard/widgets/RecentActivityWidget.js

const RecentActivityWidget = () => {
    // W realnej aplikacji te dane przyszłyby z API
    const activities = [
        { id: 1, type: 'Wygrałeś na Kole Fortuny', description: '500 PRG', time: '2 min temu', color: 'text-green-400' },
        { id: 2, type: 'Zakupiono Tokeny', description: '+ 2,000 PRG', time: '1 godz temu', color: 'text-blue-400' },
        { id: 3, type: 'Ukończono Zadanie', description: '"Pierwszy Krok"', time: '3 godz temu', color: 'text-yellow-400' },
        { id: 4, type: 'Polecenie Zakończone', description: 'Bonus +50 PRG', time: 'wczoraj', color: 'text-purple-400' },
    ];

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-yellow-500/20">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-yellow-400">Ostatnia Aktywność</h3>
                <FiList className="text-yellow-500 text-2xl" />
            </div>
            {activities.length > 0 ? (
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {activities.map(activity => (
                        <motion.li
                            key={activity.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex items-center justify-between p-3 bg-gray-700/50 rounded-md text-sm"
                        >
                            <div>
                                <span className={`font-semibold ${activity.color}`}>{activity.type}: </span>
                                <span className="text-gray-300">{activity.description}</span>
                            </div>
                            <span className="text-gray-500 text-xs">{activity.time}</span>
                        </motion.li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-400 text-sm">Brak ostatniej aktywności.</p>
            )}
        </div>
    );
};
export default RecentActivityWidget;