# 📱 MOBILE ACCESS QUICK FIX

## Problem: "Can't be reached" on mobile

## ✅ SOLUTION (3 Steps)

### Step 1: RESTART Dev Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 2: CHECK Terminal Output

Look for this line:

```
➜  Local:   http://localhost:5173/login
➜  Network: http://192.168.1.100:5173/login  👈 USE THIS
```

### Step 3: TEST on Mobile

1. Connect phone to **same WiFi** as computer
2. Open phone browser
3. Type the **Network URL** from terminal
4. Should load login page!

---

## ⚡ If Still Can't Reach

### Option 1: Allow Firewall (Windows)

Run as Administrator:

```bash
# Right-click → Run as administrator
allow-firewall.bat
```

Or manually:

```powershell
# Run PowerShell as Administrator
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### Option 2: Find Your IP Manually

**Windows:**
```bash
ipconfig
```
Look for: `IPv4 Address. . . . . : 192.168.x.x`

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

Then use: `http://192.168.x.x:5173/login`

### Option 3: Use QR Code

1. Click 📱 button (bottom-right)
2. Scan QR code with phone camera
3. Should open automatically

---

## 🔍 Checklist

- [ ] Dev server restarted
- [ ] Terminal shows "Network:" line
- [ ] Phone on same WiFi
- [ ] Firewall allows port 5173
- [ ] Backend running (port 3000)

---

## 📚 More Help

- Full troubleshooting: [FIX_CANT_REACH.md](FIX_CANT_REACH.md)
- QR code guide: [QR_CODE_GUIDE.md](QR_CODE_GUIDE.md)

---

## 🌐 Alternative: Use Ngrok

If local network doesn't work, use ngrok for public access:

```bash
npx ngrok@latest http 5173
```

Copy the ngrok URL and use it on any device anywhere!
