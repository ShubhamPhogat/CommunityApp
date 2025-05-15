Here are two README files for your client and server side projects:

---

# Server Side README - CommunityApp Backend

## Overview
This is the backend server for the CommunityApp, a SaaS platform that allows users to create communities and manage members. Built with Node.js and MongoDB.

## Repository Link
[GitHub Repository](https://github.com/ShubhamPhogat/CommunityApp)

## Client Side
[Client Side Application](https://github.com/ShubhamPhogat/communityApp-Client)

## API Endpoints

### Authentication
- `POST /v1/auth/signup` - User registration
- `POST /v1/auth/signin` - User login
- `GET /v1/auth/me` - Get current user details

### Community
- `POST /v1/community` - Create a community
- `GET /v1/community` - Get all communities
- `GET /v1/community/:id/members` - Get all members of a community
- `GET /v1/community/me/owner` - Get communities owned by current user
- `GET /v1/community/me/member` - Get communities joined by current user

### Member
- `POST /v1/member` - Add a member to community
- `DELETE /v1/member/:id` - Remove a member from community

### Role
- `POST /v1/role` - Create a role
- `GET /v1/role` - Get all roles

## Technologies Used
- Node.js
- Express.js
- MongoDB (with Mongoose)
- @theinternetfolks/snowflake for ID generation
- JWT for authentication
- Validator for request validation

## Screenshots
![image](https://github.com/user-attachments/assets/adf68013-290f-4ec6-8dd6-df7796e8eccd)  
![image](https://github.com/user-attachments/assets/af704ff9-b555-49de-ad24-9b237d82f89e)  
![image](https://github.com/user-attachments/assets/f042995d-a800-44f2-8167-48417abf7ded)  
![image](https://github.com/user-attachments/assets/1cf1a340-b372-4223-ad40-b53bb308fec1)

## Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` and add a monogdb connection stirng with name MONGODB_URL and jwt secret with name JWT_SECRET
4. Run the server: `npm start`

---

