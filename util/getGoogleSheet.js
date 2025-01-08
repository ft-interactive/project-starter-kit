import 'dotenv/config';
import { google } from 'googleapis';
import fs from 'fs';

// NOTES
// Run 'npm run gsheet'
// SheetID, SHEET RANGE: from the .env file
// Need to share google sheet with starter kit the file
// Saving output file in the config as sheet.json unless otherwise specified

// Convert column letters to column numbers (A=1, B=2, C=3, ...)
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

async function getGoogleSheet(valueRenderOption = 'FORMULA', jsonFileName = 'sheet') {
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
  const range = process.env.G_SHEET_RANGE;

  const response = await sheetsApi.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption, // See: https://developers.google.com/sheets/api/reference/rest/v4/ValueRenderOption for other options, defaults to FORMULA
  });

  // Extracting the rows from the spreadsheet
  const rows = response.data.values || [];

  // Creating the json to store the values
  const formulaDict = {};

  // Extract the starting row number from the range using regex example 'Game!A46:B50';
  const rowMatch = range.match(/(?<=!)(.*)/);
  const cellRange = rowMatch ? rowMatch[0] : ''; // Defaults to empty string if no match found, example: A46:B50
  const startingCellRange = cellRange.split(':')[0]; // example: A46
  const endingCellRange = cellRange.split(':')[1]; // example: B46

  // Extract the numbers and letters from the cell values
  const startingColumnLetter = startingCellRange.match(/[A-Za-z]+/)[0]; // Extracts column letter (A)
  const endingColumnLetter = endingCellRange.match(/[A-Za-z]+/)[0]; // Extracts ending column (B)
  const startingRow = startingCellRange.match(/\d+/)[0]; // Extracts row number (46)

  // Convert starting and ending columns to numbers
  const startingColumnNumber = columnToNumber(startingColumnLetter);
  const endingColumnNumber = columnToNumber(endingColumnLetter);

  // Loop through the columns between starting and ending columns
  // eslint-disable-next-line no-plusplus
  for (let colNum = startingColumnNumber; colNum <= endingColumnNumber; colNum++) {
    const columnLetter = numberToColumn(colNum); // Convert column number back to letter

    rows.forEach((row, index) => {
      const rowNumber = parseInt(startingRow, 10) + index; // Calculate row number dynamically

      formulaDict[`${columnLetter}${rowNumber}`] = row[colNum - startingColumnNumber]; // Set value for the correct column
    });
  }

  // Save the parsed data to config/sheet.json
  const outputPath = `./config/${jsonFileName}.json`;
  fs.writeFileSync(outputPath, JSON.stringify(formulaDict, null, 2));
  console.log(`Document data saved to ${outputPath}`);

  return formulaDict;
}

getGoogleSheet();
