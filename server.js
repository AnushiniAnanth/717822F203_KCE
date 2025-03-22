const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 9876;

// Middleware
app.use(cors());
app.use(express.json());

// Sliding window configuration
const WINDOW_SIZE = 10;
let numbersWindow = [];

// Function to fetch numbers from an external API
async function fetchNumbers(type) {
    const urlMap = {
        p: "http://20.244.56.144/numbers/primes",
        f: "http://20.244.56.144/numbers/fibo",
        e: "http://20.244.56.144/numbers/even",
        r: "http://20.244.56.144/numbers/rand",
    };

    const url = urlMap[type];
    if (!url) return [];

    try {
        const response = await axios.get(url, { timeout: 500 });
        return response.data.numbers || [];
    } catch (error) {
        console.error("Error fetching numbers:", error.message);
        return [];
    }
}

// Function to calculate the average of numbers in the window
function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return parseFloat((sum / numbers.length).toFixed(2));
}

// API endpoint to fetch numbers and update the window
app.get("/numbers/:numberid", async (req, res) => {
    const { numberid } = req.params;
    const prevWindowState = [...numbersWindow];

    // Fetch new numbers
    const newNumbers = await fetchNumbers(numberid);

    // Add unique numbers to the window
    const uniqueNumbers = newNumbers.filter(num => !numbersWindow.includes(num));
    numbersWindow = [...numbersWindow, ...uniqueNumbers].slice(-WINDOW_SIZE);

    // Calculate average
    const avg = calculateAverage(numbersWindow);

    // Send response
    res.json({
        windowPrevState: prevWindowState,
        windowCurrState: numbersWindow,
        numbers: newNumbers,
        avg
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
