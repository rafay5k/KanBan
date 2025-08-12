const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/App1';

// Sample tasks data
const sampleTasks = [
  // Todo tasks
  {
    title: 'Design user interface mockups',
    description: 'Create wireframes and mockups for the new dashboard',
    columnId: 'todo',
    order: 1
  },
  {
    title: 'Write project documentation',
    description: 'Document the API endpoints and database schema',
    columnId: 'todo',
    order: 2
  },
  {
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment',
    columnId: 'todo',
    order: 3
  },
  {
    title: 'Research new technologies',
    description: 'Investigate modern frontend frameworks and libraries',
    columnId: 'todo',
    order: 4
  },
  
  // In Progress tasks
  {
    title: 'Implement user authentication',
    description: 'Add login, logout, and registration functionality',
    columnId: 'in-progress',
    order: 1
  },
  {
    title: 'Create database migrations',
    description: 'Setup initial database structure and seed data',
    columnId: 'in-progress',
    order: 2
  },
  {
    title: 'Build responsive layout',
    description: 'Ensure the application works on mobile devices',
    columnId: 'in-progress',
    order: 3
  },
  
  // Completed tasks
  {
    title: 'Setup development environment',
    description: 'Install Node.js, MongoDB, and configure project',
    columnId: 'completed',
    order: 1
  },
  {
    title: 'Create project repository',
    description: 'Initialize Git repository and push to GitHub',
    columnId: 'completed',
    order: 2
  },
  {
    title: 'Define project requirements',
    description: 'Gather and document all functional requirements',
    columnId: 'completed',
    order: 3
  },
  {
    title: 'Choose technology stack',
    description: 'Select Node.js, Express, MongoDB, and React',
    columnId: 'completed',
    order: 4
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Clear existing tasks
    const deleteResult = await Task.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing tasks`);
    
    // Insert sample tasks
    const insertedTasks = await Task.insertMany(sampleTasks);
    console.log(`✨ Successfully inserted ${insertedTasks.length} sample tasks`);
    
    // Display summary
    const taskCounts = await Promise.all([
      Task.countDocuments({ columnId: 'todo' }),
      Task.countDocuments({ columnId: 'in-progress' }),
      Task.countDocuments({ columnId: 'completed' })
    ]);
    
    console.log('\n📊 Task distribution:');
    console.log(`   📋 Todo: ${taskCounts[0]} tasks`);
    console.log(`   🔄 In Progress: ${taskCounts[1]} tasks`);
    console.log(`   ✅ Completed: ${taskCounts[2]} tasks`);
    console.log(`   📈 Total: ${taskCounts.reduce((a, b) => a + b, 0)} tasks`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
    process.exit(0);
  }
};

// Handle script interruption
process.on('SIGINT', async () => {
  console.log('\n⚠️  Seeding interrupted by user');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
  }
  process.exit(1);
});

// Run the seeding function
if (require.main === module) {
  console.log('🚀 Kanban Board Database Seeder');
  console.log(`🔗 Connecting to: ${MONGODB_URI}`);
  console.log('⏰ Starting seeding process...\n');
  
  seedDatabase();
}

module.exports = { seedDatabase, sampleTasks };
