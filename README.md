# SHOPIFY - Online Clothing Store

A front-end e-commerce website for a clothing store, built with **HTML, CSS and JavaScript** (no backend, no database).
Made as my project for the Diploma in IT Engineering course at EDUCLENTT Learning Center, Bahadurgarh.

> "SHOPIFY" is only the name of this student project. It is not connected with any commercial company.

## Features

**Customer side**
- Sign up and login (strong password rule, passwords stored as SHA-256 hashes)
- Search, category filter and price sorting
- Wishlist and quick-view window with size selection
- Cart with quantity control, coupons (`SAVE10`, `WELCOME20`) and delivery charge (free above Rs. 999)
- Checkout form validation and a demo "Pay Now" button (no real payment)
- My Orders page and a contact form

**Admin side**
- Dashboard with totals for products, orders, customers and revenue
- Add and delete products
- Change order status (Pending, Shipped, Delivered, Cancelled)
- View customers and contact messages

## Technologies
HTML5, CSS3, JavaScript (ES6), Web Storage API (`localStorage`), SubtleCrypto (SHA-256), Visual Studio Code.

## How to run
1. Download or clone this repository.
2. Open `index.html` in any web browser. No installation is needed.

Demo admin login (written in `main.js`): username `admin`, password `Admin@123`.

## Project structure
```
index.html     Home page and product catalogue
login.html     Login and sign-up
cart.html      Cart and checkout
orders.html    Customer order history
contact.html   Contact form
admin.html     Admin dashboard
style.css      Stylesheet
main.js        All JavaScript logic
screenshots/   Screenshots used in this README
```

## Data storage
All data is saved in the browser's `localStorage` with these keys: `sp_products`, `sp_users`, `sp_session`, `sp_cart`, `sp_wish`, `sp_orders`, `sp_messages`. Data stays on one device and is cleared if browser data is cleared.

## Limitations
- No backend or database, so data is not shared between devices.
- The payment button is a demonstration only.
- The admin login is fixed inside the code, which is fine for a demo but not for a live shop.

## Screenshots
| Home | Quick view |
|---|---|
| ![Home](screenshots/home.png) | ![Quick view](screenshots/quickview.png) |

| Cart | Admin |
|---|---|
| ![Cart](screenshots/cart.png) | ![Admin](screenshots/admin.png) |

## Author
Dev Gulia - B.Tech Information Technology (2024-2028), Guru Tegh Bahadur 4th Centenary Engineering College, New Delhi.
