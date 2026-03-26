# Smart Exam and Performance Analyzer

A full-stack web application built using the MERN stack (MongoDB, Express, React, Node.js) with features tailormade for a robust examination process. The goal of this application is to support teachers in assessing student performance directly while ensuring fair testing via anti-cheat checks.

## 🚀 Features

### **Student View**
- **Authentication**: Register, Login, JWT verification.
- **View Exams**: See active tests assigned by teachers.
- **Attempt Exams**: Participate in timed MCQ tests.
- **Live Timer**: Configured dynamic countdown clock.
- **Anti-Cheating Mechanisms**: Tab switching tracking (auto-submit on multiple strikes) and right-click/copy-paste disabling.
- **Results & Recommendations**: Instant score report after submission outlining weak areas and providing feedback.

### **Teacher View**
- **Exam Builder**: Interactive step-by-step wizard to create an exam outline and attach rich MCQs with negative marking toggles.
- **Performance Dashboard**: Overview of exam participants with pie charts and line trackers denoting pass/fail metrics.
- **Global Leaderboards**: Identify the highest scorers directly from the analytics dashboard.

### **Universal**
- Dark and Light mode themes toggle.
- Secure HTTP and robust routing with Context based protection.

---

## 🛠 Project Structure

```bash
📦 smart-exam-analyzer
 ┣ 📂 backend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 config          # MongoDB logic
 ┃ ┃ ┣ 📂 controllers     # Authentication, Exam, Submission logic
 ┃ ┃ ┣ 📂 middleware      # Error and JWT auth wrappers
 ┃ ┃ ┣ 📂 models          # Mongoose schemas
 ┃ ┃ ┣ 📂 routes          # Express REST paths
 ┃ ┃ ┣ 📂 utils           # JWT Generation
 ┃ ┃ ┗ 📜 server.js       # Main server file
 ┃ ┣ 📜 .env              # Environment vars
 ┃ ┣ 📜 package.json
 ┗ 📂 frontend
   ┣ 📂 src
   ┃ ┣ 📂 assets
   ┃ ┣ 📂 components      # Navbar, ChartComponent, ExamCard
   ┃ ┣ 📂 context         # Global Auth Context API
   ┃ ┣ 📂 pages           # Login, Registry, Dashboard, CreateExam...
   ┃ ┣ 📂 services        # Axios API Interceptors
   ┃ ┣ 📜 App.jsx
   ┃ ┣ 📜 index.css       # Tailwind entry point
   ┃ ┗ 📜 main.jsx
   ┣ 📜 tailwind.config.js
   ┣ 📜 vite.config.js
   ┗ 📜 package.json
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- **Node.js**: `v16.0.0` or higher
- **MongoDB**: A local or Atlas Cluster instance.

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install necessary dependencies:
   ```bash
   npm install
   ```
3. Look into the `.env` file in the `backend` folder and replace `MONGODB_URI` with your own MongoDB Cloud Atlas connection string.
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart_exam_analyzer?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   ```
4. Start the backend Node server using `nodemon`:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a separate terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Vite, React, and Tailwind dependencies:
   ```bash
   npm install
   ```
3. Run the development environment:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:3000` or `http://localhost:5173`).

---

## 🔑 Default Roles to Testing

To test the multi-role feature safely:
1. Register a new user at `/register`. Choose **Teacher**. Use this to scaffold an exam from `/create-exam`. 
2. Open an incognito tab and Register another user but select **Student**.
3. With the student, click **Attempt Exam** on the dashboard and observe the flow. 

---

_Project designed meticulously using Tailwind CSS, Chart.js, and MongoDB MVC Architecture._
