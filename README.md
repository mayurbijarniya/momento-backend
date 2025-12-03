# Momento Backend

Backend API for the Momento Social Network, built with Node.js, Express, and MongoDB.

## Overview

The backend exposes a RESTful API for authentication, posts, reviews, follows, saves, notifications, messaging, external content, and admin workflows.  
It follows the professor-style architecture: each feature has its own `schema.js`, `model.js`, `dao.js`, and `routes.js`.

## Tech Stack

- Node.js, Express.js
- MongoDB with Mongoose
- express-session for session-based auth
- bcryptjs for password hashing
- Multer for file uploads
- UUID for identifiers
- Axios for external API calls (Unsplash, OpenRouter)
- CORS for cross-origin access

## Features

### Authentication and Users

- Register and sign in with email and password
- Session-based authentication with secure cookies
- Role-based access control (USER, ADMIN)
- Update profile details and profile image
- Admin endpoints to list and delete users

### Posts and Social Graph

- Create, update, and delete posts with image uploads
- Fetch posts by recency, by user, and by filters (latest, oldest, most liked, most reviewed)
- Like and unlike posts
- Save and unsave posts and fetch saved posts
- Follow and unfollow users, and fetch followers and following

### Reviews and Notifications

- Create, update, and delete reviews for internal posts and external Unsplash content
- Fetch reviews by post or external content identifier
- Notification system for likes, follows, and reviews, including unread counts and mark-as-read endpoints

### Messaging and AI

- AI assistant chat endpoints backed by OpenRouter
- User-to-user conversations with message history, unread counts, and mark-as-read
- Conversation partners listing for the messaging sidebar

### External API Integration

- Unsplash search and details endpoints, used by the frontend explore and details pages

## Project Structure (High Level)

```
Users/           User accounts and auth
Posts/           Post data
Saves/           Saved posts
Follows/         Follow relationships
Reviews/         Review data
Notifications/   Notification records
Messages/        AI chat history
Conversations/   Direct messages
External/        Unsplash proxy routes
middleware/      Auth and upload middleware
index.js         Server bootstrap and configuration
```

Each module contains:

- `schema.js` – Mongoose schema
- `model.js` – Mongoose model
- `dao.js` – database operations
- `routes.js` – Express routes

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or MongoDB Atlas)

### Installation

```bash
git clone https://github.com/mayurbijarniya/momento-backend
cd momento-backend
npm install
```

Create `.env`:

```env
PORT=4000
DATABASE_CONNECTION_STRING=mongodb://127.0.0.1:27017/momento
SESSION_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:3000
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
OPENROUTER_API_KEY=your-openrouter-api-key
SERVER_ENV=development
```

Start MongoDB locally or configure the connection string for MongoDB Atlas, then run:

```bash
npm run dev
```

The server listens on `http://localhost:4000` by default.

## Environment Variables

| Variable                     | Description                      |
| ---------------------------- | -------------------------------- |
| `PORT`                       | Server port                      |
| `DATABASE_CONNECTION_STRING` | MongoDB connection string        |
| `SESSION_SECRET`             | Session secret                   |
| `CLIENT_URL`                 | Frontend origin (CORS and cookies) |
| `UNSPLASH_ACCESS_KEY`        | Unsplash API key                 |
| `OPENROUTER_API_KEY`         | OpenRouter API key               |
| `SERVER_ENV`                 | `development` or `production`    |

## Scripts

- `npm run dev` – start in development with nodemon
- `npm start` – start in production mode

## Project Links

- Backend repository: [`momento-backend`](https://github.com/mayurbijarniya/momento-backend)
- Frontend repository: [`momento-frontend`](https://github.com/mayurbijarniya/momento-frontend)

## Security and Error Handling

- Password hashing with bcryptjs
- Session-based authentication with role checks at the route level
- CORS configuration for the configured frontend origin
- Multer-based file validation for uploads
- Consistent HTTP status codes and safe error messages from all routes

## License

ISC

## Notes

This backend is designed to be used together with the `momento-frontend` repository as part of an academic social network project.
