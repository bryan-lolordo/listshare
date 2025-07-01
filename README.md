# ListShare

A full-stack list sharing web app with a React frontend, Node.js/Express backend, and MongoDB (Cosmos DB API) for Azure compatibility.

## Features
- Create, edit, and delete lists
- Add, edit, and remove items (with optional links) to lists
- Responsive React frontend
- RESTful API with robust error handling
- Production-ready CORS configuration
- Azure App Service and Cosmos DB deployment ready
- Automated CI/CD with GitHub Actions

## Local Development

### Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB connection string (Cosmos DB or local MongoDB)

### Setup
1. **Clone the repo:**
   ```sh
   git clone <your-repo-url>
   cd listshare
   ```
2. **Backend setup:**
   - Go to the backend folder:
     ```sh
     cd backend
     ```
   - Create a `.env` file with:
     ```env
     MONGODB_URI=<your-mongodb-connection-string>
     ```
   - Install dependencies:
     ```sh
     npm install
     ```
   - Start the backend:
     ```sh
     npm start
     ```
   - The backend runs on [http://localhost:5000](http://localhost:5000) by default.

3. **Frontend setup:**
   - Open a new terminal and go to the frontend folder:
     ```sh
     cd ../frontend
     ```
   - Install dependencies:
     ```sh
     npm install
     ```
   - Start the frontend:
     ```sh
     npm start
     ```
   - The frontend runs on [http://localhost:3000](http://localhost:3000).
   - API requests are proxied to the backend via the `proxy` field in `package.json`.

## Production/Deployment (Azure)
- The backend serves the static React build from `client-build`.
- The backend uses `process.env.PORT` (set by Azure) or defaults to 5000 locally.
- CORS is restricted to your frontend and Azure App Service URLs.
- Set `MONGODB_URI` and (if needed) `PORT` in Azure App Service > Configuration.
- Automated deployment is handled via GitHub Actions.

## Security & Best Practices
- `.env` is gitignored and never committed.
- CORS is restricted for production.
- All API calls use relative URLs for production compatibility.

## Next Steps
- Add more features (user auth, sharing, etc.)
- Add tests (frontend and backend)
- Add API documentation (Swagger, Postman)
- Set up monitoring and rate limiting

---

For any issues, please open an issue or PR on the repository.
