const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["PENDING", "DONE"], default: "PENDING" },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { 
    versionKey: false,
    timestamps: true
  }
);

const TaskModel = mongoose.model("task", taskSchema);

module.exports = {
  TaskModel,
};
