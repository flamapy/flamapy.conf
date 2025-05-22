import 'dotenv/config'; // loads variables from .env into process.env
import fs from 'fs';

// Get environment variable
const basePath = process.env.VITE_ASSETS || '/static/configurator/';

// Path to the built worker file
const workerPath = './dist/webworker.js';
const flamapyPath = './dist/flamapy/flamapy.js'

// Read the file
let contentWorker = fs.readFileSync(workerPath, 'utf8');

// Replace all occurrences of the placeholder
const updatedWorker = contentWorker.replace(/__BASE_PATH__/g, JSON.stringify(basePath));

// Write the updated content back to file
fs.writeFileSync(workerPath, updatedWorker);

let contentFlamapy = fs.readFileSync(flamapyPath, 'utf8');

const updatedFlamapy = contentFlamapy.replace(/__BASE_PATH__/g, JSON.stringify(basePath));
fs.writeFileSync(flamapyPath, updatedFlamapy);


console.log(`✔ Replaced __BASE_PATH__ with ${basePath}`);
