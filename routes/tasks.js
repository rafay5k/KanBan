const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET /api/tasks - Fetch all tasks or filter by columnId
router.get('/', async (req, res) => {
  try {
    const { columnId } = req.query;
    
    // Build query
    const query = {};
    if (columnId) {
      // Validate columnId
      const validColumns = ['todo', 'in-progress', 'completed'];
      if (!validColumns.includes(columnId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid columnId. Must be one of: todo, in-progress, completed'
        });
      }
      query.columnId = columnId;
    }

    // Fetch tasks sorted by columnId and order
    const tasks = await Task.find(query)
      .sort({ columnId: 1, order: 1 })
      .lean();

    // Get total count
    const totalTasks = await Task.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        tasks,
        totalTasks
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tasks'
    });
  }
});

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description = '', columnId, order } = req.body;

    // Validate required fields
    if (!title || !columnId) {
      return res.status(400).json({
        status: 'error',
        message: 'Title and columnId are required'
      });
    }

    // Validate columnId
    const validColumns = ['todo', 'in-progress', 'completed'];
    if (!validColumns.includes(columnId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid columnId. Must be one of: todo, in-progress, completed'
      });
    }

    // If order is not provided, get the next available order
    let taskOrder = order;
    if (!taskOrder) {
      taskOrder = await Task.getNextOrder(columnId);
    } else {
      // If order is provided, make sure it's valid and shift other tasks
      const existingTask = await Task.findOne({ columnId, order: taskOrder });
      if (existingTask) {
        // Shift all tasks with order >= taskOrder up by 1
        await Task.updateMany(
          { columnId, order: { $gte: taskOrder } },
          { $inc: { order: 1 }, updatedAt: new Date() }
        );
      }
    }

    // Create the task
    const task = new Task({
      title,
      description,
      columnId,
      order: taskOrder
    });

    const savedTask = await task.save();

    res.status(201).json({
      status: 'success',
      data: {
        task: savedTask
      }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join(', ')
      });
    }

    // Handle duplicate key errors (unique constraint violations)
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'A task with this order already exists in the column'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create task'
    });
  }
});

// PUT /api/tasks/:id - Update a task (mainly for drag and drop)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { columnId, order, title, description } = req.body;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid task ID format'
      });
    }

    // Find the task
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // If moving task to new position/column
    if (columnId !== undefined && order !== undefined) {
      // Validate columnId
      const validColumns = ['todo', 'in-progress', 'completed'];
      if (!validColumns.includes(columnId)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid columnId. Must be one of: todo, in-progress, completed'
        });
      }

      // Use the static method to move task and handle ordering
      const updatedTask = await Task.moveTaskToColumn(id, columnId, order);
      
      res.status(200).json({
        status: 'success',
        data: {
          task: updatedTask
        }
      });
    } else {
      // Regular update (title, description, etc.)
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      updateData.updatedAt = new Date();

      const updatedTask = await Task.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        status: 'success',
        data: {
          task: updatedTask
        }
      });
    }
  } catch (error) {
    console.error('Error updating task:', error);
    
    if (error.message === 'Task not found') {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to update task'
    });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid task ID format'
      });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Remove the task
    await Task.findByIdAndDelete(id);

    // Shift down all tasks in the same column with higher order
    await Task.updateMany(
      { columnId: task.columnId, order: { $gt: task.order } },
      { $inc: { order: -1 }, updatedAt: new Date() }
    );

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete task'
    });
  }
});

// POST /api/tasks/reorder - Bulk update task order within a column
router.post('/reorder', async (req, res) => {
  try {
    const { columnId, tasks } = req.body;

    // Validate input
    if (!columnId || !Array.isArray(tasks)) {
      return res.status(400).json({
        status: 'error',
        message: 'columnId and tasks array are required'
      });
    }

    // Validate columnId
    const validColumns = ['todo', 'in-progress', 'completed'];
    if (!validColumns.includes(columnId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid columnId. Must be one of: todo, in-progress, completed'
      });
    }

    // Validate tasks format
    for (const task of tasks) {
      if (!task._id || !task.order) {
        return res.status(400).json({
          status: 'error',
          message: 'Each task must have _id and order fields'
        });
      }
    }

    // Use the static method to reorder tasks
    await Task.reorderTasks(columnId, tasks);

    // Fetch updated tasks for this column
    const updatedTasks = await Task.find({ columnId })
      .sort({ order: 1 })
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        updatedTasks
      }
    });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reorder tasks'
    });
  }
});

module.exports = router;
