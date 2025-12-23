/**
 * Test Data Seeder for Game Dashboard
 * 
 * This script creates test data in Supabase to verify:
 * - User profiles with game stats
 * - Purchase records with different investment tiers
 * 
 * Run with: node scripts/seed-test-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Test users data (matching actual schema as of Dec 23)
const testUsers = [
    {
        id: 'test-user-1',
        username: 'pierogifan',
        email: 'test1@pierogicoin.com',
        level: 15,
        xp: 12500,
        xp_to_next_level: 15000,
        prg: 50000,
        gems: 250,
        essence: 50,
        energy: 100,
        max_energy: 100,
        avatar_id: '🥟',
        stats: {
            totalSpins: 450,
            totalTaps: 8900,
            duelsWon: 23,
            collectionsCompleted: 5,
            prgEarned: 75000
        },
        helped_user_ids_today: ['test-user-2', 'test-user-3'],
        streak_count: 7,
        last_login_date: new Date().toISOString().split('T')[0]
    },
    {
        id: 'test-user-2',
        username: 'cryptohunter',
        email: 'test2@pierogicoin.com',
        level: 8,
        xp: 3200,
        xp_to_next_level: 5000,
        prg: 15000,
        gems: 80,
        essence: 15,
        energy: 85,
        max_energy: 100,
        avatar_id: '🎯',
        stats: {
            totalSpins: 120,
            totalTaps: 2100,
            duelsWon: 5,
            collectionsCompleted: 1,
            prgEarned: 18000
        },
        helped_user_ids_today: [],
        streak_count: 3,
        last_login_date: new Date().toISOString().split('T')[0]
    },
    {
        id: 'test-user-3',
        username: 'moonwalker',
        email: 'test3@pierogicoin.com',
        level: 22,
        xp: 28000,
        xp_to_next_level: 30000,
        prg: 125000,
        gems: 580,
        essence: 120,
        energy: 100,
        max_energy: 120,
        avatar_id: '🚀',
        stats: {
            totalSpins: 890,
            totalTaps: 15600,
            duelsWon: 67,
            collectionsCompleted: 12,
            prgEarned: 180000
        },
        helped_user_ids_today: [],
        streak_count: 15,
        last_login_date: new Date().toISOString().split('T')[0]
    }
];

// Test purchases data (matching actual schema)
const testPurchases = [
    {
        buyer_wallet: 'test-user-1',
        prg_delivery_address: 'test-user-1',
        usd_amount: 500,
        tokens_to_credit: 15625000,
        crypto_type: 'SOL',
        crypto_amount: 2.5,
        status: 'success',
        stage_name: 'Phase 1',
        payment_signature: 'test-sig-1',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        buyer_wallet: 'test-user-1',
        prg_delivery_address: 'test-user-1',
        usd_amount: 250,
        tokens_to_credit: 7812500,
        crypto_type: 'USDC',
        crypto_amount: 250,
        status: 'success',
        stage_name: 'Phase 1',
        payment_signature: 'test-sig-2',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
];

// Test game states (matching actual schema)
const testGameStates = [
    {
        user_id: 'test-user-1',
        tasks: [
            { id: 'task-1', description: 'Spin 10 times', progress: 10, target: 10, claimed: true }
        ],
        achievement_progress: { 'first_spin': 100 },
        claimed_achievements: ['first_spin']
    }
];

async function seedTestData() {
    console.log('🌱 Seed test data...');
    try {
        await supabase.from('users').upsert(testUsers);
        console.log('✅ Users seeded');
        await supabase.from('game_states').upsert(testGameStates);
        console.log('✅ Game states seeded');
        await supabase.from('purchases').insert(testPurchases);
        console.log('✅ Purchases seeded');
        console.log('✨ Success!');
    } catch (e) {
        console.error('❌ Failed:', e);
    }
}

seedTestData();
