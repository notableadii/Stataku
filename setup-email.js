#!/usr/bin/env node

/**
 * Email Setup Helper Script for Stataku
 * Helps configure SMTP settings quickly
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEmail() {
  console.log('🎌 Stataku Email Setup Helper\n');
  console.log('This script will help you configure SMTP settings for welcome emails.\n');

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  const envExists = fs.existsSync(envPath);
  
  let envContent = '';
  if (envExists) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Found existing .env.local file');
  } else {
    console.log('📝 Creating new .env.local file');
  }

  console.log('\n📧 SMTP Configuration\n');

  // SMTP Provider selection
  console.log('Choose your email provider:');
  console.log('1. Gmail (Recommended for testing)');
  console.log('2. Outlook/Hotmail');
  console.log('3. SendGrid (Production)');
  console.log('4. Mailgun (Production)');
  console.log('5. Custom SMTP');

  const provider = await question('\nEnter your choice (1-5): ');

  let smtpConfig = {};

  switch (provider) {
    case '1': // Gmail
      smtpConfig = {
        host: 'smtp.gmail.com',
        port: '587',
        secure: 'false'
      };
      console.log('\n📋 Gmail Setup Instructions:');
      console.log('1. Enable 2-Factor Authentication on your Gmail account');
      console.log('2. Go to Google Account Settings → Security → 2-Step Verification → App passwords');
      console.log('3. Generate an app password for "Mail"');
      console.log('4. Use that 16-character password (not your regular password)\n');
      break;

    case '2': // Outlook
      smtpConfig = {
        host: 'smtp-mail.outlook.com',
        port: '587',
        secure: 'false'
      };
      break;

    case '3': // SendGrid
      smtpConfig = {
        host: 'smtp.sendgrid.net',
        port: '587',
        secure: 'false'
      };
      console.log('\n📋 SendGrid Setup:');
      console.log('1. Create account at sendgrid.com');
      console.log('2. Generate API key');
      console.log('3. Use "apikey" as username and your API key as password\n');
      break;

    case '4': // Mailgun
      smtpConfig = {
        host: 'smtp.mailgun.org',
        port: '587',
        secure: 'false'
      };
      break;

    case '5': // Custom
      smtpConfig.host = await question('SMTP Host: ');
      smtpConfig.port = await question('SMTP Port (587): ') || '587';
      smtpConfig.secure = await question('Use SSL? (true/false): ') || 'false';
      break;

    default:
      console.log('❌ Invalid choice. Exiting...');
      process.exit(1);
  }

  // Get user credentials
  const email = await question('Your email address: ');
  const password = await question('SMTP password (use app password for Gmail): ');
  const fromEmail = await question(`From email (default: ${email}): `) || email;
  const fromName = await question('From name (default: Stataku Team): ') || 'Stataku Team';

  // Build SMTP configuration
  const smtpVars = [
    '',
    '# SMTP Email Configuration',
    `SMTP_HOST=${smtpConfig.host}`,
    `SMTP_PORT=${smtpConfig.port}`,
    `SMTP_SECURE=${smtpConfig.secure}`,
    '',
    '# SMTP Authentication',
    `SMTP_USER=${email}`,
    `SMTP_PASSWORD=${password}`,
    '',
    '# Email Settings',
    `FROM_EMAIL=${fromEmail}`,
    `FROM_NAME=${fromName}`,
    ''
  ].join('\n');

  // Update .env.local
  let newEnvContent = envContent;
  
  // Remove existing SMTP config if present
  const smtpRegex = /# SMTP Email Configuration[\s\S]*?(?=\n# [A-Z]|\n[A-Z]|\n$|$)/;
  newEnvContent = newEnvContent.replace(smtpRegex, '');
  
  // Add new SMTP config
  newEnvContent += smtpVars;

  // Write to file
  fs.writeFileSync(envPath, newEnvContent);

  console.log('\n✅ SMTP configuration saved to .env.local');
  console.log('\n📋 Next Steps:');
  console.log('1. Restart your development server: npm run dev');
  console.log('2. Go to your dashboard and click "Test Email"');
  console.log('3. Check your inbox for the test email');
  console.log('4. If successful, sign out and sign in again to trigger welcome email');

  console.log('\n🔧 Configuration Summary:');
  console.log(`Host: ${smtpConfig.host}`);
  console.log(`Port: ${smtpConfig.port}`);
  console.log(`Email: ${email}`);
  console.log(`From: ${fromName} <${fromEmail}>`);

  rl.close();
}

// Run the setup
setupEmail().catch(console.error);
