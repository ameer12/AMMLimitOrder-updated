const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Function to check if node_modules exists and is non-empty
function nodeModulesExists() {
  const nmPath = path.join(__dirname, "node_modules");
  try {
    return fs.existsSync(nmPath) && fs.readdirSync(nmPath).length > 0;
  } catch (err) {
    return false;
  }
}

// Function to check for missing dependencies using npm ls
function dependenciesValid() {
  try {
    execSync("npm ls --depth=0", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Install dependencies if node_modules missing or invalid
if (!nodeModulesExists() || !dependenciesValid()) {
  console.log("Installing missing dependencies...");
  execSync("npm install", { stdio: "inherit" });
} else {
  console.log("All dependencies are installed.");
}

// Run the dev server
console.log("Starting development server...");
execSync("npm run dev", { stdio: "inherit" });