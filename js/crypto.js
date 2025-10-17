// crypto.js

// --- Helper: Convert string to ArrayBuffer ---
function strToBuffer(str) {
    return new TextEncoder().encode(str);
}

// --- Helper: Convert ArrayBuffer to Base64 ---
function bufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
}

// --- Helper: Convert Base64 to ArrayBuffer ---
function base64ToBuffer(base64) {
    let binary = atob(base64);
    let len = binary.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

// --- SHA-256 hash (for CSR) ---
async function generateCSR(name, surname, fatherName, fin, password) {
    const data = `${name}${surname}${fatherName}${fin}${password}`;
    const hashBuffer = await crypto.subtle.digest('SHA-256', strToBuffer(data));
    return bufferToBase64(hashBuffer);
}

// --- Generate AES Key ---
async function generateAESKey() {
    return await crypto.subtle.generateKey(
        { name: "AES-CBC", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

// --- Generate IV ---
function generateIV() {
    const iv = crypto.getRandomValues(new Uint8Array(16));
    return iv;
}

// --- Encrypt plaintext using AES ---
async function aesEncrypt(plainText, key, iv) {
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv: iv },
        key,
        strToBuffer(plainText)
    );
    return bufferToBase64(encrypted);
}

// --- Export AES Key ---
async function exportAESKey(key) {
    const raw = await crypto.subtle.exportKey("raw", key);
    return bufferToBase64(raw);
}

// --- Encrypt AES key with RSA Public Key ---
async function encryptAESKeyWithRSA(aesKeyBase64, serverPublicKeyBase64) {
    const keyBuffer = base64ToBuffer(serverPublicKeyBase64);
    const publicKey = await crypto.subtle.importKey(
        "spki",
        keyBuffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["encrypt"]
    );

    const aesKeyBuffer = base64ToBuffer(aesKeyBase64);
    const encryptedKey = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        publicKey,
        aesKeyBuffer
    );
    return bufferToBase64(encryptedKey);
}
