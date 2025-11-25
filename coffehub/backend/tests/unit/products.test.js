// ============================================
// tests/unit/products.test.js - ACTUALIZADO
// ============================================
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app, { initializeApp, getMongoClient } from '../../server.js';

describe('🧪 Tests Unitarios - CoffeeHub API', () => {
  
  beforeAll(async () => {
    try {
      await initializeApp();
      console.log('✅ Inicialización completada para tests');
    } catch (error) {
      console.error('❌ Error en beforeAll:', error.message);
      throw error;
    }
  }, 60000);

  afterAll(async () => {
    try {
      const mongoClient = getMongoClient(); // ✅ Usar getter
      if (mongoClient) {
        await mongoClient.close();
        console.log('✅ Conexión de MongoDB cerrada');
      }
    } catch (error) {
      console.error('⚠️ Error cerrando MongoDB:', error.message);
    }
  });

  describe('GET /api/health', () => {
    it('✅ Debe retornar estado OK del servidor', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database');
    });
  });

  describe('GET /api/products', () => {
    it('✅ Debe retornar un array de productos', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('✅ Cada producto debe tener la estructura correcta', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      if (response.body.length > 0) {
        const product = response.body[0];
        expect(product).toHaveProperty('_id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('origin');
        expect(product).toHaveProperty('type');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('roast');
        expect(product).toHaveProperty('rating');
      }
    });
  });

  describe('POST /api/products', () => {
    it('✅ Debe crear un nuevo producto', async () => {
      const newProduct = {
        name: "Café Test " + Date.now(),
        origin: "Colombia",
        type: "Arábica",
        price: 15.99,
        roast: "Medium",
        rating: 4.5,
        description: "Producto creado por test automatizado"
      };

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(newProduct.name);
      expect(response.body.price).toBe(newProduct.price);
      expect(response.body).toHaveProperty('createdAt');
    });

    it('✅ Debe agregar descripción por defecto', async () => {
      const productWithoutDesc = {
        name: "Café Sin Desc " + Date.now(),
        origin: "Brasil",
        type: "Robusta",
        price: 12.99,
        roast: "Dark",
        rating: 4.0
      };

      const response = await request(app)
        .post('/api/products')
        .send(productWithoutDesc)
        .expect(201);

      expect(response.body.description).toBe('Sin descripción');
    });

    it('✅ Debe convertir precio string a número', async () => {
      const productWithStringPrice = {
        name: "Café String Price " + Date.now(),
        origin: "Vietnam",
        type: "Robusta",
        price: "18.99",
        roast: "Dark",
        rating: 4.0
      };

      const response = await request(app)
        .post('/api/products')
        .send(productWithStringPrice)
        .expect(201);

      expect(typeof response.body.price).toBe('number');
      expect(response.body.price).toBe(18.99);
    });
  });

  describe('GET /api/products/:id', () => {
    it('❌ Debe retornar 400 para ID inválido', async () => {
      const response = await request(app)
        .get('/api/products/id-invalido-123')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'ID inválido');
    });
  });

  describe('GET /api/stats', () => {
    it('✅ Debe retornar estadísticas de productos', async () => {
      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('avgPrice');
      expect(response.body).toHaveProperty('popularOrigin');
      expect(typeof response.body.total).toBe('number');
    });
  });

  describe('CORS Tests', () => {
    it('✅ Debe permitir origen localhost:8080', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Origin', 'http://localhost:8080')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});