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
const columnToNumber = (column) => {
  let number = 0;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < column.length; i++) {
    number = number * 26 + (column.charCodeAt(i) - 64);
  }
  return number;
};

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

  // batchGet request
  const request = {
    spreadsheetId,
    ranges,
    valueRenderOption, // Default:'FORMULA'
  };

  const response = await sheetsApi.spreadsheets.values.batchGet(request);

  // Extracting the rows from the response
  const rows = response.data.valueRanges || [];

  // Json to store the values
  const formulaDict = {};

  // Loop through the row responses from the batchGet
  rows.forEach((valueRange) => {
    // eslint-disable-next-line prefer-destructuring
    const range = valueRange.range; // Example: 'Sheet1!A1:B10'
    const values = valueRange.values; // The actual data for the range

    const sheetName = range.match(/^([A-Za-z0-9_]+)!/)[0];

    if (values) {
      // Extracting the range details
      const rowMatch = range.match(/(?<=!)(.*)/);
      const cellRange = rowMatch ? rowMatch[0] : ''; // Extracting the cell range, e.g., A1:B10
      const startingCellRange = cellRange.split(':')[0]; // Starting cell, e.g., A1
      const endingCellRange = cellRange.split(':')[1]; // Ending cell, e.g., B10

      // Extract the column and row details
      const startingColumnLetter = startingCellRange.match(/[A-Za-z]+/)[0]; // Extract column letter, e.g., A
      const endingColumnLetter = endingCellRange.match(/[A-Za-z]+/)[0]; // Extract ending column letter, e.g., B
      const startingRow = parseInt(startingCellRange.match(/\d+/)[0], 10); // Extract starting row number, e.g., 1
      const endingRow = parseInt(endingCellRange.match(/\d+/)[0], 10); // Extract ending row number, e.g., 10

      // Convert starting and ending columns to numbers
      const startingColumnNumber = columnToNumber(startingColumnLetter);
      const endingColumnNumber = columnToNumber(endingColumnLetter);

      // Loop through the columns and rows to populate the formulaDict
      // eslint-disable-next-line no-plusplus
      for (let colNum = startingColumnNumber; colNum <= endingColumnNumber; colNum++) {
        const columnLetter = numberToColumn(colNum); // Convert column number back to letter

        // Loop through the rows for each column
        // eslint-disable-next-line no-plusplus
        for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
          const rowNumber = startingRow + rowIndex; // Calculate row number dynamically based on starting row

          // Ensure the row number is within the range
          if (rowNumber <= endingRow) {
            const cellValue = values[rowIndex][colNum - startingColumnNumber];
            const key = `${sheetName}:${columnLetter}${rowNumber}`; // Key is the sheet name with the cell being refrences

            // Add the value to the formulaDict using the generated key
            formulaDict[key] = cellValue;
          }
        }
      }
    }
  });

  // Save the parsed data to config/sheet.json
  const outputPath = `./config/${jsonFileName}.json`;
  fs.writeFileSync(outputPath, JSON.stringify(formulaDict, null, 2));
  // console.log(`Document data saved to ${outputPath}`);

  return formulaDict;
}

getGoogleSheet();
