// api.js
const BASE_URL = "https://localhost:9098";

// fetch wrapper
async function postRequest(endpoint, body) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return res.json();
}
