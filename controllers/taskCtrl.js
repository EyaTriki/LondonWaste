const Task = require("../models/Task");
const Truck = require("../models/Truck");
const Driver = require("../models/Driver");



const taskCtrl = {
  createTask: async (req, res) => {
    try {
        const {
            firstName, lastName, phoneNumber,
            location, date, hour, object, price, paymentStatus
        } = req.body;

        const clientObjectPhotos = req.files.map(file => file.path);

        const newTask = new Task({
            firstName,
            lastName,
            phoneNumber,
            location,
            clientObjectPhotos, 
            date,
            hour,
            object,
            price,
            paymentStatus, 
            taskStatus: "Processing"
        });

        await newTask.save();
        res.status(201).json({ message: "Task created successfully", task: newTask });
    } catch (error) {
        res.status(400).json({ message: "Failed to create task", error: error.message });
    }
},


assignTruckToTask: async (req, res) => {
    const { taskId } = req.params;
    const { truckName } = req.body;
  
    try {
      // Find the truck by name
      const truck = await Truck.findOne({ name: truckName });
      if (!truck) {
        return res.status(404).json({ message: "Truck not found" });
      }
  
      // Find the task by ID
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // Assign the task to the truck
      truck.tasks.push(task._id);
      await truck.save();
  
      // Update the task with the truck ID
      task.truckId = truck._id;
      await task.save();
  
      res.status(200).json({ message: "Task assigned to truck successfully", truck });
    } catch (error) {
      res.status(500).json({ message: "Failed to assign truck to task", error: error.message });
    }
  },
  






};

module.exports = taskCtrl;
