/* SHOPIFY - Online Clothing Store | main.js  (connected to the backend API) */
const $=(s,e=document)=>e.querySelector(s);
const get=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v===null?d:v}catch(e){return d}};
const set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const inr=n=>'&#8377;'+Number(n).toLocaleString('en-IN');

/* ---------- Backend connection ---------- */
// Opened from http://localhost:3000 -> same server. Opened elsewhere (e.g. GitHub Pages) -> local backend.
const API=(location.hostname==='localhost'||location.hostname==='127.0.0.1')?'/api':'http://localhost:3000/api';
const clearSession=()=>{['sp_token','sp_session','sp_cartcount'].forEach(k=>localStorage.removeItem(k))};
async function api(method,path,body,token){
 const t=token||localStorage.getItem('sp_token');let r;
 try{r=await fetch(API+path,{method,headers:{'Content-Type':'application/json',...(t?{Authorization:'Bearer '+t}:{})},body:body?JSON.stringify(body):undefined})}
 catch(e){throw new Error('Cannot reach the server. Start the backend (npm start) and open http://localhost:3000')}
 const d=await r.json().catch(()=>({}));
 if(!r.ok){if(r.status===401&&!path.startsWith('/auth/login')&&!token){clearSession();location='login.html'}
  throw new Error(d.error||'Request failed')}
 return d}

const SEED=[ /* shown only if the backend is not running */
{id:1,name:"Classic White Tee",cat:"Men",price:499,type:"tee",col:"#f4f1ea",bg:"#e3ddd0",rating:4.5,desc:"Soft 100% cotton round-neck tee for everyday wear."},
{id:2,name:"Slim Fit Jeans",cat:"Men",price:1499,type:"jeans",col:"#4a6a94",bg:"#d6dfeb",rating:4.4,desc:"Stretch denim with a modern slim fit and five pockets."},
{id:3,name:"Winter Jacket",cat:"Men",price:2999,type:"jacket",col:"#3d3d3a",bg:"#dcd4c8",rating:4.7,desc:"Warm padded jacket with a zip front and fleece lining."},
{id:4,name:"Floral Summer Dress",cat:"Women",price:1799,type:"dress",col:"#d98b9b",bg:"#f7dfe2",rating:4.6,desc:"Light flowing dress with a floral print, ideal for summer."},
{id:5,name:"Cotton Kurti",cat:"Women",price:999,type:"kurti",col:"#7b5ea7",bg:"#e8def3",rating:4.3,desc:"Straight-cut cotton kurti, comfortable for daily and festive use."},
{id:6,name:"Zip Hoodie",cat:"Unisex",price:1299,type:"hoodie",col:"#4f7a5a",bg:"#d9e8d5",rating:4.5,desc:"Fleece hoodie with kangaroo pocket and full zip."},
{id:7,name:"Kids Party Frock",cat:"Kids",price:899,type:"dress",col:"#f2a65a",bg:"#fbe5c8",rating:4.2,desc:"Bright party frock with a soft inner lining for kids."},
{id:8,name:"Kids Cotton Shorts",cat:"Kids",price:399,type:"shorts",col:"#3f8f8f",bg:"#d3ebeb",rating:4.1,desc:"Elastic-waist cotton shorts for play and travel."}];
const SHAPES={
tee:'<path d="M30 20 L50 12 Q60 24 70 12 L90 20 L104 46 L88 52 L86 106 L34 106 L32 52 L16 46Z"/>',
jeans:'<path d="M36 12 H84 L90 108 H66 L60 48 L54 108 H30Z"/><path d="M36 22 H84" stroke="#fff6" fill="none"/>',
jacket:'<path d="M32 16 L52 10 L60 22 L68 10 L88 16 L106 50 L92 56 L90 108 H30 L28 56 L14 50Z"/><path d="M60 22 V108" stroke="#fff5" stroke-width="3" fill="none"/>',
dress:'<path d="M46 10 H74 L72 42 L96 108 H24 L48 42Z"/><path d="M48 42 H72" stroke="#fff6" fill="none"/>',
kurti:'<path d="M44 10 H76 L84 36 L90 108 H30 L36 36Z"/><path d="M60 10 V40" stroke="#fff6" fill="none"/>',
hoodie:'<path d="M28 22 L48 14 Q60 34 72 14 L92 22 L108 52 L92 58 L90 108 H30 L28 58 L12 52Z"/><path d="M52 30 L52 56 M68 30 L68 56" stroke="#fff7" stroke-width="2" fill="none"/>',
shorts:'<path d="M32 28 H88 L96 84 H66 L60 58 L54 84 H24Z"/>'};
const art=p=>`<svg viewBox="0 0 120 120" width="100%" height="100%"><g fill="${p.col}" stroke="#0003" stroke-width="2" stroke-linejoin="round">${SHAPES[p.type]||SHAPES.tee}</g></svg>`;

/* products come from the database */
let PRODUCTS=null,OFFLINE=false;
const fromApi=p=>({id:p.id,name:p.name,cat:p.category,price:p.price,type:p.type,col:p.col,bg:p.bg,rating:p.rating,desc:p.description});
async function loadProducts(){if(PRODUCTS)return PRODUCTS;
 try{PRODUCTS=(await api('GET','/products')).map(fromApi)}catch(e){PRODUCTS=SEED;OFFLINE=true}return PRODUCTS}
const products=()=>PRODUCTS||SEED;

const session=()=>get('sp_session',null);
const cartCount=()=>+localStorage.getItem('sp_cartcount')||0;
const setCount=n=>{localStorage.setItem('sp_cartcount',n);const l=$('#cartLink');if(l)l.textContent='Cart ('+n+')'};
const countOf=items=>items.reduce((a,i)=>a+i.qty,0);
async function refreshCount(){try{setCount(countOf((await api('GET','/cart')).items))}catch(e){}}
function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}
 t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2200)}
function layout(){const s=session();
 document.body.insertAdjacentHTML('afterbegin',`<header><a class="logo" href="index.html">SHOPIFY</a><nav>
 <a href="index.html">Shop</a><a href="orders.html">My Orders</a><a href="contact.html">Contact</a>
 <a href="cart.html" id="cartLink">Cart (${s?cartCount():0})</a>${s&&s.role==='admin'?'<a href="admin.html">Admin</a>':''}
 ${s?`<a href="#" id="out">Logout (${s.username})</a>`:'<a href="login.html">Login</a>'}</nav></header>`);
 document.body.insertAdjacentHTML('beforeend','<footer>&copy; 2026 SHOPIFY Clothing Store &middot; Student project by Dev Gulia</footer>');
 const o=$('#out');if(o)o.onclick=async e=>{e.preventDefault();try{await api('POST','/auth/logout')}catch(_){}clearSession();location='index.html'};
 if(s)refreshCount()}
async function addCart(id,size){if(!session()){location='login.html';return}
 try{const r=await api('POST','/cart',{productId:id,size,qty:1});setCount(countOf(r.items));toast('Added to cart (size '+size+')')}catch(e){toast(e.message)}}

/* ---------- Shop page ---------- */
async function shop(){const g=$('#grid'),q=$('#q'),c=$('#cat'),so=$('#sort'),m=$('#modal');
 await loadProducts();if(OFFLINE)toast('Backend not running - showing demo products');
 let W=[];if(session()){try{W=await api('GET','/wishlist')}catch(e){}}
 const draw=()=>{const t=q.value.toLowerCase(),w=W;
  let l=products().filter(p=>(c.value==='All'||(c.value==='Wishlist'?w.includes(p.id):p.cat===c.value))&&p.name.toLowerCase().includes(t));
  if(so.value==='low')l.sort((a,b)=>a.price-b.price);if(so.value==='high')l.sort((a,b)=>b.price-a.price);
  g.innerHTML=l.map(p=>`<article class="card"><button class="heart" data-w="${p.id}" title="Wishlist">${w.includes(p.id)?'&#9829;':'&#9825;'}</button>
  <div class="img" style="background:${p.bg}" data-q="${p.id}">${art(p)}</div><h3>${p.name}</h3>
  <p>${p.cat} &middot; &#9733; ${p.rating||4.0}</p><div class="price">${inr(p.price)}</div>
  <div class="two-b"><button class="ghost" data-q="${p.id}">Quick View</button><button data-id="${p.id}">Add to Cart</button></div></article>`).join('')||'<p>No products found.</p>'};
 q.oninput=c.onchange=so.onchange=draw;
 g.onclick=async e=>{const d=e.target.closest('[data-id],[data-q],[data-w]');if(!d)return;
  if(d.dataset.id)addCart(+d.dataset.id,'M');
  if(d.dataset.w){if(!session()){location='login.html';return}const i=+d.dataset.w;
   try{const r=await api('POST','/wishlist/'+i);W=r.wished?[...W,i]:W.filter(x=>x!==i);draw()}catch(er){toast(er.message)}}
  if(d.dataset.q){const p=products().find(x=>x.id===+d.dataset.q);
   m.innerHTML=`<div class="modal-in"><button class="x" id="mx">&times;</button><div class="mi" style="background:${p.bg}">${art(p)}</div>
   <h2>${p.name}</h2><p>${p.desc||''}</p><p><b>${inr(p.price)}</b> &middot; &#9733; ${p.rating||4.0}</p>
   <label>Size</label><select id="msz"><option>S</option><option selected>M</option><option>L</option><option>XL</option></select>
   <button id="madd" style="margin-top:12px">Add to Cart</button></div>`;m.style.display='flex';
   $('#mx').onclick=()=>m.style.display='none';$('#madd').onclick=()=>{addCart(p.id,$('#msz').value);m.style.display='none'}}};
 m.onclick=e=>{if(e.target===m)m.style.display='none'};draw()}

/* ---------- Login / Signup (password is hashed on the server) ---------- */
const strong=p=>/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(p);
function auth(){const m=$('#msg'),L=$('#loginForm'),S=$('#signupForm');
 $('#tabL').onclick=()=>{L.style.display='block';S.style.display='none';m.textContent=''};
 $('#tabS').onclick=()=>{S.style.display='block';L.style.display='none';m.textContent=''};
 S.onsubmit=async e=>{e.preventDefault();const u=$('#su').value.trim(),em=$('#se').value.trim(),p=$('#sp').value;m.className='msg';
  if(!strong(p))return m.textContent='Password needs 6+ chars, upper, lower, number and special character.';
  if(p!==$('#sc').value)return m.textContent='Passwords do not match.';
  try{const r=await api('POST','/auth/signup',{username:u,email:em,password:p});
   try{await api('POST','/auth/logout',null,r.token)}catch(_){}   /* user logs in on the next step */
   S.reset();$('#tabL').click();m.className='msg ok';m.textContent='Account created. Please login.'}
  catch(er){m.textContent=er.message}};
 L.onsubmit=async e=>{e.preventDefault();const u=$('#lu').value.trim(),p=$('#lp').value;m.className='msg';
  try{const r=await api('POST','/auth/login',{username:u,password:p});
   localStorage.setItem('sp_token',r.token);const admin=r.user.role==='admin';
   set('sp_session',{username:r.user.username,role:admin?'admin':'user'});location=admin?'admin.html':'index.html'}
  catch(er){m.textContent=er.message}}}

/* ---------- Cart & checkout ---------- */
async function cartPage(){if(!session()){location='login.html';return}
 const co=$('#co');if(!co.dataset.h)co.dataset.h=co.innerHTML;else co.innerHTML=co.dataset.h;
 let disc=0,code='',data={items:[],subtotal:0,discount:0,delivery:0,total:0};const box=$('#items');
 const draw=()=>{const c=data.items;
  box.innerHTML=c.length?`<table><tr><th>Item</th><th>Size</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>`+c.map((i,k)=>
   `<tr><td>${i.name}</td><td>${i.size}</td><td>${inr(i.price)}</td><td class="qty"><button data-a="-" data-k="${k}">-</button> ${i.qty} <button data-a="+" data-k="${k}">+</button></td><td>${inr(i.price*i.qty)}</td><td><button class="danger" data-a="x" data-k="${k}">Remove</button></td></tr>`).join('')+'</table>':'<p>Your cart is empty.</p>';
  const sm=$('#sum');if(sm)sm.innerHTML=`Subtotal: ${inr(data.subtotal)}<br>Discount (${disc}%): -${inr(data.discount)}<br>Delivery: ${data.delivery?inr(data.delivery):'FREE'}<br><b>Total: ${inr(data.total)}</b>`};
 const load=async()=>{try{data=await api('GET','/cart'+(code?'?coupon='+code:''));setCount(countOf(data.items))}catch(e){toast(e.message)}draw()};
 box.onclick=async e=>{const a=e.target.dataset.a,k=+e.target.dataset.k;if(!a)return;const it=data.items[k];if(!it)return;
  try{const q=a==='+'?it.qty+1:it.qty-1;
   if(a==='x'||q<1)await api('DELETE','/cart/'+it.id);else await api('PATCH','/cart/'+it.id,{qty:q})}catch(er){toast(er.message)}
  await load()};
 $('#apply').onclick=async()=>{const v=$('#cp').value.trim().toUpperCase();
  try{const r=await api('POST','/coupons/validate',{code:v});disc=r.percent;code=v;toast('Coupon applied: '+v)}
  catch(e){disc=0;code='';toast('Invalid coupon')}await load()};
 $('#pay').onclick=async()=>{const n=$('#nm').value.trim(),ph=$('#ph').value.trim(),ad=$('#ad').value.trim();
  if(!data.items.length)return toast('Cart is empty');if(!n||!/^\d{10}$/.test(ph)||!ad)return toast('Enter name, 10-digit phone and address');
  try{const r=await api('POST','/orders',{name:n,phone:ph,address:ad,coupon:code});
   $('#co').innerHTML=`<h2>Order placed!</h2><p>Order ID: <b>${r.orderId}</b></p><p>Amount: <b>${inr(r.total)}</b></p><p>Demo payment successful (no real payment is made).</p><a class="btn" href="orders.html">View My Orders</a>`;
   setCount(0)}catch(er){toast(er.message)}};
 await load()}

/* ---------- My orders ---------- */
async function ordersPage(){const s=session();if(!s){location='login.html';return}
 let l=[];try{l=await api('GET','/orders')}catch(e){toast(e.message)}
 $('#list').innerHTML=l.length?l.map(o=>`<div class="box wide"><b>${o.id}</b> &middot; ${o.created_at.slice(0,10)} &middot; <span class="tag">${o.status}</span>
  <p>${o.items.map(i=>`${i.name} (${i.size}) x${i.qty}`).join(', ')}</p><p>Total paid: <b>${inr(o.total)}</b>${o.coupon?' &middot; Coupon '+o.coupon:''}</p></div>`).join(''):'<p>You have not placed any orders yet.</p>'}

/* ---------- Contact ---------- */
function contactPage(){$('#cf').onsubmit=async e=>{e.preventDefault();const f=e.target;
 try{await api('POST','/messages',{name:$('#cn').value.trim(),email:$('#ce').value.trim(),message:$('#ct').value.trim()});
  f.reset();toast('Message sent. We will reply soon.')}catch(er){toast(er.message)}}}

/* ---------- Admin ---------- */
async function admin(){const s=session();if(!s||s.role!=='admin'){location='login.html';return}
 let P=[],O=[],U=[],M=[],ST={};
 const draw=()=>{
  $('#stats').innerHTML=[['Products',ST.products],['Orders',ST.orders],['Customers',ST.customers],['Revenue',inr(ST.revenue||0)]].map(x=>`<div class="stat">${x[0]}<b>${x[1]??0}</b></div>`).join('');
  $('#plist').innerHTML='<tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th></th></tr>'+P.map(p=>`<tr><td>${p.id}</td><td>${p.name}</td><td>${p.cat}</td><td>${inr(p.price)}</td><td><button class="danger" data-del="${p.id}">Delete</button></td></tr>`).join('');
  $('#olist').innerHTML='<tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr>'+(O.map(o=>`<tr><td>${o.id}</td><td>${o.name} (${o.username})</td><td>${o.created_at.slice(0,10)}</td><td>${inr(o.total)}</td><td><select data-st="${o.id}">${['Pending','Shipped','Delivered','Cancelled'].map(x=>`<option${x===o.status?' selected':''}>${x}</option>`).join('')}</select></td></tr>`).join('')||'<tr><td colspan="5">No orders yet.</td></tr>');
  $('#ulist').innerHTML='<tr><th>Username</th><th>Email</th><th>Joined</th></tr>'+(U.map(u=>`<tr><td>${u.username}</td><td>${u.email}</td><td>${u.created_at.slice(0,10)}</td></tr>`).join('')||'<tr><td colspan="3">No customers yet.</td></tr>');
  $('#mlist').innerHTML='<tr><th>Name</th><th>Email</th><th>Message</th><th>Date</th></tr>'+(M.map(m=>`<tr><td>${m.name}</td><td>${m.email}</td><td>${m.message}</td><td>${m.created_at.slice(0,10)}</td></tr>`).join('')||'<tr><td colspan="4">No messages yet.</td></tr>')};
 const load=async()=>{try{
   [P,O,U,M,ST]=await Promise.all([api('GET','/products'),api('GET','/admin/orders'),api('GET','/admin/customers'),api('GET','/admin/messages'),api('GET','/admin/stats')]);
   P=P.map(fromApi);PRODUCTS=null}
  catch(e){if(/Admin only/.test(e.message)){location='login.html';return}toast(e.message)}
  draw()};
 $('#plist').onclick=async e=>{if(!e.target.dataset.del)return;
  try{await api('DELETE','/products/'+e.target.dataset.del)}catch(er){toast(er.message)}await load()};
 $('#olist').onchange=async e=>{if(!e.target.dataset.st)return;
  try{await api('PATCH','/admin/orders/'+encodeURIComponent(e.target.dataset.st),{status:e.target.value});toast('Status updated')}catch(er){toast(er.message)}await load()};
 $('#addP').onsubmit=async e=>{e.preventDefault();const f=e.target,n=$('#pn').value.trim(),pr=Math.round(+$('#pp').value);if(!n||pr<=0)return;
  try{await api('POST','/products',{name:n,category:$('#pc').value,price:pr,type:$('#pt').value,col:'#8a7d6b',bg:'#eee6da'});f.reset()}catch(er){toast(er.message)}await load()};
 await load()}
document.addEventListener('DOMContentLoaded',()=>{layout();const F={shop,auth,cartPage,ordersPage,contactPage,admin}[document.body.dataset.page];if(F)F()});
