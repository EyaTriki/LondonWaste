const { User } = require("../models/User");
const { Helper } = require("../models/Helper");
const Task = require("../models/Task");
const Truck = require("../models/Truck");
const bcrypt = require("bcrypt");
const TruckStatus = require("../models/TruckStatus");

const driverManagement = {

updateDriverProfile: async (req, res) => {
    const driverId = req.user._id; 
    const { email, officialEmail, phoneNumber, username, gender, designation, dateOfBirth,picture, hourPrice } = req.body;

    try {
        const driver = await User.findById(driverId);
        if (!driver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        // Update fields if provided
        if (email) driver.email = email;
        if (officialEmail) driver.officialEmail = officialEmail;
        if (phoneNumber) driver.phoneNumber = phoneNumber;
        if (username) driver.username = username;
        if (gender) driver.gender = gender;
        if (designation) driver.designation = designation;
        if (dateOfBirth) driver.dateOfBirth = dateOfBirth;
        if (hourPrice) driver.hourPrice = hourPrice;
        // The picture URL is automatically set by the Cloudinary middleware
        if (req.file) {
            driver.picture = req.file.path;  // This should be adjusted if `req.file.path` does not correctly point to the image URL
        }

        await driver.save();
        res.status(200).json({ message: "Driver profile updated successfully", driver });
    } catch (error) {
        console.error("Error updating driver profile:", error);
        res.status(500).json({ message: "Failed to update driver profile", error: error.message });
    }
},

getTasksForDriver: async (req, res) => {
    const driverId = req.user._id; // Driver ID from the authenticated request
  

    try {
      // Step 1: Find trucks where the driver has been assigned
      const trucks = await Truck.find({
        'driverHistory.driverId': driverId
      });
      console.log("Trucks for driver:", trucks);
      if (!trucks || trucks.length === 0) {
        return res.status(404).json({ message: "No trucks found for the given driver." });
      }
  
      let allTasks = [];
  
      // Step 2: Loop through all trucks and gather the tasks
      for (const truck of trucks) {
        if (truck.tasks && truck.tasks.length > 0) {
          const truckTasks = await Task.find({
            '_id': { $in: truck.tasks }
          });
          allTasks = allTasks.concat(truckTasks); // Collect tasks from each truck
        }
      }
      

      if (allTasks.length === 0) {
        return res.status(404).json({ message: "No tasks found for the driver." });
      }
  
      res.status(200).json({ message: "Tasks retrieved successfully", tasks: allTasks });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve tasks", error: error.message });
    }
  },
 
updateTruckStart : async (req, res) => {
            const { truckId } = req.params;
            const { fuelLevel, mileageStart } = req.body;
            const uploads = req.files.map(file => file.path); // Chemins d'accès des images stockées par Cloudinary
        
            try {
                const statusUpdate = {
                    truckId,
                    pictureBefore: uploads,
                    fuelLevel,
                    mileageStart
                };
        
                const truckStatus = await TruckStatus.findOneAndUpdate(
                    { truckId },
                    statusUpdate,
                    { new: true, upsert: true } // Crée un nouveau document si aucun n'existe
                );
        
                res.status(200).json({ message: "Truck start status updated successfully", truckStatus });
            } catch (error) {
                res.status(500).json({ message: "Failed to update truck start status", error: error.message });
            }
    
 },
    
 updateTruckEnd : async (req, res) => {
  const { truckId } = req.params;
  const { fuelLevelBefore,fuelLevelAfter, mileageEnd } = req.body;
  const uploads = req.files.map(file => file.path); // Chemins d'accès des images stockées par Cloudinary

  try {
      const statusUpdate = {
          truckId,
          pictureAfter: uploads,
          fuelLevelBefore,
          fuelLevelAfter,
          mileageEnd
      };

      const truckStatus = await TruckStatus.findOneAndUpdate(
          { truckId },
          statusUpdate,
          { new: true }
      );

      res.status(200).json({ message: "Truck end status updated successfully", truckStatus });
  } catch (error) {
      res.status(500).json({ message: "Failed to update truck end status", error: error.message });
  }
},

uploadInitialConditionPhotos : async (req, res) => {
    const { taskId } = req.params;
    const description = req.body.description; // Single description for all uploaded files
    const uploads = req.files.map(file => file.path); // Collecting file paths
    console.log(req.body);

    try {
        const taskUpdate = {
            initialConditionPhotos: [{
                items: uploads,
                description: description
            }]
        };

        const task = await Task.findByIdAndUpdate(
            taskId,
            taskUpdate,
            { new: true } // Update the task document
        );

        res.status(200).json({ message: "Initial condition photos uploaded successfully", task });
    } catch (error) {
        res.status(500).json({ message: "Failed to upload initial condition photos", error: error.message });
    }
},

uploadFinalConditionPhotos : async (req, res) => {
    const { taskId } = req.params;
    const description = req.body.description;
    const uploads = req.files.map(file => file.path);


   // console.log(uploads);

    try {
        const taskUpdate = {
            finalConditionPhotos: [{
                items: uploads,  // This should be an array of strings
                description: description
            }]
        };

        const task = await Task.findByIdAndUpdate(
            taskId,
            taskUpdate,
            { new: true }
        );

        res.status(200).json({ message: "Final condition photos uploaded successfully", task });
    } catch (error) {
        res.status(500).json({ message: "Failed to upload final condition photos", error: error.message });
    }
},

addAdditionalItems : async (req, res) => {
    const { taskId } = req.params; // Ensure your route is set to capture this
  
    const description = req.body.description; // Single description for all uploads
    const uploads = req.files.map(file => file.path); // Array of image URLs
    try {
        const taskUpdate = {
            additionalItems: [{
                items: uploads,
                description: description
            }]
        };

        const task = await Task.findByIdAndUpdate(
            taskId,
            taskUpdate,
            { new: true } // Ensures the updated document is returned
        );

        res.status(200).json({ message: "Additional items added successfully", task });
    } catch (error) {
        res.status(500).json({ message: "Failed to add additional items", error: error.message });
    }
},

updateJobStatus: async (req, res) => {
    const { taskId } = req.params;
    const { taskStatus } = req.body; // Assuming the new status is passed in the body of the request

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Update the task status
        task.taskStatus = taskStatus;
        await task.save();
        res.status(200).json({ message: "Task status updated successfully", task });
    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({ message: "Failed to update task status", error: error.message });
    }
},

rateTask: async (req, res) => {
    const { taskId } = req.params;
    const { clientFeedback } = req.body; // Assuming satisfaction rating and feedback are sent in the body

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        // Update task with the client satisfaction rating and feedback
        task.clientFeedback = clientFeedback;
       
        await task.save();
        res.status(200).json({ message: "Task rated successfully", task });
    } catch (error) {
        console.error("Error rating task:", error);
        res.status(500).json({ message: "Failed to rate task", error: error.message });
    }
},



};






module.exports = driverManagement;
