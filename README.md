RoomMatch
Find a place. Find your match.

RoomMatch is a full-stack accommodation discovery platform that helps students and individuals find PGs, hostels, rooms, and flats matching their location, budget, and living preferences. It also provides landlords with tools to publish and manage property listings.

Features
Tenant and landlord accounts with role-based access and protected pages.
Email verification using OTP delivery through Brevo SMTP.
Tenant profiles and preferences for location, budget, room type, accommodation type, amenities, and move-in requirements.
Property management for landlords, including listing details and image uploads.
Personalized recommendations with a match score out of 100 and a criteria breakdown.
Preference-aware discovery with eligibility checks for relevant move-in and gender preferences.
Like / dislike interactions and a liked-properties view.
Saved properties with reminders to revisit saved listings.
Nearby map for exploring accommodation geographically.
Demo data seeding for application demonstrations.
Recommendation Engine
RoomMatch combines tenant-to-property preference matching with similarity to properties the tenant has liked.

The tenant preference score uses these weights:

Criterion	Weight
Preferred city	30
Preferred area	10
Budget compatibility	25
Preferred room type	15
Accommodation type	10
Preferred amenities	10
Total	100
Only criteria supplied in the tenant's profile are included; the score is normalized over the active criteria. Recommendation ranking also considers similarity to liked properties, listing recency, eligibility constraints, and landlord diversity.

Tech Stack
Layer	Technologies
Frontend	React 19, React Router, Vite
Backend	Node.js, Express 5
Database	MongoDB, Mongoose
Authentication	JSON Web Tokens (JWT), bcrypt
Email	Nodemailer, Brevo SMTP
Image uploads	Multer
API client	Axios
Testing	Node.js built-in test runner
Project Structure
PBL-RoomMatch/
├── backend/
│   ├── scripts/          # Demo data seeding
│   ├── src/
│   │   ├── config/       # Environment and database configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Authentication, roles, rate limits, uploads
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   └── services/     # Recommendations, email and reminders
│   ├── tests/
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        └── services/

Setup
Requirements
Node.js and npm
MongoDB instance (local or MongoDB Atlas)
Brevo SMTP credentials for email verification
1. Clone the repository
git clone <YOUR_REPOSITORY_URL>
cd PBL-RoomMatch-main

2. Configure the backend
Create backend/.env using backend/.env.example as the template.

Set the required values:

PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_32_or_more_character_secret

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_smtp_login
SMTP_PASS=your_brevo_smtp_key
MAIL_FROM="RoomMatch <your_verified_sender@example.com>"

SAVED_REMINDER_MINUTES=5

MONGODB_URI, JWT_SECRET, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and MAIL_FROM are required. Use a JWT secret of at least 32 characters and a sender address verified with Brevo.

3. Install dependencies
From the project root, install dependencies in both folders:

cd backend
npm install
cd ../frontend
npm install

4. Run in development
Start the backend in one terminal:

cd backend
npm run dev

Start the frontend in a second terminal:

cd frontend
npm run dev

Open the Vite URL shown in the frontend terminal. During development, Vite proxies /api and /uploads requests to http://localhost:5000.

5. Build and run the application
Build the frontend:

cd backend
npm run build:frontend

Then start the backend:

npm start

The Express server serves the built frontend and API from the same origin.

Demo Data
To seed the demo tenant, landlord accounts, and sample property listings:

Configure DEMO_TENANT_EMAIL, DEMO_LANDLORD1_EMAIL, DEMO_LANDLORD2_EMAIL, and DEMO_LANDLORD3_EMAIL in backend/.env. Use four distinct, deliverable email addresses.
Run:
cd backend
npm run seed:demo

Demo accounts are not automatically email-verified. Each account must complete the normal email OTP verification flow.

Tests
Run the backend test suite:

cd backend
npm test

API Overview
The backend exposes these API groups:

/api/auth
/api/tenant-profile
/api/landlord-profile
/api/properties
/api/recommendations
/api/interactions
/api/saved
A health check is available at /api/health.

Notes
Keep .env files and credentials private; do not commit them.
backend/.env.example documents the environment variables used by the application.
Uploaded property images are served from /uploads.
Demo property listings and their illustrative images are for demonstration purposes.
RoomMatch — Making accommodation discovery simpler and more personalized.
