import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appPath = path.join(__dirname, "dist");

app.use(express.static(appPath));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(appPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Deployment server running on port ${PORT}`);
  console.log(`Access locally: http://localhost:${PORT}`);
  console.log(`Access from other devices: http://YOUR_IP_ADDRESS:${PORT}`);
});
