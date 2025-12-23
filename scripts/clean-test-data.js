/**
 * Clean Test Data
 * 
 * Removes all test data created by seed-test-data.js
 * Run with: node scripts/clean-test-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const testUserIds = ['test-user-1', 'test-user-2', 'test-user-3'];

async function cleanTestData() {
    console.log('🧹 Cleaning test data...\n');

    try {
        // 1. Delete test purchases
        console.log('💰 Deleting test purchases...');
        const { error: purchasesError } = await supabase
            .from('purchases')
            .delete()
            .in('buyer_wallet', testUserIds);

        if (purchasesError && purchasesError.code !== 'PGRST116') {
            console.error('❌ Error deleting purchases:', purchasesError);
        } else {
            console.log('✅ Test purchases deleted');
        }

        // 2. Delete test game states
        console.log('\n🎮 Deleting test game states...');
        const { error: gameStatesError } = await supabase
            .from('game_states')
            .delete()
            .in('user_id', testUserIds);

        if (gameStatesError && gameStatesError.code !== 'PGRST116') {
            console.error('❌ Error deleting game states:', gameStatesError);
        } else {
            console.log('✅ Test game states deleted');
        }

        // 3. Delete test users
        console.log('\n👥 Deleting test users...');
        const { error: usersError } = await supabase
            .from('users')
            .delete()
            .in('id', testUserIds);

        if (usersError && usersError.code !== 'PGRST116') {
            console.error('❌ Error deleting users:', usersError);
        } else {
            console.log('✅ Test users deleted');
        }

        console.log('\n✨ Test data cleaned successfully!\n');

    } catch (error) {
        console.error('\n❌ Cleaning failed:', error);
        process.exit(1);
    }
}

cleanTestData();
