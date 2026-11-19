# Online Clothing Store - Backend

REST API + SQLite database for the Shopify-style clothing store project
(Dev Gulia, B.Tech IT). It replaces `localStorage` with a real server and database.

**Zero npm packages.** Uses only what is built into Node.js 22.13+ (`http`, `crypto`, `node:sqlite`).

## Run
```bash
node -v            # must be 22.13 or newer
npm start          # http://localhost:3000
npm test           # 25 automated checks
```
Optional: copy `.env.example` to `.env` to change port / admin password.
Default admin: **admin / Admin@123** (change it!). Sample products are added on first run.

To serve your frontend too, put `index.html` etc. inside the `public/` folder and open http://localhost:3000.
Add `<script src="api.js"></script>` and call the helper functions in `public/api.js` instead of localStorage.

## What is stored (maps to the old localStorage keys)
| Old key | Table | Contents |
|---|---|---|
| sp_users | `users` | username, email, **hashed** password (scrypt + salt), role |
| sp_session | `sessions` | login token (stored hashed), expiry 7 days |
| sp_products | `products` | name, category, price, type, rating |
| sp_cart | `cart` | product, size, quantity per user |
| sp_wish | `wishlist` | wishlist product ids per user |
| sp_orders | `orders` | order id, items, coupon, total, status |
| sp_messages | `messages` | contact form messages |

## API
Send `Authorization: Bearer <token>` (returned by signup/login) for protected routes.

| Method | Route | Who |
|---|---|---|
| POST | `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout` | public / user |
| GET | `/api/auth/me` | user |
| GET | `/api/products?search=&category=&sort=low\|high` | public |
| POST / DELETE | `/api/products`, `/api/products/:id` | admin |
| GET / POST | `/api/cart` , `/api/cart` | user |
| PATCH / DELETE | `/api/cart/:id` | user |
| GET / POST | `/api/wishlist`, `/api/wishlist/:productId` (toggle) | user |
| POST | `/api/coupons/validate` | public |
| POST / GET | `/api/orders` (checkout / my orders) | user |
| POST | `/api/messages` (contact form) | public |
| GET | `/api/admin/stats`, `/orders`, `/customers`, `/messages` | admin |
| PATCH | `/api/admin/orders/:id` `{status}` | admin |

## Security (good points for the viva)
- Passwords hashed with **scrypt + random salt** (stronger than plain SHA-256); never stored or returned in plain text
- Same strong-password rule enforced on the **server**, not just in the browser
- Random session tokens, stored hashed in DB, expire after 7 days
- Role check on every admin route (customer gets `403`)
- Order totals, coupons and delivery are **recalculated on the server** so prices can't be tampered with
- All SQL uses prepared statements (prevents SQL injection)
- Login rate limit (10 tries / 5 min)

## Business rules
Coupons `SAVE10` (10%) and `WELCOME20` (20%); free delivery above Rs 999, otherwise Rs 49
(change `DELIVERY_CHARGE` in `src/server.js` if your frontend uses a different amount).

## Push to GitHub
```bash
git init && git add . && git commit -m "Add backend" 
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```
