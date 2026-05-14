#  ScrapIt — Recycling Pickup Scheduling Platform

ScrapIt is a full-stack MERN web application designed to encourage sustainable waste management by allowing users to schedule recycling pickups, upload recyclable waste images, earn reward points, and redeem coupons.

The platform also includes a powerful admin dashboard for managing pickup requests, monitoring users, and tracking recycling activities.

---

#  Problem Statement

Improper waste disposal contributes significantly to environmental pollution. Many households and businesses lack easy access to organized recycling systems.

ScrapIt provides a smart solution that:
- connects users with recycling pickup services
- incentivizes recycling through reward points
- promotes environmental sustainability
- digitizes waste management workflows

---

#  Features

##  User Features

### Authentication
- User registration
- Secure login/logout
- JWT-based authentication
- Password hashing with bcryptjs

### Recycling Pickup
- Schedule recycling pickups
- Select recyclable waste type
- Enter waste quantity/weight
- Choose pickup date
- Upload recyclable waste images

### Pickup Tracking
Users can track pickup request status:
- Pending
- Approved
- Completed
- Rejected

### Rewards System
- Earn points based on recyclable waste
- View total reward points
- View point history
- Redeem coupons using points

### Profile Management
- Update address
- Update phone number
- Manage personal information

---

##  Admin Features

### Admin Dashboard
- View all pickup requests
- Approve/reject requests
- Update pickup statuses
- Filter requests by status
- Monitor user activities

### Waste Management
- View uploaded recyclable waste images
- Track completed pickups
- Manage recycling workflow

### User Monitoring
- View registered users
- Access contact information
- Track recycling participation

---

#  Reward Point System

Points are automatically calculated based on the type of recyclable waste.

| Waste Type | Points Awarded |
|------------|----------------|
| Plastic | 10 points/kg |
| Paper | 5 points/kg |
| Metal | 15 points/kg |

### Coupon Redemption
Users can:
- redeem coupons using earned points
- receive unique coupon codes
- track redeemed rewards

---

#  Tech Stack

## Frontend
- React
- React Router DOM
- Axios
- Bootstrap / CSS

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Zod Validation

## Cloud Services
- MongoDB Atlas
- Cloudinary

---

#  Project Structure

```bash
ScrapIt/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── README.md
└── .gitignore
```

---
# ⭐ Support

If you found this project useful:
- Star the repository
- Fork the project
- Share feedback
- Contribute improvements

---
