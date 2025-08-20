/**
 * Installation verification script
 * Claude-AppsScript-Pro v3.0.1
 */

console.log('🚀 Starting verification script...');

const fs = require('fs');
const path = require('path');

console.log('📁 Working directory:', process.cwd());
console.log('🎯 Node.js version:', process.version);

try {
    const info = {
        version: '3.0.1',
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cwd: process.cwd(),
        timestamp: new Date().toISOString(),
        configFiles: {
            packageJson: fs.existsSync('package.json'),
            serverJs: fs.existsSync('server.js'),
            envFile: fs.existsSync('.env')
        }
    };

    console.log('📊 Creating verification file...');
    fs.writeFileSync('install-verification.json', JSON.stringify(info, null, 2));
    
    console.log('✅ Verification file created successfully');
    console.log(`⚡ Platform: ${process.platform} (${process.arch})`);
    
    process.exit(0);
    
} catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error('🔍 Error details:', error);
    process.exit(1);
}
# Verification update 2025-08-20 11:10:43
