# 🔧 TROUBLESHOOTING: "Can't Be Reached" Error

## ✅ FIXED! Here's What Changed

I've configured your dev server to accept connections from mobile devices on your network.

---

## 🚀 IMPORTANT: Restart Your Dev Server

**You MUST restart your dev server for this to work:**

```bash
# Stop your current dev server (Ctrl+C)
# Then start it again:
npm run dev
```

**Look for this output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/login
➜  Network: http://192.168.1.100:5173/login    <-- USE THIS IP!
```

**The "Network" line shows your local IP!**

---

## 📱 How to Access from Mobile

### **Step 1: Find Your Network IP**

After running `npm run dev`, look for the **Network:** line in the terminal:

```
➜  Network: http://192.168.1.100:5173/login
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
           This is your mobile access URL!
```

### **Step 2: On Your Phone**

1. **Make sure your phone is on the SAME WiFi** as your computer
2. Open your phone's browser (Safari/Chrome)
3. Type the Network URL: `http://192.168.1.100:5173/login`
4. Press Enter
5. Login page should load!

### **Step 3: Use QR Code**

1. Click the **📱 button** on your computer's login page
2. The QR code will now show the correct Network IP
3. Scan with your phone camera
4. Page opens automatically!

---

## 🔍 If You Don't See "Network:" Line

If the terminal doesn't show the Network line, find your IP manually:

### **Windows:**
```bash
ipconfig
```
Look for: **IPv4 Address: 192.168.x.x**

### **Mac/Linux:**
```bash
ifconfig
```
Look for: **inet 192.168.x.x**

Then visit: `http://YOUR_IP:5173/login` on your phone

---

## ✅ Checklist

Before trying on mobile:

- [ ] **Restarted dev server** (npm run dev)
- [ ] **Saw "Network:" line** in terminal output  
- [ ] **Phone on same WiFi** as computer
- [ ] **Used Network URL** (not localhost)
- [ ] **Firewall allows port 5173** (see below)

---

## 🔥 Firewall Issue?

If still can't connect, your firewall might be blocking port 5173.

### **Windows Firewall:**

**Option 1: Allow Node.js**
1. Windows Security → Firewall → Allow an app
2. Find "Node.js" and check both Private and Public
3. Click OK

**Option 2: Allow Port 5173**
Run PowerShell as Administrator:
```powershell
New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### **Test Firewall:**
From your phone browser, try: `http://YOUR_IP:5173/login`

If it loads → Firewall is OK ✅  
If timeout → Firewall blocking ❌

---

## 🧪 Quick Test

### **Test 1: Can you access from your computer?**
```
Visit: http://localhost:5173/login
```
✅ Works → Backend/Frontend OK  
❌ Doesn't work → Check if dev server is running

### **Test 2: Can you access via Network IP on your computer?**
```
Visit: http://192.168.1.100:5173/login (use your Network IP)
```
✅ Works → Server listening on network ✅  
❌ Doesn't work → Restart dev server

### **Test 3: Can you access from mobile?**
```
Visit same Network IP on phone browser
```
✅ Works → Perfect! 🎉  
❌ Doesn't work → Check WiFi/Firewall

---

## 📋 Example Terminal Output (What You Should See)

```bash
C:\COCOLYTICS\Cocolytics\frontend> npm run dev

> cocolytics-frontend@1.0.0 dev
> vite


  VITE v5.0.10  ready in 423 ms

  ➜  Local:   http://localhost:5173/login
  ➜  Network: http://192.168.1.100:5173/login    👈 COPY THIS
  ➜  press h + enter to show help
```

**Copy the Network URL and use it on your phone!**

---

## 🌐 Alternative: Use Ngrok (Works From Anywhere)

If local network doesn't work, use ngrok:

```bash
# Terminal 2 (while dev server is running)
npx ngrok@latest http 5173
```

Ngrok gives you a public URL like:
```
https://abc123.ngrok-free.dev
```

Use this on ANY device, anywhere! No same WiFi needed.

---

## 💡 Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `localhost` on phone | Use Network IP instead |
| Different WiFi networks | Connect both to same WiFi |
| Forgot to restart server | Run `npm run dev` again |
| Firewall blocking | Allow port 5173 |
| Wrong IP address | Check terminal "Network:" line |
| Backend not running | Start backend on port 3000 |

---

## 🎯 Summary

1. ✅ **Server now configured** to accept network connections
2. 🔄 **Restart dev server** (`npm run dev`)
3. 📝 **Copy Network URL** from terminal
4. 📱 **Use on phone** (same WiFi)
5. 📲 **QR code will work** automatically

**Restart your dev server and look for the Network: line!** 🚀

---

## 🆘 Still Not Working?

Try this step-by-step:

```bash
# 1. Stop everything
Ctrl+C (stop dev server)

# 2. Check your IP
ipconfig

# 3. Start dev server
npm run dev

# 4. Verify output shows Network line
➜  Network: http://192.168.x.x:5173/login

# 5. Test on computer first
Open browser: http://192.168.x.x:5173/login

# 6. Test on phone (same WiFi)
Open phone browser: http://192.168.x.x:5173/login
```

If this doesn't work, send me the terminal output from `npm run dev`!
