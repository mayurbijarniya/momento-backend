# Momento Backend

Backend API server for Momento Social Network built with Node.js, Express, and MongoDB.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **express-session** - Session management
- **Multer** - File upload handling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (see `.env.example`):
```env
PORT=4000
DATABASE_CONNECTION_STRING=mongodb://127.0.0.1:27017/momento
SESSION_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

3. Start MongoDB locally or use MongoDB Atlas

4. Run development server:
```bash
npm run dev
```

## Project Structure

```
momento-backend/
├── Users/          # User management
│   ├── schema.js
│   ├── model.js
│   ├── dao.js
│   └── routes.js
├── Posts/          # Post management
├── Saves/          # Saved posts/bookmarks
├── Follows/        # User following relationships
├── Reviews/        # Reviews (if using external API)
├── External/       # External API integration
├── middleware/     # Custom middleware
└── index.js        # Main server file
```

## API Endpoints

API endpoints will be documented here as they are implemented.

## License

ISC

