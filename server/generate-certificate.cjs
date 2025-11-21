#!/usr/bin/env node

/**
 * SSL Certificate Generator for LearnSphere
 * Generates a self-signed certificate with proper configuration
 * Certificate purposes:
 * - Proves your identity to a remote computer
 * - Ensures the identity of a remote computer
 * - All issuance policies
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CERTS_DIR = path.join(__dirname, 'certs');
const KEY_PATH = path.join(CERTS_DIR, 'key.pem');
const CERT_PATH = path.join(CERTS_DIR, 'cert.pem');
const CSR_PATH = path.join(CERTS_DIR, 'certificate.csr');

// Ensure certs directory exists
if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
    console.log(`✅ Created certificates directory: ${CERTS_DIR}`);
}

// Configuration
const config = {
    country: 'IN',
    state: 'State',
    locality: 'City',
    organization: 'LearnSphere',
    organizationUnit: 'Development',
    commonName: 'localhost',
    days: 365
};

console.log('\n🔐 SSL Certificate Generator for LearnSphere\n');
console.log('📋 Certificate Configuration:');
console.log(`   Country: ${config.country}`);
console.log(`   State: ${config.state}`);
console.log(`   Locality: ${config.locality}`);
console.log(`   Organization: ${config.organization}`);
console.log(`   Organization Unit: ${config.organizationUnit}`);
console.log(`   Common Name (CN): ${config.commonName}`);
console.log(`   Validity: ${config.days} days`);
console.log(`   Algorithm: RSA 2048-bit`);

// Create a config file for certificate extensions
const extConfigPath = path.join(CERTS_DIR, 'certificate.conf');
const extConfig = `
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = req_distinguished_name
req_extensions = v3_req
x509_extensions = v3_ca

[req_distinguished_name]
C = ${config.country}
ST = ${config.state}
L = ${config.locality}
O = ${config.organization}
OU = ${config.organizationUnit}
CN = ${config.commonName}

[v3_req]
subjectAltName = DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:0.0.0.0

[v3_ca]
subjectAltName = DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:0.0.0.0
basicConstraints = CA:TRUE
keyUsage = digitalSignature, keyEncipherment, dataEncipherment, keyCertSign
extendedKeyUsage = serverAuth, clientAuth
`;

fs.writeFileSync(extConfigPath, extConfig.trim());

try {
    console.log('\n⏳ Generating private key (2048-bit RSA)...');
    
    // Generate private key
    execSync(`openssl genrsa -out "${KEY_PATH}" 2048`, { stdio: 'pipe' });
    console.log(`✅ Private key generated: ${KEY_PATH}`);

    console.log('\n⏳ Generating certificate signing request...');
    
    // Generate CSR (Certificate Signing Request)
    execSync(
        `openssl req -new -key "${KEY_PATH}" -out "${CSR_PATH}" -config "${extConfigPath}"`,
        { stdio: 'pipe' }
    );
    console.log(`✅ CSR generated: ${CSR_PATH}`);

    console.log('\n⏳ Generating self-signed certificate...');
    
    // Generate self-signed certificate with extensions
    execSync(
        `openssl x509 -req -in "${CSR_PATH}" -signkey "${KEY_PATH}" -out "${CERT_PATH}" ` +
        `-days ${config.days} -extensions v3_ca -extfile "${extConfigPath}"`,
        { stdio: 'pipe' }
    );
    console.log(`✅ Self-signed certificate generated: ${CERT_PATH}`);

    // Verify certificate
    console.log('\n📊 Certificate Details:');
    const certDetails = execSync(`openssl x509 -in "${CERT_PATH}" -text -noout`).toString();
    
    // Extract and display key information
    const lines = certDetails.split('\n');
    let inCertSection = false;
    let inExtensionsSection = false;
    
    for (const line of lines) {
        if (line.includes('Certificate:') || line.includes('Data:')) {
            inCertSection = true;
        }
        if (line.includes('X509v3 extensions:')) {
            inExtensionsSection = true;
        }
        
        // Display relevant certificate information
        if (line.includes('Issuer:') || 
            line.includes('Subject:') || 
            line.includes('Not Before:') || 
            line.includes('Not After:') ||
            line.includes('Public-Key:') ||
            line.includes('Subject:') ||
            line.includes('Signature Algorithm:')) {
            console.log(`   ${line.trim()}`);
        }
        
        if (inExtensionsSection && (
            line.includes('X509v3 Key Usage:') ||
            line.includes('X509v3 Extended Key Usage:') ||
            line.includes('X509v3 Subject Alternative Name:') ||
            line.includes('X509v3 Basic Constraints:')
        )) {
            console.log(`   ${line.trim()}`);
            // Print the value on next line if it exists
            const nextIdx = lines.indexOf(line) + 1;
            if (nextIdx < lines.length && lines[nextIdx].trim() && !lines[nextIdx].includes('X509v3')) {
                console.log(`   ${lines[nextIdx].trim()}`);
            }
        }
    }

    // Display certificate purposes
    console.log('\n✨ Certificate Purposes:');
    console.log('   ✓ Proves your identity to a remote computer');
    console.log('   ✓ Ensures the identity of a remote computer');
    console.log('   ✓ All issuance policies');

    // File info
    console.log('\n📁 Generated Files:');
    const keyStats = fs.statSync(KEY_PATH);
    const certStats = fs.statSync(CERT_PATH);
    console.log(`   • Private Key: ${KEY_PATH}`);
    console.log(`     Size: ${(keyStats.size / 1024).toFixed(2)} KB`);
    console.log(`   • Certificate: ${CERT_PATH}`);
    console.log(`     Size: ${(certStats.size / 1024).toFixed(2)} KB`);

    // Clean up temporary files
    if (fs.existsSync(CSR_PATH)) {
        fs.unlinkSync(CSR_PATH);
    }
    if (fs.existsSync(extConfigPath)) {
        fs.unlinkSync(extConfigPath);
    }
    console.log(`   • Temporary files cleaned up`);

    // Verification command
    console.log('\n🔍 To verify the certificate, run:');
    console.log(`   openssl x509 -in "${CERT_PATH}" -text -noout`);

    // Server info
    console.log('\n🚀 Server Configuration:');
    console.log('   • Issued to: localhost');
    console.log('   • Issued by: localhost');
    console.log('   • HTTPS Port: 4430');
    console.log('   • WebSocket Secure: Enabled');

    console.log('\n✅ Certificate generation completed successfully!\n');

} catch (error) {
    console.error('\n❌ Error generating certificate:');
    console.error(error.message);
    
    // Clean up on error
    [KEY_PATH, CERT_PATH, CSR_PATH, extConfigPath].forEach(p => {
        if (fs.existsSync(p)) {
            fs.unlinkSync(p);
        }
    });
    
    process.exit(1);
}
