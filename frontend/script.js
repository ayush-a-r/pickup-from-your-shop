const API_URL = 'http://localhost:5000/api';

function handleShopkeeperRegister(formSelector) {
  const form = document.querySelector(formSelector);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const shopName = form.shopName.value;
    const phone = form.phone.value;
    const address = {
      state: form.state.value,
      district: form.district.value,
      city: form.city.value,
      locality: form.locality.value
    };
    const res = await fetch(`${API_URL}/shopkeepers/register`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ phone, shopName, address })
    });
    if (res.ok) {
      alert('Shopkeeper registered! Please login.');
      window.location = "login.html";
    } else {
      alert('Registration failed');
    }
  });
}

function handleShopkeeperLogin(formSelector) {
  const form = document.querySelector(formSelector);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = form.phone.value;
    const res = await fetch(`${API_URL}/shopkeepers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('shopkeeperId', data.id);
      localStorage.setItem('shopName', data.shopName);
      window.location = "dashboard.html";
    } else {
      alert('Shopkeeper not found!');
    }
  });
}

function handleCustomerLogin(formSelector) {
  const form = document.querySelector(formSelector);
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const phone = this.phone.value;
    const name = this.name.value;
    const res = await fetch(`${API_URL}/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ phone, name })
    });
    const data = await res.json();
    if (data.id) {
      localStorage.setItem('customerId', data.id);
      localStorage.setItem('customerName', data.name);
      window.location = 'dashboard.html';
    } else {
      alert('Login error');
    }
  });
}
function requireCustomerLogin() {
  if (!localStorage.getItem('customerId')) window.location = 'login.html';
}

// Address cascading for registration and order form
function populate(id, url) {
  const sel = document.getElementById(id);
  sel.innerHTML = '<option value="">Select</option>';
  fetch(url).then(r=>r.json())
    .then(vals => { vals.forEach(val => { let o = document.createElement('option'); o.value = o.text = val; sel.appendChild(o); }); });
}
function initAddressDropdowns(base = '') {
  populate(`${base}state`, `${API_URL}/shopkeepers/states`);
  document.getElementById(`${base}state`).addEventListener('change', function() {
    populate(`${base}district`, `${API_URL}/shopkeepers/districts?state=${encodeURIComponent(this.value)}`);
    document.getElementById(`${base}city`).innerHTML = '';
    document.getElementById(`${base}locality`).innerHTML = '';
  });
  document.getElementById(`${base}district`).addEventListener('change', function() {
    populate(`${base}city`, `${API_URL}/shopkeepers/cities?state=${encodeURIComponent(document.getElementById(`${base}state`).value)}&district=${encodeURIComponent(this.value)}`);
    document.getElementById(`${base}locality`).innerHTML = '';
  });
  document.getElementById(`${base}city`).addEventListener('change', function() {
    populate(`${base}locality`,
      `${API_URL}/shopkeepers/localities?state=${encodeURIComponent(document.getElementById(`${base}state`).value)}&district=${encodeURIComponent(document.getElementById(`${base}district`).value)}&city=${encodeURIComponent(this.value)}`);
  });
}

function updateShopDropdown() {
  const s = document.getElementById('state').value;
  const d = document.getElementById('district').value;
  const c = document.getElementById('city').value;
  const l = document.getElementById('locality').value;
  const url = `${API_URL}/shopkeepers?state=${encodeURIComponent(s)}&district=${encodeURIComponent(d)}&city=${encodeURIComponent(c)}&locality=${encodeURIComponent(l)}`;
  fetch(url).then(r=>r.json()).then(shops=>{
    const sel = document.getElementById('shopkeeperId');
    sel.innerHTML = '<option value="">Select</option>';
    shops.forEach(shop => {
      let o = document.createElement('option');
      o.value = shop._id;
      o.text = shop.shopName;
      sel.appendChild(o);
    });
  });
}

// SHOPKEEPER dashboard
async function loadShopkeeperOrders() {
  const id = localStorage.getItem('shopkeeperId');
  if (!id) { window.location = 'login.html'; return; }
  const res = await fetch(`${API_URL}/orders/shopkeeper/${id}`);
  const orders = await res.json();
  const ordersUL = document.getElementById('orders');
  if (!orders.length)
    ordersUL.innerHTML = "<li class='card'>No pending orders.</li>";
  else
    ordersUL.innerHTML = orders.map(o => `
      <li class="card">
        <div><b>${o.customerId?.name||''} (${o.customerId?.phone||''})</b></div>
        <div class='small'>Order #: ${o.orderNumber}</div>
        <div class='small'>Items: ${o.items.map(i => `${i.name} (${i.company}) x${i.quantity}`).join(', ')}</div>
        <div class='small'>Pickup: ${o.pickupTime}</div>
        <button onclick="completeOrder('${o._id}')">Complete</button>
        <button onclick="cancelOrder('${o._id}')">Cancel</button>
      </li>
    `).join('');
}
window.completeOrder = async function(id) { await fetch(`${API_URL}/orders/${id}/complete`, {method:'POST'}); loadShopkeeperOrders(); loadStats();}
window.cancelOrder = async function(id) { await fetch(`${API_URL}/orders/${id}/cancel`, {method:'POST'}); loadShopkeeperOrders(); loadStats();}
async function loadStats() {
  const id = localStorage.getItem('shopkeeperId');
  const res = await fetch(`${API_URL}/orders/statistics/${id}`);
  const stats = await res.json();
  document.getElementById('total').textContent = stats.totalOrders;
  document.getElementById('completed').textContent = stats.completedOrders;
}

// CUSTOMER dashboard: add item and order
let itemCount = 0;
function addItemField() {
  itemCount++;
  const div = document.createElement('div');
  div.className = "card";
  div.id = `item${itemCount}`;
  div.innerHTML = `
    <label>Item Name: <input type="text" name="name" required class="input"></label>
    <label>Company: <input type="text" name="company" class="input"></label>
    <label>Quantity: <input type="text" name="quantity" required class="input"></label>
    <button type="button" onclick="removeItemField('${div.id}')" class="btn">Remove</button>
  `;
  document.getElementById('itemsList').appendChild(div);
}
window.addItemField = addItemField;
window.removeItemField = (id) => document.getElementById(id).remove();

async function loadMyOrders() {
  const id = localStorage.getItem('customerId');
  const res = await fetch(`${API_URL}/orders/customer/${id}`);
  const orders = await res.json();
  document.getElementById('myOrders').innerHTML = (orders.length ? orders.map(o => `
    <li class="card">
      <div><b>Order #: ${o.orderNumber}</b></div>
      <div>Shop: ${o.shopkeeperId?.shopName||''}</div>
      <div>${o.items.map(i => `${i.name} (${i.company}) x${i.quantity}`).join(', ')}</div>
      <div>Pickup: ${o.pickupTime}</div>
      <div>Status: ${o.status}</div>
      ${o.status==='pending'?`<button class="btn" onclick="cancelOrder('${o._id}')">Cancel</button>`:''}
    </li>
  `).join('') : "<li>No orders yet.</li>");
}
window.cancelOrder = async function(id) { await fetch(`${API_URL}/orders/${id}/cancel`, {method:'POST'}); loadMyOrders(); }
