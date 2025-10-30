#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the file
const filePath = '/Users/irgyaarnezzi/Desktop/tamankehati_new/apps/frontend/src/components/ai/ComprehensiveAIGenerator.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Function to replace template literals with string concatenation
function replaceTemplateLiterals(content) {
  // Pattern to match template literals with ${}
  const templateLiteralPattern = /`([^`]*\$\{[^}]*\}[^`]*)`/g;

  return content.replace(templateLiteralPattern, (match, templateContent) => {
    // Replace ${...} with proper concatenation
    let result = templateContent.replace(/\$\{([^}]+)\}/g, "' + ($1) + '");

    // Clean up empty string parts
    result = result.replace(/'' \+ \+ /g, '');
    result = result.replace(/ \+ ''$/g, '');
    result = result.replace(/^'' \+ /g, '');

    return `(${result})`;
  });
}

// Apply the replacement
content = replaceTemplateLiterals(content);

// Write back to file
fs.writeFileSync(filePath, content, 'utf8');
console.log('Template literals replaced successfully in ComprehensiveAIGenerator.tsx');