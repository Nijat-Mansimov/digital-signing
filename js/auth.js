// auth.js

document.getElementById('createAdminForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const responseBox = document.getElementById('responseBox');
    responseBox.textContent = "Processing...";

    try {
        // 1️⃣ Collect inputs
        const adminUsername = document.getElementById('adminUsername').value;
        const adminPassword = document.getElementById('adminPassword').value;
        const name = document.getElementById('name').value;
        const surname = document.getElementById('surname').value;
        const fatherName = document.getElementById('fatherName').value;
        const position = document.getElementById('position').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rankId = parseInt(document.getElementById('rankId').value);
        const fin = document.getElementById('fin').value;

        // 2️⃣ Generate CSR
        const csr = await generateCSR(name, surname, fatherName, fin, password);

        // 3️⃣ Build JSON object
        const payload = {
            adminUsername,
            adminPassword,
            name,
            surname,
            fatherName,
            position,
            username,
            password,
            rankId,
            csr,
            fin
        };

        const plainText = JSON.stringify(payload);

        // 4️⃣ AES encryption
        const aesKey = await generateAESKey();
        const iv = generateIV();
        const cipherText = await aesEncrypt(plainText, aesKey, iv);
        const aesKeyBase64 = await exportAESKey(aesKey);
        const ivBase64 = bufferToBase64(iv);

        // ⚠️ Replace with real server public key (you might fetch it from an endpoint)
        const serverPublicKeyBase64 = "-----BASE64_OF_SERVER_PUBLIC_KEY-----";

        // 5️⃣ Encrypt AES key with server public key
        const encryptedAesKey = await encryptAESKeyWithRSA(aesKeyBase64, serverPublicKeyBase64);

        // 6️⃣ Build final request
        const requestBody = {
            ciphetText: cipherText,
            key: encryptedAesKey,
            iv: ivBase64
        };

        // 7️⃣ Send to backend
        const res = await postRequest("/admin/createAdmin", requestBody);

        // 8️⃣ Display response
        if (res.statusCode === 200) {
            responseBox.style.color = "green";
            responseBox.textContent = `✅ Admin created successfully: ${res.data}`;
        } else {
            responseBox.style.color = "red";
            responseBox.textContent = `❌ Error: ${res.errorMessage || 'Unknown error'}`;
        }

    } catch (err) {
        console.error(err);
        responseBox.style.color = "red";
        responseBox.textContent = "❌ An error occurred.";
    }
});
