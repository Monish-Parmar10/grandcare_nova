# GrandCare Backend

This is the Node.js + Express + MongoDB backend for the GrandCare application. It provides the REST API for all frontend features (Authentication, Medicines, Routines, Help Requests, Quiz, SOS) and sets up a Socket.io server for real-time messaging.

## ⚠️ What You Need To Do Manually (Important!)

I have built the entire backend codebase, but **I cannot create a MongoDB Atlas database cluster for you**. You must do this manually to make the backend work:

1. **Create a MongoDB Atlas Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account/cluster.
2. **Get your Connection String**: In your cluster dashboard, click "Connect" -> "Drivers" -> "Node.js" and copy the connection string. It will look something like:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/grandcare?retryWrites=true&w=majority`
3. **Set up your `.env` file**:
   Rename the provided `.env.example` file in this directory to `.env`:
   ```bash
   cp .env.example .env
   ```
   Then, open the `.env` file and replace the `MONGO_URI` value with your actual connection string. Also, set a strong random string for `JWT_SECRET`.

## Setup & Running Locally

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Seed Initial Data**:
   To populate your new database with some mock elders, helpers, and quiz questions, run:
   ```bash
   node seed.js
   ```

3. **Start the Server**:
   You can start the development server using:
   ```bash
   node src/server.js
   ```
   *Note: You might want to install `nodemon` globally (`npm install -g nodemon`) and run `nodemon src/server.js` for hot-reloading during development.*

The server will start on `http://localhost:5000` by default.

## API Specification
Please see `src/docs/api-spec.md` for a full list of available routes, HTTP methods, and required roles.

## Integration with Frontend
To connect your existing React frontend to this backend:
1. Ensure this server is running on port 5000.
2. In your React frontend, update your `dummyApi.js` or data-fetching logic to make actual `fetch` or `axios` calls to `http://localhost:5000/api/...`.
3. For Chat, update the `HelpConnectPage.jsx` to connect to Socket.io using `io('http://localhost:5000')`.
