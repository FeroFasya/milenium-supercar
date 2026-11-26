# Milenium Supercar — Showroom Catalog & Admin Dashboard

Dynamic luxury & supercar showroom web catalog built for **Milenium Supercar** (Bursa Mobil Bintaro Sektor 7, Tangerang Selatan).

## Features
- **Luxury Dark Landing Page**: Hero showcase video, brand marquee, live vehicle catalog, showroom services (Import, New Car, Trade-In, Consignment), unit guarantees, and Google Maps embed.
- **Dynamic Vehicle Catalog**: Real-time inventory powered by Firebase Firestore with `READY` / `SOLD` status badges, expandable technical specs, fullscreen multi-photo gallery lightbox, and pre-filled WhatsApp inquiry links per unit.
- **Mobile-First Admin Dashboard (`/admin`)**: Secured with Firebase Authentication (Email/Password + Reset Password), 1-click `READY`/`SOLD` status toggle, soft-limit capacity guard (up to 35 units & 15 photos/unit), and client-side WebP auto-compression before uploading to Cloudinary.

## Tech Stack
- **Frontend**: Vue 3 (Composition API), Vite, Vue Router, Tailwind CSS
- **Database & Auth**: Firebase Firestore & Firebase Authentication
- **Media Storage & CDN**: Cloudinary (Unsigned Upload Preset + browser WebP compression)
- **Hosting & CI/CD**: Netlify (`mileniumsupercar.com`)

## Local Setup
```bash
npm install
cp .env.example .env
# Fill in your Firebase & Cloudinary credentials in .env
npm run dev
```
