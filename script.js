// ==========================================================================
// ۱. تنظیمات اتصال به فایربیس گوگل (ویترین آنلاین المنتال)
// ==========================================================================
const firebaseConfig = {
    apiKey: "AIzaSyBP93iYJYRhnHgtzCmoEE2Np5--lMLH5T8",
    authDomain: "elemental-shop.firebaseapp.com",
    projectId: "elemental-shop",
    storageBucket: "elemental-shop.firebasestorage.app",
    messagingSenderId: "501363613031",
    appId: "1:501363613031:web:b2fb2e9097c425d60923c2",
    measurementId: "G-GKXC40ZQC5"
};

// راه‌اندازی اولیه ابری
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// متغیرهای پویا برای نگهداری داده‌های ابری
let globalProductsList = [];
let cart = JSON.parse(localStorage.getItem("elementalCart")) || [];

// ==========================================================================
// ۲. رندر زنده محصولات در ویترین اصلی و کاتالوگ از فایربیس
// ==========================================================================
function renderProducts() {
    const grid = document.getElementById("productsGrid");
    if (!grid) return; 

    grid.innerHTML = "<p style='text-align:center; width:100%; color:#6a00ff; padding:20px;'>در حال فراخوانی کاتالوگ ابری... 🔮</p>";

    const urlParams = new URLSearchParams(window.location.search);
    const catFilter = urlParams.get('cat');
    
    const categoryTitle = document.getElementById("categoryTitle");
    if (categoryTitle) {
        categoryTitle.innerText = catFilter ? `دسته‌بندی: ${catFilter}` : "تمامی محصولات جادویی";
    }

    // اتصال زنده به فایربیس
    db.collection("products").orderBy("createdAt", "desc").onSnapshot((querySnapshot) => {
        grid.innerHTML = "";
        globalProductsList = [];

        if (querySnapshot.empty) {
            grid.innerHTML = `<p style="text-align:center; width:100%; color:#7f8c8d; font-weight:bold; padding:40px;">ویترین فروشگاه در حال حاضر خالی است! 🦄</p>`;
            return;
        }

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            // تبدیل آی‌دی متنی فایربیس به مشخصات محصول برای هماهنگی سبد خرید
            const productWithId = { id: doc.id, ...product };
            globalProductsList.push(productWithId);

            // فیلتر دسته‌بندی
            if (catFilter && product.category !== catFilter) return;

            const currentCount = product.count !== undefined ? parseInt(product.count) : 0;
            const isAvailable = currentCount > 0;

            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <span class="badge">${product.category}</span>
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/280x220?text=Elemental'">
                <h3>${product.name}</h3>
                <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">موجونی انبار: ${currentCount} عدد</div>
                <div class="price">${parseInt(product.price).toLocaleString()} تومان</div>
                <div class="card-buttons">
                    <a href="product.html?id=${doc.id}" class="view-btn">مشاهده</a>
                    ${isAvailable 
                        ? `<button class="add-btn" onclick="addToCart('${doc.id}')">🛒+</button>` 
                        : `<button class="add-btn" style="background:#bdc3c7; cursor:not-allowed;" disabled>اتمام</button>`
                    }
                </div>
            `;
            grid.appendChild(card);
        });
        
        // اگر بعد از فیلتر هیچ کالایی نبود
        if (grid.innerHTML === "" && catFilter) {
            grid.innerHTML = `<p style="text-align:center; width:100%; color:#7f8c8d; font-weight:bold; padding:40px;">هیچ محصولی در این دسته‌بندی پیدا نشد!</p>`;
        }
    });
}

// ==========================================================================
// ۳. سیستم تک‌محصول ابری (صفحه product.html)
// ==========================================================================
function renderSingleProduct() {
    const container = document.getElementById("productContainer");
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        container.innerHTML = `<p style="text-align:center; width:100%;">کد محصول ارسالی معتبر نیست! ☄️</p>`;
        return;
    }

    container.innerHTML = "<p style='text-align:center; width:100%;'>در حال لود مشخصات محصول ابری...</p>";

    db.collection("products").doc(productId).onSnapshot((doc) => {
        if (!doc.exists) {
            container.innerHTML = `<p style="text-align:center; width:100%;">محصول مورد نظر روی سرور یافت نشد! ☄️</p>`;
            return;
        }

        const product = doc.data();
        const currentCount = product.count !== undefined ? parseInt(product.count) : 0;
        const isAvailable = currentCount > 0;

        container.innerHTML = `
            <div class="prod-img-side">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x400?text=Elemental'">
            </div>
            <div class="prod-info-side">
                <h1 style="font-weight:900; color:#2c3e50;">${product.name}</h1>
                <span style="background:#e6e6fa; color:#6a00ff; padding:5px 15px; border-radius:15px; font-weight:bold; width:fit-content;">دسته‌بندی: ${product.category}</span>
                <div style="font-size: 14px; color: #e74c3c; margin-top: 15px; font-weight: bold;">موجودی در انبار: ${currentCount} عدد</div>
                <div class="single-price">${parseInt(product.price).toLocaleString()} تومان</div>
                <p class="desc">${product.desc || "این یک محصول جادویی فوق‌العاده کیوت از فروشگاه المنتال است. ✨"}</p>
                ${isAvailable 
                    ? `<button class="checkout-btn" onclick="addToCart('${doc.id}')" style="margin-top:20px;">🔮 افزودن به سبد خرید</button>`
                    : `<button class="checkout-btn" style="margin-top:20px; background:#bdc3c7; cursor:not-allowed;" disabled>❌ در حال حاضر ناموجود</button>`
                }
            </div>
        `;
    });
}

// ==========================================================================
// ۴. سیستم سبد خرید کشویی متصل به ساختار ابری
// ==========================================================================
function addToCart(id) {
    // پیدا کردن کالا از روی لیست آنلاین لود شده
    const product = globalProductsList.find(p => p.id === id);
    if (!product) {
        alert("خطا در افزودن کالا: محصول در کاتالوگ فعال یافت نشد.");
        return;
    }

    const cartItem = cart.find(item => item.id === id);
    const maxCount = product.count !== undefined ? parseInt(product.count) : 0;

    if (cartItem) {
        if (cartItem.qty >= maxCount) {
            alert(`🦄 متأسفانه بیش از ${maxCount} عدد از این محصول در انبار موجود نیست.`);
            return;
        }
        cartItem.qty += 1;
    } else {
        if (maxCount <= 0) {
            alert("☄️ این محصول در انبار به اتمام رسیده است.");
            return;
        }
        cart.push({ ...product, qty: 1 });
    }

    updateCart();
    openCartPanel();
}

function updateCart() {
    localStorage.setItem("elementalCart", JSON.stringify(cart));
    const cartItemsContainer = document.getElementById("cartItems");
    const totalPriceElement = document.getElementById("totalPrice");
    if (!cartItemsContainer || !totalPriceElement) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        total += parseInt(item.price) * item.qty;
        const itemDiv = document.createElement("div");
        itemDiv.className = "cart-item";
        itemDiv.innerHTML = `
            <img src="${item.image}" onerror="this.src='https://via.placeholder.com/60?text=Elemental'">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span>${(parseInt(item.price) * item.qty).toLocaleString()} ت</span>
            </div>
            <div class="qty-box">
                <button onclick="changeQty('${item.id}', -1)">-</button>
                <span>${item.qty}</span>
                <button onclick="changeQty('${item.id}', 1)">+</button>
            </div>
            <button class="remove-btn" onclick="removeFromCart('${item.id}')">×</button>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    totalPriceElement.innerText = total.toLocaleString();
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    const product = globalProductsList.find(p => p.id === id);
    if (!item || !product) return;

    const maxCount = product.count !== undefined ? parseInt(product.count) : 0;

    if (delta > 0 && item.qty >= maxCount) {
        alert(`🦄 حداکثر موجودی این کالا در انبار ${maxCount} عدد است.`);
        return;
    }

    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    updateCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCart();
}

function openCartPanel() {
    const panel = document.getElementById("cartPanel");
    const overlay = document.getElementById("cartOverlay");
    if (panel && overlay) { panel.classList.add("active"); overlay.style.display = "block"; }
}
function closeCartPanel() {
    const panel = document.getElementById("cartPanel");
    const overlay = document.getElementById("cartOverlay");
    if (panel && overlay) { panel.classList.remove("active"); overlay.style.display = "none"; }
}
function showCheckoutForm() {
    if(cart.length === 0) { alert("سبد خرید شما خالی است! 🛒"); return; }
    document.getElementById("cartMainSection").style.display = "none";
    document.getElementById("checkoutFormSection").style.display = "block";
}
function hideCheckoutForm() {
    document.getElementById("cartMainSection").style.display = "block";
    document.getElementById("checkoutFormSection").style.display = "none";
}

// ==========================================================================
// ۵. بخش پرداخت و شبیه‌ساز صدور فاکتور
// ==========================================================================
function redirectToGateway() {
    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const address = document.getElementById("customerAddress").value.trim();

    if (!name || !phone || !address) { 
        alert("لطفاً تمامی مشخصات ارسال را وارد کنید! 📋"); 
        return; 
    }

    const totalPriceTomanText = document.getElementById("totalPrice").innerText;
    const cleanTomanPrice = parseInt(totalPriceTomanText.replace(/,/g, ''));
    const priceInRial = cleanTomanPrice * 10; 

    let emailMessage = `🌟 سفارش جدید در وب‌سایت المنتال 🌟\n\n`;
    emailMessage += `👤 مشخصات خریدار:\n`;
    emailMessage += `-----------------------------------\n`;
    emailMessage += ` نام و نام خانوادگی: ${name}\n`;
    emailMessage += ` شماره موبایل: ${phone}\n`;
    emailMessage += ` آدرس دقیق پستی: ${address}\n\n`;
    emailMessage += `📦 اقلام خریداری شده:\n`;
    emailMessage += `-----------------------------------\n`;

    cart.forEach((item, index) => {
        emailMessage += `${index + 1}. ${item.name} | تعداد: ${item.qty} عدد | قیمت واحد: ${parseInt(item.price).toLocaleString()} تومان\n`;
    });

    emailMessage += `\n-----------------------------------\n`;
    emailMessage += `💰 مجموع به تومان: ${totalPriceTomanText} تومان\n`;
    emailMessage += `💳 مبلغ پرداختی درگاه بانک: ${priceInRial.toLocaleString()} ریال\n`;

    localStorage.setItem("latestOrderInvoice", emailMessage);

    const payBtn = document.querySelector("#checkoutFormSection button");
    if(payBtn) {
        payBtn.innerText = "⚡ در حال انتقال به بانک...";
        payBtn.disabled = true;
    }

    alert(`📋 فاکتور صادر شد.\nمبلغ تراکنش: ${priceInRial.toLocaleString()} ریال\nدر حال انتقال به درگاه شبیه‌سازی شده...`);
    window.location.href = `verify.html?status=success`; 
}

// ==========================================================================
// ۶. راه‌اندازی اولیه و گوش‌به‌زنگ‌ها روی اجزای صفحه
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    renderSingleProduct();
    updateCart();

    const cartBtn = document.querySelector(".cart-btn");
    if (cartBtn) cartBtn.addEventListener("click", openCartPanel);

    const closeBtn = document.querySelector(".close-cart");
    if (closeBtn) closeBtn.addEventListener("click", closeCartPanel);

    const overlay = document.getElementById("cartOverlay");
    if (overlay) overlay.addEventListener("click", closeCartPanel);
});
