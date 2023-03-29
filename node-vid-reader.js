var HID = require('node-hid');

// List all HID devices connected to your computer
const devices = HID.devices();

console.log(devices);

// Find your RFID Reader
const rfidReader = devices.find(device => {
    // Replace these values with the VID and PID of your RFID Reader
    const VENDOR_ID = 1452;
    const PRODUCT_ID = 34304;

    return device.vendorId === VENDOR_ID && device.productId === PRODUCT_ID;
});

if (rfidReader) {
    console.log('RFID Reader found!');
    console.log('Vendor ID:', rfidReader.vendorId);
    console.log('Product ID:', rfidReader.productId);
} else {
    console.log('RFID Reader not found');
}
