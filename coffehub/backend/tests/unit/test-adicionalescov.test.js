// ============================================
// tests/unit/missing-coverage.test.js - ACTUALIZADO
// ============================================
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app, { initializeApp, getMongoClient, getProductsCollection } from '../../server.js';
import { ObjectId } from 'mongodb';

describe('🎯 Tests para Líneas Sin Cobertura', () => {
  
  let testProductIds = [];

  beforeAll(async () => {
    await initializeApp();
  }, 60000);

  afterAll(async () => {
    const productsCollection = getProductsCollection(); // ✅ Usar getter
    if (testProductIds.length > 0 && productsCollection) {
      await productsCollection.deleteMany({ _id: { $in: testProductIds } });
    }
    const mongoClient = getMongoClient(); // ✅ Usar getter
    if (mongoClient) await mongoClient.close();
  });

  describe('GET /api/products/:id - Líneas 230-236', () => {
    it('✅ Debe obtener producto por ID (línea 230-236)', async () => {
      const created = await request(app)
        .post('/api/products')
        .send({ name: 'Test GET ID', price: 10 });

      const id = created.body._id;
      testProductIds.push(new ObjectId(id));

      const response = await request(app)
        .get(`/api/products/${id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body._id).toBe(id);
      expect(response.body.name).toBe('Test GET ID');
      expect(response.body.price).toBe(10);
    });

    it('❌ Debe retornar 404 (línea 232-233)', async () => {
      const fakeId = new ObjectId();
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body).toBeDefined();
      expect(response.body.message || response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/products/:id - Líneas 283-321', () => {
    it('✅ Debe actualizar producto (líneas 291-321)', async () => {
      const created = await request(app)
        .post('/api/products')
        .send({ name: 'Original', price: 10 });

      const id = created.body._id;
      testProductIds.push(new ObjectId(id));

      const response = await request(app)
        .put(`/api/products/${id}`)
        .send({ name: 'Actualizado', price: 20 })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.message).toBe('Producto actualizado exitosamente');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body.updatedAt).toBeTruthy();
    });

    it('❌ Debe rechazar ID inválido (línea 286-287)', async () => {
      const response = await request(app)
        .put('/api/products/invalid')
        .send({ name: 'Test' })
        .expect(400);

      expect(response.body).toBeDefined();
      expect(response.body.error || response.body.message).toBeDefined();
    });

    it('❌ Debe retornar 404 si no existe (línea 313-314)', async () => {
      const fakeId = new ObjectId();
      const response = await request(app)
        .put(`/api/products/${fakeId}`)
        .send({ name: 'Test', price: 10 })
        .expect(404);

      expect(response.body).toBeDefined();
      expect(response.body.message || response.body.error).toBeTruthy();
    });

    it('❌ Debe validar precio negativo (línea 295-299)', async () => {
      const created = await request(app)
        .post('/api/products')
        .send({ name: 'Test', price: 10 });

      testProductIds.push(new ObjectId(created.body._id));

      const response = await request(app)
        .put(`/api/products/${created.body._id}`)
        .send({ price: -10 })
        .expect(400);

      expect(response.body).toBeDefined();
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toMatch(/precio|Datos inválidos/i);
    });
  });

  describe('DELETE /api/products/:id - Líneas 337-346', () => {
    it('✅ Debe eliminar producto (líneas 337-346)', async () => {
      const created = await request(app)
        .post('/api/products')
        .send({ name: 'Para Eliminar', price: 10 });

      const response = await request(app)
        .delete(`/api/products/${created.body._id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.message).toBe('Producto eliminado exitosamente');
      expect(response.body.deletedId).toBe(created.body._id);
      expect(response.body.deletedId).toBeTruthy();
    });

    it('❌ Debe rechazar ID inválido (línea 333-334)', async () => {
      const response = await request(app)
        .delete('/api/products/invalid')
        .expect(400);

      expect(response.body).toBeDefined();
      expect(response.body.error || response.body.message).toBeDefined();
    });

    it('❌ Debe retornar 404 si no existe (línea 339-340)', async () => {
      const fakeId = new ObjectId();
      const response = await request(app)
        .delete(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body).toBeDefined();
      expect(response.body.message || response.body.error).toBeTruthy();
    });
  });

  describe('CORS - Líneas 185-186', () => {
    it('✅ Debe permitir origen válido (línea 182-183)', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:8080')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.status || response.text).toBeTruthy();
    });

    it('✅ Debe permitir request sin origin (línea 181)', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.status || response.text).toBeTruthy();
    });
  });

  describe('POST - Líneas 259-274', () => {
    it('✅ Debe crear producto con todos los campos (línea 259-274)', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Completo',
          origin: 'Colombia',
          type: 'Arábica',
          price: 15.99,
          roast: 'Medium',
          rating: 4.5,
          description: 'Test description'
        })
        .expect(201);

      testProductIds.push(new ObjectId(res.body._id));
      
      expect(res.body).toBeDefined();
      expect(res.body).toHaveProperty('_id');
      expect(res.body._id).toBeTruthy();
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body.createdAt).toBeTruthy();
      expect(res.body.name).toBe('Test Completo');
      expect(res.body.price).toBe(15.99);
    });

    it('✅ Debe usar valores por defecto (línea 261-267)', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ name: 'Mínimo', price: 10 })
        .expect(201);

      testProductIds.push(new ObjectId(res.body._id));
      
      expect(res.body).toBeDefined();
      expect(res.body.origin).toBe('Desconocido');
      expect(res.body.type).toBe('Desconocido');
      expect(res.body.roast).toBe('Medium');
      expect(res.body.rating).toBe(0);
      expect(res.body.description).toBe('Sin descripción');
      expect(res.body).toHaveProperty('_id');
    });
  });

  describe('GET /api/stats - Líneas 355-374', () => {
    it('✅ Debe calcular estadísticas con productos (líneas 356-374)', async () => {
      const prod1 = await request(app)
        .post('/api/products')
        .send({ name: 'Stats1', price: 10, origin: 'Colombia' });
      
      const prod2 = await request(app)
        .post('/api/products')
        .send({ name: 'Stats2', price: 20, origin: 'Colombia' });

      testProductIds.push(new ObjectId(prod1.body._id));
      testProductIds.push(new ObjectId(prod2.body._id));

      const response = await request(app)
        .get('/api/stats')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('avgPrice');
      expect(response.body).toHaveProperty('popularOrigin');
      expect(response.body.total).toBeGreaterThan(0);
      expect(typeof response.body.total).toBe('number');
      expect(typeof response.body.avgPrice).toBe('string');
      expect(response.body.avgPrice).toMatch(/^\d+\.\d{2}$/);
      expect(parseFloat(response.body.avgPrice)).toBeGreaterThan(0);
    });
  });

  describe('Validaciones adicionales', () => {
    it('❌ Debe validar rating NaN en actualización', async () => {
      const created = await request(app)
        .post('/api/products')
        .send({ name: 'Test', price: 10 });

      testProductIds.push(new ObjectId(created.body._id));

      const response = await request(app)
        .put(`/api/products/${created.body._id}`)
        .send({ rating: 'invalid' })
        .expect(400);

      expect(response.body).toBeDefined();
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toMatch(/rating|Datos inválidos/i);
    });

    it('❌ Debe validar rating < 0 en actualización', async () => {
      const created = await request(app)
        .post('/api/products')
        .send({ name: 'Test', price: 10 });

      testProductIds.push(new ObjectId(created.body._id));

      const response = await request(app)
        .put(`/api/products/${created.body._id}`)
        .send({ rating: -1 })
        .expect(400);

      expect(response.body).toBeDefined();
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toMatch(/rating|Datos inválidos/i);
    });

    it('❌ Debe validar rating > 5 en actualización', async () => {
      const created = await request(app)
        .post('/api/products')
        .send({ name: 'Test', price: 10 });

      testProductIds.push(new ObjectId(created.body._id));

      const response = await request(app)
        .put(`/api/products/${created.body._id}`)
        .send({ rating: 6 })
        .expect(400);

      expect(response.body).toBeDefined();
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toMatch(/rating|Datos inválidos/i);
    });

    it('❌ Debe validar precio muy alto en actualización', async () => {
      const created = await request(app)
        .post('/api/products')
        .send({ name: 'Test', price: 10 });

      testProductIds.push(new ObjectId(created.body._id));

      const response = await request(app)
        .put(`/api/products/${created.body._id}`)
        .send({ price: 1000000 })
        .expect(400);

      expect(response.body).toBeDefined();
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toMatch(/precio|Datos inválidos/i);
    });
  });
});