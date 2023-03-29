// VIA Readline- hack ra ni sya


const readline = require('readline');

// Initialize readline interface
const readLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Event listener for new lines (i.e., RFID card IDs)
readLine.on('line', (input) => {
  console.log(`RFID card ID: ${input}`);
});

// Prompt message to indicate that the script is running
console.log('Waiting for RFID card input...');

// Graceful shutdown on Ctrl+C
process.on('SIGINT', () => {
  console.log('Shutting down...');
  readLine.close();
  process.exit();
});