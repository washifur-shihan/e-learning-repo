# 🎓 E-Learning Platform (LMS)

![Next.js](https://img.shields.io/badge/Next.js-13+-black?style=flat&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=flat&logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-Caching-red?style=flat&logo=redis)

A full-stack, comprehensive E-Learning Management System built with **Next.js (App Router)** and **Node.js/Express**. This platform provides a seamless learning experience for students and robust management capabilities for administrators. It utilizes modern technologies including RTK Query for state management, Redis for high-performance caching, and JWT for secure authentication.

---

## 🚀 Features & How They Work

### 👨‍🎓 For Students
*   **Authentication & Authorization:** Secure registration and login using OTP verification via Email (Nodemailer). Supports Social Logins (Google & GitHub) powered by NextAuth.
*   **Course Browsing & Discovery:** Browse available courses, filter by categories, and view comprehensive course details including syllabus, instructor info, and student reviews.
*   **Interactive Video Player:** Built-in secure video player to consume course content effectively.
*   **Q&A and Reviews:** Students can ask questions on specific course lectures, reply to threads, and leave course ratings/reviews.
*   **Profile Management:** Update personal information, manage passwords, and upload custom avatars.

### 👨‍💼 For Administrators (Dashboard)
*   **/admin Route access mail:** washifur.mail@gmmail.com
pass:123456
*   **Course Management Engine:** Create, update, and delete courses. Upload course thumbnails, set pricing, and build course curriculum with video links and textual content.
*   **User & Role Management:** View all registered users, update user roles (e.g., promote a user to `admin`), and manage platform access.
*   **Order & Revenue Tracking:** View all purchases and track revenue over time.
*   **Advanced Analytics:** Interactive charts powered by Recharts to visualize User Growth, Course Enrollments, and Financial Analytics.
*   **Site Customization:** Manage platform layout elements like the Hero section, FAQ, and Categories dynamically from the admin panel.

---

## 🛠️ Tech Stack

**Frontend Architecture:**
*   **Framework:** Next.js 13+ (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS & Custom CSS
*   **State Management:** Redux Toolkit & RTK Query
*   **Forms & Validation:** Formik & Yup
*   **Authentication UI:** NextAuth.js

**Backend Architecture:**
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Language:** TypeScript
*   **Database:** MongoDB with Mongoose
*   **Caching:** Redis (Upstash / Local)
*   **Authentication:** JWT (Access & Refresh Tokens stored in HTTP-only cookies)
*   **Email Services:** Nodemailer (EJS Templates)

---

## 🔌 API Endpoints Reference

The backend exposes a secure REST API. Most endpoints require authentication via JWT. Admin routes have an additional role-based middleware guard to prevent unauthorized access.

### 🔐 Authentication
*   `POST /api/v1/registration`: Register a new user and trigger a 4-digit OTP email.
*   `POST /api/v1/activate-user`: Verify the OTP to activate the user account.
*   `POST /api/v1/login`: Authenticate and set HttpOnly cookies for `access_token` and `refresh_token`.
*   `GET /api/v1/logout`: Clear authentication cookies.
*   `POST /api/v1/social-auth`: Handle Google/GitHub OAuth logins and database synchronization.
*   `GET /api/v1/refresh`: Refresh the access token using the valid refresh token.

### 📚 Course Management
*   `POST /api/v1/create-course` **[Admin]**: Create a new course with details and curriculum.
*   `PUT /api/v1/edit-course/:id` **[Admin]**: Update existing course metadata or content.
*   `DELETE /api/v1/delete-course/:id` **[Admin]**: Delete a course.
*   `GET /api/v1/get-courses`: Fetch publicly available courses.
*   `GET /api/v1/get-course/:id`: Fetch public details of a specific course.
*   `GET /api/v1/get-course-content/:id`: Fetch restricted video/text content (only accessible to users who purchased the course).
*   `GET /api/v1/get-admin-courses` **[Admin]**: Retrieve all courses (including drafts) for the dashboard.

### 💬 Engagement & Reviews
*   `PUT /api/v1/add-question`: Ask a question in a specific course lecture.
*   `PUT /api/v1/add-answer`: Reply to an existing question.
*   `PUT /api/v1/add-review/:id`: Submit a rating and review for an enrolled course.
*   `PUT /api/v1/add-reply`: Admins can reply to course reviews.

### 👥 User Management
*   `GET /api/v1/me`: Retrieve current authenticated user profile.
*   `PUT /api/v1/update-user-info`: Update name, email, etc.
*   `PUT /api/v1/update-user-password`: Securely change the password.
*   `PUT /api/v1/update-user-avatar`: Upload and set a new profile picture.
*   `GET /api/v1/get-users` **[Admin]**: List all users.
*   `PUT /api/v1/update-user-role` **[Admin]**: Change user permissions (e.g., User -> Admin).
*   `DELETE /api/v1/delete-user/:id` **[Admin]**: Remove a user from the platform.

### 🛒 Orders & Payments
*   `POST /api/v1/create-order`: Create a new purchase record.
*   `GET /api/v1/get-orders` **[Admin]**: Retrieve all platform transactions.
*   `GET /api/v1/payment/stripepublishablekey`: Get public key for Stripe frontend initialization.
*   `POST /api/v1/payment/process`: Create a Stripe payment intent.

### 📈 Analytics & Platform Data [Admin]
*   `GET /api/v1/get-users-analytics`: Last 12 months user registration data.
*   `GET /api/v1/get-courses-analytics`: Last 12 months course creation data.
*   `GET /api/v1/get-orders-analytics`: Last 12 months revenue and order data.
*   `POST /api/v1/create-layout` / `PUT /api/v1/edit-layout`: Manage dynamic platform content (Hero, FAQ, Categories).

---

## 💻 Getting Started (Local Development)

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local instance or MongoDB Atlas)
*   Redis (Local instance or Upstash)
*   Stripe Account (for payments)
*   Cloudinary Account (for image uploads)

### 1. Server Setup (Backend)

1. Navigate to the server directory:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file in the `server` directory with the following variables:
   ```env
   PORT=8000
   ORIGIN=http://localhost:3000
   NODE_ENV=development
   
   # Database
   DB_URI=your_mongodb_connection_string
   REDIS_URL=your_redis_connection_string
   
   # Cloudinary
   CLOUD_NAME=your_cloudinary_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_SECRET_KEY=your_cloudinary_secret_key
   
   # JWT & Authentication
   ACTIVATION_SECRET=your_random_string
   ACCESS_TOKEN=your_random_string
   REFRESH_TOKEN=your_random_string
   ACCESS_TOKEN_EXPIRE=5
   REFRESH_TOKEN_EXPIRE=3
   
   # Emails
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SERVICE=gmail
   SMTP_MAIL=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   
   # Payments (Stripe)
   STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

3. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Client Setup (Frontend)

1. Navigate to the client directory:
   ```bash
   cd client
   npm install
   ```

2. Create a `.env` file in the `client` directory:
   ```env
   NEXT_PUBLIC_SERVER_URI=http://localhost:8000/api/v1
   NEXT_PUBLIC_SOCKET_SERVER_URI=http://localhost:8000
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_random_string
   GITHUB_CLIENT_ID=your_github_id
   GITHUB_CLIENT_SECRET=your_github_secret
   GOOGLE_CLIENT_ID=your_google_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` to view the platform.

---

## 🛠️ How to Add a New Admin Feature (Example: New Analytics Route)

To demonstrate how the system architecture supports extending functionality, here is the workflow to add a new Admin feature:

1. **Database Model (Server):** Create or update a Mongoose model in `server/models/`.
2. **Controller (Server):** Add a function in `server/controllers/` to handle the logic.
3. **Route Guarding (Server):** Add the route in `server/routes/` and protect it using `isAuthenticated` and `authorizeRoles("admin")` middleware.
4. **RTK Query (Client):** Define a new query or mutation in `client/redux/features/api/apiSlice.ts` or a specialized feature slice.
5. **UI Integration (Client):** Create a new React component under `client/app/admin/` and fetch the data using the RTK Query hook.
