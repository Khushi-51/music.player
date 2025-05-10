# Music Player Web Application

A full-stack music player web application built with Node.js, Express.js, MongoDB, and EJS.

## Features

- **User Authentication**: Register, login, and user profiles
- **Music Streaming**: Listen to music with an embedded audio player
- **Song Management**: Upload, edit, and delete songs
- **Playlist Management**: Create, edit, and delete playlists
- **User Management**: Update profile and preferences
- **Search & Filter**: Find songs by title, artist, or genre

## Technology Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Multer**: File uploads

### Frontend
- **EJS**: Embedded JavaScript templates
- **Bootstrap 5**: CSS framework
- **FontAwesome**: Icon library
- **JavaScript**: Client-side scripting

## Project Structure

```
music-player-app/
├── src/
│   ├── config/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── song.controller.js
│   │   └── playlist.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── upload.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── song.model.js
│   │   └── playlist.model.js
│   ├── public/
│   │   ├── css/
│   │   ├── js/
│   │   └── uploads/
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── song.routes.js
│   │   └── playlist.routes.js
│   ├── utils/
│   ├── views/
│   │   ├── partials/
│   │   ├── layouts/
│   │   ├── auth/
│   │   ├── songs/
│   │   └── playlists/
│   └── server.js
├── .env
├── package.json
└── README.md
```

## Prerequisites

- Node.js (version 14 or higher)
- MongoDB (local or MongoDB Atlas)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/music-player-app.git
cd music-player-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/music-player
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

4. Start the application:
```bash
npm start
```

For development mode:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user
- `GET /auth/profile` - Get current user profile

### Songs
- `GET /songs` - Get all songs
- `GET /songs/:id` - Get a specific song
- `POST /songs` - Create a new song (requires authentication)
- `PUT /songs/:id` - Update a song (requires authorization)
- `DELETE /songs/:id` - Delete a song (requires authorization)

### Playlists
- `GET /playlists` - Get all public playlists
- `GET /playlists/my-playlists` - Get user's playlists (requires authentication)
- `GET /playlists/:id` - Get a specific playlist
- `POST /playlists` - Create a new playlist (requires authentication)
- `PUT /playlists/:id` - Update a playlist (requires authorization)
- `DELETE /playlists/:id` - Delete a playlist (requires authorization)
- `POST /playlists/:id/songs` - Add song to playlist (requires authorization)
- `DELETE /playlists/:id/songs/:songId` - Remove song from playlist (requires authorization)

## License

MIT License
# music.player
