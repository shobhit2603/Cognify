const fs = require('fs');
const path = 'node_modules/@langchain/classic/package.json';
let pkg = fs.readFileSync(path, 'utf8');
pkg = pkg.replace(/"\.\/dist\/(.*?)\.js"/g, '"./dist/$1.cjs"');
fs.writeFileSync(path, pkg);
console.log("Patched!");
