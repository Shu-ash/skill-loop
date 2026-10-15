import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting SkillLoop build process...");

// Locate Frontend folder (whether running from root or backend)
const candidateFrontendPaths = [
  path.resolve(__dirname, "../../Frontend"),
  path.resolve(process.cwd(), "Frontend"),
  path.resolve(process.cwd(), "../Frontend")
];

const frontendDir = candidateFrontendPaths.find((dir) =>
  fs.existsSync(path.join(dir, "package.json"))
);

if (frontendDir) {
  console.log(`📦 Found Frontend directory at: ${frontendDir}`);
  console.log("📥 Installing Frontend dependencies...");
  execSync("npm install", { cwd: frontendDir, stdio: "inherit" });

  console.log("⚙️ Compiling Frontend React app with Vite...");
  execSync("npm run build", { cwd: frontendDir, stdio: "inherit" });
  console.log("✅ Frontend assets compiled successfully!");
} else {
  console.log("ℹ️ No Frontend directory found. Running as standalone API backend.");
}

console.log("🎉 Build completed successfully!");
