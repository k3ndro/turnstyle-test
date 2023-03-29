const RFID = require('node-rfid');
const onoff = require('onoff');
const { setInterval, clearInterval } = require('timers');

// GPIO pin configuration
const Relay0 = new onoff.Gpio(12, 'out'); // PIN 32
const Relay1 = new onoff.Gpio(16, 'out'); // PIN 36
const Indicator = new onoff.Gpio(5, 'out'); // PIN 29
const Buzzer = new onoff.Gpio(21, 'out'); // PIN 40

// Set default states for relays, LED indicator, and buzzer
Relay0.writeSync(1); // default relay state is high (relay NO)
Relay1.writeSync(1); // default relay state is high (relay NO)
Indicator.writeSync(1); // default LED indicator state is high (relay NO)
Buzzer.writeSync(0); // default buzzer state is off

startListener(validateUID0, validateUID1);

function validateUID0(err, uid)
{
    console.log(`id0 - ${uid}`);
}

function validateUID1(err, uid)
{
    console.log(`id2 - ${uid}`);
}


// Interval object for RFID listener
let listener;

// Callback objects for RFID tag events
let callback0;
let callback1;

// Toggle between RFID readers
let rfidToggle = true;

// Private function to toggle buzzer state
let buzzerInterval;
function toggleBuzzer() {
  if (Buzzer.readSync() === 0) {
    Buzzer.writeSync(1);
  } else {
    Buzzer.writeSync(0);
  }
}

// Private function to end buzzer interval
function endBuzzerInterval() {
  clearInterval(buzzerInterval);
  Buzzer.writeSync(0);
}

// Private function to reset buzzer and LED indicator state
function resetBuzzer() {
  Buzzer.writeSync(0);
  Indicator.writeSync(1);
}

// Private function to reset relay state after a delay
function resetRelay(index) {
  if (typeof index === 'undefined') {
    Relay0.writeSync(1);
  } else if (index === 0) {
    Relay0.writeSync(1);
  } else {
    Relay1.writeSync(1);
  }
}

// Private function to read RFID tags
function rfidRead() {
  rfidToggle ^= true;

  RFID.readintime(rfidToggle, 800, (err, result) => {
    if (err) {
      console.log('Sorry, some hardware error occurred!');
    } else if (result === 'timeout') {
      // console.log('Sorry, you timed out.');
    } else {
      let uid;
      if (Array.isArray(result)) {
        uid = Conversion.Byte_Array_To_Uint32(result, 0);
      } else {
        try {
          uid = Conversion.Byte_Array_To_Uint32(JSON.parse(result), 0);
        } catch (err) {
          console.log('rfidError: ' + err);
        }
      }

      if (typeof uid !== 'undefined') {
        // Fix UID to 10-digit code
        uid = uid.toString().padStart(10, '0');

        if (callback0 && callback1) {
          if (rfidToggle === 0) {
            callback0(null, uid);
          } else {
            callback1(null, uid);
          }
        } else if (callback0) {
          callback0(null, uid);
        }
      }
    }
  });
}

// Exported functions
module.exports = {
 // Public functions
startListener: function (callback0, callback1) {
    console.log('Turnstile listener started!');
    callback0 = callback0;
    callback1 = callback1;
    listener = setInterval(rfidRead, 1000);
  },
  
  openRelay: function (index) {
    if (typeof index === 'undefined') {
      Relay0.writeSync(0);
    } else if (index === 0) {
      Relay0.writeSync(0);
    } else {
      Relay1.writeSync(0);
    }
    setTimeout(resetRelay, 500, index);
  },
  
  playBuzzer: function (authorized) {
    if (authorized) {
      buzzerInterval = setInterval(toggleBuzzer, 100);
      setTimeout(endBuzzerInterval, 400);
    } else {
      Buzzer.writeSync(1);
      Indicator.writeSync(0);
      setTimeout(resetBuzzer, 1000);
    }
  }
  };
  

  // Helper class for uint32 numbers
class Uint32 {
    constructor(value) {
      this.number = new Uint32Array(1);
      this.number[0] = value;
    }
  
    get get() {
      return this.number[0];
    }
  
    set set(newValue) {
      this.number[0] = newValue;
    }
  }
  
  // Helper functions for byte array conversion
  const Conversion = {
    Uint32_To_Byte_Array: function (sourceNum) {
      const uint32Num = new Uint32(sourceNum);
      const byteNum = new Byte(0);
      const byteArr = new Uint8Array(4);
  
      for (let i = 0; i < 4; i++) {
        if (sourceNum > 255) {
          uint32Num.set = sourceNum / 256;
          byteNum.set = sourceNum - uint32Num.get * 256;
        } else {
          byteNum.set = uint32Num.get;
          uint32Num.set = 0;
        }
        byteArr[i] = byteNum.get;
        sourceNum = uint32Num.get;
      }
  
      return byteArr;
    },
  
    Byte_Array_To_Uint32: function (sourceByteArray, startPosition) {
      const uint32Num = new Uint32(0);
      let multiplier = 1;
  
      for (let i = 0; i < 4; i++) {
        uint32Num.set += sourceByteArray[startPosition + i] * multiplier;
        multiplier *= 256;
      }
  
      return uint32Num.get;
    },
  };
  