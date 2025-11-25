// ================================
// ☕ CoffeeHub Backend - MongoDB
// ================================
import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
app.disable("x-powered-by");
const PORT = process.env.PORT || 4000;

// ================================
// 🔗 MongoDB Connection
// ================================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ ERROR: MONGODB_URI no está definida");
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

// ✅ CAMBIO: Variables internas privadas (no exportadas)
let _db;
let _productsCollection;
let _mongoClient;
let _server;

// ✅ CAMBIO: Getters para exportar valores de forma segura (readonly)
export const getDb = () => _db;
export const getProductsCollection = () => _productsCollection;
export const getMongoClient = () => _mongoClient;
export const getServer = () => _server;

async function connectDB() {
  try {
    _mongoClient = new MongoClient(MONGODB_URI);
    await _mongoClient.connect();
    
    const dbName = new URL(MONGODB_URI).pathname.substring(1).split('?')[0];
    _db = _mongoClient.db(dbName);
    _productsCollection = _db.collection("products");
    
    console.log(`✅ Conectado a MongoDB Atlas - Base de datos: ${dbName}`);
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

// ================================
// 🛡️ FUNCIONES DE VALIDACIÓN REFACTORIZADAS
// ================================

/**
 * Valida el nombre del producto
 */
function validateName(name, isUpdate) {
  if (isUpdate && name === undefined) return [];
  
  const errors = [];
  if (!name || typeof name !== 'string') {
    errors.push('Name is required and must be a string');
  } else if (name.trim() === '') {
    errors.push('Name cannot be empty or only whitespace');
  } else if (name.length > 255) {
    errors.push('Name cannot exceed 255 characters');
  }
  return errors;
}

/**
 * Valida el precio del producto
 */
function validatePrice(price, isUpdate) {
  if (isUpdate && price === undefined) return [];
  
  const errors = [];
  const priceNum = Number.parseFloat(price);
  
  if (Number.isNaN(priceNum)) {
    errors.push('Price must be a valid number');
  } else if (priceNum < 0) {
    errors.push('Price cannot be negative');
  } else if (priceNum > 999999.99) {
    errors.push('Price cannot exceed 999,999.99');
  }
  return errors;
}

/**
 * Valida el rating del producto
 */
function validateRating(rating) {
  if (rating === undefined || rating === null) return [];
  
  const errors = [];
  const ratingNum = Number.parseFloat(rating);
  
  if (Number.isNaN(ratingNum)) {
    errors.push('Rating must be a valid number');
  } else if (ratingNum < 0 || ratingNum > 5) {
    errors.push('Rating must be between 0 and 5');
  }
  return errors;
}

/**
 * Valida campos de tipo string (origin, type, roast, description)
 */
function validateStringField(value, fieldName, isUpdate) {
  if (isUpdate && value === undefined) return [];
  if (value === undefined || value === null) return [];
  
  const errors = [];
  if (typeof value !== 'string') {
    errors.push(`${fieldName} must be a string`);
  }
  return errors;
}

/**
 * Valida los datos de un producto
 * @param {Object} productData - Datos del producto
 * @param {boolean} isUpdate - Si es una actualización (campos opcionales)
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateProduct(productData, isUpdate = false) {
  const errors = [
    ...validateName(productData.name, isUpdate),
    ...validatePrice(productData.price, isUpdate),
    ...validateRating(productData.rating),
    ...validateStringField(productData.origin, 'Origin', isUpdate),
    ...validateStringField(productData.type, 'Type', isUpdate),
    ...validateStringField(productData.roast, 'Roast', isUpdate),
    ...validateStringField(productData.description, 'Description', isUpdate)
  ];

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitiza los datos de un producto
 * @param {Object} productData - Datos del producto
 * @returns {Object} Datos sanitizados
 */
function sanitizeProduct(productData) {
  const sanitized = {};

  if (productData.name !== undefined) {
    sanitized.name = String(productData.name).trim();
  }

  if (productData.origin !== undefined) {
    sanitized.origin = String(productData.origin).trim();
  }

  if (productData.type !== undefined) {
    sanitized.type = String(productData.type).trim();
  }

  if (productData.price !== undefined) {
    sanitized.price = Number.parseFloat(productData.price);
  }

  if (productData.roast !== undefined) {
    sanitized.roast = String(productData.roast).trim();
  }

  if (productData.rating !== undefined && productData.rating !== null) {
    sanitized.rating = Number.parseFloat(productData.rating);
  }

  if (productData.description !== undefined) {
    sanitized.description = productData.description 
      ? String(productData.description).trim() 
      : "Sin descripción";
  }

  return sanitized;
}

// ================================
// 🌐 CORS
// ================================
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:4000",

  // Render QA (frontend y backend)
  "https://coffehub-frontend-qa-66nb.onrender.com",
  "https://coffehub-backend-qa-apsk.onrender.com",

  // Render PROD (cuando lo crees)
  "https://coffehub-frontend-prod-sgpy.onrender.com",
  "https://coffehub-backend-prod-vhuc.onrender.com"
];


app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    console.warn(`CORS bloqueado para: ${origin}`);
    return callback(new Error(`CORS no permitido para: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

// ================================
// 📦 Endpoints API
// ================================

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    database: _db ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || "development"
  });
});

// GET todos los productos
app.get("/api/products", async (req, res) => {
  try {
    const products = await _productsCollection.find({}).toArray();
    res.json(products);
  } catch (err) {
    console.error("Error al obtener productos:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// GET un producto por ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    
    const product = await _productsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    res.json(product);
  } catch (err) {
    console.error("Error al obtener producto:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// POST agregar producto (CON VALIDACIÓN)
app.post("/api/products", async (req, res) => {
  try {
    // 1. Sanitizar datos
    const sanitized = sanitizeProduct(req.body);
    
    // 2. Validar datos
    const validation = validateProduct(sanitized, false);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: "Datos inválidos",
        details: validation.errors 
      });
    }
    
    // 3. Crear producto
    const newProduct = {
      name: sanitized.name,
      origin: sanitized.origin || "Desconocido",
      type: sanitized.type || "Desconocido",
      price: sanitized.price,
      roast: sanitized.roast || "Medium",
      rating: sanitized.rating || 0,
      description: sanitized.description || "Sin descripción",
      createdAt: new Date()
    };
    
    const result = await _productsCollection.insertOne(newProduct);
    res.status(201).json({ 
      _id: result.insertedId,
      ...newProduct 
    });
  } catch (err) {
    console.error("Error al insertar producto:", err);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

// PUT actualizar producto (CON VALIDACIÓN)
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    
    // 1. Sanitizar datos
    const sanitized = sanitizeProduct(req.body);
    
    // 2. Validar datos (modo actualización)
    const validation = validateProduct(sanitized, true);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: "Datos inválidos",
        details: validation.errors 
      });
    }
    
    // 3. Preparar datos de actualización
    const updateData = {
      ...sanitized,
      updatedAt: new Date()
    };
    
    const result = await _productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    res.json({ 
      _id: id,
      ...updateData,
      message: "Producto actualizado exitosamente" 
    });
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

// DELETE eliminar producto
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }
    
    const result = await _productsCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    res.json({ 
      message: "Producto eliminado exitosamente",
      deletedId: id 
    });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// GET estadísticas
app.get("/api/stats", async (req, res) => {
  try {
    const products = await _productsCollection.find({}).toArray();
    
    const total = products.length;
    const avgPrice = total > 0 
      ? (products.reduce((sum, p) => sum + (p.price || 0), 0) / total).toFixed(2)
      : 0;
    
    const origins = products.map(p => p.origin).filter(Boolean);
    const popularOrigin = origins.length > 0
      ? origins.sort((a, b) => 
          origins.filter(o => o === b).length - origins.filter(o => o === a).length
        )[0]
      : "N/A";

    res.json({
      total,
      avgPrice,
      popularOrigin
    });
  } catch (err) {
    console.error("Error al obtener estadísticas:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ================================
// 🚀 Iniciar servidor
// ================================

export async function initializeApp() {
  try {
    await connectDB();
    
    if (process.env.NODE_ENV !== 'test') {
      _server = app.listen(PORT, () => {
        console.log(`✅ CoffeeHub Backend corriendo en puerto ${PORT}`);
        console.log('🔗 Orígenes permitidos:', allowedOrigins);
      });
    }
  } catch (err) {
    console.error("❌ No se pudo inicializar el servidor:", err);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw err;
  }
}

// Solo auto-inicializar en producción
if (process.env.NODE_ENV !== 'test') {
  initializeApp();
}

export default app;