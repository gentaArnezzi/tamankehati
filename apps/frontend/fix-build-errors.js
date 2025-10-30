#!/usr/bin/env node

const fs = require('fs');

// Additional files that have build errors
const files = [
  '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/app/dashboard/flora/create/page.tsx',
  '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/app/test-login/page.tsx'
];

// Fix each file
files.forEach(filePath => {
  console.log(`Fixing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix API URL template literals
  content = content.replace(
    /fetch\(`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\}\/api\/v1\/upload\/gallery-image`/g,
    "fetch((process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com') + '/api/v1/upload/gallery-image'"
  );

  // Fix Authorization Bearer template literals
  content = content.replace(
    /'Authorization': `Bearer \$\{localStorage\.getItem\('auth_token'\)\}`/g,
    "'Authorization': 'Bearer ' + localStorage.getItem('auth_token')"
  );

  // Fix other API endpoints
  content = content.replace(
    /fetch\(`\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tamankehati-backend-pxnu\.onrender\.com'\}\/api\/v1\/([^`]+)`/g,
    "fetch((process.env.NEXT_PUBLIC_API_URL || 'https://tamankehati-backend-pxnu.onrender.com') + '/api/v1/$1'"
  );

  // Fix error messages with template literals
  content = content.replace(
    /setResult\(`❌ Login failed: \$\{errorData\.detail \|\| 'Unknown error'\}`\);/g,
    "setResult('❌ Login failed: ' + (errorData.detail || 'Unknown error'));"
  );

  // Fix general template literals with string concatenation
  content = content.replace(/`([^`]*)`/g, (match, inner) => {
    // If it doesn't contain ${}, keep as regular string
    if (!inner.includes('${')) {
      return `'${inner}'`;
    }

    // Replace ${...} with concatenation
    let result = inner.replace(/\$\{([^}]+)\}/g, "' + ($1) + '");

    // Clean up empty string concatenations
    result = result.replace(/' \+ ''/g, '');
    result = result.replace(/'' \+ '/g, '');

    return `'${result}'`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${filePath}`);
});

console.log('Build error fixes completed');