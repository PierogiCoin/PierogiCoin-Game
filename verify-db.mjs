import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.error('Missing ENV vars in .env.local');
    process.exit(1);
}

const supabase = createClient(url, key);

async function checkDatabase() {
    console.log('Checking database tables and functions...');

    // Check for 'purchases' table
    const { data: purchases, error: pError } = await supabase.from('purchases').select('id').limit(1);
    if (pError) {
        console.log('❌ purchases table:', pError.message);
    } else {
        console.log('✅ purchases table: FOUND');
    }

    // Check for 'transactions' table
    const { data: transactions, error: tError } = await supabase.from('transactions').select('id').limit(1);
    if (tError) {
        console.log('❌ transactions table:', tError.message);
    } else {
        console.log('✅ transactions table: FOUND');
    }

    // Check for 'newsletter_subscribers' table
    const { data: news, error: nError } = await supabase.from('newsletter_subscribers').select('id').limit(1);
    if (nError) {
        console.log('❌ newsletter_subscribers table:', nError.message);
    } else {
        console.log('✅ newsletter_subscribers table: FOUND');
    }

    // Check for 'users' table
    const { data: users, error: uError } = await supabase.from('users').select('id').limit(1);
    if (uError) {
        console.log('❌ users table:', uError.message);
    } else {
        console.log('✅ users table: FOUND');
    }

    // Check for 'game_states' table
    const { data: gs, error: gsError } = await supabase.from('game_states').select('user_id').limit(1);
    if (gsError) {
        console.log('❌ game_states table:', gsError.message);
    } else {
        console.log('✅ game_states table: FOUND');
    }

    // Check RPC functions
    const { data: rpc1, error: r1Error } = await supabase.rpc('get_total_confirmed_usd_raised');
    if (r1Error) {
        console.log('❌ RPC get_total_confirmed_usd_raised:', r1Error.message);
    } else {
        console.log('✅ RPC get_total_confirmed_usd_raised: WORKING (result:', rpc1, ')');
    }
}

checkDatabase();
