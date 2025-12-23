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

    const tables = ['purchases', 'transactions', 'newsletter_subscribers', 'users', 'game_states', 'presale_stages', 'sales'];

    for (const table of tables) {
        try {
            const { error } = await supabase.from(table).select('id').limit(1);
            if (error) {
                console.log(`❌ ${table} table: ${error.message}`);
            } else {
                console.log(`✅ ${table} table: FOUND`);
            }
        } catch (e) {
            console.log(`❌ ${table} table: Unexpected error: ${e.message}`);
        }
    }

    try {
        const { data: rpc1, error: r1Error } = await supabase.rpc('get_total_confirmed_usd_raised');
        if (r1Error) {
            console.log('❌ RPC get_total_confirmed_usd_raised:', r1Error.message);
        } else {
            console.log('✅ RPC get_total_confirmed_usd_raised: WORKING (result:', rpc1, ')');
        }
    } catch (e) {
        console.log(`❌ RPC get_total_confirmed_usd_raised: Unexpected error: ${e.message}`);
    }
}

checkDatabase();
