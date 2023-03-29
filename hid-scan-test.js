const HID = require('node-hid');

// const VENDOR_ID = 0xffff; // 1452
// const PRODUCT_ID = 0x0035; // 34304

const VENDOR_ID = 1452; // 1452
const PRODUCT_ID = 34304; // 34304

// console.log(HID.devices());

// Find the device with the specified vendor and product IDs
const device = new HID.HID(VENDOR_ID, PRODUCT_ID);

if (!device) {
  console.error('Unable to find the device. Please ensure it is connected and try again.');
  process.exit(1);
} else{
  console.log(`device found`);
}

let cardID = '';

function parseCardID(data) {

  for (let i = 0; i < data.length; i++) {
    const value = data[i];

    // ASCII values for digits are between 48 (0) and 57 (9)
    if (value >= 48 && value <= 57) {
      cardID += String.fromCharCode(value);
    } else if (cardID.length > 0) {
      // If a non-digit is encountered and the cardID buffer is not empty, reset the buffer
      cardID = '';
    }
  }

  if (cardID.length === 10) {
    console.log(`Card ID: ${cardID}`);
    cardID = '';
  }
}



// Listen for data events
// device.on('data', (data) => {
//   console.log('Raw data:', data);
//   parseCardID(data);
// });

function readData() {
  device.read((err, data) => {
    if (err) {
      console.error('Error reading data:', err);
      return;
    }

    console.log('Raw data:', data);
    parseCardID(data);
    
    // Continue reading data
    readData();
  });
}

// Start reading data
readData();

// Handle errors
device.on('error', (err) => {
  console.error(`Error: ${err}`);
});
