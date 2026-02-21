// Quick setup checker script
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Checking Backend Setup...\n');

// Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('MONGODB_URI')) {
    console.log('✅ MONGODB_URI found in .env');
  } else {
    console.log('❌ MONGODB_URI not found in .env');
  }
  if (envContent.includes('PORT')) {
    console.log('✅ PORT found in .env');
  } else {
    console.log('❌ PORT not found in .env');
  }
} else {
  console.log('❌ .env file NOT found');
  console.log('   Create .env file with:');
  console.log('   PORT=5000');
  console.log('   NODE_ENV=development');
  console.log('   MONGODB_URI=mongodb://localhost:27017/xpect-portal');
  console.log('   FRONTEND_URL=http://localhost:5173');
}

// Check node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules exists');
  
  // Check key dependencies
  const requiredDeps = ['express', 'mongoose', 'cors', 'dotenv'];
  const missingDeps = [];
  
  requiredDeps.forEach(dep => {
    const depPath = path.join(nodeModulesPath, dep);
    if (fs.existsSync(depPath)) {
      console.log(`✅ ${dep} installed`);
    } else {
      console.log(`❌ ${dep} NOT installed`);
      missingDeps.push(dep);
    }
  });
  
  if (missingDeps.length > 0) {
    console.log('\n⚠️  Run: npm install');
  }
} else {
  console.log('❌ node_modules NOT found');
  console.log('   Run: npm install');
}

// Check server.js
const serverPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverPath)) {
  console.log('✅ server.js exists');
} else {
  console.log('❌ server.js NOT found');
}

console.log('\n📝 Next Steps:');
console.log('1. Make sure MongoDB is running (local or Atlas)');
console.log('2. Run: npm run dev');
console.log('3. Check: http://localhost:5000/api/health');
