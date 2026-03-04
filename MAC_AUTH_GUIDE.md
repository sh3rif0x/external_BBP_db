# 🔐 MAC ADDRESS AUTHENTICATION & ADD TARGET FEATURE

## ✨ What's New

### 1️⃣ MAC Address Authentication (No More Signup)
- ❌ **Removed**: Email/password sign-up system
- ✅ **Added**: MAC address-based device authentication
- ✅ **Only authorized MAC addresses** can access the app
- ✅ **No passwords needed** - device identification only

### 2️⃣ Add New Program Targets
- ➕ **New button** in header: "Add Target"
- 📝 **Custom program entry** with URL and category
- 🎯 **Auto-detection** of duplicates
- 💾 **Stored locally** in your browser

---

## 🔐 MAC Address Login

### How to Login
1. Go to http://localhost:3000
2. You'll see the **MAC Authentication** page
3. Enter your device's MAC address in format: `AA:BB:CC:DD:EE:FF`
4. Click "🔓 Login with MAC Address"

### Default Test MAC Addresses (for demo)
```
00:1A:2B:3C:4D:5E
AA:BB:CC:DD:EE:FF
```

To add your **actual MAC address**, edit [Auth.jsx](src/Auth.jsx):

```javascript
const AUTHORIZED_MACS = [
    '00:1A:2B:3C:4D:5E',  // Example MAC
    'AA:BB:CC:DD:EE:FF',  // Example MAC
    'XX:XX:XX:XX:XX:XX'   // Add your MAC here!
];
```

### How to Find Your MAC Address

**Windows:**
```cmd
ipconfig /all
Look for "Physical Address"
```

**Mac (macOS):**
```bash
ifconfig | grep "HWaddr"
or
system_profiler SPNetworkDataType | grep "Hardware (MAC) Address"
```

**Linux:**
```bash
ip link show
# Format: link/ether XX:XX:XX:XX:XX:XX
```

---

## ➕ ADD NEW PROGRAMS (TARGETS)

### How to Add a Target
1. Click the **"➕ Add Target"** button in the header
2. Fill in the **Program URL** (required)
3. Select a **Category** (bugbountydirectory, HackerOne, etc.)
4. Click **"✅ Add Target"**

### Example
```
URL: https://company.com/bug-bounty
Category: 🎯 Bugcrowd

Result: Program added with 🆕 NEW badge for 7 days
```

### Features
- ✅ URL validation (must be valid)
- ✅ Duplicate detection (can't add same URL twice)
- ✅ Category selection (custom or match platform)
- ✅ Auto-marked as NEW (shows 🆕 badge for 7 days)
- ✅ Stored in browser storage
- ✅ Persists after page refresh

### Manually Added Programs
- Marked as `manually_added: true` in database
- Show 🆕 NEW badge for 7 days
- Can be filtered by source like any other program
- Included in search and filters

---

## 📊 Authentication Flow

### MAC Address Based
```
User enters MAC address
        ↓
Format validated (AA:BB:CC:DD:EE:FF)
        ↓
Checked against authorized list
        ↓
✅ Login successful → Access app
❌ Not authorized → Error message
```

### User Object (stored in localStorage)
```javascript
{
  id: 1709554800000,
  macAddress: "AA:BB:CC:DD:EE:FF",
  loginTime: "2026-03-04T06:30:00Z",
  deviceName: "Device-EE:FF"
}
```

---

## 🔧 Configuration

### Add Authorized MAC Addresses
Edit [src/Auth.jsx](src/Auth.jsx) line ~15:

```javascript
const AUTHORIZED_MACS = [
    '00:1A:2B:3C:4D:5E',    // DeviceNet123
    'AA:BB:CC:DD:EE:FF',    // Laptop MacBook
    '11:22:33:44:55:66',    // Desktop Windows
    // Add more here...
];
```

### Remove Sign-up Completely
✅ Already done! The old sign-up modal has been removed entirely.
- No email input
- No password fields
- No registration form
- Only MAC-based login available

---

## 🎨 User Interface

### Login Page Header Shows
```
🎯 Bug Bounty Programs
🔐 MAC Address Authentication
```

### After Login Header Shows
```
🔐 AA:BB:CC:DD:EE:FF
➕ Add Target  ☀️/🌙 Light/Dark  Logout
```

---

## 💾 Data Storage

### Programs Added Locally
```
Key: bbp_custom_programs
Storage: Browser localStorage
Recovery: Will persist after page refresh
```

### Search across All Programs
- Scraped programs from 5 platforms
- Manually added custom targets
- All searchable and filterable together
- All get 🆕 badge if newer

---

## 🚀 Deployment

### Current Setup
```
✅ Mac address auth enabled
✅ Add program feature active  
✅ Database: hunting_ons.json (1,623 programs)
✅ Server: Running on port 3000
✅ Build: Compiled React app
```

### To Deploy
1. Build: `npm run build`
2. Serve: `python3 -m http.server 3000` (from /build)
3. Add your MAC addresses to [src/Auth.jsx](src/Auth.jsx)
4. Rebuild: `npm run build`
5. Done! Only your devices can access

---

## 🔒 Security

### Access Control
- Only devices with authorized MAC addresses can login
- No password required - device recognition only
- Perfect for **personal/team use** on fixed machines
- MAC stored in browser localStorage

### Local Data
- Favorites stored in localStorage
- Custom programs stored in localStorage
- Ratings stored in localStorage
- All data is client-side, not sent to server

---

## ❓ Troubleshooting

### "Invalid MAC address format"
- Use format: `AA:BB:CC:DD:EE:FF` (hyphens or colons ok)
- No spaces
- Must be valid hex (0-9, A-F)

### "This MAC address is not authorized"
- Add your MAC to [src/Auth.jsx](src/Auth.jsx)
- Find MAC using commands above
- Rebuild: `npm run build`
- Clear browser cache (Ctrl+Shift+Del)

### "Program already exists"
- URL is already in database
- Try a different program URL
- Check database: hunting_ons.json

### Custom programs not saved
- Clear browser storage: DevTools → Application → Clear Storage
- Try adding again
- Check localStorage limit (usually 5-10MB)

---

## 📋 Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| MAC Auth | ✅ Active | Authorized only |
| Email/Password | ❌ Removed | MAC-only |
| Sign-up | ❌ Removed | Admins add MACs |
| Add Programs | ✅ Active | With 🆕 badge |
| Favorites | ✅ Active | 4 emoji buttons |
| Search | ✅ Active | All programs |
| Filter | ✅ Active | By platform/status |
| Scraper | ✅ Active | Daily auto-scrape |
| NEW Badge | ✅ Active | 7-day duration |

---

**Last Updated**: March 4, 2026
**Version**: 2.0 (MAC Auth + Add Programs)
**Ready to Deploy**: ✅ YES

Go to: **http://localhost:3000** and test with:
- MAC: `00:1A:2B:3C:4D:5E` or `AA:BB:CC:DD:EE:FF`
