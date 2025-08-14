DocBook - Doctor Appointment Booking App

A **full-stack, role-based** web application for booking doctor appointments.  
Supports **patients** searching & booking doctors and **doctors** managing appointments, profiles, and prescriptions — with data stored on a hosted **JSON Server API**.

## 🌐 Live Links

- **Web App**: [https://doctor-booking-app-final1.vercel.app/auth](https://doctor-booking-app-final1.vercel.app/auth)  
- **API (Render)**: [https://server-side-api-pelg.onrender.com](https://server-side-api-pelg.onrender.com)  

The API stores:
- Doctors  
- Patients (Users)  
- Appointments  
- Prescriptions  
- Reviews  

---

## ✨ Features

### For Patients
- Search and filter doctors by specialty or consultation mode (**In-Clinic / Online / Call**)
- Book appointments with date/time selection
- View upcoming and past appointments
- Manage personal profile
- Leave ratings and reviews for doctors

### For Doctors
- Dashboard with **Today’s / Upcoming / Past** appointments
- Accept, reject, or **reschedule** appointments
- Manage professional profile and availability
- Create, save, and share prescriptions (with QR code option)
- View patient details and feedback

### Common
- Role-based authentication from a **single login/signup page** (with "Are you a doctor?" toggle)
- Real-time form validation with error messages
- Toast notifications for feedback
- Responsive UI with modern Tailwind design

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (React) with TypeScript  
- **Styling**: Tailwind CSS, shadcn/ui  
- **State Management**: React Context API  
- **Forms & Validation**: React Hook Form + Yup  
- **Notifications**: React-Toastify  
- **Backend**: JSON Server (hosted on Render)  
- **Icons**: Lucide Icons  

---

## 🚀 Quick Setup Guide (Local Development)

### 1. Install dependencies
```bash
npm install
```

### 2. Set API URL
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_BASE_URL=https://server-side-api-pelg.onrender.com
```

### 3. Run the Next.js app
```bash
npm run dev
```
Visit **http://localhost:3000**

*(Optional)* Run JSON Server locally:
```bash
npm install -g json-server
json-server --watch db.json --port 3001
```
Then update `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

---

## 🗝 Default Login Credentials

### Doctor
- Email: `sarah@example.com`
- Password: `26272627`

### Patient
- Email: `john@example.com`
- Password: `11221122`

---

## 📂 Project Structure

```
app/
  auth/               # Shared login/signup
  (doctor)/           # Doctor dashboard & management
  (patient)/          # Patient dashboard & booking
components/           # UI components (includes shadcn/ui)
contexts/             # Auth context
lib/                  # API helpers & utilities
public/               # Static assets
styles/               # Tailwind styles
```

---

## 📡 API Endpoints (Hosted on Render)

Base URL: `https://server-side-api-pelg.onrender.com`

| Endpoint            | Method | Description |
|--------------------|--------|-------------|
| `/doctors`         | GET    | List all doctors |
| `/patients`        | GET    | List all patients |
| `/appointments`    | GET/POST/PATCH | Manage appointments |
| `/prescriptions`   | GET/POST | Manage prescriptions |
| `/reviews`         | GET/POST | Add & fetch reviews |

---

## 🩺 Features Implemented

✅ Role-based authentication (Doctor / Patient)  
✅ Doctor search & filtering  
✅ Appointment booking & rescheduling  
✅ Prescription generation & QR linking  
✅ Patient & doctor dashboards  
✅ Profile management  
✅ Reviews & ratings  
✅ Form validation & toast notifications  
✅ Mobile-friendly UI  

---

## 🛠 Troubleshooting

**"Server not responding" error:**  
- Render API may be sleeping — wait 30–60 seconds after first request.  
- Check `NEXT_PUBLIC_API_BASE_URL` is correct in `.env.local`.

**"Invalid email/password":**  
- Use correct credentials (see above).  
- Ensure the role toggle matches your account type.

**Local server issues:**  
- Stop all running servers (`Ctrl+C`)  
- Delete `node_modules` & reinstall:  
  ```bash
  rm -rf node_modules
  npm install
  ```

---

## 📦 Deployment

**Frontend**: Deployed on **Vercel**  
**Backend**: JSON Server hosted on **Render**  

---

## 📜 License
MIT © Anas Ali
