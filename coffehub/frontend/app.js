// app.js - CoffeeHub Frontend
// ============================

// -----------------------------
// 🌐 Estado interno
// -----------------------------
let editingCoffeeId = null;

// -----------------------------
// 🔹 Helpers
// -----------------------------
export function getEditingCoffeeId() {
  return editingCoffeeId;
}

export function setEditingCoffeeId(id) {
  editingCoffeeId = id;
}

// -----------------------------
// 🔹 Backend URL
// -----------------------------
export function getBackendURL() {
  // 1. Si Render inyecta la variable → usar esa siempre
  if (typeof window !== "undefined" && window.BACKEND_URL) {
    return window.BACKEND_URL;
  }

  // 2. Si estamos corriendo tests en JSDOM / Node
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";

  // QA (hostname simulado en los tests)
  if (hostname.includes("qa")) {
    return "https://coffehub-backend-qa-apsk.onrender.com";
  }

  // PROD (hostname simulado en los tests)
  if (hostname.includes("prod")) {
    return "https://coffehub-backend-prod-vhuc.onrender.com";
  }

  // Localhost (dev)
  if (hostname.includes("localhost")) {
    return "http://localhost:4000";
  }

  // Fallback → QA
  return "https://coffehub-backend-qa-apsk.onrender.com";
}
// -----------------------------
// 🔹 Formulario
// -----------------------------
export function toggleForm() {
  const form = document.getElementById('add-form');
  if (!form) return;

  if (form.style.display === 'none' || form.style.display === '') {
    form.style.display = 'block';
  } else {
    cancelEdit();
    form.style.display = 'none';
  }
}

export function cancelEdit() {
  const form = document.getElementById('coffee-form');
  const addForm = document.getElementById('add-form');
  if (!form) return;

  editingCoffeeId = null;

  form.reset();
  document.getElementById('form-title').textContent = 'Agregar Nuevo Café';
  document.getElementById('submit-btn').innerHTML = '✅ Agregar Café';
  document.getElementById('cancel-btn').style.display = 'none';
  
  if (addForm) addForm.style.display = 'none';
}

export function editCoffee(coffee) {
  const form = document.getElementById('coffee-form');
  const addForm = document.getElementById('add-form');
  if (!form) return;

  setEditingCoffeeId(coffee._id);

  document.getElementById('name').value = coffee.name || '';
  document.getElementById('origin').value = coffee.origin || '';
  document.getElementById('type').value = coffee.type || '';
  document.getElementById('price').value = coffee.price || '';
  document.getElementById('rating').value = coffee.rating || '';
  document.getElementById('roast').value = coffee.roast || '';
  document.getElementById('description').value = coffee.description || '';

  document.getElementById('form-title').textContent = 'Editar Café';
  document.getElementById('submit-btn').innerHTML = '💾 Guardar Cambios';
  document.getElementById('cancel-btn').style.display = 'inline-block';

  if (addForm) addForm.style.display = 'block';
}

// -----------------------------
// 🔹 CRUD
// -----------------------------
export async function deleteCoffee(id, name, alertFn = alert) {
  if (!confirm(`¿Eliminar café "${name}"?`)) return;

  try {
    const res = await fetch(`${getBackendURL()}/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    alertFn('✅ Café eliminado exitosamente!');
    loadCoffees();
    updateStats();
  } catch (error) {
    console.error('❌ Error al eliminar café:', error);
    alertFn(`⚠️ Error al eliminar café: ${error.message}`);
  }
}

export async function handleFormSubmit(event) {
  if (event) event.preventDefault();

  const coffee = {
    name: document.getElementById('name').value,
    origin: document.getElementById('origin').value,
    type: document.getElementById('type').value,
    price: Number.parseFloat(document.getElementById('price').value),
    rating: Number.parseFloat(document.getElementById('rating').value),
    roast: document.getElementById('roast').value,
    description: document.getElementById('description').value
  };

  try {
    const url = editingCoffeeId 
      ? `${getBackendURL()}/api/products/${editingCoffeeId}`
      : `${getBackendURL()}/api/products`;
    
    const method = editingCoffeeId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coffee)
    });
    
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    alert(editingCoffeeId ? '✅ Café actualizado exitosamente!' : '✅ Café agregado exitosamente!');
    cancelEdit();
    loadCoffees();
    updateStats();
  } catch (error) {
    console.error('❌ Error al guardar café:', error);
    alert(`⚠️ Error al guardar café: ${error.message}`);
  }
}

// -----------------------------
// 🔹 Cargar Cafés
// -----------------------------
export async function loadCoffees() {
  const grid = document.getElementById('coffee-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="loading">Cargando cafés...</div>';

  try {
    const res = await fetch(`${getBackendURL()}/api/products`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const coffees = await res.json();
    renderCoffees(coffees);
  } catch (error) {
    console.error('❌ Error al cargar cafés:', error);
    grid.innerHTML = '<div class="loading">Error al cargar cafés</div>';
  }
}

// -----------------------------
// 🔹 Render / Stats
// -----------------------------
export function renderCoffees(coffees) {
  const grid = document.getElementById('coffee-grid');
  if (!grid) return;

  grid.innerHTML = '';
  if (!coffees || coffees.length === 0) {
    grid.innerHTML = '<div class="loading">No hay cafés disponibles</div>';
    return;
  }

  coffees.forEach(coffee => {
    const card = document.createElement('div');
    card.className = 'coffee-card';
    card.innerHTML = `
      <h3>${coffee.name}</h3>
      <p><strong>Origen:</strong> ${coffee.origin}</p>
      <p><strong>Tipo:</strong> ${coffee.type}</p>
      <p><strong>Tostado:</strong> ${coffee.roast}</p>
      <p><strong>Precio:</strong> $${coffee.price}</p>
      <p><strong>Calificación:</strong> ${coffee.rating} ⭐</p>
      <p>${coffee.description || ''}</p>
      <div class="card-actions">
        <button class="btn btn-small" onclick='editCoffee(${JSON.stringify(coffee)})'>✏️ Editar</button>
        <button class="btn btn-small btn-danger" onclick="deleteCoffee('${coffee._id}', '${coffee.name}')">🗑️ Eliminar</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

export async function updateStats() {
  try {
    const res = await fetch(`${getBackendURL()}/api/stats`);
    let stats;
    
    if (res?.ok) {
      stats = await res.json();
    } else {
      stats = { total: 0, avgPrice: '0.00', popularOrigin: 'N/A' };
    }
    
    const totalEl = document.getElementById('total-coffees');
    const priceEl = document.getElementById('avg-price');
    const originEl = document.getElementById('popular-origin');

    if (totalEl) totalEl.textContent = stats.total || 0;
    if (priceEl) priceEl.textContent = `$${stats.avgPrice || '0.00'}`;
    if (originEl) originEl.textContent = stats.popularOrigin || 'N/A';
  } catch (error) {
    console.error('❌ Error al cargar estadísticas:', error);
  }
}

// -----------------------------
// 🔹 Inicialización
// -----------------------------
export function init() {
  loadCoffees();
  updateStats();
  
  const form = document.getElementById('coffee-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
}

// Inicializar cuando el DOM esté listo
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      exposeGlobalFunctions();
    });
  } else {
    init();
    exposeGlobalFunctions();
  }
}

// Exponer funciones globalmente para uso en HTML (onclick)
function exposeGlobalFunctions() {
  if (typeof window !== 'undefined') {
    window.toggleForm = toggleForm;
    window.editCoffee = editCoffee;
    window.deleteCoffee = deleteCoffee;
    window.cancelEdit = cancelEdit;
  }
}