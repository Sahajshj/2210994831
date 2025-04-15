# Average Calculator Microservice

## Description
This microservice fetches even numbers from a third-party API and maintains a window of the most recent 10 unique values. It returns the current window, previous state, and average.

## How to Run
1. Install dependencies: `npm install`
2. Start server: `node server.js`
3. Make a GET request to `http://localhost:9876/numbers/e`
