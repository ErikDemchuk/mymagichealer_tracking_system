const { spawn } = require('child_process');
const { exec } = require('child_process');
const os = require('os');
const path = require('path');

const platform = os.platform();
const isWindows = platform === 'win32';

// Start Next.js dev server (using plain dev to avoid recursion)
console.log('🚀 Starting Next.js dev server...');
const nextDev = spawn(isWindows ? 'npm.cmd' : 'npm', ['run', 'dev:plain'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

let browserOpened = false;

// Function to open browser
function openBrowser() {
  if (browserOpened) return;
  browserOpened = true;
  
  const url = 'http://localhost:3000';
  console.log(`\n🌐 Opening browser at ${url}...\n`);
  
  let command;
  if (isWindows) {
    command = `start ${url}`;
  } else if (platform === 'darwin') {
    command = `open ${url}`;
  } else {
    command = `xdg-open ${url}`;
  }
  
  exec(command, (error) => {
    if (error) {
      console.error(`Failed to open browser: ${error.message}`);
    }
  });
}

// Wait a bit for server to start, then open browser
setTimeout(() => {
  // Check if port is listening
  const net = require('net');
  const tester = net.createConnection(3000, 'localhost', () => {
    tester.end();
    openBrowser();
  });
  
  tester.on('error', () => {
    // Port not ready yet, try again in 2 seconds
    setTimeout(() => {
      const retry = net.createConnection(3000, 'localhost', () => {
        retry.end();
        openBrowser();
      });
      retry.on('error', () => {
        console.log('Waiting for server to start...');
      });
    }, 2000);
  });
}, 3000);

// Handle process termination
process.on('SIGINT', () => {
  nextDev.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  nextDev.kill('SIGTERM');
  process.exit(0);
});

