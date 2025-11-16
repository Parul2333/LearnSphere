# HTTPS Certificate Warning Fix

## Issue: "Your connection is not private" / "NET::ERR_CERT_AUTHORITY_INVALID"

This warning appears because the development server uses a **self-signed SSL certificate**. This is normal for local development and safe to bypass.

---

## Solution: Accept the Self-Signed Certificate

### Method 1: Click "Advanced" and Proceed (Recommended for Testing)

1. When you see the warning page, click the **"Advanced"** button
2. Click **"Proceed to localhost (unsafe)"** or **"Continue to localhost"**
3. The browser will remember this choice for this session

**Note:** The exact button text varies by browser:
- **Chrome/Edge:** "Proceed to localhost (unsafe)"
- **Firefox:** "Advanced" → "Accept the Risk and Continue"
- **Safari:** "Show Details" → "visit this website"

### Method 2: Add Certificate Exception (Permanent Fix)

#### For Chrome/Edge:
1. Click the lock icon in the address bar
2. Click "Certificate"
3. Click "Details" tab
4. Click "Copy to File"
5. Save the certificate
6. Go to Chrome Settings → Privacy and Security → Security
7. Click "Manage certificates" → "Authorities" → "Import"
8. Select the saved certificate and check "Trust this certificate for identifying websites"

#### For Firefox:
1. Click the lock icon → "Connection not secure" → "More information"
2. Click "View Certificate"
3. Click "Permanently store this exception"

#### For Safari (macOS):
1. Open Keychain Access
2. Drag the certificate file (`server/certs/cert.pem`) into Keychain Access
3. Double-click the certificate
4. Expand "Trust" section
5. Set "When using this certificate" to "Always Trust"

---

## Alternative: Use HTTP Instead of HTTPS

If you prefer to avoid the certificate warning entirely, you can use HTTP:

1. **Stop the servers**
2. **Access via HTTP:**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

3. **The WebSocket will automatically use `ws://` instead of `wss://`**

The client code automatically detects the protocol and connects accordingly.

---

## Why This Happens

- Self-signed certificates are not trusted by browsers by default
- This is a **security feature** - browsers warn about untrusted certificates
- For **local development**, it's safe to bypass this warning
- For **production**, you must use a certificate from a trusted Certificate Authority (CA)

---

## Verification

After accepting the certificate, you should see:
- ✅ No more security warnings
- ✅ WebSocket connection works: Check browser console for `✅ Connected to WebSocket notification server`
- ✅ HTTPS lock icon in address bar (may show "Not Secure" but connection works)

---

## Quick Test

1. Open browser console (F12)
2. Look for: `🔌 Connecting to WebSocket server: https://localhost:4430`
3. Should see: `✅ Connected to WebSocket notification server`
4. If you see connection errors, check:
   - Server is running on port 4430 (HTTPS) or 5000 (HTTP)
   - Certificate files exist in `server/certs/`
   - Browser has accepted the certificate exception

---

## Summary

**For Development:**
- ✅ Safe to bypass the certificate warning
- ✅ Click "Advanced" → "Proceed to localhost"
- ✅ Or use HTTP instead: `http://localhost:5173`

**For Production:**
- ❌ Never use self-signed certificates
- ✅ Use certificates from trusted CAs (Let's Encrypt, etc.)
- ✅ Configure proper SSL/TLS

