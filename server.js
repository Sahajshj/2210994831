const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Config
const WINDOW_SIZE = 10;
const VALID_IDS = new Set(['p', 'f', 'e', 'r']);
const API_BASE_URL = "http://20.244.56.144/evaluation-service";

// State
let slidingWindow = [];

// Utility to fetch numbers with timeout and error handling
async function fetchNumbers(id) {
    try {
        const source = axios.CancelToken.source();
        const timeout = setTimeout(() => {
            source.cancel(`Request timeout after 500ms`);
        }, 500);

        const response = await axios.get(`${API_BASE_URL}/${id}`, {
            cancelToken: source.token,
            timeout: 500,
        });

        clearTimeout(timeout);
        return response.data.numbers || [];
    } catch (error) {
        console.error("Fetch error or timeout:", error.message);
        return [];
    }
}

// Add unique numbers with sliding window logic
function updateWindow(fetchedNumbers) {
    const existing = new Set(slidingWindow);
    const newNumbers = fetchedNumbers.filter(num => !existing.has(num));

    for (let num of newNumbers) {
        if (slidingWindow.length >= WINDOW_SIZE) {
            slidingWindow.shift(); // Remove oldest
        }
        slidingWindow.push(num);
    }
}

// Average calculation
function calculateAverage() {
    if (slidingWindow.length === 0) return 0;
    const sum = slidingWindow.reduce((acc, val) => acc + val, 0);
    return parseFloat((sum / slidingWindow.length).toFixed(2));
}

// API Endpoint
app.get("/numbers/:numberid", async (req, res) => {
    const id = req.params.numberid;

    if (!VALID_IDS.has(id)) {
        return res.status(400).json({ error: "Invalid number ID. Use p, f, e, or r." });
    }

    const prevState = [...slidingWindow];

    const fetchedNumbers = await fetchNumbers(id);
    updateWindow(fetchedNumbers);

    const currState = [...slidingWindow];
    const avg = calculateAverage();

    return res.json({
        windowPrevState: prevState,
        windowCurrState: currState,
        avg: avg
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
