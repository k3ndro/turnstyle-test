const readline = require('readline');
const HID = require('node-hid');


const VENDOR_ID = 1452;
const PRODUCT_ID = 34304;

// Function to find the USB RFID Reader
function findRFIDReader() {
  const devices = HID.devices();
  return devices.find((device) => {
    // You should replace VENDOR_ID and PRODUCT_ID with your device's vendor and product IDs
    return device.vendorId === VENDOR_ID && device.productId === PRODUCT_ID;
  });
}

const rfidReader = findRFIDReader();
if (rfidReader) {
  console.log(`RFID Reader found: Vendor ID: ${rfidReader.vendorId}, Product ID: ${rfidReader.productId}`);

  // Open the HID device
  const hidDevice = new HID.HID(rfidReader.path);

  // Event listener for data received from the HID device (i.e., RFID card IDs)
  hidDevice.on('data', (data) => {
    // Assuming that the RFID card ID is a string in the received data, you can decode it using 'utf8' encoding.
    const input = data.toString('utf8').trim();
    console.log(`RFID card ID: ${input}, Vendor ID: ${rfidReader.vendorId}, Product ID: ${rfidReader.productId}`);
    });
    
    // Event listener for errors from the HID device
    hidDevice.on('error', (error) => {
    console.error(`Error: ${error}`);
    });
    
    // Prompt message to indicate that the script is running
    console.log('Waiting for RFID card input...');
    } else {
    console.error('USB RFID Reader not found.');
    process.exit(1);
    }
    
    // Initialize readline interface
    const readLine = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    });

    // Graceful shutdown on Ctrl+C
process.on('SIGINT', () => {
    console.log('Shutting down...');
    if (hidDevice) {
    hidDevice.close();
    }
    readLine.close();
    process.exit();
    });