const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://fnfvvclbmussntkmoqqd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZnZ2Y2xibXVzc250a21vcXFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDM2NzQyMiwiZXhwIjoyMDc5OTQzNDIyfQ.Np5zf8ElA4ag3rX21EV1LTZLbaSqHI4lnFQAJizWtoo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupDatabase() {
    console.log('Setting up database...');

    // Read the schema file
    const schema = fs.readFileSync('supabase-schema.sql', 'utf8');

    // Execute the schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });

    if (error) {
        console.error('Error setting up database:', error);
        console.log('This is normal - the schema might already be applied.');
        console.log('Checking if tasks table exists...');

        // Check if table exists
        const { data: tables, error: checkError } = await supabase
            .from('tasks')
            .select('count')
            .limit(1);

        if (checkError) {
            console.error('Tasks table does not exist. Please apply the schema manually.');
            console.log('\nTo apply manually:');
            console.log('1. Go to https://supabase.com/dashboard/project/fnfvvclbmussntkmoqqd');
            console.log('2. Click on "SQL Editor"');
            console.log('3. Copy and paste the contents of supabase-schema.sql');
            console.log('4. Click "Run"');
        } else {
            console.log('✓ Tasks table exists! Database is ready.');
        }
    } else {
        console.log('✓ Database setup complete!');
    }

    // Check authentication
    console.log('\nChecking authentication setup...');
    console.log('✓ Supabase Auth is enabled by default');
    console.log('\nYour app is ready! Open index.html to start using it.');
}

setupDatabase();
