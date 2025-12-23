// Plik: src/app/dashboard/widgets/AccountOverviewWidget.js
'use client';

import React from 'react';
// POPRAWKA: Usunięto zduplikowany import. Każda ikona jest teraz importowana tylko raz.
import { FiUser, FiTrendingUp, FiDollarSign } from 'react-icons/fi'; 

// Przykładowa implementacja komponentu
const AccountOverviewWidget = () => {
  const stats = [
    { id: 1, icon: <FiUser />, label: 'Followers', value: '1,234' },
    { id: 2, icon: <FiTrendingUp />, label: 'Engagement', value: '5.6%' },
    { id: 3, icon: <FiDollarSign />, label: 'Earnings', value: '$456.78' },
  ];

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Account Overview</h3>
      <div className="space-y-4">
        {stats.map(stat => (
          <div key={stat.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-yellow-400 text-xl">{stat.icon}</div>
              <span className="text-gray-300">{stat.label}</span>
            </div>
            <span className="font-bold text-white">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountOverviewWidget;