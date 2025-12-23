const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    // Try to get one user to see the structure
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Available columns in users table:');
        console.log(Object.keys(data[0]).sort());
    } else {
        console.log('No users found. Trying to insert a minimal user to discover schema...');
        const { error: insertError } = await supabase
            .from('users')
            .insert({ id: 'schema-test', username: 'test' });

        if (insertError) {
            console.log('Insert error (shows required fields):', insertError.message);
        }
    }
}

checkSchema();
