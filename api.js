// Drop-in helper for your frontend. Replace localStorage calls with these.
// If frontend is served by this backend, API stays '/api'. Otherwise use 'http://localhost:3000/api'.
const API = '/api';

async function api(method, path, body) {
  const token = localStorage.getItem('sp_token');
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');   // show data.error in your alert/toast
  return data;
}

// ---- examples ----
async function signup(username, email, password) {
  const { token, user } = await api('POST', '/auth/signup', { username, email, password });
  localStorage.setItem('sp_token', token); localStorage.setItem('sp_user', JSON.stringify(user));
  return user;
}
async function login(username, password) {
  const { token, user } = await api('POST', '/auth/login', { username, password });
  localStorage.setItem('sp_token', token); localStorage.setItem('sp_user', JSON.stringify(user));
  return user;            // user.role === 'admin' -> redirect to admin page
}
const logout = async () => { await api('POST', '/auth/logout').catch(() => {}); localStorage.clear(); };

const getProducts = (search = '', category = 'All', sort = '') =>
  api('GET', `/products?search=${encodeURIComponent(search)}&category=${category}&sort=${sort}`);
const addToCart = (productId, size, qty = 1) => api('POST', '/cart', { productId, size, qty });
const getCart = (coupon = '') => api('GET', `/cart?coupon=${coupon}`);       // returns items + totals
const placeOrder = (name, phone, address, coupon) => api('POST', '/orders', { name, phone, address, coupon });
const myOrders = () => api('GET', '/orders');
const toggleWish = (productId) => api('POST', `/wishlist/${productId}`);
const sendMessage = (name, email, message) => api('POST', '/messages', { name, email, message });

// admin
const adminStats = () => api('GET', '/admin/stats');
const adminOrders = () => api('GET', '/admin/orders');
const setStatus = (id, status) => api('PATCH', `/admin/orders/${id}`, { status });
const addProduct = (p) => api('POST', '/products', p);
const deleteProduct = (id) => api('DELETE', `/products/${id}`);
