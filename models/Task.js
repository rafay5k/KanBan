const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    minlength: [5, 'Title must be at least 5 characters long'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  columnId: {
    type: String,
    required: [true, 'Column ID is required'],
    enum: {
      values: ['todo', 'in-progress', 'completed'],
      message: 'Column ID must be one of: todo, in-progress, completed'
    },
    index: true
  },
  order: {
    type: Number,
    required: [true, 'Order is required'],
    min: [1, 'Order must be at least 1'],
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false
});

// Compound index for efficient sorting and filtering with unique constraint
taskSchema.index({ columnId: 1, order: 1 }, { unique: true });

// Pre-save middleware to update the updatedAt field
taskSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Pre-update middleware to update the updatedAt field
taskSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Static method to get the next order value for a column
taskSchema.statics.getNextOrder = async function(columnId) {
  const lastTask = await this.findOne({ columnId })
    .sort({ order: -1 })
    .select('order')
    .lean();
  
  return lastTask ? lastTask.order + 1 : 1;
};

// Static method to reorder tasks in a column
taskSchema.statics.reorderTasks = async function(columnId, taskUpdates) {
  try {
    for (const update of taskUpdates) {
      await this.updateOne(
        { _id: update._id, columnId },
        { order: update.order, updatedAt: new Date() }
      );
    }
  } catch (error) {
    throw new Error('Failed to reorder tasks: ' + error.message);
  }
};

// Static method to move task to new column and adjust orders
taskSchema.statics.moveTaskToColumn = async function(taskId, newColumnId, newOrder) {
  try {
    const task = await this.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const oldColumnId = task.columnId;
    const oldOrder = task.order;

    // If moving to a different column
    if (oldColumnId !== newColumnId) {
      // Shift down tasks in the old column
      await this.updateMany(
        { columnId: oldColumnId, order: { $gt: oldOrder } },
        { $inc: { order: -1 }, updatedAt: new Date() }
      );

      // Shift up tasks in the new column at or after the new position
      await this.updateMany(
        { columnId: newColumnId, order: { $gte: newOrder } },
        { $inc: { order: 1 }, updatedAt: new Date() }
      );
    } else {
      // Moving within the same column
      if (newOrder < oldOrder) {
        // Moving up: shift down tasks between new and old position
        await this.updateMany(
          { 
            columnId: oldColumnId, 
            order: { $gte: newOrder, $lt: oldOrder } 
          },
          { $inc: { order: 1 }, updatedAt: new Date() }
        );
      } else if (newOrder > oldOrder) {
        // Moving down: shift up tasks between old and new position
        await this.updateMany(
          { 
            columnId: oldColumnId, 
            order: { $gt: oldOrder, $lte: newOrder } 
          },
          { $inc: { order: -1 }, updatedAt: new Date() }
        );
      }
    }

    // Update the task itself
    task.columnId = newColumnId;
    task.order = newOrder;
    task.updatedAt = new Date();
    
    return await task.save();
  } catch (error) {
    throw new Error('Failed to move task: ' + error.message);
  }
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
