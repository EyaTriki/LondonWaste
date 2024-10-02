// models/Driver.js
const mongoose = require("mongoose");
const { User, userSchema } = require("./User");

// Driver-specific schema fields
const driverSchema = new mongoose.Schema({
  
  //hourPrice:{ type: Number    , required: true},
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false,
    },
    coordinates: {
      type: [Number],
      required: false,
    },
    //helperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Helper' } 
  }
});

const Driver = User.discriminator("Driver", driverSchema);

module.exports = Driver;
