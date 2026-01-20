# Cocolytics

A full-stack analytics application with Vue.js frontend (PWA) and Node.js backend.

## 🚀 Features

- **Vue.js 3** - Modern frontend framework with Composition API
- **Node.js + Express** - Powerful backend API
- **PWA Support** - Install the app on any device
- **Offline Support** - Works without internet connection
- **Responsive Design** - Works on desktop and mobile

## 📁 Project Structure

```
Cocolytics/
├── frontend/          # Vue.js PWA frontend
│   ├── src/
│   │   ├── views/     # Page components
│   │   ├── App.vue    # Root component
│   │   ├── main.js    # Entry point
│   │   └── style.css  # Global styles
│   ├── public/        # Static assets & PWA icons
│   └── vite.config.js # Vite + PWA configuration
│
├── backend/           # Node.js backend
│   ├── server.js      # Express server
│   ├── .env           # Environment variables
│   └── package.json   # Dependencies
│
└── README.md
```

## 🛠️ Installation

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

The API will start on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will start on `http://localhost:5173`

## 📱 Installing the PWA

Once the app is running in your browser:

1. **Chrome/Edge**: Click the install icon in the address bar, or use the "Install App" button in the navbar
2. **Safari (iOS)**: Tap Share → "Add to Home Screen"
3. **Android**: Tap the menu → "Add to Home Screen" or "Install app"

## 🔧 Available Scripts

### Backend

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/api/health` | Health check |
| GET | `/api/data` | Sample data |

## 🔒 Environment Variables

Create a `.env` file in the backend folder:

```env
PORT=3000
NODE_ENV=development
```

## 📄 License

MIT License - feel free to use this project for your own purposes.