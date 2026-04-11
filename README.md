# Shopverse ⚡

A full-stack e-commerce web application built with React, Redux Toolkit, Firebase, and Tailwind CSS. Features a dark-themed modern UI, role-based authentication, a real-time product catalogue powered by Firestore, persistent cart, and a full admin dashboard with Cloudinary image uploads.

---

## Features

### Storefront
- Product listing with search, category filter, and sort (price, featured)
- Product detail page with stock status
- Skeleton loading states
- Fully responsive design

### Cart & Checkout
- Add, remove, increase/decrease quantity
- Cart persists across page refreshes via `localStorage`
- 3-step checkout (Shipping → Payment → Confirm)
- Orders saved to Firestore on completion

### Authentication (Firebase Auth)
- Email/password signup and login
- Protected routes — checkout and profile require login
- Role-based access — admin users are redirected to the dashboard
- User documents auto-created in Firestore on first login/signup

### Admin Dashboard
- View all products in a table
- Add new products with Cloudinary image upload or URL paste
- Edit and delete existing products
- Stats: total products, categories, low stock count
- Admin role is set manually in Firestore

### User Profile
- Real order history fetched from Firestore
- Cart summary with quick checkout link
- Account details

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8 |
| Routing | React Router DOM v7 |
| State | Redux Toolkit + React Redux |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Auth & DB | Firebase v12 (Auth + Firestore) |
| Images | Cloudinary (unsigned upload) |
| Fonts | Syne, DM Sans (Google Fonts) |

---

## Project Structure

```
src/
├── components/
│   ├── AdminRoute.jsx       # Route guard for admin-only pages
│   ├── Footer.jsx
│   ├── Navbar.jsx           # Role-aware nav (cart hidden for admin)
│   ├── ProductCard.jsx      # Card with Add to Cart (hidden for admin)
│   ├── ProtectedRoute.jsx   # Route guard for logged-in users
│   ├── SkeletonCard.jsx     # Shimmer loading placeholder
│   └── Toast.jsx            # Success/error notifications
├── pages/
│   ├── AdminDashboard.jsx   # Product CRUD + Cloudinary upload
│   ├── Cart.jsx
│   ├── Checkout.jsx         # 3-step checkout, saves order to Firestore
│   ├── Home.jsx             # Product grid with filters
│   ├── Login.jsx
│   ├── ProductDetail.jsx
│   ├── Profile.jsx          # Order history + cart summary
│   └── Signup.jsx
├── redux/
│   ├── store.js             # localStorage persistence for cart
│   └── slices/
│       ├── authSlice.js     # user, role, loading, error
│       ├── cartSlice.js     # items, qty, selectors
│       └── productsSlice.js # Firestore fetch with mock fallback
├── firebase/
│   ├── config.js            # Firebase app init (Auth + Firestore)
│   └── firestore.js         # All Firestore read/write functions
├── cloudinary/
│   └── config.js            # Cloudinary upload helper
├── data/
│   └── products.js          # Mock product data (fallback)
├── hooks/
│   └── useToast.js
└── App.jsx                  # Routes + Firebase auth listener
```

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/m-asadusman/shopverse.git
cd shopverse
npm install
```

### 2. Configure Firebase

Create a project at [console.firebase.google.com](https://console.firebase.google.com) then replace the placeholder values in `src/firebase/config.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_MSG_ID",
  appId: "YOUR_APP_ID"
};
```

In Firebase Console:
- **Authentication** → Sign-in method → Enable **Email/Password**
- **Firestore Database** → Create database → Start in test mode

### 3. Configure Cloudinary

Create a free account at [cloudinary.com](https://cloudinary.com), then fill in `src/cloudinary/config.js`:

```js
export const cloudinaryConfig = {
  cloudName: "YOUR_CLOUD_NAME",
  uploadPreset: "YOUR_UPLOAD_PRESET", // must be set to Unsigned
};
```

To create an upload preset: Cloudinary Dashboard → Settings → Upload → Upload Presets → Add preset → set Signing Mode to **Unsigned**.

### 4. Set Firestore security rules

In Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
    }
  }
}
```

### 5. Run the app

```bash
npm run dev
```

---

## Setting Up an Admin Account

1. Sign up normally through the app
2. Go to Firebase Console → Firestore → `users` collection
3. Find your document (it will be your UID)
4. Add a field: `role` = `"admin"` (string)
5. Log out and log back in — the Admin link will appear in the navbar

---

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build locally
```

---

## Deployment

The app builds to a static `dist/` folder. Deploy to any static host:

**Vercel** — connect your GitHub repo, Vercel auto-detects Vite and deploys on every push.

**Netlify** — drag and drop the `dist/` folder, or connect via Git with build command `npm run build` and publish directory `dist`.

---

## Environment Notes

- Cart state is persisted in `localStorage` under the key `shopverse_cart`
- Products are loaded from Firestore on every page load. If Firestore is not configured or returns no results, the app falls back to the mock data in `src/data/products.js`
- Admin users do not see the cart, Add to Cart buttons, or the Profile page
