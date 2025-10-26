#!/usr/bin/env node

/**
 * Dokify Setup Verification Script
 * 
 * Run this before deploying to verify your configuration is correct.
 * Usage: node verify-setup.js
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, errorMsg) {
    checks.push({ name, condition, errorMsg });
}

// Environment Variable Checks
check('SUPABASE_URL is set', !!process.env.SUPABASE_URL, 'Add SUPABASE_URL to server/.env (from Supabase project settings)');
check('SUPABASE_KEY is set', !!process.env.SUPABASE_KEY, 'Add SUPABASE_KEY to server/.env (service_role key from Supabase)');
check('JWT_SECRET is set', !!process.env.JWT_SECRET, 'Add JWT_SECRET to server/.env (run: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))")');
check('ANTHROPIC_API_KEY is set', !!process.env.ANTHROPIC_API_KEY, 'Add ANTHROPIC_API_KEY to server/.env (get from console.anthropic.com)');
check('GOOGLE_API_KEY is set', !!process.env.GOOGLE_API_KEY, 'Add GOOGLE_API_KEY to server/.env (get from makersuite.google.com/app/apikey)');

// Security Checks
check('JWT_SECRET is not default', process.env.JWT_SECRET !== 'dev-secret', 'Change JWT_SECRET from default value');
check('JWT_SECRET is strong', !process.env.JWT_SECRET || process.env.JWT_SECRET.length >= 32, 'JWT_SECRET should be at least 32 characters');

console.log('Dokify Setup Verification\n');
console.log('━'.repeat(60));

// Run synchronous checks
for (const { name, condition, errorMsg } of checks) {
    const result = condition ? '✅' : '❌';
    console.log(`${result} ${name}`);
    
    if (condition) {
        passed++;
    } else {
        failed++;
        console.log(`   → ${errorMsg}\n`);
    }
}

// Database connection check (async)
async function checkDatabase() {
    console.log('\nTesting Supabase Connection...\n');
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        console.log('Cannot test database: SUPABASE_URL or SUPABASE_KEY not set\n');
        failed++;
        return;
    }
    
    try {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
        
        // Test connection
        const { error: connectionError } = await supabase.from('users').select('count').limit(1);
        if (connectionError) throw connectionError;
        
        console.log('Supabase connection successful');
        passed++;
        
        // Check if tables exist by trying to query them
        const requiredTables = ['users', 'projects', 'docs', 'api_keys', 'api_usage', 'chats', 'messages'];
        
        console.log('\n📋 Checking Database Schema...\n');
        
        for (const table of requiredTables) {
            const { error } = await supabase.from(table).select('count').limit(1);
            if (!error) {
                console.log(`Table '${table}' exists`);
                passed++;
            } else {
                console.log(`Table '${table}' missing or inaccessible`);
                console.log(`   → Run schema.sql in Supabase SQL Editor\n`);
                failed++;
            }
        }
    } catch (error) {
        console.log('Supabase connection failed');
        console.log(`   → ${error.message}\n`);
        failed++;
    }
}

// Run async checks
await checkDatabase();

// Summary
console.log('\n' + '━'.repeat(60));
console.log('\nSummary:\n');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
    console.log('\nAll checks passed! You\'re ready to deploy.\n');
    console.log('Next steps:');
    console.log('   1. npm run build');
    console.log('   2. Deploy server to Railway/Vercel/VPS');
    console.log('   3. Deploy web to Vercel/Netlify');
    console.log('   4. See DEPLOYMENT.md for detailed instructions\n');
    process.exit(0);
} else {
    console.log('\nPlease fix the issues above before deploying.\n');
    console.log('See SETUP_INSTRUCTIONS.md for help.\n');
    process.exit(1);
}

