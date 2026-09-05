# RoomMatch

## Tinder-like Room, PG & Flat Discovery Platform

> **Project Type:** Full-Stack Web Application
> **Purpose:** PBL / Academic Project
> **Core Idea:** A swipe-based platform where students and individuals can discover rooms, PGs, flats, and rental properties based on their preferences instead of contacting landlords individually.

---

# 1. Project Overview

Finding suitable accommodation can be difficult for students and individuals because they often have to search through multiple platforms, contact different landlords, compare properties manually, and repeatedly provide the same requirements.

**RoomMatch** aims to simplify this process.

The application works similarly to a Tinder-style matching platform:

1. A user creates an account.
2. The user creates a profile and specifies accommodation requirements.
3. The system recommends suitable rooms/PGs/flats.
4. The user browses properties one at a time.
5. The user can swipe:

   * **Right → Interested**
   * **Left → Not Interested**
6. The recommendation system learns from the user's interactions and gradually recommends properties more similar to the ones they liked.
7. Users can save interesting properties for later comparison.
8. Landlords/property owners can add and manage their property listings.

The goal of the PBL is **not** to build a production-ready rental marketplace, but to demonstrate the core functionality of a full-stack recommendation-based accommodation platform.

---

# 2. Problem Statement

Students and individuals searching for accommodation commonly face problems such as:

* Too many unrelated listings.
* Difficulty finding properties according to specific requirements.
* Having to contact landlords individually.
* Difficulty comparing multiple properties.
* Lack of personalized recommendations.
* Repeatedly searching for the same type of accommodation.
* No simple way to indicate whether a property is suitable or unsuitable.

RoomMatch addresses these problems using a personalized, swipe-based property discovery system.

---

# 3. Main Objectives

The project should demonstrate the following:

* User authentication.
* User profile creation.
* Accommodation preference collection.
* Property/listing management.
* Personalized property recommendations.
* Tinder-style swipe interface.
* Like/dislike tracking.
* Saved properties.
* Basic recommendation algorithm.
* Backend REST APIs.
* Database integration.
* Frontend-backend communication.

---

# 4. User Roles

The application should initially have **two user roles**.

## 4.1 Tenant/User

A tenant is a student or individual searching for accommodation.

They can:

* Register/login.
* Create their profile.
* Specify accommodation preferences.
* Browse recommended properties.
* Swipe right to like a property.
* Swipe left to reject a property.
* Save properties.
* View liked properties.
* View saved properties.
* View property details.
* Update their preferences.

## 4.2 Landlord/Owner

A landlord/property owner can:

* Register/login.
* Create a landlord profile.
* Add properties.
* Add property information.
* Upload property images.
* Edit their listings.
* Delete/deactivate listings.
* View their listed properties.

For the initial PBL, you **do not need to build a complex landlord-tenant communication system**.

---

# 5. Core MVP Features

The following features should constitute the first version of the project.

## 5.1 Authentication

Implement:

* User registration.
* Login.
* Logout.
* Password hashing.
* Authentication using sessions or JWT.
* Role selection:

  * Tenant
  * Landlord

Basic user information:

```text
User
├── id
├── name
├── email
├── password
├── role
├── createdAt
└── updatedAt
```

---

# 6. Tenant Profile

After registration, a tenant should create a profile.

Possible fields:

```text
Tenant Profile
├── userId
├── age
├── gender
├── occupation
├── preferredCity
├── preferredArea
├── budgetMin
├── budgetMax
├── accommodationType
├── preferredRoomType
├── preferredAmenities
└── moveInDate
```

For a PBL, don't collect unnecessary personal information.

The most important information is the information that can actually influence property recommendations.

---

# 7. Property Listing

Landlords should be able to create property listings.

Example:

```text
Property
├── id
├── landlordId
├── title
├── description
├── propertyType
├── roomType
├── city
├── area
├── address
├── rent
├── securityDeposit
├── availableFrom
├── amenities
├── images
├── latitude
├── longitude
├── status
├── createdAt
└── updatedAt
```

### Example property

```text
Title:
"Fully Furnished PG near Metro"

Type:
PG

Location:
Ghaziabad

Rent:
₹8,000/month

Room:
Single

Amenities:
- WiFi
- AC
- Washing Machine
- Food
- Parking

Available:
Immediately
```

---

# 8. Swipe Interface

This is the most important visual feature of the project.

The main tenant screen should display one property card at a time.

Example:

```text
┌─────────────────────────────┐
│                             │
│        PROPERTY IMAGE       │
│                             │
├─────────────────────────────┤
│ Fully Furnished PG          │
│ ₹8,000 / month              │
│ Ghaziabad                   │
│                             │
│ Single Room                 │
│ WiFi • AC • Parking         │
│                             │
│      ❌          ❤️         │
└─────────────────────────────┘
```

The user can:

* Swipe right → Like
* Swipe left → Reject
* Click the card → View details
* Click save → Save property

You can initially implement the interaction using buttons.

Once that works, add actual drag/swipe gestures.

---

# 9. Like/Dislike System

Create a separate interaction record.

```text
Interaction
├── id
├── userId
├── propertyId
├── action
└── createdAt
```

Where:

```text
action =
LIKE
DISLIKE
```

Example:

```text
User 101 → Property 20 → LIKE
User 101 → Property 21 → DISLIKE
User 101 → Property 22 → LIKE
```

This information becomes the foundation of your recommendation system.

---

# 10. Saved Properties

Users should be able to save properties.

```text
SavedProperty
├── id
├── userId
├── propertyId
└── createdAt
```

This allows users to compare properties later.

The Saved page could look like:

```text
My Saved Properties

┌──────────────┐
│ Property A   │
│ ₹8,000       │
│ Ghaziabad    │
└──────────────┘

┌──────────────┐
│ Property B   │
│ ₹9,500       │
│ Noida        │
└──────────────┘
```

---

# 11. Recommendation System

The recommendation system does **not** need to use machine learning for the PBL.

A rule-based/content-based recommendation system is actually a better starting point.

## 11.1 Initial Recommendation Logic

When a user first creates their profile, calculate property scores based on their preferences.

For example:

```text
Location match       → +30
Budget match         → +25
Room type match      → +15
Property type match  → +10
Amenities match      → +10
Other preferences    → +10
```

Maximum:

```text
100 points
```

Properties with higher scores appear first.

---

# 12. Example Recommendation

Suppose the user wants:

```text
City: Ghaziabad
Budget: ₹6,000 - ₹9,000
Room: Single
Type: PG
Amenities:
- WiFi
- AC
```

Property A:

```text
City: Ghaziabad        → +30
Budget: ₹8,000         → +25
Single room            → +15
PG                     → +10
WiFi + AC              → +10

Score = 90
```

Property B:

```text
City: Noida            → +0
Budget: ₹7,000         → +25
Single room            → +15
PG                     → +10
WiFi                   → +5

Score = 55
```

Property A should therefore appear before Property B.

---

# 13. Learning From Swipes

This is where your project becomes more interesting.

The system can use previous likes to modify recommendations.

For example, if the user repeatedly likes:

```text
PG
₹7,000 - ₹9,000
Single room
WiFi
Near metro
```

then the system can increase the priority of properties containing these characteristics.

You can implement a simple version like:

```text
Initial preferences
        ↓
Generate property scores
        ↓
User swipes
        ↓
Store LIKE/DISLIKE
        ↓
Analyze liked properties
        ↓
Update preference weights
        ↓
Generate better recommendations
```

This is enough to demonstrate a basic recommendation system without needing advanced AI/ML.

---

# 14. Recommendation Algorithm — Suggested Version

Start with explicit user preferences.

Then add interaction-based scoring.

For example:

```text
Final Score =
    Preference Score
    + Like-Based Similarity
    - Previously Disliked Penalty
```

Example:

```text
Preference Score       = 75
Similar to liked rooms = +15
Previously disliked    = -10

Final Score            = 80
```

Sort properties by final score.

---

# 15. Important Recommendation Rule

Never recommend a property that the user has already processed.

If:

```text
Property 1 → LIKE
Property 2 → DISLIKE
Property 3 → LIKE
```

then these properties should not appear again in the main recommendation feed.

Instead, they can be viewed through:

* Liked properties.
* Saved properties.
* History.

---

# 16. Frontend

The frontend should be responsible for:

* UI.
* Navigation.
* Forms.
* Property cards.
* Swipe interaction.
* Authentication screens.
* Profile screens.
* Saved properties.
* Landlord dashboard.
* API communication.

A suitable stack would be:

```text
React
+
React Router
+
CSS / Tailwind CSS
+
Axios or Fetch API
```

You can use another frontend framework if required by your course, but React is a good choice for this project.

---

# 17. Frontend Pages

Build these pages first.

## Authentication

```text
/login
/register
```

## Tenant

```text
/profile
/preferences
/home
/property/:id
/saved
/liked
```

## Landlord

```text
/landlord/dashboard
/landlord/properties
/landlord/properties/new
/landlord/properties/:id/edit
```

You can simplify the routes if necessary.

---

# 18. Backend

The backend should handle:

* Authentication.
* Authorization.
* User management.
* Profiles.
* Property management.
* Swipe interactions.
* Saved properties.
* Recommendation generation.

A good stack would be:

```text
Node.js
+
Express.js
+
PostgreSQL
```

For the ORM:

```text
Prisma
```

is a good option if you are comfortable learning it.

An alternative is:

```text
MongoDB + Mongoose
```

But because your data has clear relationships between users, properties, landlords, likes, and saved properties, **PostgreSQL is a strong choice**.

---

# 19. Suggested Backend Structure

```text
backend/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── models/
│   ├── utils/
│   ├── config/
│   └── app.js
│
├── prisma/
│   └── schema.prisma
│
├── .env
├── package.json
└── README.md
```

---

# 20. API Design

You don't need dozens of APIs.

Start with these.

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## User/Profile

```http
GET   /api/users/me
PUT   /api/users/me
GET   /api/users/me/preferences
PUT   /api/users/me/preferences
```

## Properties

```http
GET    /api/properties
GET    /api/properties/:id
POST   /api/properties
PUT    /api/properties/:id
DELETE /api/properties/:id
```

## Recommendations

```http
GET /api/recommendations
```

## Swipes

```http
POST /api/interactions
GET  /api/interactions
```

Example request:

```json
{
  "propertyId": 42,
  "action": "LIKE"
}
```

## Saved Properties

```http
POST   /api/saved
GET    /api/saved
DELETE /api/saved/:propertyId
```

---

# 21. Database Design

A simple relational structure could be:

```text
User
 │
 ├──── TenantProfile
 │
 └──── LandlordProfile
          │
          └──── Property
                    │
                    ├──── Interaction
                    │
                    └──── SavedProperty
```

Recommended tables:

```text
users
tenant_profiles
landlord_profiles
properties
interactions
saved_properties
property_images
```

You can initially store amenities as a JSON/array field instead of creating a separate amenities table.

Keep the database simple.

---

# 22. Authentication & Authorization

There should be two levels of authorization.

### Authentication

"Who is this user?"

Example:

```text
User logs in
      ↓
Server verifies credentials
      ↓
JWT/session created
      ↓
Frontend stores authentication state
```

### Authorization

"What is this user allowed to do?"

Example:

```text
Tenant
  ↓
Can browse properties
Can like/dislike
Can save properties

Landlord
  ↓
Can create properties
Can edit own properties
Can delete own properties
```

A landlord should not be able to edit another landlord's property.

---

# 23. Development Plan

Do **not** start by building the swipe animation.

Build the project in layers.

---

## Phase 1 — Project Setup

### Backend

* [ ] Create backend project.
* [ ] Initialize Node.js.
* [ ] Install Express.
* [ ] Configure environment variables.
* [ ] Connect PostgreSQL.
* [ ] Set up Prisma.
* [ ] Create initial database schema.
* [ ] Test database connection.

### Frontend

* [ ] Create React application.
* [ ] Configure routing.
* [ ] Create basic layout.
* [ ] Create API service.
* [ ] Configure environment variables.

At the end of this phase:

```text
Frontend ↔ Backend ↔ Database
```

should be working.

---

# 24. Phase 2 — Authentication

Implement authentication before anything else.

Build:

```text
Register
   ↓
Login
   ↓
Authentication
   ↓
Protected Routes
```

Backend:

* [ ] Register endpoint.
* [ ] Password hashing.
* [ ] Login endpoint.
* [ ] JWT/session.
* [ ] Authentication middleware.
* [ ] Role-based authorization.

Frontend:

* [ ] Register page.
* [ ] Login page.
* [ ] Logout.
* [ ] Protected routes.
* [ ] Authentication state.

Test this thoroughly before moving on.

---

# 25. Phase 3 — User Profiles

Implement tenant profile creation.

Create:

```text
Profile Page
```

and:

```text
Preferences Page
```

The user should be able to specify:

* Preferred location.
* Budget.
* Property type.
* Room type.
* Amenities.
* Move-in date.

Save these preferences in the database.

---

# 26. Phase 4 — Landlord Property Management

Now create the landlord side.

Build:

```text
Landlord Dashboard
        ↓
Add Property
        ↓
Property Form
        ↓
Database
```

Implement:

* [ ] Create property.
* [ ] View properties.
* [ ] Edit property.
* [ ] Delete/deactivate property.

At this stage, you should have enough data to test the recommendation system.

---

# 27. Phase 5 — Property Discovery

Create the tenant home screen.

Start with a normal list.

For example:

```text
Recommended Properties

Property A
Property B
Property C
Property D
```

Do **not** implement Tinder-style swiping yet.

First make sure:

```text
Backend
    ↓
GET /recommendations
    ↓
Frontend
    ↓
Property Cards
```

works correctly.

---

# 28. Phase 6 — Recommendation Engine

Implement your first recommendation algorithm.

Start with:

```text
Location
Budget
Property Type
Room Type
Amenities
```

Calculate a score for every property.

Then:

```text
Sort properties
        ↓
Highest score first
        ↓
Return recommendations
```

Test the algorithm independently before connecting it to the swipe system.

---

# 29. Phase 7 — Like/Dislike

Now implement interactions.

When the user clicks:

```text
❤️
```

send:

```http
POST /api/interactions
```

with:

```json
{
  "propertyId": 12,
  "action": "LIKE"
}
```

For a dislike:

```json
{
  "propertyId": 12,
  "action": "DISLIKE"
}
```

The backend should save the interaction.

---

# 30. Phase 8 — Saved Properties

Implement:

```text
Save
Unsave
View Saved Properties
```

This gives users a way to compare interesting properties later.

---

# 31. Phase 9 — Tinder-Style UI

Only after everything above works should you implement the actual swipe experience.

Use a card stack:

```text
        ┌───────────────┐
        │   Property    │
        │               │
        │     IMAGE     │
        │               │
        │ ₹8,000        │
        │ Ghaziabad     │
        └───────────────┘
```

Dragging:

```text
← LEFT                     RIGHT →
DISLIKE                      LIKE
```

You can implement this using a React swipe/card library or your own pointer/touch handling.

For a PBL, a reliable library is preferable to spending days debugging gesture physics.

---

# 32. Phase 10 — Improve Recommendations Using Swipes

Once likes/dislikes are being stored, modify the recommendation algorithm.

Example:

User likes:

```text
Property A
Property C
Property F
```

Analyze common characteristics:

```text
PG
Single Room
₹7,000-₹9,000
WiFi
Near Metro
```

Increase their weights.

The next recommendation should prioritize properties with these characteristics.

This gives you a simple form of **behavior-based personalization**.

---

# 33. Phase 11 — UI/UX Polish

Only after the functionality works:

* [ ] Improve property cards.
* [ ] Add animations.
* [ ] Add loading states.
* [ ] Add empty states.
* [ ] Add error messages.
* [ ] Add responsive design.
* [ ] Improve navigation.
* [ ] Add confirmation dialogs.
* [ ] Add image previews.
* [ ] Add filters.

Do not spend most of your project time on CSS before the backend works.

---

# 34. Recommended Order of Implementation

The entire project can be summarized as:

```text
1. Project setup
       ↓
2. Database
       ↓
3. Authentication
       ↓
4. User profiles
       ↓
5. Landlord properties
       ↓
6. Property API
       ↓
7. Basic recommendations
       ↓
8. Property discovery UI
       ↓
9. Like/dislike
       ↓
10. Saved properties
       ↓
11. Swipe UI
       ↓
12. Behavior-based recommendations
       ↓
13. Testing
       ↓
14. UI polish
       ↓
15. Deployment
```

This is the order I recommend following.

---

# 35. What You Should NOT Implement Right Now

Because this is a PBL, avoid scope creep.

Do **not** initially implement:

* Real-time chat.
* Online rent payments.
* Complex AI/ML.
* Background verification.
* Aadhaar/identity verification.
* Map-based property search.
* Video calls.
* Booking system.
* Legal agreements.
* Automated landlord verification.
* Advanced notification systems.
* Complex admin panel.
* Microservices.
* Recommendation models requiring large datasets.

These can all be future scope.

---

# 36. MVP Definition

Your project should be considered complete when a user can perform this flow:

```text
Register
   ↓
Login
   ↓
Create Profile
   ↓
Enter Preferences
   ↓
Get Recommended Properties
   ↓
View Property
   ↓
Swipe Right / Like
   ↓
Swipe Left / Dislike
   ↓
Save Interesting Properties
   ↓
View Saved Properties
   ↓
Get Better Recommendations
```

And a landlord should be able to:

```text
Register
   ↓
Login
   ↓
Create Property
   ↓
Edit Property
   ↓
Delete/Deactivate Property
```

If these flows work properly, you have a strong PBL.

---

# 37. Future Scope

These features can be mentioned in your project report but should **not** be implemented in the first version.

## 37.1 Real-Time Chat

Allow tenants and landlords to communicate directly after a user shows interest.

```text
Tenant ↔ Landlord
```

Could use WebSockets/Socket.IO.

---

## 37.2 Location & Maps

Integrate maps to show:

* Exact/general property location.
* Distance from college.
* Distance from metro stations.
* Distance from workplace.
* Nearby restaurants and shops.

---

## 37.3 Advanced Recommendation System

Replace the rule-based recommendation engine with:

* Machine learning.
* Collaborative filtering.
* Content-based filtering.
* Hybrid recommendation models.

Eventually:

```text
User behavior
     +
Property characteristics
     +
Similar users
     ↓
ML Recommendation Model
```

---

## 37.4 Property Verification

Introduce verified landlords and properties.

Example:

```text
✓ Verified Owner
✓ Verified Property
✓ Verified Images
```

This could help reduce fraudulent listings.

---

## 37.5 Booking System

