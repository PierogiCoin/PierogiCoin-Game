const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkGameStatesSchema() {
    const { data, error } = await supabase
        .from('game_states')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Available columns in game_states table:');
        console.log(Object.keys(data[0]).sort());
    } else {
        console.log('No game_states found.');
    }
}

checkGameStatesSchema();
