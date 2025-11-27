# Momento Backend

Backend API server for Momento Social Network, a full-stack social media application built with Node.js, Express, and MongoDB.

## Overview

Momento Backend provides a RESTful API for user authentication, content management, social interactions, and external API integration. The architecture follows a modular pattern with clear separation of concerns: routes, data access objects (DAO), models, and schemas.

## Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling library
- **express-session** - Session management middleware
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **UUID** - Unique identifier generation
- **Axios** - HTTP client for external API calls
- **CORS** - Cross-origin resource sharing

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd momento-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=4000
DATABASE_CONNECTION_STRING=mongodb://127.0.0.1:27017/momento
SESSION_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:3000
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
SERVER_ENV=development
```

4. Start MongoDB locally or configure MongoDB Atlas connection string.

5. Run the development server:
```bash
npm run dev
```

The server will start on `http://localhost:4000` by default.

## Project Structure

The project follows a modular architecture pattern where each feature module contains:

- `schema.js` - Mongoose schema definition
- `model.js` - Mongoose model creation
- `dao.js` - Data access object with CRUD operations
- `routes.js` - Express route handlers

```
momento-backend/
├── Users/              # User management module
│   ├── schema.js       # User schema definition
│   ├── model.js        # User Mongoose model
│   ├── dao.js          # User data access operations
│   └── routes.js       # User API endpoints
├── Posts/              # Post management module
│   ├── schema.js
│   ├── model.js
│   ├── dao.js
│   └── routes.js
├── Saves/              # Saved posts/bookmarks module
│   ├── schema.js
│   ├── model.js
│   ├── dao.js
│   └── routes.js
├── Follows/            # User following relationships module
│   ├── schema.js
│   ├── model.js
│   ├── dao.js
│   └── routes.js
├── Reviews/            # Review system module
│   ├── schema.js
│   ├── model.js
│   ├── dao.js
│   └── routes.js
├── Notifications/      # Notification system module
│   ├── schema.js
│   ├── model.js
│   ├── dao.js
│   └── routes.js
├── External/           # External API integration
│   └── routes.js       # Unsplash API proxy routes
├── middleware/         # Custom middleware
│   ├── auth.js         # Authentication and authorization
│   └── upload.js       # File upload configuration
├── database/           # Sample data (optional)
├── uploads/            # Uploaded files directory
├── index.js            # Main server entry point
├── package.json        # Dependencies and scripts
└── .env                # Environment variables (not in repo)
```

## API Endpoints

### Authentication
- `POST /api/users/signup` - Register a new user
- `POST /api/users/signin` - Sign in with email and password
- `POST /api/users/signout` - Sign out current user
- `POST /api/users/profile` - Get current user profile

### Users
- `GET /api/users/:userId` - Get user by ID
- `PUT /api/users/:userId` - Update user profile
- `DELETE /api/users/:userId` - Delete user account
- `POST /api/users/upload` - Upload profile image
- `GET /api/admin/users` - Get all users (Admin only)

### Posts
- `GET /api/posts` - Get recent posts with pagination
- `GET /api/posts/:postId` - Get post by ID
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:postId` - Update post
- `DELETE /api/posts/:postId` - Delete post
- `GET /api/posts/user/:userId` - Get posts by user
- `PUT /api/posts/:postId/like` - Like or unlike a post
- `GET /api/posts/search` - Search posts
- `GET /api/posts/user/:userId/liked` - Get liked posts by user

### Saves
- `POST /api/saves` - Save a post
- `DELETE /api/saves` - Unsave a post
- `GET /api/saves/user/:userId` - Get saved posts by user

### Follows
- `POST /api/follows` - Follow a user
- `DELETE /api/follows/:followingId` - Unfollow a user
- `GET /api/follows/followers/:userId` - Get user's followers
- `GET /api/follows/following/:userId` - Get users being followed

### Reviews
- `POST /api/reviews` - Create a review
- `GET /api/reviews/post/:postId` - Get reviews for a post
- `GET /api/reviews/external/:externalContentId` - Get reviews for external content
- `PUT /api/reviews/:reviewId` - Update a review
- `DELETE /api/reviews/:reviewId` - Delete a review

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread notification count
- `PUT /api/notifications/:notificationId/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:notificationId` - Delete a notification

### External API
- `GET /api/external/search` - Search Unsplash photos
- `GET /api/external/details/:id` - Get Unsplash photo details

## Architecture

The backend follows a layered architecture pattern:

1. **Routes Layer** (`routes.js`) - Handles HTTP requests, validates input, manages sessions
2. **DAO Layer** (`dao.js`) - Performs database operations, abstracts data access logic
3. **Model Layer** (`model.js`) - Mongoose model definitions
4. **Schema Layer** (`schema.js`) - Data structure and validation rules

This separation ensures maintainability, testability, and follows best practices for Express applications.

## Authentication

The application uses session-based authentication with `express-session`. Sessions are stored server-side and managed through cookies. Passwords are hashed using bcryptjs before storage.

## File Uploads

File uploads are handled using Multer middleware. Uploaded files are stored in the `uploads/` directory. Supported file types and size limits are configured in `middleware/upload.js`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port number | 4000 |
| `DATABASE_CONNECTION_STRING` | MongoDB connection string | mongodb://127.0.0.1:27017/momento |
| `SESSION_SECRET` | Secret key for session encryption | Required |
| `CLIENT_URL` | Frontend application URL | http://localhost:3000 |
| `UNSPLASH_ACCESS_KEY` | Unsplash API access key | Required for external API |
| `SERVER_ENV` | Server environment (development/production) | development |

## Development

### Running in Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm start
```

## Security Features

- Password hashing with bcryptjs
- Session-based authentication
- Role-based access control (USER, ADMIN)
- CORS configuration
- File upload validation
- Input validation and sanitization

## Database Schema

The application uses MongoDB with the following main collections:
- `users` - User accounts and profiles
- `posts` - User-generated posts
- `saves` - Saved posts relationships
- `follows` - User following relationships
- `reviews` - Reviews for posts and external content
- `notifications` - User notifications

## Error Handling

All API endpoints include proper error handling with appropriate HTTP status codes:
- 200 - Success
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Internal Server Error

## License

ISC

## Contributing

This is a project for academic purposes. For questions or issues, please contact the development team.
