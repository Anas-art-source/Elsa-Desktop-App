const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');

process.env.ELECTRON_START_URL = 'http://localhost:3000';

const child = spawn(electron, ['.'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('close', () => {
  process.exit();
});
