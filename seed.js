const db = require('./db');
const { hashPassword } = require('./auth');

function seed() {
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123';
  if (!db.prepare('SELECT 1 FROM users WHERE role = ?').get('admin')) {
    db.prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?,?,?,?)')
      .run(adminUser, `${adminUser}@store.local`, hashPassword(adminPass), 'admin');
    console.log(`Admin account created: ${adminUser}`);
  }
  if (db.prepare('SELECT COUNT(*) c FROM products').get().c === 0) {
    const ins = db.prepare('INSERT INTO products (name, category, price, type, rating, description) VALUES (?,?,?,?,?,?)');
    [
      ['Classic White T-Shirt', 'Men', 499, 'T-Shirt', 4.3, 'Soft cotton everyday tee.'],
      ['Blue Denim Jeans', 'Men', 1299, 'Jeans', 4.5, 'Slim fit stretch denim.'],
      ['Floral Summer Dress', 'Women', 1599, 'Dress', 4.6, 'Light and breezy for summer.'],
      ['Black Hoodie', 'Men', 1199, 'Hoodie', 4.4, 'Warm fleece-lined hoodie.'],
      ['Kids Cartoon Tee', 'Kids', 399, 'T-Shirt', 4.2, 'Fun printed tee for kids.'],
      ['Cotton Kurti', 'Women', 899, 'Kurti', 4.5, 'Comfortable cotton kurti.'],
    ].forEach((p) => ins.run(...p));
    console.log('Sample products added');
  }
}
module.exports = seed;
