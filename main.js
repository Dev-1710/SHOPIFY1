/* SHOPIFY - Online Clothing Store | main.js */
const $=(s,e=document)=>e.querySelector(s);
const get=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v===null?d:v}catch(e){return d}};
const set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const today=()=>new Date().toISOString().slice(0,10);
const inr=n=>'&#8377;'+Number(n).toLocaleString('en-IN');
const SEED=[
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
const products=()=>{let p=get('sp_products',null);if(!p){p=SEED;set('sp_products',p)}return p};
const session=()=>get('sp_session',null);
const cart=()=>get('sp_cart',[]);
const cartCount=()=>cart().reduce((a,i)=>a+i.qty,0);
const wish=()=>get('sp_wish',[]);
function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}
 t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2200)}
function layout(){const s=session();
 document.body.insertAdjacentHTML('afterbegin',`<header><a class="logo" href="index.html">SHOPIFY</a><nav>
 <a href="index.html">Shop</a><a href="orders.html">My Orders</a><a href="contact.html">Contact</a>
 <a href="cart.html" id="cartLink">Cart (${cartCount()})</a>${s&&s.role==='admin'?'<a href="admin.html">Admin</a>':''}
 ${s?`<a href="#" id="out">Logout (${s.username})</a>`:'<a href="login.html">Login</a>'}</nav></header>`);
 document.body.insertAdjacentHTML('beforeend','<footer>&copy; 2026 SHOPIFY Clothing Store &middot; Student project by Dev Gulia</footer>');
 const o=$('#out');if(o)o.onclick=e=>{e.preventDefault();localStorage.removeItem('sp_session');location='index.html'}}
function addCart(id,size){if(!session()){location='login.html';return}
 const c=cart(),i=c.find(x=>x.id===id&&x.size===size);i?i.qty++:c.push({id,size,qty:1});set('sp_cart',c);
 $('#cartLink').textContent='Cart ('+cartCount()+')';toast('Added to cart (size '+size+')')}
/* ---------- Shop page ---------- */
function shop(){const g=$('#grid'),q=$('#q'),c=$('#cat'),so=$('#sort'),m=$('#modal');
 const draw=()=>{const t=q.value.toLowerCase(),w=wish();
  let l=products().filter(p=>(c.value==='All'||(c.value==='Wishlist'?w.includes(p.id):p.cat===c.value))&&p.name.toLowerCase().includes(t));
  if(so.value==='low')l.sort((a,b)=>a.price-b.price);if(so.value==='high')l.sort((a,b)=>b.price-a.price);
  g.innerHTML=l.map(p=>`<article class="card"><button class="heart" data-w="${p.id}" title="Wishlist">${w.includes(p.id)?'&#9829;':'&#9825;'}</button>
  <div class="img" style="background:${p.bg}" data-q="${p.id}">${art(p)}</div><h3>${p.name}</h3>
  <p>${p.cat} &middot; &#9733; ${p.rating||4.0}</p><div class="price">${inr(p.price)}</div>
  <div class="two-b"><button class="ghost" data-q="${p.id}">Quick View</button><button data-id="${p.id}">Add to Cart</button></div></article>`).join('')||'<p>No products found.</p>'};
 q.oninput=c.onchange=so.onchange=draw;
 g.onclick=e=>{const d=e.target.closest('[data-id],[data-q],[data-w]');if(!d)return;
  if(d.dataset.id)addCart(+d.dataset.id,'M');
  if(d.dataset.w){const w=wish(),i=+d.dataset.w;set('sp_wish',w.includes(i)?w.filter(x=>x!==i):[...w,i]);draw()}
  if(d.dataset.q){const p=products().find(x=>x.id===+d.dataset.q);
   m.innerHTML=`<div class="modal-in"><button class="x" id="mx">&times;</button><div class="mi" style="background:${p.bg}">${art(p)}</div>
   <h2>${p.name}</h2><p>${p.desc||''}</p><p><b>${inr(p.price)}</b> &middot; &#9733; ${p.rating||4.0}</p>
   <label>Size</label><select id="msz"><option>S</option><option selected>M</option><option>L</option><option>XL</option></select>
   <button id="madd" style="margin-top:12px">Add to Cart</button></div>`;m.style.display='flex';
   $('#mx').onclick=()=>m.style.display='none';$('#madd').onclick=()=>{addCart(p.id,$('#msz').value);m.style.display='none'}}};
 m.onclick=e=>{if(e.target===m)m.style.display='none'};draw()}
/* ---------- Login / Signup ---------- */
async function hash(s){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
 return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return btoa(s)}}
const strong=p=>/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(p);
function auth(){const m=$('#msg'),L=$('#loginForm'),S=$('#signupForm');
 $('#tabL').onclick=()=>{L.style.display='block';S.style.display='none';m.textContent=''};
 $('#tabS').onclick=()=>{S.style.display='block';L.style.display='none';m.textContent=''};
 S.onsubmit=async e=>{e.preventDefault();const u=$('#su').value.trim(),em=$('#se').value.trim(),p=$('#sp').value;m.className='msg';
  const users=get('sp_users',[]);
  if(users.some(x=>x.username===u)||u==='admin')return m.textContent='Username already taken.';
  if(!strong(p))return m.textContent='Password needs 6+ chars, upper, lower, number and special character.';
  if(p!==$('#sc').value)return m.textContent='Passwords do not match.';
  users.push({username:u,email:em,password:await hash(p),joined:today()});set('sp_users',users);
  S.reset();$('#tabL').click();m.className='msg ok';m.textContent='Account created. Please login.'};
 L.onsubmit=async e=>{e.preventDefault();const u=$('#lu').value.trim(),p=$('#lp').value;m.className='msg';
  if(u==='admin'&&p==='Admin@123'){set('sp_session',{username:'admin',role:'admin'});return location='admin.html'}
  const f=get('sp_users',[]).find(x=>x.username===u);
  if(f&&f.password===await hash(p)){set('sp_session',{username:u,role:'user'});location='index.html'}
  else m.textContent='Invalid username or password.'}}
/* ---------- Cart & checkout ---------- */
const COUPONS={SAVE10:10,WELCOME20:20};
function cartPage(){if(!session()){location='login.html';return}
 const co=$('#co');if(!co.dataset.h)co.dataset.h=co.innerHTML;else co.innerHTML=co.dataset.h;
 let disc=0,code='';const box=$('#items');
 const calc=()=>{const P=products();let sub=0;cart().forEach(i=>{const p=P.find(x=>x.id===i.id);if(p)sub+=p.price*i.qty});
  const d=Math.round(sub*disc/100),ship=sub===0||sub-d>=999?0:99;return{sub,d,ship,total:sub-d+ship}};
 const draw=()=>{const c=cart(),P=products();
  box.innerHTML=c.length?`<table><tr><th>Item</th><th>Size</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr>`+c.map((i,k)=>{
   const p=P.find(x=>x.id===i.id);if(!p)return'';
   return`<tr><td>${p.name}</td><td>${i.size}</td><td>${inr(p.price)}</td><td class="qty"><button data-a="-" data-k="${k}">-</button> ${i.qty} <button data-a="+" data-k="${k}">+</button></td><td>${inr(p.price*i.qty)}</td><td><button class="danger" data-a="x" data-k="${k}">Remove</button></td></tr>`}).join('')+'</table>':'<p>Your cart is empty.</p>';
  const t=calc(),sm=$('#sum');if(sm)sm.innerHTML=`Subtotal: ${inr(t.sub)}<br>Discount (${disc}%): -${inr(t.d)}<br>Delivery: ${t.ship?inr(t.ship):'FREE'}<br><b>Total: ${inr(t.total)}</b>`};
 box.onclick=e=>{const a=e.target.dataset.a,k=+e.target.dataset.k;if(!a)return;const c=cart();
  if(a==='+')c[k].qty++;if(a==='-')c[k].qty--;if(a==='x')c[k].qty=0;set('sp_cart',c.filter(x=>x.qty>0));draw()};
 $('#apply').onclick=()=>{const v=$('#cp').value.trim().toUpperCase();
  if(COUPONS[v]){disc=COUPONS[v];code=v;toast('Coupon applied: '+v)}else{disc=0;code='';toast('Invalid coupon')}draw()};
 $('#pay').onclick=()=>{const c=cart(),n=$('#nm').value.trim(),ph=$('#ph').value.trim(),ad=$('#ad').value.trim();
  if(!c.length)return toast('Cart is empty');if(!n||!/^\d{10}$/.test(ph)||!ad)return toast('Enter name, 10-digit phone and address');
  const P=products(),t=calc(),id='SP'+Date.now().toString().slice(-8);
  const items=c.map(i=>{const p=P.find(x=>x.id===i.id);return{name:p.name,size:i.size,qty:i.qty,price:p.price}});
  const o=get('sp_orders',[]);o.push({id,user:session().username,name:n,phone:ph,address:ad,items,coupon:code,total:t.total,status:'Pending',date:today()});
  set('sp_orders',o);set('sp_cart',[]);
  $('#co').innerHTML=`<h2>Order placed!</h2><p>Order ID: <b>${id}</b></p><p>Amount: <b>${inr(t.total)}</b></p><p>Demo payment successful (no real payment is made).</p><a class="btn" href="orders.html">View My Orders</a>`;
  $('#cartLink').textContent='Cart (0)';draw()};
 draw()}
/* ---------- My orders ---------- */
function ordersPage(){const s=session();if(!s){location='login.html';return}
 const l=get('sp_orders',[]).filter(o=>o.user===s.username).reverse();
 $('#list').innerHTML=l.length?l.map(o=>`<div class="box wide"><b>${o.id}</b> &middot; ${o.date} &middot; <span class="tag">${o.status}</span>
  <p>${o.items.map(i=>`${i.name} (${i.size}) x${i.qty}`).join(', ')}</p><p>Total paid: <b>${inr(o.total)}</b>${o.coupon?' &middot; Coupon '+o.coupon:''}</p></div>`).join(''):'<p>You have not placed any orders yet.</p>'}
/* ---------- Contact ---------- */
function contactPage(){$('#cf').onsubmit=e=>{e.preventDefault();const m=get('sp_messages',[]);
 m.push({name:$('#cn').value.trim(),email:$('#ce').value.trim(),text:$('#ct').value.trim(),date:today()});set('sp_messages',m);e.target.reset();toast('Message sent. We will reply soon.')}}
/* ---------- Admin ---------- */
function admin(){const s=session();if(!s||s.role!=='admin'){location='login.html';return}
 const draw=()=>{const P=products(),O=get('sp_orders',[]),U=get('sp_users',[]),M=get('sp_messages',[]);
  $('#stats').innerHTML=[['Products',P.length],['Orders',O.length],['Customers',U.length],['Revenue',inr(O.filter(o=>o.status!=='Cancelled').reduce((a,o)=>a+o.total,0))]].map(x=>`<div class="stat">${x[0]}<b>${x[1]}</b></div>`).join('');
  $('#plist').innerHTML='<tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th></th></tr>'+P.map(p=>`<tr><td>${p.id}</td><td>${p.name}</td><td>${p.cat}</td><td>${inr(p.price)}</td><td><button class="danger" data-del="${p.id}">Delete</button></td></tr>`).join('');
  $('#olist').innerHTML='<tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr>'+(O.map((o,i)=>`<tr><td>${o.id}</td><td>${o.name} (${o.user})</td><td>${o.date}</td><td>${inr(o.total)}</td><td><select data-st="${i}">${['Pending','Shipped','Delivered','Cancelled'].map(x=>`<option${x===o.status?' selected':''}>${x}</option>`).join('')}</select></td></tr>`).join('')||'<tr><td colspan="5">No orders yet.</td></tr>');
  $('#ulist').innerHTML='<tr><th>Username</th><th>Email</th><th>Joined</th></tr>'+(U.map(u=>`<tr><td>${u.username}</td><td>${u.email}</td><td>${u.joined}</td></tr>`).join('')||'<tr><td colspan="3">No customers yet.</td></tr>');
  $('#mlist').innerHTML='<tr><th>Name</th><th>Email</th><th>Message</th><th>Date</th></tr>'+(M.map(m=>`<tr><td>${m.name}</td><td>${m.email}</td><td>${m.text}</td><td>${m.date}</td></tr>`).join('')||'<tr><td colspan="4">No messages yet.</td></tr>')};
 $('#plist').onclick=e=>{if(e.target.dataset.del){set('sp_products',products().filter(p=>p.id!==+e.target.dataset.del));draw()}};
 $('#olist').onchange=e=>{const o=get('sp_orders',[]);o[+e.target.dataset.st].status=e.target.value;set('sp_orders',o);draw();toast('Status updated')};
 $('#addP').onsubmit=e=>{e.preventDefault();const P=products(),n=$('#pn').value.trim(),pr=+$('#pp').value;if(!n||pr<=0)return;
  P.push({id:Math.max(0,...P.map(p=>p.id))+1,name:n,cat:$('#pc').value,price:pr,type:$('#pt').value,col:'#8a7d6b',bg:'#eee6da',rating:4.0,desc:'New arrival at SHOPIFY.'});
  set('sp_products',P);e.target.reset();draw()};
 draw()}
document.addEventListener('DOMContentLoaded',()=>{layout();const F={shop,auth,cartPage,ordersPage,contactPage,admin}[document.body.dataset.page];if(F)F()});
