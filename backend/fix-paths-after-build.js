const fs = require('fs');
const path = require('path');

// Function to recursively find all .js files in the dist directory
function findJsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findJsFiles(fullPath));
    } else if (item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to replace @/ aliases with relative paths based on file location
function fixPaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Get the directory of the current file
  const fileDir = path.dirname(filePath);
  const distDir = path.join(__dirname, 'dist');
  
  // Calculate relative paths from the current file's directory
  const getRelativePath = (targetDir) => {
    const relativePath = path.relative(fileDir, path.join(distDir, targetDir));
    return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
  };
  
  // Replace @/ aliases with correct relative paths
  const replacements = [
    { from: /@\/config\//g, to: getRelativePath('config') + '/' },
    { from: /@\/controllers\//g, to: getRelativePath('controllers') + '/' },
    { from: /@\/models\//g, to: getRelativePath('models') + '/' },
    { from: /@\/routes\//g, to: getRelativePath('routes') + '/' },
    { from: /@\/middleware\//g, to: getRelativePath('middleware') + '/' },
    { from: /@\/utils\//g, to: getRelativePath('utils') + '/' },
    { from: /@\/types\//g, to: getRelativePath('types') + '/' },
    { from: /@\//g, to: getRelativePath('') + '/' }
  ];
  
  for (const replacement of replacements) {
    content = content.replace(replacement.from, replacement.to);
  }
  
  fs.writeFileSync(filePath, content);
}

// Main execution
const distDir = path.join(__dirname, 'dist');
const jsFiles = findJsFiles(distDir);

for (const file of jsFiles) {
  fixPaths(file);
}

console.log('✅ Path aliases fixed in compiled JavaScript files');