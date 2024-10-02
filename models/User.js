const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  
  email: { type: String, required: true, unique: true },
  officialEmail: { type: String},
  phoneNumber: [{ type: String, required: true }],
  username: { type: String , required: true },
  gender: {
    type: String,
    enum: ["Female", "Male", "Other"],
    default: "Other",
  },
  designation:{ type: String},
  dateOfBirth: { type: Date },
  picture: { type: String },
  password: { type: String, required: true },
  role: {
    type: [String],
    enum: ["Admin", "Helper", "Driver", "HR" ,"Manager" ,"CM" ,"IT" ,"CEO"] 
  },
  hourPrice: { type: Number,
    // required: true 
    },
  totalHoursWorked: { type: Number, default: 0 },  
  totalSalary: { type: Number, default: 0 },      
  payrollReset: { type: Boolean, default: false },
  dayOffRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dayoff' }]

 
,
  refreshToken: { type: String }
}, { discriminatorKey: 'roleType' });


const User = mongoose.model('User', userSchema);

module.exports =  {User};
