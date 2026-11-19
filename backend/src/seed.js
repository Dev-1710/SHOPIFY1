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
  // older sample products from the first version are replaced by the frontend catalogue
  if (db.prepare("SELECT 1 FROM products WHERE name = 'Classic White T-Shirt'").get()) {
    db.exec("DELETE FROM products; DELETE FROM sqlite_sequence WHERE name = 'products'");
  }
  if (db.prepare('SELECT COUNT(*) c FROM products').get().c === 0) {
    const ins = db.prepare('INSERT INTO products (id, name, category, price, type, rating, description, col, bg) VALUES (?,?,?,?,?,?,?,?,?)');
    [
      [1, 'Classic White Tee', 'Men', 499, 'tee', 4.5, 'Soft 100% cotton round-neck tee for everyday wear.', '#f4f1ea', '#e3ddd0'],
      [2, 'Slim Fit Jeans', 'Men', 1499, 'jeans', 4.4, 'Stretch denim with a modern slim fit and five pockets.', '#4a6a94', '#d6dfeb'],
      [3, 'Winter Jacket', 'Men', 2999, 'jacket', 4.7, 'Warm padded jacket with a zip front and fleece lining.', '#3d3d3a', '#dcd4c8'],
      [4, 'Floral Summer Dress', 'Women', 1799, 'dress', 4.6, 'Light flowing dress with a floral print, ideal for summer.', '#d98b9b', '#f7dfe2'],
      [5, 'Cotton Kurti', 'Women', 999, 'kurti', 4.3, 'Straight-cut cotton kurti, comfortable for daily and festive use.', '#7b5ea7', '#e8def3'],
      [6, 'Zip Hoodie', 'Unisex', 1299, 'hoodie', 4.5, 'Fleece hoodie with kangaroo pocket and full zip.', '#4f7a5a', '#d9e8d5'],
      [7, 'Kids Party Frock', 'Kids', 899, 'dress', 4.2, 'Bright party frock with a soft inner lining for kids.', '#f2a65a', '#fbe5c8'],
      [8, 'Kids Cotton Shorts', 'Kids', 399, 'shorts', 4.1, 'Elastic-waist cotton shorts for play and travel.', '#3f8f8f', '#d3ebeb'],
    ].forEach((p) => ins.run(...p));
    console.log('Products added');
  }
}
module.exports = seed;
