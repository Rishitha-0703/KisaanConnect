from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import uuid
import re


# =========================================================
# APP CONFIGURATION
# =========================================================

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(__file__)

DATABASE = os.path.join(BASE_DIR, "database.db")

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db():

    conn = sqlite3.connect(DATABASE)

    conn.row_factory = sqlite3.Row

    return conn


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

def init_db():

    conn = get_db()

    # -----------------------------------------------------
    # USERS TABLE
    # -----------------------------------------------------

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            email TEXT NOT NULL,

            phone TEXT NOT NULL,

            location TEXT NOT NULL,

            role TEXT NOT NULL
        )
    """)

    # -----------------------------------------------------
    # PRODUCTS TABLE
    # -----------------------------------------------------

    conn.execute("""
        CREATE TABLE IF NOT EXISTS products (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            farmer_id INTEGER NOT NULL,

            name TEXT NOT NULL,

            category TEXT NOT NULL,

            quantity TEXT NOT NULL,

            price REAL NOT NULL,

            location TEXT NOT NULL,

            description TEXT,

            image TEXT
        )
    """)

    # -----------------------------------------------------
    # ORDERS TABLE
    # -----------------------------------------------------

    conn.execute("""
        CREATE TABLE IF NOT EXISTS orders (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            consumer_id INTEGER NOT NULL,

            product_id INTEGER NOT NULL,

            quantity TEXT NOT NULL,

            total_price REAL NOT NULL,

            delivery_charge REAL DEFAULT 0,

            distance REAL DEFAULT 0,

            status TEXT DEFAULT 'Pending',

            delivery_location TEXT,

            payment_method TEXT,

            upi_id TEXT
        )
    """)

    conn.commit()


    # =====================================================
    # DATABASE MIGRATION
    # =====================================================

    # Add image column to old products table
    try:

        conn.execute(
            "ALTER TABLE products ADD COLUMN image TEXT"
        )

    except sqlite3.OperationalError:

        pass


    # Add delivery location to old orders table
    try:

        conn.execute(
            "ALTER TABLE orders ADD COLUMN delivery_location TEXT"
        )

    except sqlite3.OperationalError:

        pass


    # Add payment method to old orders table
    try:

        conn.execute(
            "ALTER TABLE orders ADD COLUMN payment_method TEXT"
        )

    except sqlite3.OperationalError:

        pass


    # Add UPI ID to old orders table
    try:

        conn.execute(
            "ALTER TABLE orders ADD COLUMN upi_id TEXT"
        )

    except sqlite3.OperationalError:

        pass


    # Add delivery charge to old orders table
    try:

        conn.execute(
            "ALTER TABLE orders ADD COLUMN delivery_charge REAL DEFAULT 0"
        )

    except sqlite3.OperationalError:

        pass


    # Add distance to old orders table
    try:

        conn.execute(
            "ALTER TABLE orders ADD COLUMN distance REAL DEFAULT 0"
        )

    except sqlite3.OperationalError:

        pass


    conn.commit()

    conn.close()


# =========================================================
# HOME / TEST
# =========================================================

@app.route("/")
def home():

    return jsonify({

        "message": "KisaanConnect Backend is Running!",

        "status": "success"

    })


# =========================================================
# IMAGE SERVING
# =========================================================

@app.route("/uploads/<filename>")
def uploaded_file(filename):

    return send_from_directory(

        app.config["UPLOAD_FOLDER"],

        filename

    )


# =========================================================
# REGISTER
# =========================================================

@app.route("/api/register", methods=["POST"])
def register():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "success": False,

                "message": "Invalid data."

            }), 400


        name = data.get("name")

        email = data.get("email")

        phone = data.get("phone")

        location = data.get("location")

        role = data.get("role")


        # -------------------------------------------------
        # REQUIRED FIELD CHECK
        # -------------------------------------------------

        if not all([

            name,

            email,

            phone,

            location,

            role

        ]):

            return jsonify({

                "success": False,

                "message": "Please fill all details."

            }), 400


        # -------------------------------------------------
        # ROLE CHECK
        # -------------------------------------------------

        if role not in ["farmer", "consumer"]:

            return jsonify({

                "success": False,

                "message": "Invalid role."

            }), 400


        # -------------------------------------------------
        # PHONE CHECK
        # -------------------------------------------------

        if len(phone) != 10 or not phone.isdigit():

            return jsonify({

                "success": False,

                "message":
                    "Enter a valid 10-digit phone number."

            }), 400


        # -------------------------------------------------
        # INSERT USER
        # -------------------------------------------------

        conn = get_db()

        cursor = conn.execute("""

            INSERT INTO users

            (
                name,
                email,
                phone,
                location,
                role
            )

            VALUES (?, ?, ?, ?, ?)

        """, (

            name,

            email,

            phone,

            location,

            role

        ))


        user_id = cursor.lastrowid

        conn.commit()

        conn.close()


        return jsonify({

            "success": True,

            "message":
                "Account created successfully!",

            "user": {

                "id": user_id,

                "name": name,

                "email": email,

                "phone": phone,

                "location": location,

                "role": role

            }

        })


    except Exception as e:

        print("REGISTER ERROR:", str(e))

        return jsonify({

            "success": False,

            "message": "Registration error: " + str(e)

        }), 500


# =========================================================
# ADD PRODUCT WITH IMAGE
# =========================================================

@app.route("/api/products", methods=["POST"])
def add_product():

    try:

        farmer_id = request.form.get("farmer_id")

        name = request.form.get("name")

        category = request.form.get("category")

        quantity = request.form.get("quantity")

        price = request.form.get("price")

        location = request.form.get("location")

        description = request.form.get(
            "description",
            ""
        )

        image = request.files.get("image")


        # -------------------------------------------------
        # REQUIRED FIELD CHECK
        # -------------------------------------------------

        if not all([

            farmer_id,

            name,

            category,

            quantity,

            price,

            location

        ]):

            return jsonify({

                "success": False,

                "message":
                    "Please fill all required fields."

            }), 400


        # -------------------------------------------------
        # PRICE CHECK
        # -------------------------------------------------

        try:

            price = float(price)

        except (ValueError, TypeError):

            return jsonify({

                "success": False,

                "message": "Invalid price."

            }), 400


        if price <= 0:

            return jsonify({

                "success": False,

                "message":
                    "Price must be greater than zero."

            }), 400


        # -------------------------------------------------
        # FARMER CHECK
        # -------------------------------------------------

        conn = get_db()

        farmer = conn.execute("""

            SELECT id

            FROM users

            WHERE id = ?

            AND role = ?

        """, (

            farmer_id,

            "farmer"

        )).fetchone()


        if farmer is None:

            conn.close()

            return jsonify({

                "success": False,

                "message":
                    "Invalid farmer ID. Please login again."

            }), 400


        # -------------------------------------------------
        # SAVE IMAGE
        # -------------------------------------------------

        image_filename = None


        if image and image.filename:

            extension = os.path.splitext(

                image.filename

            )[1].lower()


            allowed_extensions = [

                ".jpg",

                ".jpeg",

                ".png",

                ".webp"

            ]


            if extension not in allowed_extensions:

                conn.close()

                return jsonify({

                    "success": False,

                    "message":
                        "Only JPG, JPEG, PNG and WEBP images are allowed."

                }), 400


            image_filename = (

                str(uuid.uuid4())

                + extension

            )


            image.save(

                os.path.join(

                    app.config["UPLOAD_FOLDER"],

                    image_filename

                )

            )


        # -------------------------------------------------
        # INSERT PRODUCT
        # -------------------------------------------------

        cursor = conn.execute("""

            INSERT INTO products

            (

                farmer_id,

                name,

                category,

                quantity,

                price,

                location,

                description,

                image

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?)

        """, (

            farmer_id,

            name,

            category,

            quantity,

            price,

            location,

            description,

            image_filename

        ))


        product_id = cursor.lastrowid

        conn.commit()

        conn.close()


        return jsonify({

            "success": True,

            "message":
                "Product added successfully!",

            "product_id":
                product_id

        })


    except Exception as e:

        print("ADD PRODUCT ERROR:", str(e))

        return jsonify({

            "success": False,

            "message":
                "Add Product Error: " + str(e)

        }), 500


# =========================================================
# GET PRODUCTS
# =========================================================

@app.route("/api/products", methods=["GET"])
def get_products():

    try:

        conn = get_db()

        products = conn.execute("""

            SELECT

                products.*,

                users.name AS farmer_name

            FROM products

            JOIN users

            ON products.farmer_id = users.id

            ORDER BY products.id DESC

        """).fetchall()


        conn.close()


        result = []


        for product in products:

            image_url = None


            if product["image"]:

                image_url = (

                    "http://127.0.0.1:5000/uploads/"

                    + product["image"]

                )


            result.append({

                "id":
                    product["id"],

                "farmer_id":
                    product["farmer_id"],

                "farmer_name":
                    product["farmer_name"],

                "name":
                    product["name"],

                "category":
                    product["category"],

                "quantity":
                    product["quantity"],

                "price":
                    product["price"],

                "location":
                    product["location"],

                "description":
                    product["description"] or "",

                "image":
                    image_url

            })


        return jsonify({

            "success": True,

            "products":
                result

        })


    except Exception as e:

        print("GET PRODUCTS ERROR:", str(e))

        return jsonify({

            "success": False,

            "message":
                "Unable to load products: " + str(e)

        }), 500


# =========================================================
# PLACE ORDER
# =========================================================

@app.route("/api/orders", methods=["POST"])
def place_order():

    try:

        data = request.get_json()


        if not data:

            return jsonify({

                "success": False,

                "message":
                    "Invalid order data."

            }), 400


        consumer_id = data.get(
            "consumer_id"
        )

        product_id = data.get(
            "product_id"
        )

        quantity = data.get(
            "quantity"
        )

        delivery_location = data.get(
            "delivery_location"
        )

        payment_method = data.get(
            "payment_method"
        )

        upi_id = data.get(
            "upi_id"
        )

        delivery_charge = data.get(
            "delivery_charge",
            0
        )

        distance = data.get(
            "distance",
            0
        )


        # =================================================
        # CHECK REQUIRED DETAILS
        # =================================================

        if not all([

            consumer_id,

            product_id,

            quantity,

            delivery_location,

            payment_method

        ]):

            return jsonify({

                "success": False,

                "message":
                    "Please fill all checkout details."

            }), 400


        # =================================================
        # PAYMENT METHOD
        # =================================================

        payment_method = str(
            payment_method
        ).upper()


        if payment_method not in [

            "UPI",

            "COD"

        ]:

            return jsonify({

                "success": False,

                "message":
                    "Payment method must be UPI or COD."

            }), 400


        # =================================================
        # UPI CHECK
        # =================================================

        if payment_method == "UPI" and not upi_id:

            return jsonify({

                "success": False,

                "message":
                    "Please enter your UPI ID."

            }), 400


        # =================================================
        # QUANTITY
        # =================================================

        try:

            numeric_quantity = float(
                quantity
            )

        except (ValueError, TypeError):

            return jsonify({

                "success": False,

                "message":
                    "Invalid quantity."

            }), 400


        if numeric_quantity <= 0:

            return jsonify({

                "success": False,

                "message":
                    "Quantity must be greater than zero."

            }), 400


        # =================================================
        # DELIVERY CHARGE
        # =================================================

        try:

            delivery_charge = float(
                delivery_charge
            )

        except (ValueError, TypeError):

            delivery_charge = 0


        if delivery_charge < 0:

            delivery_charge = 0


        # =================================================
        # DISTANCE
        # =================================================

        try:

            distance = float(
                distance
            )

        except (ValueError, TypeError):

            distance = 0


        if distance < 0:

            distance = 0


        # =================================================
        # DATABASE
        # =================================================

        conn = get_db()


        # =================================================
        # CHECK CONSUMER
        # =================================================

        consumer = conn.execute("""

            SELECT id

            FROM users

            WHERE id = ?

            AND role = ?

        """, (

            consumer_id,

            "consumer"

        )).fetchone()


        if consumer is None:

            conn.close()

            return jsonify({

                "success": False,

                "message":
                    "Invalid consumer ID. Please login again."

            }), 400


        # =================================================
        # GET PRODUCT
        # =================================================

        product = conn.execute("""

            SELECT *

            FROM products

            WHERE id = ?

        """, (

            product_id,

        )).fetchone()


        if product is None:

            conn.close()

            return jsonify({

                "success": False,

                "message":
                    "Product not found."

            }), 404


        # =================================================
        # STOCK CHECK
        # =================================================

        quantity_text = str(
            product["quantity"]
        )


        match = re.search(

            r"\d+(?:\.\d+)?",

            quantity_text

        )


        if not match:

            conn.close()

            return jsonify({

                "success": False,

                "message":
                    "Product stock is invalid."

            }), 400


        available_stock = float(
            match.group()
        )


        if numeric_quantity > available_stock:

            conn.close()

            return jsonify({

                "success": False,

                "message":
                    "Only "
                    + quantity_text
                    + " available."

            }), 400


        # =================================================
        # PRODUCT PRICE
        # =================================================

        product_total = (

            numeric_quantity

            * float(product["price"])

        )


        # =================================================
        # FINAL TOTAL
        # =================================================

        final_total = (

            product_total

            + delivery_charge

        )


        # =================================================
        # REDUCE STOCK
        # =================================================

        remaining_stock = (

            available_stock

            - numeric_quantity

        )


        # Get unit such as kg, kg, litre etc.
        unit_match = re.search(

            r"[A-Za-z]+",

            quantity_text

        )


        unit = ""


        if unit_match:

            unit = unit_match.group()


        if remaining_stock.is_integer():

            remaining_text = str(

                int(remaining_stock)

            )

        else:

            remaining_text = str(

                round(

                    remaining_stock,

                    2

                )

            )


        if unit:

            remaining_text += " " + unit


        # =================================================
        # SAVE ORDER
        # =================================================

        cursor = conn.execute("""

            INSERT INTO orders

            (

                consumer_id,

                product_id,

                quantity,

                total_price,

                delivery_charge,

                distance,

                delivery_location,

                payment_method,

                upi_id

            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

        """, (

            consumer_id,

            product_id,

            quantity,

            final_total,

            delivery_charge,

            distance,

            delivery_location,

            payment_method,

            upi_id

        ))


        order_id = cursor.lastrowid


        # =================================================
        # UPDATE PRODUCT STOCK
        # =================================================

        conn.execute("""

            UPDATE products

            SET quantity = ?

            WHERE id = ?

        """, (

            remaining_text,

            product_id

        ))


        conn.commit()

        conn.close()


        # =================================================
        # SUCCESS RESPONSE
        # =================================================

        return jsonify({

            "success": True,

            "message":
                "Order placed successfully!",

            "order_id":
                order_id,

            "product_price":
                round(
                    product_total,
                    2
                ),

            "delivery_charge":
                round(
                    delivery_charge,
                    2
                ),

            "distance":
                round(
                    distance,
                    2
                ),

            "total_price":
                round(
                    final_total,
                    2
                ),

            "remaining_stock":
                remaining_text

        })


    except Exception as e:

        print("PLACE ORDER ERROR:", str(e))

        return jsonify({

            "success": False,

            "message":
                "Order error: " + str(e)

        }), 500


# =========================================================
# CONSUMER ORDERS
# =========================================================

@app.route(
    "/api/orders/consumer/<int:consumer_id>"
)
def consumer_orders(consumer_id):

    try:

        conn = get_db()


        orders = conn.execute("""

            SELECT

                orders.*,

                products.name AS product_name,

                users.name AS farmer_name

            FROM orders

            JOIN products

            ON orders.product_id = products.id

            JOIN users

            ON products.farmer_id = users.id

            WHERE orders.consumer_id = ?

            ORDER BY orders.id DESC

        """, (

            consumer_id,

        )).fetchall()


        conn.close()


        result = []


        for order in orders:

            result.append({

                "id":
                    order["id"],

                "product_name":
                    order["product_name"],

                "farmer_name":
                    order["farmer_name"],

                "quantity":
                    order["quantity"],

                "total_price":
                    order["total_price"],

                "delivery_charge":
                    order["delivery_charge"] or 0,

                "distance":
                    order["distance"] or 0,

                "status":
                    order["status"],

                "delivery_location":
                    order["delivery_location"] or "",

                "payment_method":
                    order["payment_method"] or "",

                "upi_id":
                    order["upi_id"] or ""

            })


        return jsonify({

            "success": True,

            "orders":
                result

        })


    except Exception as e:

        print("CONSUMER ORDERS ERROR:", str(e))

        return jsonify({

            "success": False,

            "message":
                "Unable to load consumer orders: "
                + str(e)

        }), 500


# =========================================================
# FARMER ORDERS
# =========================================================

@app.route(
    "/api/orders/farmer/<int:farmer_id>"
)
def farmer_orders(farmer_id):

    try:

        conn = get_db()


        orders = conn.execute("""

            SELECT

                orders.*,

                products.name AS product_name,

                users.name AS consumer_name

            FROM orders

            JOIN products

            ON orders.product_id = products.id

            JOIN users

            ON orders.consumer_id = users.id

            WHERE products.farmer_id = ?

            ORDER BY orders.id DESC

        """, (

            farmer_id,

        )).fetchall()


        conn.close()


        result = []


        for order in orders:

            result.append({

                "id":
                    order["id"],

                "product_name":
                    order["product_name"],

                "consumer_name":
                    order["consumer_name"],

                "quantity":
                    order["quantity"],

                "total_price":
                    order["total_price"],

                "delivery_charge":
                    order["delivery_charge"] or 0,

                "distance":
                    order["distance"] or 0,

                "status":
                    order["status"],

                "delivery_location":
                    order["delivery_location"] or "",

                "payment_method":
                    order["payment_method"] or "",

                "upi_id":
                    order["upi_id"] or ""

            })


        return jsonify({

            "success": True,

            "orders":
                result

        })


    except Exception as e:

        print("FARMER ORDERS ERROR:", str(e))

        return jsonify({

            "success": False,

            "message":
                "Unable to load farmer orders: "
                + str(e)

        }), 500


# =========================================================
# CANCEL ORDER
# =========================================================

@app.route(
    "/api/orders/<int:order_id>/cancel",
    methods=["PUT"]
)
def cancel_order(order_id):

    try:

        conn = get_db()


        # -------------------------------------------------
        # FIND ORDER
        # -------------------------------------------------

        order = conn.execute("""

            SELECT *

            FROM orders

            WHERE id = ?

        """, (

            order_id,

        )).fetchone()


        if not order:

            conn.close()

            return jsonify({

                "success": False,

                "message":
                    "Order not found."

            }), 404


        # -------------------------------------------------
        # ALREADY CANCELLED
        # -------------------------------------------------

        if order["status"] == "Cancelled":

            conn.close()

            return jsonify({

                "success": False,

                "message":
                    "Order is already cancelled."

            }), 400


        # -------------------------------------------------
        # CANCEL ORDER
        # -------------------------------------------------

        conn.execute("""

            UPDATE orders

            SET status = ?

            WHERE id = ?

        """, (

            "Cancelled",

            order_id

        ))


        # -------------------------------------------------
        # RETURN STOCK
        # -------------------------------------------------

        product = conn.execute("""

            SELECT quantity

            FROM products

            WHERE id = ?

        """, (

            order["product_id"],

        )).fetchone()


        if product:

            current_quantity_text = str(
                product["quantity"]
            )


            current_match = re.search(

                r"\d+(?:\.\d+)?",

                current_quantity_text

            )


            order_match = re.search(

                r"\d+(?:\.\d+)?",

                str(order["quantity"])

            )


            if current_match and order_match:

                current_stock = float(
                    current_match.group()
                )

                cancelled_quantity = float(
                    order_match.group()
                )


                new_stock = (

                    current_stock

                    + cancelled_quantity

                )


                unit_match = re.search(

                    r"[A-Za-z]+",

                    current_quantity_text

                )


                unit = ""


                if unit_match:

                    unit = unit_match.group()


                if new_stock.is_integer():

                    new_stock_text = str(
                        int(new_stock)
                    )

                else:

                    new_stock_text = str(
                        round(new_stock, 2)
                    )


                if unit:

                    new_stock_text += " " + unit


                conn.execute("""

                    UPDATE products

                    SET quantity = ?

                    WHERE id = ?

                """, (

                    new_stock_text,

                    order["product_id"]

                ))


        conn.commit()

        conn.close()


        return jsonify({

            "success": True,

            "message":
                "Order cancelled successfully."

        })


    except Exception as e:

        print(
            "CANCEL ORDER ERROR:",
            str(e)
        )

        return jsonify({

            "success": False,

            "message":
                "Cancel order error: "
                + str(e)

        }), 500


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    init_db()

    print(
        "======================================"
    )

    print(
        "🌾 KisaanConnect Backend"
    )

    print(
        "======================================"
    )

    print(
        "Backend running at:"
    )

    print(
        "http://127.0.0.1:5000"
    )

    print(
        "======================================"
    )

    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True

    )