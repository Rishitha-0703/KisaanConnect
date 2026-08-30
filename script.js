// =====================================================
// KISAANCONNECT IN-APP NOTIFICATION
// =====================================================

function showMessage(message, type = "success") {

    // Remove old message
    const oldMessage =
        document.getElementById("appNotification");

    if (oldMessage) {
        oldMessage.remove();
    }

    // Create notification
    const notification =
        document.createElement("div");

    notification.id = "appNotification";

    notification.className =
        "app-notification " + type;

    notification.innerHTML = `
        <span class="notification-icon">
            ${type === "success" ? "✅" :
              type === "error" ? "❌" : "⚠️"}
        </span>

        <span class="notification-text">
            ${message}
        </span>

        <button
            class="notification-close"
            onclick="closeMessage()">
            ×
        </button>
    `;

    document.body.appendChild(notification);

    // Automatically remove after 4 seconds
    setTimeout(() => {

        if (notification) {
            notification.remove();
        }

    }, 4000);
}


function closeMessage() {

    const notification =
        document.getElementById("appNotification");

    if (notification) {
        notification.remove();
    }
}
const API = "https://kisaanconnect-aeny.onrender.com";


// =====================================================
// LANGUAGE
// =====================================================

const translations = {

    en: {

        addProduct: "Add Product",
        productName: "Product Name",
        category: "Category",
        quantity: "Quantity",
        price: "Price ₹",
        location: "Farm Location",
        description: "Description",
        productImage: "Product Image",
        cart: "Cart",
        availableProducts: "Available Products",
        checkout: "Proceed to Checkout",
        orderSummary: "Order Summary",
        deliveryLocation: "Delivery Location",
        paymentMethod: "Payment Method",
        upiId: "UPI ID",
        placeOrder: "Place Order",
        myOrders: "My Orders",
        addToCart: "Add to Cart",
        remove: "Remove",
        emptyCart: "Your cart is empty.",
        orderPlaced: "Order placed successfully!"

    },

    te: {

        addProduct: "ఉత్పత్తిని జోడించండి",
        productName: "ఉత్పత్తి పేరు",
        category: "వర్గం",
        quantity: "పరిమాణం",
        price: "ధర ₹",
        location: "వ్యవసాయ స్థానం",
        description: "వివరణ",
        productImage: "ఉత్పత్తి చిత్రం",
        cart: "కార్ట్",
        availableProducts: "అందుబాటులో ఉన్న ఉత్పత్తులు",
        checkout: "చెక్‌అవుట్‌కు వెళ్లండి",
        orderSummary: "ఆర్డర్ వివరాలు",
        deliveryLocation: "డెలివరీ స్థానం",
        paymentMethod: "చెల్లింపు విధానం",
        upiId: "UPI ID",
        placeOrder: "ఆర్డర్ చేయండి",
        myOrders: "నా ఆర్డర్లు",
        addToCart: "కార్ట్‌లోకి జోడించండి",
        remove: "తొలగించండి",
        emptyCart: "మీ కార్ట్ ఖాళీగా ఉంది.",
        orderPlaced: "ఆర్డర్ విజయవంతంగా చేయబడింది!"

    },

    hi: {

        addProduct: "उत्पाद जोड़ें",
        productName: "उत्पाद का नाम",
        category: "श्रेणी",
        quantity: "मात्रा",
        price: "कीमत ₹",
        location: "खेत का स्थान",
        description: "विवरण",
        productImage: "उत्पाद की तस्वीर",
        cart: "कार्ट",
        availableProducts: "उपलब्ध उत्पाद",
        checkout: "चेकआउट करें",
        orderSummary: "ऑर्डर विवरण",
        deliveryLocation: "डिलीवरी स्थान",
        paymentMethod: "भुगतान का तरीका",
        upiId: "UPI ID",
        placeOrder: "ऑर्डर करें",
        myOrders: "मेरे ऑर्डर",
        addToCart: "कार्ट में जोड़ें",
        remove: "हटाएं",
        emptyCart: "आपका कार्ट खाली है।",
        orderPlaced: "ऑर्डर सफलतापूर्वक किया गया!"

    }

};


function getLanguage() {

    return localStorage.getItem(
        "language"
    ) || "en";

}


function changeLanguage(language) {

    localStorage.setItem(
        "language",
        language
    );

    applyLanguage();

}


function applyLanguage() {

    const language =
        getLanguage();

    const dictionary =
        translations[language];


    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key =
                element.getAttribute(
                    "data-i18n"
                );

            if (dictionary[key]) {

                element.textContent =
                    dictionary[key];

            }

        });


    const selector =
        document.getElementById(
            "languageSelect"
        );

    if (selector) {

        selector.value =
            language;

    }

}


document.addEventListener(
    "DOMContentLoaded",
    function() {

        applyLanguage();

        updateCartCount();

        initializePage();

    }
);


// =====================================================
// INITIALIZE PAGE
// =====================================================

function initializePage() {

    if (
        document.getElementById(
            "productForm"
        )
    ) {

        initializeProductForm();

    }


    if (
        document.getElementById(
            "productsContainer"
        )
    ) {

        loadProducts();

    }


    if (
        document.getElementById(
            "cartContainer"
        )
    ) {

        loadCart();

    }


    if (
        document.getElementById(
            "checkoutItems"
        )
    ) {

        loadCheckout();

    }


    if (
        document.getElementById(
            "ordersContainer"
        )
    ) {

        loadOrders();

    }

}


// =====================================================
// IMAGE PREVIEW
// =====================================================

function previewImage(event) {

    const image =
        document.getElementById(
            "imagePreview"
        );

    const file =
        event.target.files[0];


    if (!file) {

        image.style.display =
            "none";

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function(e) {

            image.src =
                e.target.result;

            image.style.display =
                "block";

        };


    reader.readAsDataURL(file);

}


// =====================================================
// VOICE ASSISTANT
// =====================================================

function startVoice(fieldId) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        alert(
            "Voice recognition is not supported. Please use Google Chrome."
        );

        return;

    }


    const language =
        getLanguage();


    const recognition =
        new SpeechRecognition();


    if (language === "te") {

        recognition.lang =
            "te-IN";

    }
    else if (language === "hi") {

        recognition.lang =
            "hi-IN";

    }
    else {

        recognition.lang =
            "en-IN";

    }


    recognition.continuous =
        false;

    recognition.interimResults =
        false;


    recognition.onstart =
        function() {

            alert(
                "🎤 Listening..."
            );

        };


    recognition.onresult =
        function(event) {

            const text =
                event.results[0][0]
                    .transcript;


            document.getElementById(
                fieldId
            ).value = text;

        };


    recognition.onerror =
        function(event) {

            console.log(
                "Voice error:",
                event.error
            );

            alert(
                "Could not understand. Please try again."
            );

        };


    recognition.start();

}


// =====================================================
// ADD PRODUCT
// =====================================================

function initializeProductForm() {

    const form =
        document.getElementById(
            "productForm"
        );


    const user =
        JSON.parse(
            localStorage.getItem(
                "user"
            )
        );


    if (!user ||
        user.role !== "farmer") {

        alert(
            "Please login as farmer."
        );

        window.location.href =
            "index.html";

        return;

    }


    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const formData =
                new FormData();


            formData.append(
                "farmer_id",
                user.id
            );

            formData.append(
                "name",
                document.getElementById(
                    "productName"
                ).value
            );

            formData.append(
                "category",
                document.getElementById(
                    "category"
                ).value
            );

            formData.append(
                "quantity",
                document.getElementById(
                    "quantity"
                ).value
            );

            formData.append(
                "price",
                document.getElementById(
                    "price"
                ).value
            );
            formData.append(
    "upi_id",
    document.getElementById("upi_id").value
);

            formData.append(
                "location",
                document.getElementById(
                    "productLocation"
                ).value
            );

            formData.append(
                "description",
                document.getElementById(
                    "description"
                ).value
            );


            const image =
                document.getElementById(
                    "productImage"
                );


            if (
                image.files.length > 0
            ) {

                formData.append(
                    "image",
                    image.files[0]
                );

            }


            const message =
                document.getElementById(
                    "productMessage"
                );


            message.textContent =
                "Adding product...";


            try {

                const response =
                    await fetch(
                        API +
                        "/api/products",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (!data.success) {

                    message.textContent =
                        data.message;

                    return;

                }


                alert(
                    "🌾 Product added successfully!"
                );


                window.location.href =
                    "farmer_dashboard.html";

            }
            catch(error) {

                console.error(error);

                message.textContent =
                    "Backend is not running.";

            }

        }
    );

}

// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

    const container =
        document.getElementById("productsContainer");

    if (!container) return;

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );

    try {

        const response =
            await fetch(
                API + "/api/products"
            );

        const data =
            await response.json();

        container.innerHTML = "";

        if (
            !data.success ||
            !data.products ||
            data.products.length === 0
        ) {

            container.innerHTML =
                "<h2>No products available.</h2>";

            return;
        }


        data.products.forEach(product => {

            const card =
                document.createElement("div");

            card.className =
                "product-card";


            // IMAGE

            const image =
                product.image
                ?
                `<img
                    src="${product.image}"
                    class="product-photo"
                    alt="${product.name}"
                >`
                :
                `<div class="no-image">
                    🌾
                </div>`;


            const stock =
                Number(product.quantity) || 0;


            // =================================================
            // FARMER VIEW
            // =================================================

            if (
                user &&
                user.role === "farmer" &&
                Number(user.id) ===
                Number(product.farmer_id)
            ) {

                card.innerHTML = `

                    ${image}

                    <h2>
                        ${product.name}
                    </h2>

                    <p>
                        👨‍🌾 ${product.farmer_name}
                    </p>

                    <p>
                        📍 ${product.location}
                    </p>

                    <p>
                        ${product.category}
                    </p>

                    <h3>
                        ₹${product.price}
                    </h3>

                    <p>
                        Stock:
                        <strong>
                            ${stock}
                        </strong>
                    </p>


                    <input
                        type="number"
                        id="stock-${product.id}"
                        min="0"
                        value="${stock}"
                        style="
                            width:100px;
                            padding:8px;
                            margin:5px;
                        "
                    >


                    <button
                        onclick="updateStock(${product.id})"
                        class="primary-button"
                    >
                        📦 Update Stock
                    </button>


                    <button
                        onclick="deleteProduct(${product.id})"
                        style="
                            background:#d32f2f;
                            color:white;
                            border:none;
                            padding:10px;
                            border-radius:8px;
                            cursor:pointer;
                            margin-top:8px;
                        "
                    >
                        🗑️ Delete Product
                    </button>

                `;

            }


            // =================================================
            // CONSUMER VIEW
            // =================================================

            else {

                if (stock <= 0) {

                    card.innerHTML = `

                        ${image}

                        <h2>
                            ${product.name}
                        </h2>

                        <p>
                            👨‍🌾 ${product.farmer_name}
                        </p>

                        <p>
                            📍 ${product.location}
                        </p>

                        <p>
                            ${product.category}
                        </p>

                        <h3>
                            ₹${product.price}
                        </h3>

                        <p style="
                            color:red;
                            font-weight:bold;
                            font-size:18px;
                        ">
                            🔴 OUT OF STOCK
                        </p>

                        <button
                            disabled
                            style="
                                background:#aaa;
                                color:white;
                                border:none;
                                padding:10px;
                                border-radius:8px;
                                cursor:not-allowed;
                            "
                        >
                            🛒 Out of Stock
                        </button>

                    `;

                }

                else {

                    card.innerHTML = `

                        ${image}

                        <h2>
                            ${product.name}
                        </h2>

                        <p>
                            👨‍🌾 ${product.farmer_name}
                        </p>

                        <p>
                            📍 ${product.location}
                        </p>

                        <p>
                            ${product.category}
                        </p>

                        <h3>
                            ₹${product.price}
                        </h3>

                        <p style="
                            color:green;
                            font-weight:bold;
                        ">
                            🟢 In Stock:
                            ${stock}
                        </p>

                        <p>
                            ${product.description || ""}
                        </p>

                        <input
                            type="number"
                            id="qty-${product.id}"
                            min="1"
                            max="${stock}"
                            value="1"
                            class="quantity-input"
                        >

                        <button
                            onclick="addToCart(${product.id})"
                            class="primary-button"
                        >
                            🛒
                            ${translations[getLanguage()].addToCart}
                        </button>

                    `;

                }

            }


            container.appendChild(card);

        });

    }
    catch(error) {

        console.error(error);

        container.innerHTML =
            "<h2>Backend is not running.</h2>";

    }

}


// =====================================================
// UPDATE STOCK
// =====================================================

async function updateStock(productId) {

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );

    if (
        !user ||
        user.role !== "farmer"
    ) {

        return;

    }


    const input =
        document.getElementById(
            "stock-" + productId
        );


    const stock =
        Number(input.value);


    if (
        isNaN(stock) ||
        stock < 0
    ) {

        alert(
            "Enter a valid stock quantity."
        );

        return;

    }


    try {

        const response =
            await fetch(
                API +
                "/api/products/" +
                productId +
                "/stock",
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        farmer_id:
                            user.id,

                        stock:
                            stock

                    })

                }
            );


        const data =
            await response.json();


        if (data.success) {

            alert(
                "Stock updated successfully!"
            );

            loadProducts();

        }
        else {

            alert(
                data.message ||
                "Unable to update stock."
            );

        }

    }
    catch(error) {

        console.error(error);

        alert(
            "Backend is not running."
        );

    }

}


// =====================================================
// DELETE FARMER PRODUCT
// =====================================================

async function deleteProduct(productId) {

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );


    if (
        !user ||
        user.role !== "farmer"
    ) {

        alert(
            "Only farmers can delete products."
        );

        return;

    }


    const confirmDelete =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                API +
                "/api/products/" +
                productId +
                "?farmer_id=" +
                user.id,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (data.success) {

            alert(
                "Product deleted successfully!"
            );

            loadProducts();

        }
        else {

            alert(
                data.message ||
                "Unable to delete product."
            );

        }

    }
    catch(error) {

        console.error(error);

        alert(
            "Backend is not running."
        );

    }

}


// =====================================================
// ADD TO CART
// =====================================================

async function addToCart(productId) {

    const quantity =
        document.getElementById(
            "qty-" + productId
        ).value;


    if (
        !quantity ||
        Number(quantity) <= 0
    ) {

        alert(
            "Enter a valid quantity."
        );

        return;

    }


    try {

        const response =
            await fetch(
                API +
                "/api/products"
            );


        const data =
            await response.json();


        const product =
            data.products.find(
                p =>
                    p.id === productId
            );


        if (!product) {

            alert(
                "Product not found."
            );

            return;

        }


        let cart =
            JSON.parse(
                localStorage.getItem(
                    "cart"
                )
            ) || [];


        const existing =
            cart.find(
                item =>
                    item.id === productId
            );


        if (existing) {

            existing.quantity =
                Number(
                    existing.quantity
                ) +
                Number(quantity);

        }
        else {

            cart.push({

                id: product.id,

                name: product.name,

                price: Number(
                    product.price
                ),

                image: product.image,

                farmer_name:
                    product.farmer_name,

                quantity:
                    Number(quantity)

            });

        }


        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        updateCartCount();

showMessage("🛒 Added to cart!", "success");

}
catch(error) {

    console.error(error);

    alert("Unable to add product to cart.");
}
}

// =====================================================
// CART COUNT
// =====================================================

function updateCartCount() {

    const cart =
        JSON.parse(
            localStorage.getItem(
                "cart"
            )
        ) || [];


    const count =
        cart.reduce(
            (total, item) =>
                total +
                Number(item.quantity),
            0
        );


    const element =
        document.getElementById(
            "cartCount"
        );


    if (element) {

        element.textContent =
            count;

    }

}


// =====================================================
// LOAD CART
// =====================================================

function loadCart() {

    const container =
        document.getElementById(
            "cartContainer"
        );


    const totalElement =
        document.getElementById(
            "cartTotal"
        );


    let cart =
        JSON.parse(
            localStorage.getItem(
                "cart"
            )
        ) || [];


    if (cart.length === 0) {

        container.innerHTML =
            `<h2>
                ${translations[getLanguage()].emptyCart}
             </h2>`;

        totalElement.textContent =
            "";

        return;

    }


    container.innerHTML =
        "";


    let total = 0;


    cart.forEach(
        (item, index) => {

            const itemTotal =
                item.price *
                item.quantity;


            total += itemTotal;


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "cart-item";


            div.innerHTML = `

                ${
                    item.image

                    ?

                    `<img
                        src="${item.image}"
                        class="cart-image"
                    >`

                    :

                    `<div class="cart-image">
                        🌾
                    </div>`
                }

                <div>

                    <h2>
                        ${item.name}
                    </h2>

                    <p>
                        Farmer:
                        ${item.farmer_name}
                    </p>

                    <p>
                        ₹${item.price}
                        ×
                        ${item.quantity}
                    </p>

                    <h3>
                        ₹${itemTotal}
                    </h3>

                    <button
                        onclick="removeFromCart(${index})">

                        ❌
                        ${translations[getLanguage()].remove}

                    </button>

                </div>

            `;


            container.appendChild(
                div
            );

        }
    );


    totalElement.innerHTML =
        `<h2>Total: ₹${total}</h2>`;

}


// =====================================================
// REMOVE CART ITEM
// =====================================================

function removeFromCart(index) {

    let cart =
        JSON.parse(
            localStorage.getItem(
                "cart"
            )
        ) || [];


    cart.splice(
        index,
        1
    );


    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    updateCartCount();

    loadCart();

}


// =====================================================
// CHECKOUT
// =====================================================

function goToCheckout() {

    const cart =
        JSON.parse(
            localStorage.getItem(
                "cart"
            )
        ) || [];


    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    window.location.href =
        "checkout.html";

}


// =====================================================
// LOAD CHECKOUT
// =====================================================

function loadCheckout() {

    const cart =
        JSON.parse(
            localStorage.getItem(
                "cart"
            )
        ) || [];


    const container =
        document.getElementById(
            "checkoutItems"
        );


    const totalElement =
        document.getElementById(
            "checkoutTotal"
        );


    let total = 0;


    container.innerHTML =
        "";


    cart.forEach(
        item => {

            const itemTotal =
                item.price *
                item.quantity;


            total += itemTotal;


            container.innerHTML += `

                <div class="checkout-item">

                    <strong>
                        ${item.name}
                    </strong>

                    <div>
    <p>Price per kg: ₹${item.price}</p>

    <p>Quantity: ${item.quantity} kg</p>

    <p>
        <strong>
            Total: ₹${itemTotal}
        </strong>
    </p>
</div>

                </div>

            `;

        }
    );


    totalElement.textContent =
        total;


    toggleUPI();

}


// =====================================================
// UPI
// =====================================================

function toggleUPI() {

    const payment =
        document.getElementById(
            "paymentMethod"
        );


    const upiBox =
        document.getElementById(
            "upiBox"
        );


    if (!payment || !upiBox)
        return;


    if (
        payment.value === "UPI"
    ) {

        upiBox.style.display =
            "block";

    }
    else {

        upiBox.style.display =
            "none";

    }

}


// =====================================================
// SUBMIT CHECKOUT
// =====================================================

async function submitCheckout() {

    const user =
        JSON.parse(
            localStorage.getItem(
                "user"
            )
        );


    if (!user ||
        user.role !== "consumer") {

        alert(
            "Please login as consumer."
        );

        return;

    }


    const cart =
        JSON.parse(
            localStorage.getItem(
                "cart"
            )
        ) || [];


    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    const deliveryLocation =
        document.getElementById(
            "deliveryLocation"
        ).value.trim();


    const paymentMethod =
        document.getElementById(
            "paymentMethod"
        ).value;


    const upiId =
        document.getElementById(
            "upiId"
        ).value.trim();


    if (!deliveryLocation) {

        alert(
            "Please enter delivery location."
        );

        return;

    }


    if (
        paymentMethod === "UPI" &&
        !upiId
    ) {

        alert(
            "Please enter your UPI ID."
        );

        return;

    }


    const message =
        document.getElementById(
            "checkoutMessage"
        );


    message.textContent =
        "Placing order...";


    try {

        // Place each cart item as an order
        for (
            const item of cart
        ) {

            const response =
                await fetch(
                    API +
                    "/api/orders",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                consumer_id:
                                    user.id,

                                product_id:
                                    item.id,

                                quantity:
                                    item.quantity,

                                delivery_location:
                                    deliveryLocation,

                                payment_method:
                                    paymentMethod,

                                upi_id:
                                    paymentMethod === "UPI"
                                    ? upiId
                                    : ""

                            })

                    }
                );


            const data =
                await response.json();


            if (!data.success) {

                throw new Error(
                    data.message
                );

            }

        }


        localStorage.removeItem(
            "cart"
        );


        updateCartCount();


        alert(
            "✅ " +
            translations[getLanguage()]
                .orderPlaced
        );


        window.location.href =
            "orders.html";

    }
    catch(error) {

        console.error(error);

        message.textContent =
            error.message ||
            "Order failed.";

    }

}


// =====================================================
// ORDERS
// =====================================================

async function loadOrders() {

    const user =
        JSON.parse(
            localStorage.getItem(
                "user"
            )
        );


    const container =
        document.getElementById(
            "ordersContainer"
        );


    if (!user) {

        window.location.href =
            "index.html";

        return;

    }


    let url;


    if (
        user.role === "consumer"
    ) {

        url =
            API +
            "/api/orders/consumer/" +
            user.id;

    }
    else {

        url =
            API +
            "/api/orders/farmer/" +
            user.id;

    }


    try {

        const response =
            await fetch(url);


        const data =
            await response.json();


        container.innerHTML =
            "";


        if (
            data.orders.length === 0
        ) {

            container.innerHTML =
                "<h2>No orders yet.</h2>";

            return;

        }


        data.orders.forEach(
            order => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "order-card";


                if (
                    user.role ===
                    "consumer"
                ) {

                    div.innerHTML = `

                        <h2>
                            📦 ${order.product_name}
                        </h2>

                        <p>
                            Farmer:
                            ${order.farmer_name}
                        </p>

                        <p>
                            Quantity:
                            ${order.quantity}
                        </p>

                        <p>
                            Total:
                            ₹${order.total_price}
                        </p>

                        <p>
                            Delivery:
                            ${order.delivery_location}
                        </p>

                        <p>
                            Payment:
                            ${order.payment_method}
                        </p>

                        <div class="status-box">

                            🚚
                            <strong>
                                ${order.status}
                            </strong>

                        </div>

                    `;

                }
                else {

                    div.innerHTML = `

                        <h2>
                            📦 ${order.product_name}
                        </h2>

                        <p>
                            Consumer:
                            ${order.consumer_name}
                        </p>

                        <p>
                            Quantity:
                            ${order.quantity}
                        </p>

                        <p>
                            Total:
                            ₹${order.total_price}
                        </p>

                        <p>
                            Delivery:
                            ${order.delivery_location}
                        </p>

                        <p>
                            Payment:
                            ${order.payment_method}
                        </p>

                        <div class="status-box">

                            🚚
                            <strong>
                                ${order.status}
                            </strong>

                        </div>

                    `;

                }


                container.appendChild(
                    div
                );

            }
        );

    }
    catch(error) {

        console.error(error);

        container.innerHTML =
            "<h2>Backend is not running.</h2>";

    }

}
// =====================================================
// REGISTRATION
// =====================================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const location = document.getElementById("location").value.trim();
        const upi_id =
    document.getElementById("upi_id")
        ? document.getElementById("upi_id").value.trim()
        : "";

        // Get Farmer or Consumer from previous page
        const role = localStorage.getItem("selectedRole");

        if (!role) {

            document.getElementById("message").textContent =
                "Please select Farmer or Consumer again.";

            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                body: JSON.stringify({

    name: name,

    email: email,

    phone: phone,

    location: location,

    role: role,

    upi_id: upi_id

})
                }
            );


            const data = await response.json();


            if (!data.success) {

                document.getElementById("message").textContent =
                    data.message || "Registration failed.";

                return;
            }


            // Save user information
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            // Go to correct dashboard
            if (role === "farmer") {

                window.location.href =
                    "farmer_dashboard.html";

            }
            else if (role === "consumer") {

                window.location.href =
                    "consumer_dashboard.html";

            }

        }
        catch (error) {

            console.error(error);

            document.getElementById("message").textContent =
                "Cannot connect to backend. Please start app.py.";

        }

    });

}
// =====================================================
// KISAANCONNECT - LANGUAGE SYSTEM
// English + Telugu + Hindi
// =====================================================

const languageTranslations = {

    en: {
        language: "Language",
        farmer: "Farmer",
        consumer: "Consumer",

        welcomeFarmer: "Welcome",
        welcomeConsumer: "Welcome",

        addProduct: "Add Product",
        addProductDesc: "List your agricultural products.",

        orders: "Orders",
        myOrders: "My Orders",
        ordersDesc: "View consumer orders.",

        browseProducts: "Browse Products",
        browseProductsDesc: "Buy fresh products directly from farmers.",

        myCart: "My Cart",
        myCartDesc: "View products added to your cart.",

        logout: "Logout",

        remove: "Remove",
        delete: "Delete",

        confirmDelete: "Are you sure you want to remove this item?",

        noProducts: "No products available.",
        noOrders: "No orders yet.",
        emptyCart: "Your cart is empty.",

        quantity: "Quantity",
        price: "Price",
        total: "Total"
    },


    te: {
        language: "భాష",
        farmer: "రైతు",
        consumer: "వినియోగదారు",

        welcomeFarmer: "స్వాగతం",
        welcomeConsumer: "స్వాగతం",

        addProduct: "ఉత్పత్తిని జోడించండి",
        addProductDesc: "మీ వ్యవసాయ ఉత్పత్తులను జాబితా చేయండి.",

        orders: "ఆర్డర్లు",
        myOrders: "నా ఆర్డర్లు",
        ordersDesc: "వినియోగదారుల ఆర్డర్లను చూడండి.",

        browseProducts: "ఉత్పత్తులను చూడండి",
        browseProductsDesc: "రైతుల నుండి తాజా ఉత్పత్తులను నేరుగా కొనండి.",

        myCart: "నా కార్ట్",
        myCartDesc: "కార్ట్‌లో జోడించిన ఉత్పత్తులను చూడండి.",

        logout: "లాగ్ అవుట్",

        remove: "తొలగించు",
        delete: "తొలగించు",

        confirmDelete: "మీరు ఈ వస్తువును తొలగించాలనుకుంటున్నారా?",

        noProducts: "ఉత్పత్తులు అందుబాటులో లేవు.",
        noOrders: "ఇంకా ఆర్డర్లు లేవు.",
        emptyCart: "మీ కార్ట్ ఖాళీగా ఉంది.",

        quantity: "పరిమాణం",
        price: "ధర",
        total: "మొత్తం"
    },


    hi: {
        language: "भाषा",
        farmer: "किसान",
        consumer: "उपभोक्ता",

        welcomeFarmer: "स्वागत है",
        welcomeConsumer: "स्वागत है",

        addProduct: "उत्पाद जोड़ें",
        addProductDesc: "अपने कृषि उत्पाद सूचीबद्ध करें।",

        orders: "ऑर्डर",
        myOrders: "मेरे ऑर्डर",
        ordersDesc: "उपभोक्ताओं के ऑर्डर देखें।",

        browseProducts: "उत्पाद देखें",
        browseProductsDesc: "किसानों से सीधे ताज़े उत्पाद खरीदें।",

        myCart: "मेरी कार्ट",
        myCartDesc: "कार्ट में जोड़े गए उत्पाद देखें।",

        logout: "लॉग आउट",

        remove: "हटाएं",
        delete: "हटाएं",

        confirmDelete: "क्या आप इस वस्तु को हटाना चाहते हैं?",

        noProducts: "कोई उत्पाद उपलब्ध नहीं है।",
        noOrders: "अभी कोई ऑर्डर नहीं है।",
        emptyCart: "आपकी कार्ट खाली है।",

        quantity: "मात्रा",
        price: "कीमत",
        total: "कुल"
    }

};


// =====================================================
// GET CURRENT LANGUAGE
// =====================================================

function getLanguage() {

    return localStorage.getItem("language") || "en";

}


// =====================================================
// CHANGE LANGUAGE
// =====================================================

function changeLanguage(language) {

    if (
        language !== "en" &&
        language !== "te" &&
        language !== "hi"
    ) {
        language = "en";
    }

    localStorage.setItem(
        "language",
        language
    );

    applyLanguage();

}


// =====================================================
// APPLY LANGUAGE
// =====================================================

function applyLanguage() {

    const language =
        getLanguage();

    const text =
        languageTranslations[language];


    // Elements with data-translate
    document
        .querySelectorAll("[data-translate]")
        .forEach(element => {

            const key =
                element.getAttribute(
                    "data-translate"
                );

            if (text[key]) {

                element.textContent =
                    text[key];

            }

        });


    // Update language selector
    const selector =
        document.getElementById(
            "languageSelect"
        );

    if (selector) {

        selector.value =
            language;

    }

}


// =====================================================
// LANGUAGE SELECTOR
// =====================================================

function createLanguageSelector() {

    // Don't create twice
    if (
        document.getElementById(
            "languageBox"
        )
    ) {
        return;
    }


    const nav =
        document.querySelector("nav");


    if (!nav) {
        return;
    }


    const languageBox =
        document.createElement("div");

    languageBox.id =
        "languageBox";

    languageBox.innerHTML = `

        <label
            for="languageSelect"
            style="margin-right:5px;"
        >
            🌐 ${languageTranslations[getLanguage()].language}
        </label>

        <select
            id="languageSelect"
            onchange="changeLanguage(this.value)"
        >

            <option value="en">
                English
            </option>

            <option value="te">
                తెలుగు
            </option>

            <option value="hi">
                हिन्दी
            </option>

        </select>

    `;


    nav.appendChild(
        languageBox
    );

}


// =====================================================
// INITIALIZE LANGUAGE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        createLanguageSelector();

        applyLanguage();

    }
);
// =====================================================
// AUTOMATIC LOCATION
// =====================================================

function getLocation() {

    const locationInput =
        document.getElementById("location");

    const status =
        document.getElementById("locationStatus");

    if (!navigator.geolocation) {

        status.innerText =
            "Location is not supported. Please enter manually.";

        return;
    }

    status.innerText =
        "📍 Getting your location...";

    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            locationInput.value =
                latitude.toFixed(6) +
                ", " +
                longitude.toFixed(6);

            status.innerText =
                "✅ Current location selected.";

        },

        function() {

            status.innerText =
                "❌ Location permission denied. Enter manually.";

        }

    );
}
// =====================================================
// SHOW UPI FIELD ONLY FOR FARMER
// =====================================================

function showFarmerUPI() {

    const role =
        localStorage.getItem("selectedRole");

    const section =
        document.getElementById(
            "farmerUpiSection"
        );

    if (!section) return;

    if (role === "farmer") {

        section.style.display =
            "block";

        document.getElementById(
            "upi_id"
        ).required = true;

    }
    else {

        section.style.display =
            "none";

        document.getElementById(
            "upi_id"
        ).required = false;

    }

}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        showFarmerUPI();

    }
);
function getCurrentLocation() {

    const message =
        document.getElementById("locationMessage");

    if (!navigator.geolocation) {

        message.innerText =
            "❌ Your browser does not support GPS location.";

        return;
    }

    message.innerText =
        "📍 Please allow location access in your browser...";

    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            document.getElementById("location").value =
                `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`;

            message.innerText =
                "✅ Current location detected.";

        },

        function(error) {

            if (error.code === 1) {

                message.innerText =
                    "❌ Location access was blocked. Please allow GPS access in your browser.";

            } else {

                message.innerText =
                    "⚠️ Unable to get your location. Please enter it manually.";

            }

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );
}