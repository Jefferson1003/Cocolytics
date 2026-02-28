#!/usr/bin/env node

/**
 * Mobile Device Access Helper
 * Run: node mobile-share.js
 * Shows QR code and links for mobile access
 */

const chalk = require('chalk');

console.clear();
console.log(chalk.cyan.bold('\n📱 COCOLYTICS - MOBILE ACCESS SETUP\n'));

console.log(chalk.yellow('═══════════════════════════════════════════════════════════\n'));

console.log(chalk.green('✅ STEP 1: Run your dev server (opens to login page)'));
console.log(chalk.gray('   Command: npm run dev\n'));

console.log(chalk.green('✅ STEP 2: Start ngrok tunnel (in another terminal)'));
console.log(chalk.gray('   Command: npx ngrok@latest http 5173\n'));

console.log(chalk.green('✅ STEP 3: Access on mobile'));
console.log(chalk.gray('   A. Local Network (same WiFi):'));
console.log(chalk.cyan('      http://192.168.x.x:5173/login'));
console.log(chalk.gray('      (Replace 192.168.x.x with your computer IP)\n'));

console.log(chalk.gray('   B. Public Link (ngrok):'));
console.log(chalk.cyan('      https://your-ngrok-url/login'));
console.log(chalk.gray('      (Get from ngrok terminal output)\n'));

console.log(chalk.yellow('═══════════════════════════════════════════════════════════\n'));

console.log(chalk.blue('📲 MOBILE ACCESS BUTTON\n'));
console.log(chalk.gray('   A floating 📱 button appears on the login page'));
console.log(chalk.gray('   Click it to:\n'));
console.log(chalk.cyan('   ✓ Copy local network link'));
console.log(chalk.cyan('   ✓ Copy ngrok public link'));
console.log(chalk.cyan('   ✓ Generate QR codes'));
console.log(chalk.cyan('   ✓ Test on mobile\n'));

console.log(chalk.yellow('═══════════════════════════════════════════════════════════\n'));

console.log(chalk.magenta('🔗 QUICK COMMANDS:\n'));

console.log(chalk.cyan('  # Get your computer IP (Windows)'));
console.log(chalk.gray('  ipconfig | findstr IPv4\n'));

console.log(chalk.cyan('  # Get your computer IP (Mac/Linux)'));
console.log(chalk.gray('  ifconfig | grep inet\n'));

console.log(chalk.cyan('  # Start full setup'));
console.log(chalk.gray('  npm run dev'));
console.log(chalk.gray('  npx ngrok@latest http 5173\n'));

console.log(chalk.yellow('═══════════════════════════════════════════════════════════\n'));

console.log(chalk.green('✨ FEATURES:\n'));
console.log(chalk.gray('   ✓ Mobile-first responsive design'));
console.log(chalk.gray('   ✓ Works on iPhone & Android'));
console.log(chalk.gray('   ✓ Installable as PWA'));
console.log(chalk.gray('   ✓ Works offline'));
console.log(chalk.gray('   ✓ Full-screen mobile app mode'));
console.log(chalk.gray('   ✓ QR code for easy sharing\n'));

console.log(chalk.yellow('═══════════════════════════════════════════════════════════\n'));

console.log(chalk.blue('📖 For detailed info, see: MOBILE_LINK_SETUP.md\n'));

console.log(chalk.yellow.bold('Ready to go! 🚀\n'));
