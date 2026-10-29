#EdTech CRM – Inquiry Management System

##Project Overview
EdTech CRM is a full-stack web application developed to manage student inquiries through an admin dashboard. It provides an organized interface for inquiry management and secure admin authentication using custom JWT-based authentication.

##Tech Stack
- **Frontend:** React.js, Vite, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Styling:** CSS

##Key Features
- Admin login and authentication
- Custom JWT authentication
- Protected dashboard access
- Student inquiry management
- Responsive admin dashboard
- Role-based access control 

##Local Setup Instructions

###Prerequisites
- Node.js and npm
- MongoDB connection
- Git

###1. Clone the Repository
```bash
git clone https://github.com/amityadaav/EdTech-CRM-dashboard.git
cd edtech-crm
```

###2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

Use `node server.js` if no development script is configured.

###3. Frontend Setup
Open a new terminal:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL provided by Vite, typically `http://localhost:5173`.

##Authentication Testing

Use Postman to test the custom JWT authentication.

1. Send a POST request to the configured admin login endpoint.
2. Provide valid admin credentials in the request body.
3. Copy the JWT token from the successful login response.
4. Send a request to a protected API endpoint using:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

5. Verify that:
   - Valid tokens are accepted when permissions allow.
   - Missing or invalid tokens are rejected.
   - Expired tokens are rejected if token expiration is configured.
   - Unauthorized roles are denied if role-based authorization is implemented.

Test using your actual API routes and request fields.

##Live Demo

- **Frontend:** https://edtech-crm-dashboard.netlify.app/inquiry
- **Backend API:**https://edtech-crm-dashboard-1.onrender.com/
- **GitHub Repository:**https://github.com/amityadaav/EdTech-CRM-dashboard/tree/main

##Deployment
The frontend can be deployed using Vercel or Netlify, and the backend using Render. Configure environment variables and CORS settings before deployment.

##Author
**Amit Kumar**  
Full Stack Developer
