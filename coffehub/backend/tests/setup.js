// tests/setup.js  (ESM compatible con Jest)

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Simular __dirname porque ESM no lo tiene nativo
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar archivo .env.test
dotenv.config({ path: `${__dirname}/../.env.test` });

process.env.NODE_ENV = "test";
process.env.PORT = process.env.PORT || "4001";

if (!process.env.MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI no está definida en .env.test");
  process.exit(1);
}

console.log("✅ Variables de entorno cargadas correctamente");
console.log("📝 NODE_ENV:", process.env.NODE_ENV);
console.log("📝 PORT:", process.env.PORT);
console.log("📝 MONGODB_URI:", process.env.MONGODB_URI ? "Definida ✅" : "No definida ❌");
