const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://fnfvvclbmussntkmoqqd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZnZ2Y2xibXVzc250a21vcXFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM2NzQyMiwiZXhwIjoyMDc5OTQzNDIyfQ.Np5zf8ElA4ag3rX21EV1LTZLbaSqHI4lnFQAJizWtoo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    db: {
        schema: 'public'
    }
});

async function applySchema() {
    console.log('Connecting to Supabase...');

    // First, check if table already exists
    console.log('Checking if tasks table exists...');
    const { data: existingTable, error: checkError } = await supabase
        .from('tasks')
        .select('id')
        .limit(1);

    if (!checkError) {
        console.log('✓ Tasks table already exists!');
        console.log('Schema is already applied. Your database is ready!');
        return;
    }

    console.log('Tasks table not found. Applying schema...\n');

    // Apply schema using REST API directly
    const schema = fs.readFileSync('supabase-schema.sql', 'utf8');

    // Split the schema into individual statements
    const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i] + ';';
        console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
                },
                body: JSON.stringify({ query: statement })
            });

            const result = await response.text();

            if (!response.ok) {
                console.log('Response:', result);
            } else {
                console.log('✓ Success');
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
    }

    // Verify the table was created
    console.log('\nVerifying table creation...');
    const { data: verifyTable, error: verifyError } = await supabase
        .from('tasks')
        .select('id')
        .limit(1);

    if (verifyError) {
        console.log('\n❌ Table creation failed. Using alternative method...\n');

        // Use pg library for direct connection
        const { Client } = require('pg');

        // Extract connection details from Supabase URL
        const connectionString = `postgresql://postgres.fnfvvclbmussntkmoqqd:${SUPABASE_SERVICE_ROLE_KEY.split('.')[2]}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

        console.log('Attempting direct PostgreSQL connection...');
        console.log('This method requires your database password.');
        console.log('\nPlease apply the schema manually:');
        console.log('1. Go to https://supabase.com/dashboard/project/fnfvvclbmussntkmoqqd');
        console.log('2. Click "SQL Editor"');
        console.log('3. Paste the contents of supabase-schema.sql');
        console.log('4. Click "Run"');
    } else {
        console.log('\n✓ Tasks table created successfully!');
        console.log('✓ Database schema applied!');
        console.log('\nYour app is ready! Open index.html in your browser.');
    }
}

applySchema().catch(console.error);
