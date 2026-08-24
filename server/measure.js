import { performance } from 'perf_hooks';

console.log('Starting module loading measurement...');

async function measureImport(moduleName, path) {
  const start = performance.now();
  await import(path);
  const end = performance.now();
  console.log(`[Import] ${moduleName} took ${(end - start).toFixed(2)} ms`);
}

async function run() {
  await measureImport('express', 'express');
  await measureImport('cors', 'cors');
  await measureImport('mongoose', 'mongoose');
  await measureImport('passport', 'passport');
  await measureImport('@langchain/mistralai', '@langchain/mistralai');
  await measureImport('@pinecone-database/pinecone', '@pinecone-database/pinecone');
  
  const startApp = performance.now();
  await import('./src/app.js');
  const endApp = performance.now();
  console.log(`[Import] src/app.js took ${(endApp - startApp).toFixed(2)} ms`);

  const startEnv = performance.now();
  await import('./src/config/env.config.js');
  const endEnv = performance.now();
  console.log(`[Import] src/config/env.config.js took ${(endEnv - startEnv).toFixed(2)} ms`);

  const startDb = performance.now();
  const dbConfig = await import('./src/config/db.config.js');
  const endDb = performance.now();
  console.log(`[Import] src/config/db.config.js took ${(endDb - startDb).toFixed(2)} ms`);
  
  console.log('Now connecting to DB...');
  const startConnect = performance.now();
  await dbConfig.connectDatabase();
  const endConnect = performance.now();
  console.log(`[Connect] MongoDB connection took ${(endConnect - startConnect).toFixed(2)} ms`);

  console.log('Done.');
  process.exit(0);
}

run();
