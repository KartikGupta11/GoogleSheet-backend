const { google } = require("googleapis");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const sheets = google.sheets({ version: "v4" });
const SPREADSHEET_ID = "1sDjVSSSGZWzCFjO0cLx7q77--M_d3t4wTzT6s17grn8";
const RANGE = "Sheet1!A:C";

// Load credentials from the JSON key file downloaded from Google Developers Console
const credentials = require("./credentials.json");

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: "https://www.googleapis.com/auth/spreadsheets.readonly",
});

app.get("/api/data", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      auth,
    });
    const rows = response.data.values;
    console.log(response.data);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/createRow", async (req, res) => {
  try {
    const requestBody = req.body;
    console.log("Hello", req.body);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Obtain the JWT client
    const client = await auth.getClient();

    // Create the sheets API instance
    const sheets = google.sheets({ version: "v4", auth: client });

    // Define the request body for appending a row
    const request = {
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: "USER_ENTERED",
      resource: { values: [Object.values(requestBody)] },
    };

    // Append the row to the spreadsheet
    const response = await sheets.spreadsheets.values.append(request);
    console.log(response);
    // Send a success response
    res.status(201).json({ message: "Row created successfully" });
  } catch (error) {
    console.error("Error creating row:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
