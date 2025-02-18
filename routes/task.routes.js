const express = require("express");
const { TaskModel } = require("../models/task.model");
const { userRouter } = require("./user.routes");
const { auth } = require("../middleware/auth.middleware");

const taskRouter = express.Router();

// Create a Task
taskRouter.post("/create", auth, async (req, res) => {
    const { name, description } = req.body;

    try {
        const task = await TaskModel.create({ name, description, user: req.user.id });
        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating task", error: error.message });
    }
});


// Get a Tasks of login user
taskRouter.get("/getTasks", auth, async (req, res) => {
    try {
        let { search, status, startDate, endDate, page = 1, limit = 10 } = req.query;

        // Ensure limit doesn't exceed 10
        limit = Math.min(parseInt(limit) || 10, 10);
        page = parseInt(page) || 1;
        const skip = (page - 1) * limit;

        // Build filter query
        let filter = { user: req.user.id };

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        if (status) {
            filter.status = status.toUpperCase();
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Fetch tasks with pagination
        const tasks = await TaskModel.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination metadata
        const totalTasks = await TaskModel.countDocuments(filter);

        res.status(200).json({
            totalTasks,
            totalPages: Math.ceil(totalTasks / limit),
            currentPage: page,
            tasks,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching tasks", error: error.message });
    }
});


// Update the Task
taskRouter.put("/update/:id", auth, async (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;

    try {
        const task = await TaskModel.findOne({ _id: id, user: req.user.id });

        if (!task) {
            return res.status(404).json({ message: "Task not found or not authorized to update" });
        }

        const updatedTask = await TaskModel.findByIdAndUpdate(
            id,
            { name, description, status },
            { new: true }
        );

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating task", error: error.message });
    }
});


// Delete the Task
taskRouter.delete("/delete/:id", auth, async (req, res) => {
    const { id } = req.params;

    try {
        const task = await TaskModel.findOne({ _id: id, user: req.user.id });

        if (!task) {
            return res.status(404).json({ message: "Task not found or not authorized to delete" });
        }

        await TaskModel.findByIdAndDelete(id);

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting task", error: error.message });
    }
});


module.exports = {
    taskRouter
}