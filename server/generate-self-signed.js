import fs from 'fs';
import path from 'path';
import selfsigned from 'selfsigned';
import { fileURLToPath } from 'url';

// Usage: node generate-self-signed.js [hostname] [days]
// Example: node generate-self-signed.js localhost 365

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const host = process.argv[2] || 'localhost';
const days = parseInt(process.argv[3], 10) || 365;

const attrs = [
  { name: 'commonName', value: host },
];

const opts = {
  keySize: 2048,
  days,
  algorithm: 'sha256',
  extensions: [
    { name: 'basicConstraints', cA: false },
    { name: 'keyUsage', keyCertSign: true, digitalSignature: true, nonRepudiation: true, keyEncipherment: true },
    { name: 'extKeyUsage', serverAuth: true, clientAuth: true },
    { name: 'subjectAltName', altNames: [ { type: 2, value: host }, { type: 7, ip: '127.0.0.1' } ] },
  ],
};

console.log(`Generating self-signed cert for ${host} (valid ${days} days)...`);

const pems = selfsigned.generate(attrs, opts);

const outDir = path.join(__dirname, 'certs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'key.pem'), pems.private);
fs.writeFileSync(path.join(outDir, 'cert.pem'), pems.cert);

console.log('Wrote files:');
console.log(' -', path.join(outDir, 'key.pem'));
console.log(' -', path.join(outDir, 'cert.pem'));
console.log('\nTo use these in the server:');
console.log(" - Load them with fs.readFileSync('./server/certs/key.pem') and fs.readFileSync('./server/certs/cert.pem')");
console.log(' - See server/README-ssl.md for instructions.');