(function () {

    // ============================================
    // SETTINGS
    // ============================================

    const DELIVERY_RATE = 3;


    // ============================================
    // GET CART
    // ============================================

    function getCart() {

        const savedCart = localStorage.getItem("cart");

        if (!savedCart) {
            return [];
        }

        try {
            return JSON.parse(savedCart);
        } catch (error) {
            console.error("Cart read error:", error);
            return [];
        }
    }


    // ============================================
    // SAVE CART
    // ============================================

    function saveCart(cart) {

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );
    }


    // ============================================
    // ADD PRODUCT TO CART
    // ============================================

    function addProductToCart(product) {

        let cart = getCart();

        let existingProduct = cart.find(function (item) {

            return Number(item.id) ===
                   Number(product.id);

        });


        if (existingProduct) {

            existingProduct.quantity =
                Number(existingProduct.quantity) + 1;

        } else {

            cart.push({

                id: product.id,

                name: product.name,

                price: Number(product.price),

                quantity: 1,

                farmer_name:
                    product.farmer_name ||
                    "Farmer",

                location:
                    product.location ||
                    "",

                image:
                    product.image ||
                    ""

            });

        }


        saveCart(cart);


        alert(
            "✅ " +
            product.name +
            " added to cart!"
        );
    }


    // ============================================
    // DISPLAY CART
    // ============================================

    function displayCart() {

        const container =
            document.getElementById(
                "cartContainer"
            );


        const totalElement =
            document.getElementById(
                "cartTotal"
            );


        if (!container) {
            return;
        }


        const cart = getCart();


        // ----------------------------------------
        // EMPTY CART
        // ----------------------------------------

        if (cart.length === 0) {

            container.innerHTML = `

                <div style="
                    padding:25px;
                    text-align:center;
                    background:#f5f5f5;
                    border-radius:12px;
                ">

                    <h2>
                        🛒 Your cart is empty
                    </h2>

                    <p>
                        Add products from the
                        Products page.
                    </p>

                    <a href="products.html">
                        Continue Shopping
                    </a>

                </div>

            `;


            if (totalElement) {

                totalElement.textContent =
                    "0.00";

            }


            return;
        }


        container.innerHTML = "";


        let productTotal = 0;


        // ----------------------------------------
        // SHOW EACH PRODUCT
        // ----------------------------------------

        cart.forEach(function (item, index) {

            const quantity =
                Number(item.quantity);


            const price =
                Number(item.price);


            const itemTotal =
                quantity * price;


            productTotal += itemTotal;


            const card =
                document.createElement("div");


            card.style.cssText = `
                padding:20px;
                margin-bottom:20px;
                border-radius:12px;
                background:#f8f8f8;
                border:1px solid #ddd;
            `;


            let imageHTML = "";


            if (item.image) {

                imageHTML = `

                    <img
                        src="${item.image}"
                        style="
                            width:150px;
                            height:120px;
                            object-fit:cover;
                            border-radius:10px;
                            margin-bottom:10px;
                        "
                    >

                `;
            }


            card.innerHTML = `

                ${imageHTML}

                <h2>
                    ${item.name}
                </h2>

                <p>
                    👨‍🌾 Farmer:
                    ${item.farmer_name}
                </p>

                <p>
                    📍 Farmer Location:
                    ${item.location || "Not available"}
                </p>

                <p>
                    💰 Price:
                    ₹${price.toFixed(2)} / kg
                </p>

                <p>
                    📦 Quantity:
                    <strong>
                        ${quantity} kg
                    </strong>
                </p>

                <p>
                    💵 Product Total:
                    <strong>
                        ₹${itemTotal.toFixed(2)}
                    </strong>
                </p>

                <div style="margin-top:15px;">

                    <button
                        onclick="decreaseCart(${index})"
                    >
                        ➖
                    </button>

                    <span style="
                        margin:0 15px;
                        font-weight:bold;
                    ">
                        ${quantity}
                    </span>

                    <button
                        onclick="increaseCart(${index})"
                    >
                        ➕
                    </button>

                    <button
                        onclick="removeFromCart(${index})"
                        style="margin-left:15px;"
                    >
                        ❌ Remove
                    </button>

                </div>

            `;


            container.appendChild(card);

        });


        // ----------------------------------------
        // PRODUCT TOTAL
        // ----------------------------------------

        if (totalElement) {

            totalElement.textContent =
                productTotal.toFixed(2);

        }

    }


    // ============================================
    // INCREASE QUANTITY
    // ============================================

    function increaseCart(index) {

        let cart = getCart();


        if (!cart[index]) {
            return;
        }


        cart[index].quantity =
            Number(cart[index].quantity) + 1;


        saveCart(cart);


        displayCart();
    }


    // ============================================
    // DECREASE QUANTITY
    // ============================================

    function decreaseCart(index) {

        let cart = getCart();


        if (!cart[index]) {
            return;
        }


        let quantity =
            Number(cart[index].quantity);


        if (quantity > 1) {

            cart[index].quantity =
                quantity - 1;

        } else {

            cart.splice(index, 1);

        }


        saveCart(cart);


        displayCart();
    }


    // ============================================
    // REMOVE PRODUCT
    // ============================================

    function removeFromCart(index) {

        let cart = getCart();


        if (!cart[index]) {
            return;
        }


        const productName =
            cart[index].name;


        if (
            !confirm(
                "Remove " +
                productName +
                " from cart?"
            )
        ) {

            return;
        }


        cart.splice(index, 1);


        saveCart(cart);


        displayCart();
    }


    // ============================================
    // GET CONSUMER GPS LOCATION
    // ============================================

    function getCurrentLocation() {

        return new Promise(
            function (resolve, reject) {

                if (!navigator.geolocation) {

                    reject(
                        new Error(
                            "GPS is not supported by your browser."
                        )
                    );

                    return;
                }


                navigator.geolocation.getCurrentPosition(

                    function (position) {

                        resolve({

                            latitude:
                                position.coords.latitude,

                            longitude:
                                position.coords.longitude

                        });

                    },


                    function (error) {

                        let message =
                            "Unable to get your location.";


                        if (
                            error.code ===
                            error.PERMISSION_DENIED
                        ) {

                            message =
                                "Location permission was denied.";

                        }


                        reject(
                            new Error(message)
                        );

                    },


                    {
                        enableHighAccuracy: true,

                        timeout: 15000,

                        maximumAge: 0
                    }

                );

            }
        );
    }


    // ============================================
    // CONVERT FARMER LOCATION TO COORDINATES
    // ============================================

    async function getFarmerLocation(
        locationText
    ) {

        if (
            !locationText ||
            !locationText.trim()
        ) {

            throw new Error(
                "Farmer location is missing."
            );
        }


        const response =
            await fetch(

                "https://nominatim.openstreetmap.org/search" +
                "?format=json" +
                "&limit=1" +
                "&q=" +
                encodeURIComponent(
                    locationText
                )

            );


        if (!response.ok) {

            throw new Error(
                "Unable to find farmer location."
            );
        }


        const results =
            await response.json();


        if (
            !results ||
            results.length === 0
        ) {

            throw new Error(
                "Farmer location could not be found."
            );
        }


        return {

            latitude:
                Number(results[0].lat),

            longitude:
                Number(results[0].lon)

        };

    }


    // ============================================
    // CALCULATE DISTANCE
    // ============================================

    function calculateDistance(
        lat1,
        lon1,
        lat2,
        lon2
    ) {

        const earthRadius = 6371;


        const dLat =
            (lat2 - lat1) *
            Math.PI / 180;


        const dLon =
            (lon2 - lon1) *
            Math.PI / 180;


        const a =

            Math.sin(dLat / 2) *
            Math.sin(dLat / 2) +

            Math.cos(
                lat1 * Math.PI / 180
            ) *

            Math.cos(
                lat2 * Math.PI / 180
            ) *

            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);


        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );


        return earthRadius * c;

    }


    // ============================================
    // CALCULATE DELIVERY CHARGE
    // ============================================

    async function calculateDelivery() {

        const cart = getCart();


        if (cart.length === 0) {

            alert(
                "🛒 Your cart is empty."
            );

            return null;
        }


        const locationMessage =
            document.getElementById(
                "locationMessage"
            );


        try {

            if (locationMessage) {

                locationMessage.innerHTML =
                    "📍 Getting your current location...";

            }


            // ------------------------------------
            // CONSUMER GPS
            // ------------------------------------

            const consumer =
                await getCurrentLocation();


            if (locationMessage) {

                locationMessage.innerHTML =
                    "📍 Finding farmer location...";

            }


            // ------------------------------------
            // FARMER LOCATION
            // ------------------------------------

            const farmerText =
                cart[0].location;


            const farmer =
                await getFarmerLocation(
                    farmerText
                );


            // ------------------------------------
            // DISTANCE
            // ------------------------------------

            const distance =
                calculateDistance(

                    consumer.latitude,
                    consumer.longitude,

                    farmer.latitude,
                    farmer.longitude

                );


            // ------------------------------------
            // ₹3 PER KM
            // ------------------------------------

            const deliveryCharge =
                distance *
                DELIVERY_RATE;


            if (locationMessage) {

                locationMessage.innerHTML =

                    "📍 Distance: " +
                    distance.toFixed(2) +
                    " km<br>" +

                    "🚚 Delivery Charge: ₹" +
                    deliveryCharge.toFixed(2) +
                    " (" +
                    distance.toFixed(2) +
                    " × ₹3/km)";

            }


            return {

                distance:
                    distance,

                deliveryCharge:
                    deliveryCharge

            };

        }


        catch (error) {

            console.error(
                "Delivery calculation error:",
                error
            );


            alert(
                "❌ " +
                error.message
            );


            return null;
        }

    }


    // ============================================
    // PLACE CART ORDER
    // ============================================

    async function placeCartOrders() {

        const cart = getCart();


        if (cart.length === 0) {

            alert(
                "🛒 Your cart is empty."
            );

            return;
        }


        // ----------------------------------------
        // CALCULATE DELIVERY
        // ----------------------------------------

        const delivery =
            await calculateDelivery();


        if (!delivery) {
            return;
        }


        // ----------------------------------------
        // PRODUCT TOTAL
        // ----------------------------------------

        let productTotal = 0;


        cart.forEach(function (item) {

            productTotal +=

                Number(item.price) *
                Number(item.quantity);

        });


        // ----------------------------------------
        // FINAL TOTAL
        // ----------------------------------------

        const finalTotal =

            productTotal +
            delivery.deliveryCharge;


        // ----------------------------------------
        // CONSUMER DELIVERY LOCATION
        // ----------------------------------------

        const deliveryLocation =
            prompt(
                "📍 Enter your delivery address/location:"
            );


        if (
            !deliveryLocation ||
            !deliveryLocation.trim()
        ) {

            alert(
                "❌ Delivery location is required."
            );

            return;
        }


        // ----------------------------------------
        // PAYMENT METHOD
        // ----------------------------------------

        let paymentMethod =
            prompt(

                "💳 Enter payment method:\n\n" +

                "Type UPI or COD"

            );


        if (!paymentMethod) {
            return;
        }


        paymentMethod =
            paymentMethod
                .trim()
                .toUpperCase();


        if (
            paymentMethod !== "UPI" &&
            paymentMethod !== "COD"
        ) {

            alert(
                "❌ Please enter either UPI or COD."
            );

            return;
        }


        // ----------------------------------------
        // CONSUMER UPI ID
        // ----------------------------------------

        let consumerUpiId = "";


        if (
            paymentMethod === "UPI"
        ) {

            consumerUpiId =
                prompt(
                    "💳 Enter your UPI ID:"
                );


            if (
                !consumerUpiId ||
                !consumerUpiId.trim()
            ) {

                alert(
                    "❌ UPI ID is required for UPI payment."
                );

                return;
            }


            consumerUpiId =
                consumerUpiId.trim();

        }


        // ----------------------------------------
        // ORDER SUMMARY
        // ----------------------------------------

        const confirmation =

            "🛒 ORDER SUMMARY\n\n" +

            "Product Total: ₹" +
            productTotal.toFixed(2) +

            "\n\nDistance: " +
            delivery.distance.toFixed(2) +
            " km" +

            "\nDelivery Rate: ₹3/km" +

            "\nDelivery Charge: ₹" +
            delivery.deliveryCharge.toFixed(2) +

            "\n\nDelivery Location:\n" +
            deliveryLocation +

            "\n\nPayment Method: " +
            paymentMethod +

            (
                paymentMethod === "UPI"
                    ? "\nConsumer UPI ID: " +
                      consumerUpiId
                    : ""
            ) +

            "\n\n------------------------" +

            "\nFinal Total: ₹" +
            finalTotal.toFixed(2) +

            "\n\nPlace this order?";


        if (
            !confirm(
                confirmation
            )
        ) {

            return;
        }


        // ----------------------------------------
        // TEMPORARY SUCCESS
        // ----------------------------------------
        //
        // We are NOT sending to Flask yet.
        // This prevents the "Cannot connect to Flask"
        // problem while we test the cart.
        //
        // ----------------------------------------

        alert(

            "✅ Order details collected!\n\n" +

            "Product Total: ₹" +
            productTotal.toFixed(2) +

            "\nDelivery: ₹" +
            delivery.deliveryCharge.toFixed(2) +

            "\nFinal Total: ₹" +
            finalTotal.toFixed(2) +

            "\n\n📍 Delivery Location saved for checkout." +

            (
                paymentMethod === "UPI"
                    ? "\n💳 UPI ID received."
                    : "\n💵 Payment: COD."
            )

        );


        // ----------------------------------------
        // SAVE CHECKOUT INFORMATION
        // ----------------------------------------

        const checkoutData = {

            cart: cart,

            productTotal:
                productTotal,

            distance:
                delivery.distance,

            deliveryCharge:
                delivery.deliveryCharge,

            finalTotal:
                finalTotal,

            deliveryLocation:
                deliveryLocation,

            paymentMethod:
                paymentMethod,

            consumerUpiId:
                consumerUpiId

        };


        localStorage.setItem(
            "checkoutData",
            JSON.stringify(
                checkoutData
            )
        );

    }


    // ============================================
    // MAKE FUNCTIONS AVAILABLE TO HTML
    // ============================================

    window.addProductToCart =
        addProductToCart;


    window.increaseCart =
        increaseCart;


    window.decreaseCart =
        decreaseCart;


    window.removeFromCart =
        removeFromCart;


    window.placeCartOrders =
        placeCartOrders;


    // ============================================
    // LOAD CART PAGE
    // ============================================

    if (
        document.getElementById(
            "cartContainer"
        )
    ) {

        displayCart();

    }

})();