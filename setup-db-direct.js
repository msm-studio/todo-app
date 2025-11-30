const { Client } = require('pg');
const fs = require('fs');

// Supabase connection string format
// You'll need to get your database password from Supabase dashboard
const SUPABASE_URL = 'https://fnfvvclbmussntkmoqqd.supabase.co';

async function setupDatabase() {
    console.log('Setting up database with direct PostgreSQL connection...\n');

    // Connection using environment variables or direct credentials
    // The pooler connection string format for Supabase
    const client = new Client({
        host: 'aws-0-us-east-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        user: 'postgres.fnfvvclbmussntkmoqqd',
        password: process.env.DB_PASSWORD, // Database password needed
        ssl: {
            rejectUnauthorized: false
        }
    });

    if (!process.env.DB_PASSWORD) {
        console.log('❌ Database password not provided.\n');
        console.log('To get your database password:');
        console.log('1. Go to https://supabase.com/dashboard/project/fnfvvclbmussntkmoqqd/settings/database');
        console.log('2. Look for "Database password" or reset it if needed');
        console.log('3. Run this script with: DB_PASSWORD=your_password node setup-db-direct.js\n');
        console.log('OR apply the schema manually:');
        console.log('1. Go to https://supabase.com/dashboard/project/fnfvvclbmussntkmoqqd');
        console.log('2. Click "SQL Editor"');
        console.log('3. Paste the contents of supabase-schema.sql');
        console.log('4. Click "Run"');
        return;
    }

    try {
        await client.connect();
        console.log('✓ Connected to database\n');

        // Read schema file
        const schema = fs.readFileSync('supabase-schema.sql', 'utf8');

        console.log('Applying schema...');
        await client.query(schema);

        console.log('✓ Schema applied successfully!\n');
        console.log('Your database is ready! You can now:');
        console.log('- Open index.html in your browser');
        console.log('- Sign up for a new account');
        console.log('- Start using your todo app!');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('❌ Connection refused. Please check your database credentials.');
        } else if (error.code === '42P07') {
            console.log('✓ Table already exists! Your database is ready.');
        } else {
            console.error('Error:', error.message);
        }
    } finally {
        await client.end();
    }
}

setupDatabase();
