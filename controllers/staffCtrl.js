const { User } = require("../models/User");
const Driver = require("../models/Driver");
const Helper = require("../models/Helper");
const Truck = require("../models/Truck");
const bcrypt = require("bcrypt");
const socket = require("../socket"); // Ensure you have the correct path to your socket module
const {Dayoff }= require('../models/Dayoff');


const isWithinDistance = (coord1, coord2, maxDistance) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance <= maxDistance;
};
const staffManagement = {
  addStaff: async (req, res) => {
    console.log('Request Body:', req.body);  // Log to see what you actually received
  
    try {
      const {
        password, role, username, email, phoneNumber,hourPrice
      } = req.body;
      const pictureUrl = req.file ? req.file.path : null;
  
      if (!username || !email || !password || !role || !phoneNumber) {
        return res.status(400).json({ message: "Missing required fields: username, email, password, phoneNumber, and role are required." });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      let newUser;
  
      if (role === 'Driver' || role === 'Helper') {
        const Model = role === 'Driver' ? Driver : Helper;
        newUser = new Model({
          username,
          email,
          phoneNumber,
          password: hashedPassword,
          role: [role],
          picture: pictureUrl,
          hourPrice:hourPrice
        });
      } else {
        newUser = new User({
          username,
          email,
          phoneNumber,
          password: hashedPassword,
          role: [role],
          picture: pictureUrl
        });
      }
      await newUser.save();
      res.status(201).json({ message: `${role} created successfully`, user: newUser });
    } catch (error) {
      console.error('Error in addStaff:', error);
      res.status(500).json({ message: `Failed to create staff member`, error: error.message });
    }
  },
  
  getAllStaff: async (req, res) => {
    try {
      // Simple fetch of all users without populating any references
      const users = await User.find();
      res.status(200).json({ message: "Staff retrieved successfully", users });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve staff", error: error.message });
    }
  },

  getStaffById: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "Staff not found" });
      }
      res.status(200).json({ message: "Staff retrieved successfully", user });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve staff", error: error.message });
    }
  },

  deleteStaff: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({ message: "Staff not found" });
      }
      res.status(200).json({ message: "Staff deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete staff", error: error.message });
    }
  },

   updateStaff : async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        // Retrieve the specific user and determine their role
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Staff not found" });
        }

        // Update common fields
        const fieldsToUpdate = ['username', 'email', 'phoneNumber', 'designation', 'dateOfBirth']; // Common fields
        fieldsToUpdate.forEach(field => {
            if (updateData[field] !== undefined) {
                user[field] = updateData[field];
            }
        });

        // Check if there's a password update
        if (updateData.password) {
            user.password = await bcrypt.hash(updateData.password, 10);
        }

        // Handle specific updates for Driver or Helper
        if (user.roleType === 'Driver' || user.roleType === 'Helper') {
            const specificFields = ['hourPrice', 'location']; // Specific fields for Driver and Helper
            specificFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    user[field] = updateData[field];
                }
            });
        }

        // Save the updated document
        await user.save();
        res.status(200).json({ message: "Staff updated successfully", user });
    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).json({ message: "Failed to update staff", error: error.message });
    }
},
  
assignDriverToTruck: async (req, res) => {
  const { driverId } = req.params;
  const { truckName, date } = req.body;  // `date` is the assignment date

  try {
    // Find the truck by name
    const truck = await Truck.findOne({ name: truckName });
    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    // Find the driver by ID and check for day-off requests
    const driver = await User.findById(driverId).populate('dayOffRequests');
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Check if the driver has any approved day-offs overlapping with the task date
    const taskDate = new Date(date);
    const approvedDayOffs = driver.dayOffRequests.filter(dayOff => dayOff.status === 'Approved');

    const isOnDayOff = approvedDayOffs.some(dayOff => {
      const startDate = new Date(dayOff.startDate);
      const endDate = new Date(dayOff.endDate);
      return taskDate >= startDate && taskDate <= endDate;
    });

    if (isOnDayOff) {
      return res.status(400).json({ message: `Driver is on an approved day off on the task date: ${taskDate.toDateString()}.` });
    }

    // Assign the driver to the truck for the given date and update driverHistory
    truck.driverId = driverId;  // Currently assigned driver
    truck.driverHistory.push({ driverId, assignedDate: taskDate });  // Track the assignment

    await truck.save();

    res.status(200).json({ message: "Driver assigned to truck successfully", truck });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign driver", error: error.message });
  }
},


assignHelperToTruck: async (req, res) => {
  const { helperId } = req.params;  // Helper ID from URL
  const { truckName, date } = req.body;  // Truck name and task date from request body

  try {
    // Find the truck by name
    const truck = await Truck.findOne({ name: truckName });
    if (!truck) {
      return res.status(404).json({ message: "Truck not found" });
    }

    // Find the helper by ID and check for day-off requests
    const helper = await User.findById(helperId).populate('dayOffRequests');  // Ensure `dayOffRequests` is populated
    if (!helper) {
      return res.status(404).json({ message: "Helper not found" });
    }

    // Check if the helper has any approved day-offs overlapping with the task date
    const taskDate = new Date(date);  // Convert the task date
    const approvedDayOffs = helper.dayOffRequests.filter(dayOff => dayOff.status === 'Approved');  // Filter approved day-offs

    // Check if the helper is on a day off on the task date
    const isOnDayOff = approvedDayOffs.some(dayOff => {
      const startDate = new Date(dayOff.startDate);
      const endDate = new Date(dayOff.endDate);
      return taskDate >= startDate && taskDate <= endDate;
    });

    if (isOnDayOff) {
      return res.status(400).json({ message: `Helper is on an approved day off on the task date: ${taskDate.toDateString()}.` });
    }

    // Assign the helper to the truck and update helperHistory
    truck.helperId = helperId;  // Currently assigned helper
    truck.helperHistory.push({ helperId, assignedDate: taskDate });  // Track the assignment

    await truck.save();

    res.status(200).json({ message: "Helper assigned to truck successfully", truck });
  } catch (error) {
    res.status(500).json({ message: "Failed to assign helper", error: error.message });
  }
},

updateDriverLocation: async (req, res) => {
  const { driverId } = req.params;
  const { latitude, longitude } = req.body;

  try {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Update driver's current location
    driver.location = { type: "Point", coordinates: [longitude, latitude] };

    // Find the assigned helper by the truck's helperId
    const truck = await Truck.findOne({ driverId: driverId });
    if (!truck || !truck.helperId) {
      return res.status(404).json({ message: "No helper assigned to this truck" });
    }

    const helper = await Helper.findById(truck.helperId);
    if (helper && helper.location) {
      const helperLocation = [longitude, latitude]; // Assuming helper's location is in similar format

      // Check if the driver is within 0.1 km of the helper
      const maxDistance = 0.1; // Distance in kilometers
      if (isWithinDistance(driver.location.coordinates, helperLocation, maxDistance)) {
        if (!driver.startTime) { // Start time is not already set
          driver.startTime = new Date(); // Record the start time
        }
      }
    }

    await driver.save();

    // Emit the new driver location to all connected clients
    socket.emitEvent("driverLocationUpdate", { driverId, latitude, longitude });

    res.status(200).json({ message: "Location updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update location", error: error.message });
  }
},

getTasksForDriver : async (req, res) => {
  const driverId = req.params;   // ID of the driver from URL

  try {
    // Find the truck that this driver is assigned to
    const truck = await Truck.findOne({ driverId: driverId });
    if (!truck) {
      return res.status(404).json({ message: "No truck found for the given driver." });
    }

    // Retrieve all tasks associated with this truck
    const tasks = await Task.find({ '_id': { $in: truck.tasks } });
    res.status(200).json({ message: "Tasks retrieved successfully", tasks });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve tasks", error: error.message });
  }
},
};

module.exports = staffManagement;
