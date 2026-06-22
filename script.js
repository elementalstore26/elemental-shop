import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// تنظیمات اتصال فایربیس
const firebaseConfig = {
    apiKey: "AIzaSyBP93iYJYRhnHgtzCmoEE2Np5--lMLH5T8",
    authDomain: "elemental-shop.firebaseapp.com",
    projectId: "elemental-shop",
    storageBucket: "elemental-shop.firebasestorage.app",
    messagingSenderId: "501363613031",
    appId: "1:501363613031:web:b2fb2e9097c425d60923c2",
    measurementId: "G-GKXC40ZQC5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let cart = [];

// ۱. لود کردن محصولات از فایربیس
async function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    const querySnapshot = await getDocs(collection(db, "products"));
    productsGrid.innerHTML = ''; 
    
    querySnapshot.forEach((doc) => {
        const product = doc.data();
        productsGrid.innerHTML += `
            <div class="product-card">
                <h3>${product.name}</h3>
                <p>${product.price} تومان</p>
                <button onclick="addToCart('${product.name}', ${product.price})">افزودن به سبد</button>
            </div>
        `;
    });
}

// ۲. مدیریت سبد خرید
window.addToCart = (name, price) => {
    cart.push({ name, price });
    updateCartUI();
    alert(name + " به سبد اضافه شد!");
};

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');
    cartItems.innerHTML = cart.map(item => `<p>${item.name} - ${item.price} تومان</p>`).join('');
    totalPrice.innerText = cart.reduce((sum, item) => sum + item.price, 0);
}

// ۳. ثبت سفارش در دیتابیس (بخش اصولی)
window.submitOrder = async () => {
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const totalAmount = document.getElementById('totalPrice').innerText;

    if (!customerName || !customerPhone) {
        alert("لطفاً نام و شماره تماس را وارد کنید.");
        return;
    }

    try {
        await addDoc(collection(db, "orders"), {
            customerName: customerName,
            customerPhone: customerPhone,
            items: cart,
            totalPriceRials: parseInt(totalAmount) * 10, // تبدیل به ریال
            orderDate: new Date().toLocaleString('fa-IR'),
            status: "در انتظار پرداخت"
        });
        
        alert("سفارش شما ثبت شد! در حال انتقال به درگاه (مبلغ به ریال: " + (parseInt(totalAmount) * 10) + ")");
    } catch (e) {
        console.error("خطا در ثبت:", e);
        alert("خطایی در ثبت سفارش رخ داد.");
    }
};

// ۴. توابع کنترل پنل
window.showCheckoutForm = () => {
    document.getElementById('cartMainSection').style.display = 'none';
    document.getElementById('checkoutFormSection').style.display = 'block';
};

window.hideCheckoutForm = () => {
    document.getElementById('cartMainSection').style.display = 'block';
    document.getElementById('checkoutFormSection').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', loadProducts);
