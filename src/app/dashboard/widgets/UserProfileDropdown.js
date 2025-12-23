import { FiChevronDown } from 'react-icons/fi';
import { FiLogOut } from 'react-icons/fi';
import { FiSettings } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
// components/dashboard/UserProfileDropdown.js

const UserProfileDropdown = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Funkcja do wylogowania (w realnej aplikacji wywołałaby API i przekierowała)
  const handleLogout = () => {
    console.log("Wylogowywanie...");
    alert("Wylogowano!"); // Placeholder
    // np. router.push('/login');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
      >
        <Image
            src={user.avatarUrl || `https://avatar.iran.liara.run/username?username=${user.username}`}
            alt={user.username}
            width={36}
            height={36}
            className="rounded-full border-2 border-yellow-500"
        />
        <span className="text-sm font-medium text-gray-200 hidden md:inline">{user.username}</span>
        <FiChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale:0.95 }}
            animate={{ opacity: 1, y: 0, scale:1 }}
            exit={{ opacity: 0, y: -10, scale:0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 py-1"
          >
            <div className="px-4 py-3 border-b border-gray-700">
                <p className="text-sm font-semibold text-yellow-400">{user.username}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <Link href="/dashboard/profile" passHref>
              <a className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-yellow-400 transition-colors">
                <FiUser size={16} /> Profil
              </a>
            </Link>
            <Link href="/dashboard/settings" passHref>
              <a className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-yellow-400 transition-colors">
                <FiSettings size={16} /> Ustawienia
              </a>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
            >
              <FiLogOut size={16} /> Wyloguj
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfileDropdown;