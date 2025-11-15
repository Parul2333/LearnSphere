# Generating a Self-Signed SSL Certificate (Local development)

This repository includes a small Node script to generate a self-signed certificate suitable for local development and testing HTTPS on `localhost`.

> Warning: Self-signed certificates are only appropriate for local development and testing. Do NOT use these in production. For production use a CA-signed certificate (e.g., Let's Encrypt).

## Steps

1. Open a terminal and change into the `server` folder:

```powershell
cd .\server
```

2. Install the small dev dependency (`selfsigned`) used by the generator (only needed once):

```powershell
npm install --save-dev selfsigned
```

3. Run the generator script. Replace `localhost` with your hostname if needed, and the number is validity in days.

```powershell
node generate-self-signed.js localhost 365
```

4. The script will create the following files:

```
server/certs/key.pem   # private key
server/certs/cert.pem  # public certificate
```

5. Update `server/server.js` to run HTTPS (example snippet below). The project currently uses HTTP; to enable HTTPS for local dev, you can replace the HTTP server creation with an HTTPS server. Example:

```javascript
// at top of server.js
import https from 'https';
import fs from 'fs';

const key = fs.readFileSync(path.join(__dirname, 'certs', 'key.pem'));
const cert = fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'));

const httpsServer = https.createServer({ key, cert }, app);
httpsServer.listen(4430, () => console.log('HTTPS server running on https://localhost:4430'));
```

6. In development, your browser will warn that the certificate is not trusted. For local testing you can accept the risk and proceed (or add the cert to your OS trust store).

## Git

Certificate files are sensitive and should not be committed. This repository includes `server/.gitignore` to ignore `server/certs`.

## Troubleshooting

- If you get an error that `selfsigned` is not found, ensure you ran `npm install --save-dev selfsigned` in the `server` folder.
- On Windows, you can use PowerShell's `New-SelfSignedCertificate` cmdlet as an alternative, but exporting to PEM requires extra steps.

If you'd like, I can also:
- Patch `server/server.js` to optionally start HTTPS when `server/certs/cert.pem` and `key.pem` exist.
- Generate the certificate now and commit the files into a `.local-certs` branch (not recommended).