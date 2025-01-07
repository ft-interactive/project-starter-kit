/* eslint-disable prefer-destructuring */
import 'dotenv/config';
import { google } from 'googleapis';
import fs from 'fs';

// NOTES
// Run 'npm run gsheetBatch'
// SheetID, SHEET RANGE: from the .env file
// Need to share google sheet with starter kit the file
// Saving output file in the config as sheet.json unless otherwise specified

// Convert column numbers back to letters
const numberToColumn = (number) => {
  let column = '';
  while (number > 0) {
    const remainder = (number - 1) % 26;
    column = String.fromCharCode(remainder + 65) + column;
    // eslint-disable-next-line no-param-reassign
    number = Math.floor((number - 1) / 26);
  }
  return column;
};

async function getGoogleSheet(valueRenderOption = 'FORMULA', jsonFileName = 'sheetBatch') {
  const auth = await google.auth.getClient({
    projectId: process.env.G_PROJECT_ID,
    credentials: {
      type: 'service_account',
      private_key: process.env.G_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.G_CLIENT_EMAIL,
      client_id: process.env.G_CLIENT_ID,
      token_url: 'https://oauth2.googleapis.com/token',
      universe_domain: 'googleapis.com',
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheetsApi = google.sheets({ version: 'v4', auth });

  const spreadsheetId = process.env.G_SHEET_ID;
  const ranges = process.env.G_SHEET_RANGE.split(',');

  // Structure for the batchGet request
  const request = {
    spreadsheetId,
    ranges,
    valueRenderOption, // Default:'FORMULA'
  };

  const response = await sheetsApi.spreadsheets.values.batchGet(request);

  // Extracting the rows from the response
  const rows = response.data.valueRanges || []; // Will be an array of value ranges

  // Create a json to store the values
  const formulaDict = {};

  // Loop through the valueRanges returned from batchGet
  rows.forEach((valueRange) => {
    // eslint-disable-next-line prefer-destructuring
    const range = valueRange.range; // Example: 'Sheet1!A1:B10'
    const values = valueRange.values; // The actual data for the range

    // For example, let's populate the formulaDict with the data from this range
    if (values) {
      values.forEach((row, rowIndex) => {
        row.forEach((cellValue, colIndex) => {
          // Generate a key that includes the range to avoid duplication
          const columnLetter = numberToColumn(colIndex + 1); // Assuming you want to use column numbers converted to letters
          const rowNumber = rowIndex + 1; // Row number within the range

          // Use the full range as part of the key
          const key = `${range}:${columnLetter}${rowNumber}`;

          formulaDict[key] = cellValue;
        });
      });
    }
  });

  // Save the parsed data to config/sheet.json
  const outputPath = `./config/${jsonFileName}.json`;
  fs.writeFileSync(outputPath, JSON.stringify(formulaDict, null, 2));
  // console.log(`Document data saved to ${outputPath}`);

  return formulaDict;
}

getGoogleSheet();
