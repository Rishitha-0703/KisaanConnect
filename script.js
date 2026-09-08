const API = "http://127.0.0.1:5000";


// =====================================================
// GET SAVED USER
// =====================================================

function getUser() {

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
        return null;
    }

    try {
        return JSON.parse(savedUser);
    } catch (error) {
        return null;
    }
}


// =====================================================
// REGISTER
// =====================================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");

    const title = document.getElementById("registerTitle");

    if (role === "farmer") {

        if (title) {
            title.textContent = "Farmer Registration";
        }

    } else if (role === "consumer") {

        if (title) {
            title.textContent = "Consumer Registration";
        }

    } else {

        window.location.href = "index.html";
    }


    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const location =
            document.getElementById("location").value.trim();

        const message =
            document.getElementById("message");

        if (message) {
            message.textContent = "Creating account...";
        }


        try {

            const response = await fetch(
                API + "/api/register",
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
                        role: role
                    })
                }
            );


            const data = await response.json();


            if (!data.success) {

                if (message) {
                    message.textContent = data.message;
                }

                return;
            }


            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            if (role === "farmer") {

                window.location.href =
                    "farmer_dashboard.html";

            } else {

                window.location.href =
                    "consumer_dashboard.html";
            }


        } catch (error) {

            console.error(error);

            if (message) {
                message.textContent =
                    "Cannot connect to Flask.";
            }
        }
    });
}


// =====================================================
// FARMER DASHBOARD
// =====================================================

const farmerName =
    document.getElementById("farmerName");

if (farmerName) {

    const user = getUser();

    if (!user || user.role !== "farmer") {

        window.location.href = "index.html";

    } else {

        farmerName.textContent = user.name;

        const location =
            document.getElementById("farmerLocation");

        if (location) {
            location.textContent = user.location;
        }
    }
}


// =====================================================
// CONSUMER DASHBOARD
// =====================================================

const consumerName =
    document.getElementById("consumerName");

if (consumerName) {

    const user = getUser();

    if (!user || user.role !== "consumer") {

        window.location.href = "index.html";

    } else {

        consumerName.textContent = user.name;

        const location =
            document.getElementById("consumerLocation");

        if (location) {
            location.textContent = user.location;
        }
    }
}


// =====================================================
// ADD PRODUCT
// =====================================================

const productForm =
    document.getElementById("productForm");

if (productForm) {

    const user = getUser();

    if (!user || user.role !== "farmer") {

        window.location.href = "index.html";

    } else {

        productForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const message =
                    document.getElementById(
                        "productMessage"
                    );

                const formData = new FormData();


                formData.append(
                    "farmer_id",
                    user.id
                );


                formData.append(
                    "name",
                    document.getElementById(
                        "productName"
                    ).value.trim()
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
                    ).value.trim()
                );


                formData.append(
                    "price",
                    document.getElementById(
                        "price"
                    ).value
                );


                formData.append(
                    "location",
                    document.getElementById(
                        "productLocation"
                    ).value.trim()
                );


                const description =
                    document.getElementById(
                        "description"
                    );


                if (description) {

                    formData.append(
                        "description",
                        description.value.trim()
                    );
                }


                // IMAGE

                const image =
                    document.getElementById(
                        "productImage"
                    );


                if (
                    image &&
                    image.files.length > 0
                ) {

                    formData.append(
                        "image",
                        image.files[0]
                    );
                }


                if (message) {
                    message.textContent =
                        "Adding product...";
                }


                try {

                    const response =
                        await fetch(
                            API + "/api/products",
                            {
                                method: "POST",
                                body: formData
                            }
                        );


                    const data =
                        await response.json();


                    if (!data.success) {

                        if (message) {
                            message.textContent =
                                data.message;
                        }

                        return;
                    }


                    alert(
                        "Product added successfully!"
                    );


                    window.location.href =
                        "farmer_dashboard.html";


                } catch (error) {

                    console.error(error);

                    if (message) {
                        message.textContent =
                            "Cannot connect to Flask.";
                    }
                }
            }
        );
    }
}


// =====================================================
// PRODUCTS PAGE
// =====================================================

const productsContainer =
    document.getElementById(
        "productsContainer"
    );


if (productsContainer) {

    loadProducts();
}


// Store all products
let allProducts = [];


async function loadProducts() {

    try {

        const response =
            await fetch(
                API + "/api/products"
            );


        const data =
            await response.json();


        if (!data.success) {

            productsContainer.innerHTML =
                "<p>Unable to load products.</p>";

            return;
        }


        if (data.products.length === 0) {

            productsContainer.innerHTML = `
                <div class="empty-box">

                    <h2>
                        No products available
                    </h2>

                    <p>
                        Farmers have not added products yet.
                    </p>

                </div>
            `;

            return;
        }


        productsContainer.innerHTML = "";


        allProducts = data.products;


        data.products.forEach(function (product) {

            const card =
                document.createElement("div");


            card.className =
                "product-card";


            let imageHTML = `
                <div class="product-image">
                    🌾
                </div>
            `;


            if (product.image) {

                imageHTML = `
                    <div class="product-image">

                        <img
                            src="${product.image}"
                            alt="${product.name}"

                            style="
                                width:100%;
                                height:200px;
                                object-fit:cover;
                                border-radius:10px;
                            "
                        >

                    </div>
                `;
            }


            card.innerHTML = `

                ${imageHTML}

                <h2>
                    ${product.name}
                </h2>

                <p>
                    Category:
                    ${product.category}
                </p>

                <p>
                    Farmer:
                    ${product.farmer_name}
                </p>

                <p>
                    📍 ${product.location}
                </p>

                <p>
                    Available:
                    ${product.quantity}
                </p>

                <h3>
                    ₹${product.price}
                </h3>

                <p>
                    ${
                        product.description ||
                        "Fresh farm product."
                    }
                </p>


                <input
                    type="number"
                    id="quantity-${product.id}"
                    min="0.1"
                    step="0.1"
                    placeholder="Enter quantity"
                >


                <br><br>


                <button
                    onclick="addProductToCartById(${product.id})"
                >
                    🛒 Add to Cart
                </button>

            `;


            productsContainer.appendChild(card);

        });


    } catch (error) {

        console.error(error);


        productsContainer.innerHTML = `

            <div class="empty-box">

                <h2>
                    Backend not connected
                </h2>

                <p>
                    Start Flask and refresh the page.
                </p>

            </div>

        `;
    }
}


// =====================================================
// ADD PRODUCT TO CART BY ID
// =====================================================

function addProductToCartById(productId) {

    const product =
        allProducts.find(function (item) {

            return Number(item.id) ===
                   Number(productId);

        });


    if (!product) {

        alert(
            "❌ Product not found."
        );

        return;
    }


    if (
        typeof window.addProductToCart !==
        "function"
    ) {

        alert(
            "❌ Cart system is not loaded."
        );

        console.error(
            "cart.js is not loaded."
        );

        return;
    }


    window.addProductToCart(product);
}


// =====================================================
// GET QUANTITY
// =====================================================

function getQuantity(productId) {

    const input =
        document.getElementById(
            "quantity-" + productId
        );


    if (!input) {

        alert(
            "Quantity box not found."
        );

        return null;
    }


    const quantity =
        Number(input.value);


    if (!quantity || quantity <= 0) {

        alert(
            "Please enter a valid quantity."
        );

        return null;
    }


    return quantity;
}


// =====================================================
// PLACE ORDER
// =====================================================

async function placeOrder(productId) {

    const user = getUser();


    if (!user || user.role !== "consumer") {

        alert(
            "Please register as a consumer first."
        );

        return;
    }


    const quantity =
        getQuantity(productId);


    if (quantity === null) {
        return;
    }


    const delivery =
        prompt(
            "Enter your delivery address:"
        );


    if (!delivery || !delivery.trim()) {

        alert(
            "Delivery address is required."
        );

        return;
    }


    let payment =
        prompt(
            "Enter payment method:\n\nUPI\nor\nCOD"
        );


    if (!payment) {
        return;
    }


    payment =
        payment.trim().toUpperCase();


    if (
        payment !== "UPI" &&
        payment !== "COD"
    ) {

        alert(
            "Please enter UPI or COD."
        );

        return;
    }


    let upi = "";


    if (payment === "UPI") {

        upi =
            prompt(
                "Enter your UPI ID:"
            );


        if (!upi || !upi.trim()) {

            alert(
                "UPI ID is required."
            );

            return;
        }


        upi = upi.trim();
    }


    try {

        const response =
            await fetch(
                API + "/api/orders",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        consumer_id:
                            user.id,

                        product_id:
                            productId,

                        quantity:
                            quantity,

                        delivery_location:
                            delivery.trim(),

                        payment_method:
                            payment,

                        upi_id:
                            upi
                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            alert(
                data.message
            );

            return;
        }


        alert(
            "Order placed successfully!\n\n" +
            "Order ID: " +
            data.order_id +
            "\nTotal: ₹" +
            data.total_price
        );


        window.location.href =
            "orders.html";


    } catch (error) {

        console.error(error);


        alert(
            "Cannot connect to Flask."
        );
    }
}


// =====================================================
// ORDERS PAGE
// =====================================================

const ordersContainer =
    document.getElementById(
        "ordersContainer"
    );


if (ordersContainer) {

    loadOrders();
}


async function loadOrders() {

    const user = getUser();


    if (!user) {

        window.location.href =
            "index.html";

        return;
    }


    try {

        let url;


        if (user.role === "consumer") {

            url =
                API +
                "/api/orders/consumer/" +
                user.id;

        } else {

            url =
                API +
                "/api/orders/farmer/" +
                user.id;
        }


        const response =
            await fetch(url);


        const data =
            await response.json();


        if (!data.success) {

            ordersContainer.innerHTML =
                "<p>Unable to load orders.</p>";

            return;
        }


        if (data.orders.length === 0) {

            ordersContainer.innerHTML = `

                <div class="empty-box">

                    <h2>
                        No orders yet
                    </h2>

                    <p>
                        Orders will appear here.
                    </p>

                </div>

            `;

            return;
        }


        ordersContainer.innerHTML = "";


        data.orders.forEach(function (order) {

            const card =
                document.createElement("div");


            card.className =
                "order-card";


            // =================================================
            // CONSUMER ORDERS
            // =================================================

            if (user.role === "consumer") {

                let cancelButton = "";


                if (
                    order.status !== "Cancelled"
                ) {

                    cancelButton = `

                        <button
                            onclick="cancelOrder(${order.id})"
                            style="margin-top:10px;"
                        >
                            ❌ Cancel Order
                        </button>

                    `;

                } else {

                    cancelButton = `

                        <p>
                            ❌ This order has been cancelled.
                        </p>

                    `;
                }


                card.innerHTML = `

                    <h2>
                        ${order.product_name}
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

                    <p>
                        Status:
                        <strong>
                            ${order.status}
                        </strong>
                    </p>

                    ${cancelButton}

                `;


            } else {

                // =================================================
                // FARMER ORDERS
                // =================================================

                card.innerHTML = `

                    <h2>
                        ${order.product_name}
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

                    <p>
                        Status:
                        <strong>
                            ${order.status}
                        </strong>
                    </p>

                `;
            }


            ordersContainer.appendChild(card);

        });


    } catch (error) {

        console.error(error);


        ordersContainer.innerHTML = `

            <div class="empty-box">

                <h2>
                    Backend not connected
                </h2>

                <p>
                    Start Flask and refresh.
                </p>

            </div>

        `;
    }
}


// =====================================================
// CANCEL ORDER
// =====================================================

async function cancelOrder(orderId) {

    const confirmCancel =
        confirm(
            "Are you sure you want to cancel this order?"
        );


    if (!confirmCancel) {
        return;
    }


    try {

        const response =
            await fetch(
                API +
                "/api/orders/" +
                orderId +
                "/cancel",
                {
                    method: "PUT"
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            alert(
                "❌ " +
                data.message
            );

            return;
        }


        alert(
            "✅ Order cancelled successfully!"
        );


        loadOrders();


    } catch (error) {

        console.error(
            "Cancel order error:",
            error
        );


        alert(
            "❌ Cannot connect to Flask."
        );
    }
}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    localStorage.removeItem("user");

    window.location.href =
        "index.html";
}