# Kanban Board API

A comprehensive Node.js REST API for a Trello-style Kanban board with drag-and-drop functionality. Built with Express.js and MongoDB, this API supports task management across three columns: "To Do," "In Progress," and "Completed."

## 🚀 Features

- **RESTful API Design**: Clean, intuitive endpoints for all task operations
- **Drag & Drop Support**: Advanced task ordering and column management
- **MongoDB Integration**: Robust data persistence with Mongoose ODM
- **Task Ordering**: Intelligent order management within columns
- **Error Handling**: Comprehensive error responses and validation
- **Postman Ready**: Complete testing collection included
- **CORS Enabled**: Frontend-ready with proper CORS configuration
- **Seed Data**: Sample tasks for immediate testing

## 📋 API Endpoints

### Tasks Management
- `GET /api/tasks` - Fetch all tasks or filter by column
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update task or move between columns
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/reorder` - Bulk reorder tasks within a column

### Utility Endpoints
- `GET /health` - Health check
- `GET /` - API information and documentation

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Environment**: dotenv
- **UUID**: uuid (for unique identifiers if needed)
- **CORS**: cors (for cross-origin requests)

## 📁 Project Structure

```
kanban-board-api/
├── models/
│   └── Task.js              # Mongoose schema for Tasks
├── routes/
│   └── tasks.js            # Express routes for /api/tasks
├── .env                    # Environment variables
├── server.js               # Main Express server
├── seed.js                 # Database seeding script
├── postman_collection.json # Postman testing collection
├── package.json            # Project dependencies
└── README.md               # This file
```

## 🏗️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or cloud instance)
- npm or yarn package manager

### Step 1: Clone and Install Dependencies

```powershell
# Navigate to project directory
cd "c:\\Users\\a.rafay\\Desktop\\KanBanBoard"

# Install dependencies
npm install
```

### Step 2: Environment Configuration

The `.env` file is already configured with default values:

```env
MONGODB_URI=mongodb://localhost:27017/App1
PORT=3000
DB_NAME=App1
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
Update `MONGODB_URI` in `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/App1
```

### Step 3: Start MongoDB

**Local MongoDB:**
```powershell
# Start MongoDB service (Windows)
net start MongoDB

# Or if using MongoDB manually
mongod --dbpath "C:\\data\\db"
```

**MongoDB Atlas:**
Ensure your cluster is running and IP address is whitelisted.

### Step 4: Seed the Database

```powershell
# Populate database with sample tasks
npm run seed
```

Expected output:
```
🌱 Starting database seeding...
✅ Connected to MongoDB
🗑️  Cleared 0 existing tasks
✨ Successfully inserted 11 sample tasks

📊 Task distribution:
   📋 Todo: 4 tasks
   🔄 In Progress: 3 tasks
   ✅ Completed: 4 tasks
   📈 Total: 11 tasks

🎉 Database seeding completed successfully!
```

### Step 5: Start the Server

```powershell
# Production mode
npm start

# Development mode (with auto-restart)
npm run dev
```

Expected output:
```
🚀 Kanban Board API Server is running!
📍 Local URL: http://localhost:3000
🗂️  Database: mongodb://localhost:27017/App1
🌍 Environment: development
⏰ Started at: 2025-07-18T14:44:00.000Z

📋 Available endpoints:
  GET    /                     - API information
  GET    /health               - Health check
  GET    /api/tasks            - Get all tasks
  POST   /api/tasks            - Create new task
  PUT    /api/tasks/:id        - Update task
  DELETE /api/tasks/:id        - Delete task
  POST   /api/tasks/reorder    - Reorder tasks

💡 Ready for requests!
```

## 🧪 Testing with Postman

### Import the Collection

1. Open Postman
2. Click "Import" → "Upload Files"
3. Select `postman_collection.json`
4. The collection will include:
   - **Health & Info**: Server status checks
   - **Tasks - Basic Operations**: CRUD operations
   - **Tasks - Create**: Task creation examples
   - **Tasks - Update & Move**: Drag & drop simulation
   - **Tasks - Bulk Operations**: Batch updates
   - **Tasks - Delete**: Task removal
   - **Error Testing**: Validation and error scenarios
   - **Workflow Examples**: Complete task lifecycle

### Quick Test Workflow

1. **Health Check**: `GET /health`
2. **View All Tasks**: `GET /api/tasks`
3. **Create Task**: `POST /api/tasks`
4. **Move Task**: `PUT /api/tasks/:id` (simulates drag & drop)
5. **Complete Task**: Move to "completed" column

## 📊 Database Schema

### Tasks Collection

```javascript
{
  _id: ObjectId,              // Auto-generated MongoDB ID
  title: String,              // Required, min 5 characters
  description: String,        // Optional, default empty
  columnId: String,           // Required: "todo", "in-progress", "completed"
  order: Number,              // Required, position within column
  createdAt: Date,            // Auto-generated timestamp
  updatedAt: Date             // Auto-updated on modifications
}
```

### Indexes
- `{ columnId: 1, order: 1 }` - Compound index for efficient sorting
- `{ columnId: 1, order: 1 }` - Unique constraint per column

## 🔄 Drag & Drop Logic

### Task Movement Between Columns

```javascript
// Example: Move task from "todo" to "in-progress"
PUT /api/tasks/64a7b8c9d1e2f3a4b5c6d7e8
{
  "columnId": "in-progress",
  "order": 2
}
```

The API automatically:
1. Updates the target task's column and position
2. Shifts other tasks in source column up (fills gap)
3. Shifts other tasks in target column down (makes space)
4. Maintains consistent ordering across all columns

### Task Reordering Within Column

```javascript
// Example: Move task to position 1 within same column
PUT /api/tasks/64a7b8c9d1e2f3a4b5c6d7e8
{
  "columnId": "todo",  // Same column
  "order": 1           // New position
}
```

### Bulk Reordering

```javascript
POST /api/tasks/reorder
{
  "columnId": "todo",
  "tasks": [
    { "_id": "64a7b8c9d1e2f3a4b5c6d7e8", "order": 1 },
    { "_id": "64a7b8c9d1e2f3a4b5c6d7e9", "order": 2 }
  ]
}
```

## 🛡️ Error Handling

### Validation Errors (400)
```json
{
  "status": "error",
  "message": "Title must be at least 5 characters long"
}
```

### Not Found Errors (404)
```json
{
  "status": "error",
  "message": "Task not found"
}
```

### Server Errors (500)
```json
{
  "status": "error",
  "message": "Failed to fetch tasks"
}
```

## 🔌 Frontend Integration

### React with @dnd-kit Example

```javascript
// Fetch tasks
const fetchTasks = async () => {
  const response = await fetch('http://localhost:3000/api/tasks');
  return response.json();
};

// Move task on drop
const handleDragEnd = async (event) => {
  const { active, over } = event;
  
  if (!over) return;
  
  const taskId = active.id;
  const newColumnId = over.id;
  const newOrder = calculateNewOrder(over);
  
  await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      columnId: newColumnId,
      order: newOrder
    })
  });
};
```

## 🧪 Development Commands

```powershell
# Install dependencies
npm install

# Start development server (auto-restart)
npm run dev

# Start production server
npm start

# Seed database with sample data
npm run seed

# Run linting (if configured)
npm run lint

# Run tests (if configured)
npm test
```

## 🚀 Production Deployment

### Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/App1
PORT=3000
NODE_ENV=production
```

### MongoDB Atlas Setup

1. Create MongoDB Atlas account
2. Create cluster and database "App1"
3. Create user with read/write permissions
4. Whitelist IP addresses
5. Update `MONGODB_URI` with connection string

### Deployment Checklist

- [ ] Update `MONGODB_URI` for production database
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS origins for your frontend domain
- [ ] Set up proper logging and monitoring
- [ ] Configure SSL/TLS certificates
- [ ] Set up backup strategies

## 🔧 Configuration Options

### CORS Configuration
In `server.js`, update CORS settings for production:

```javascript
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### MongoDB Connection Options
Customize connection settings in `server.js`:

```javascript
await mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});
```

## 📈 Performance Considerations

- **Indexes**: Compound indexes on `columnId` and `order` for fast queries
- **Connection Pooling**: MongoDB connection pool configured for concurrent requests
- **Lean Queries**: Using `.lean()` for read-only operations
- **Transaction Support**: Atomic operations for task movement
- **Error Boundaries**: Comprehensive error handling prevents crashes

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For issues and questions:
- Check the Postman collection for API examples
- Review error responses for debugging
- Ensure MongoDB is running and accessible
- Verify environment variables are set correctly

## 🎯 Next Steps

- [ ] Add user authentication and authorization
- [ ] Implement task assignment to users
- [ ] Add due dates and priority levels
- [ ] Create task comments and attachments
- [ ] Add real-time updates with WebSockets
- [ ] Implement task search and filtering
- [ ] Add task archiving functionality
- [ ] Create task templates and categories
