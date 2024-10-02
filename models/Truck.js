const mongoose = require('mongoose');
const { Schema } = mongoose;

const truckSchema = new mongoose.Schema({
  name: { type: String, required: true },
  loadCapacity: { type: Number, required: true },
  matricule: { type: String, required: true },

  // Array to store tasks assigned to the truck
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
 // Currently assigned driver and helper
 driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Currently assigned driver
 helperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Currently assigned helper
  // History of drivers assigned to the truck with assigned dates
  driverHistory: [{
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedDate: { type: Date }
  }],

  // History of helpers assigned to the truck with assigned dates
  helperHistory: [{
    helperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedDate: { type: Date }
  }]
}, { timestamps: true });

const Truck = mongoose.model('Truck', truckSchema);
module.exports = Truck;
