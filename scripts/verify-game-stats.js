
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config(); // fallback to .env
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

console.log('Connecting to Supabase at:', supabaseUrl);

async function verifyStats() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching users count...');
    const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error fetching count:', countError);
    } else {
        console.log('Real Users Count:', count);
    }

    console.log('Fetching total PRG...');
    const { data: usersData, error: sumError } = await supabase
        .from('users')
        .select('prg');

    if (sumError) {
        console.error('Error fetching PRG:', sumError);
    } else {
        const totalPrg = usersData.reduce((acc, user) => acc + (Number(user.prg) || 0), 0);
        console.log('Total Real PRG:', totalPrg);

        // Simulate the logic used in API
        const BASELINE_PLAYERS = 150;
        const finalPlayers = BASELINE_PLAYERS + (count || 0);
        const BASELINE_PRG = 12500;
        const finalPrg = BASELINE_PRG + totalPrg;

        console.log('--- API Response Simulation ---');
        console.log('Active Players (150 + real):', finalPlayers);
        console.log('Total PRG (12500 + real):', finalPrg);
    }
}

verifyStats().catch(console.error);
