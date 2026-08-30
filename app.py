from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import uuid

app = Flask(__name__)
CORS(app)

# =========================================================
# PATHS
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATABASE = os.path.join(
    BASE_DIR,
    "database.db"
)

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db():

    conn = sqlite3.connect(DATABASE)

    conn.row_factory = sqlite3.Row

    return conn


# =========================================================
# INITIALIZE DATABASE
# =========================================================

def init_db():

    conn = get_db()

    # -----------------------------------------------------
    # USERS
    # -----------------------------------------------------

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            email TEXT UNIQUE NOT NULL,

            phone TEXT NOT NULL,

            location TEXT NOT NULL,

            role TEXT NOT NULL,

            upi_id TEXT DEFAULT ''

        )
    """)


    # -----------------------------------------------------
    # PRODUCTS
    # -----------------------------------------------------

    conn.execute("""
        CREATE TABLE IF NOT EXISTS products (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            farmer_id INTEGER NOT NULL,

            name TEXT NOT NULL,

            category TEXT NOT NULL,

            quantity REAL NOT NULL DEFAULT 0,

            price REAL NOT NULL,

            location TEXT NOT NULL,

            description TEXT DEFAULT '',

            image TEXT,

            FOREIGN KEY (farmer_id)
            REFERENCES users(id)

        )
    """)


    # -----------------------------------------------------
    # ORDERS
    # -----------------------------------------------------

    conn.execute("""
        CREATE TABLE IF NOT EXISTS orders (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            consumer_id INTEGER NOT NULL,

            product_id INTEGER NOT NULL,

            quantity REAL NOT NULL,

            total_price REAL NOT NULL,

            delivery_location TEXT NOT NULL,

            payment_method TEXT NOT NULL,

            upi_id TEXT DEFAULT '',

            status TEXT DEFAULT 'Pending',

            FOREIGN KEY (consumer_id)
            REFERENCES users(id),

            FOREIGN KEY (product_id)
            REFERENCES products(id)

        )
    """)


    # =====================================================
    # ADD MISSING COLUMNS TO OLD DATABASES
    # =====================================================

    columns = {

        "users": [

            ("upi_id", "TEXT")

        ],

        "products": [

            ("image", "TEXT")

        ],

        "orders": [

            ("delivery_location", "TEXT"),

            ("payment_method", "TEXT"),

            ("upi_id", "TEXT"),

            ("status", "TEXT")

        ]

    }


    for table, table_columns in columns.items():

        existing = conn.execute(
            f"PRAGMA table_info({table})"
        ).fetchall()


        existing_names = [

            row["name"]

            for row in existing

        ]


        for column_name, column_type in table_columns:

            if column_name not in existing_names:

                conn.execute(
                    f"""
                    ALTER TABLE {table}
                    ADD COLUMN {column_name}
                    {column_type}
                    """
                )


    conn.commit()

    conn.close()


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    return jsonify({

        "success": True,

        "message":
            "KisaanConnect Backend Running"

    })


# =========================================================
# IMAGE
# =========================================================

@app.route(
    "/uploads/<filename>"
)
def uploaded_file(filename):

    return send_from_directory(

        app.config["UPLOAD_FOLDER"],

        filename

    )


# =========================================================
# REGISTER
# =========================================================

@app.route(
    "/api/register",
    methods=["POST"]
)
def register():

    data = request.get_json()

    if not data:

        return jsonify({

            "success": False,

            "message":
                "Invalid request."

        }), 400


    name = str(
        data.get("name", "")
    ).strip()


    email = str(
        data.get("email", "")
    ).strip()


    phone = str(
        data.get("phone", "")
    ).strip()


    location = str(
        data.get("location", "")
    ).strip()


    role = str(
        data.get("role", "")
    ).strip().lower()


    upi_id = str(
        data.get("upi_id", "")
    ).strip()


    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    if not all([

        name,
        email,
        phone,
        location,
        role

    ]):

        return jsonify({

            "success": False,

            "message":
                "Please fill all details."

        }), 400


    if role not in [
        "farmer",
        "consumer"
    ]:

        return jsonify({

            "success": False,

            "message":
                "Invalid role."

        }), 400


    if (
        not phone.isdigit()
        or len(phone) != 10
    ):

        return jsonify({

            "success": False,

            "message":
                "Enter a valid 10-digit phone number."

        }), 400


    # Farmer UPI is required
    if role == "farmer" and not upi_id:

        return jsonify({

            "success": False,

            "message":
                "Farmer UPI ID is required."

        }), 400


    # Consumer does not need UPI
    if role == "consumer":

        upi_id = ""


    conn = get_db()


    try:

        cursor = conn.execute(
            """
            INSERT INTO users
            (
                name,
                email,
                phone,
                location,
                role,
                upi_id
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                name,
                email,
                phone,
                location,
                role,
                upi_id
            )
        )


        user_id = cursor.lastrowid


        conn.commit()


    except sqlite3.IntegrityError:

        conn.close()

        return jsonify({

            "success": False,

            "message":
                "Email already registered."

        }), 400


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

            "role": role,

            "upi_id":
                upi_id
                if role == "farmer"
                else ""

        }

    })


# =========================================================
# ADD PRODUCT
# =========================================================

@app.route(
    "/api/products",
    methods=["POST"]
)
def add_product():

    farmer_id = request.form.get(
        "farmer_id"
    )

    name = request.form.get(
        "name"
    )

    category = request.form.get(
        "category"
    )

    quantity = request.form.get(
        "quantity"
    )

    price = request.form.get(
        "price"
    )

    location = request.form.get(
        "location"
    )

    description = request.form.get(
        "description",
        ""
    )


    image = request.files.get(
        "image"
    )


    # -----------------------------------------------------
    # REQUIRED FIELDS
    # -----------------------------------------------------

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


    # -----------------------------------------------------
    # VALIDATE FARMER
    # -----------------------------------------------------

    conn = get_db()


    farmer = conn.execute(
        """
        SELECT id, role
        FROM users
        WHERE id = ?
        """,
        (farmer_id,)
    ).fetchone()


    if not farmer:

        conn.close()

        return jsonify({

            "success": False,

            "message":
                "Farmer not found."

        }), 404


    if farmer["role"] != "farmer":

        conn.close()

        return jsonify({

            "success": False,

            "message":
                "Only farmers can add products."

        }), 403


    # -----------------------------------------------------
    # NUMBER VALIDATION
    # -----------------------------------------------------

    try:

        quantity = float(quantity)

        price = float(price)

    except (
        TypeError,
        ValueError
    ):

        conn.close()

        return jsonify({

            "success": False,

            "message":
                "Quantity and price must be numbers."

        }), 400


    if quantity < 0:

        conn.close()

        return jsonify({

            "success": False,

            "message":
                "Stock cannot be negative."

        }), 400


    if price < 0:

        conn.close()

        return jsonify({

            "success": False,

            "message":
                "Price cannot be negative."

        }), 400


    # -----------------------------------------------------
    # IMAGE
    # -----------------------------------------------------

    image_filename = None


    if image and image.filename:

        extension = os.path.splitext(
            image.filename
        )[1].lower()


        allowed = [

            ".jpg",
            ".jpeg",
            ".png",
            ".webp"

        ]


        if extension not in allowed:

            conn.close()

            return jsonify({

                "success": False,

                "message":
                    "Only JPG, PNG and WEBP images are allowed."

            }), 400


        image_filename = (

            str(uuid.uuid4())

            + extension

        )


        image.save(

            os.path.join(

                UPLOAD_FOLDER,

                image_filename

            )

        )


    # -----------------------------------------------------
    # INSERT PRODUCT
    # -----------------------------------------------------

    cursor = conn.execute(
        """
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
        """,
        (
            farmer_id,
            name,
            category,
            quantity,
            price,
            location,
            description,
            image_filename
        )
    )


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


# =========================================================
# GET PRODUCTS
# =========================================================

@app.route(
    "/api/products",
    methods=["GET"]
)
def get_products():

    conn = get_db()


    rows = conn.execute(
        """
        SELECT

            products.*,

            users.name AS farmer_name,

            users.upi_id AS farmer_upi

        FROM products

        JOIN users

        ON products.farmer_id =
           users.id

        ORDER BY products.id DESC
        """
    ).fetchall()


    conn.close()


    products = []


    for row in rows:

        image_url = None


        if row["image"]:

            image_url = (

                "http://127.0.0.1:5000/uploads/"

                + row["image"]

            )


        products.append({

            "id":
                row["id"],

            "farmer_id":
                row["farmer_id"],

            "farmer_name":
                row["farmer_name"],

            "farmer_upi":
                row["farmer_upi"] or "",

            "name":
                row["name"],

            "category":
                row["category"],

            "quantity":
                row["quantity"],

            "price":
                row["price"],

            "location":
                row["location"],

            "description":
                row["description"] or "",

            "image":
                image_url

        })


    return jsonify({

        "success": True,

        "products":
            products

    })


# =========================================================
# UPDATE STOCK
# =========================================================

@app.route(
    "/api/products/<int:product_id>/stock",
    methods=["PUT"]
)
def update_product_stock(
    product_id
):

    data = request.get_json()


    if not data:

        return jsonify({

            "success": False,

            "message":
                "Invalid request."

        }), 400


    farmer_id = data.get(
        "farmer_id"
    )

    stock = data.get(
        "stock"
    )


    if farmer_id is None or stock is None:

        return jsonify({

            "success": False,

            "message":
                "Farmer ID and stock are required."

        }), 400


    try:

        stock = float(stock)

    except (
        TypeError,
        ValueError
    ):

        return jsonify({

            "success": False,

            "message":
                "Invalid stock value."

        }), 400


    if stock < 0:

        return jsonify({

            "success": False,

            "message":
                "Stock cannot be negative."

        }), 400


    conn = get_db()


    product = conn.execute(
        """
        SELECT id
        FROM products
        WHERE id = ?
        AND farmer_id = ?
        """,
        (
            product_id,
            farmer_id
        )
    ).fetchone()


    if not product:

        conn.close()

        return jsonify({

            "success": False,

            "message":
                "Product not found or you are not allowed to modify it."

        }), 404


    conn.execute(
        """
        UPDATE products

        SET quantity = ?

        WHERE id = ?

        AND farmer_id = ?
        """,
        (
            stock,
            product_id,
            farmer_id
        )
    )


    conn.commit()

    conn.close()


    return jsonify({

        "success": True,

        "message":
            "Stock updated successfully.",

        "stock":
            stock

    })


# =========================================================
# DELETE PRODUCT
# =========================================================

@app.route(
    "/api/products/<int:product_id>",
    methods=["DELETE"]
)
def delete_product(
    product_id
):

    farmer_id = request.args.get(
        "farmer_id"
    )


    if not farmer_id:

        return jsonify({

            "success": False,

            "message":
                "Farmer ID is required."

        }), 400


    conn = get_db()


    product = conn.execute(
        """
        SELECT *

        FROM products

        WHERE id = ?

        AND farmer_id = ?
        """,
        (
            product_id,
            farmer_id
        )
    ).fetchone()


    if not product:

        conn.close()

        return jsonify({

            "success": False,

            "message":
                "Product not found or you are not allowed to delete it."

        }), 404


    # -----------------------------------------------------
    # DELETE IMAGE
    # -----------------------------------------------------

    if product["image"]:

        image_path = os.path.join(

            UPLOAD_FOLDER,

            product["image"]

        )


        if os.path.exists(image_path):

            try:

                os.remove(
                    image_path
                )

            except OSError:

                pass


    # -----------------------------------------------------
    # DELETE PRODUCT
    # -----------------------------------------------------

    conn.execute(
        """
        DELETE FROM products

        WHERE id = ?

        AND farmer_id = ?
        """,
        (
            product_id,
            farmer_id
        )
    )


    conn.commit()

    conn.close()


    return jsonify({

        "success": True,

        "message":
            "Product deleted successfully."

    })


# =========================================================
# PLACE ORDER
# =========================================================

@app.route(
    "/api/orders",
    methods=["POST"]
)
def place_order():

    data = request.get_json()


    if not data:

        return jsonify({

            "success": False,

            "message":
                "Invalid request."

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

    delivery_location = str(
        data.get(
            "delivery_location",
            ""
        )
    ).strip()

    payment_method = str(
        data.get(
            "payment_method",
            ""
        )
    ).strip()


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


    # -----------------------------------------------------
    # VALIDATE QUANTITY
    # -----------------------------------------------------

    try:

        qty = float(quantity)

    except (
        TypeError,
        ValueError
    ):

        return jsonify({

            "success": False,

            "message":
                "Invalid quantity."

        }), 400


    if qty <= 0:

        return jsonify({

            "success": False,

            "message":
                "Quantity must be greater than zero."

        }), 400


    conn = get_db()


    # -----------------------------------------------------
    # CHECK CONSUMER
    # -----------------------------------------------------

    consumer = conn.execute(
        """
        SELECT id, role
        FROM users
        WHERE id = ?
        """,
        (consumer_id,)
    ).fetchone()


    if not consumer:

        conn.close()

        return jsonify({

            "success": False,

            "message":
                "Consumer not found."

        }), 404


    if consumer["role"] != "consumer":

        conn.close()

        return jsonify({

            "success": False,

            "message":
                "Only consumers can place orders."

        }), 403


    # -----------------------------------------------------
    # GET PRODUCT + FARMER UPI
    # -----------------------------------------------------

    product = conn.execute(
        """
        SELECT

            products.*,

            users.name AS farmer_name,

            users.upi_id AS farmer_upi

        FROM products

        JOIN users

        ON products.farmer_id =
           users.id

        WHERE products.id = ?

        """,
        (product_id,)
    ).fetchone()


    if not product:

        conn.close()

        return jsonify({

            "success": False,

            "message":
                "Product not found."

        }), 404


    # -----------------------------------------------------
    # CHECK STOCK
    # -----------------------------------------------------

    available_stock = float(
        product["quantity"]
    )


    if available_stock <= 0:

        conn.close()

        return jsonify({

            "success": False,

            "message":
                "This product is out of stock."

        }), 400


    if qty > available_stock:

        conn.close()

        return jsonify({

            "success": False,

            "message":
                f"Only {available_stock:g} kg is available."

        }), 400


    # -----------------------------------------------------
    # CALCULATE TOTAL
    # -----------------------------------------------------

    total = (
        qty *
        float(product["price"])
    )


    # -----------------------------------------------------
    # FARMER UPI
    # -----------------------------------------------------

    farmer_upi = (
        product["farmer_upi"]
        or ""
    )


    # IMPORTANT:
    # Consumer does NOT provide the farmer UPI.
    # Backend automatically gets farmer UPI.

    if payment_method == "UPI":

        if not farmer_upi:

            conn.close()

            return jsonify({

                "success": False,

                "message":
                    "Farmer has not added a UPI ID."

            }), 400


    # -----------------------------------------------------
    # SAVE ORDER
    # -----------------------------------------------------

    cursor = conn.execute(
        """
        INSERT INTO orders
        (
            consumer_id,
            product_id,
            quantity,
            total_price,
            delivery_location,
            payment_method,
            upi_id,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            consumer_id,
            product_id,
            qty,
            total,
            delivery_location,
            payment_method,

            # Store FARMER UPI
            farmer_upi
            if payment_method == "UPI"
            else "",

            "Pending"
        )
    )


    order_id = cursor.lastrowid


    # -----------------------------------------------------
    # REDUCE STOCK
    # -----------------------------------------------------

    new_stock = (
        available_stock -
        qty
    )


    conn.execute(
        """
        UPDATE products

        SET quantity = ?

        WHERE id = ?
        """,
        (
            new_stock,
            product_id
        )
    )


    conn.commit()

    conn.close()


    return jsonify({

        "success": True,

        "message":
            "Order placed successfully!",

        "order_id":
            order_id,

        "total_price":
            total,

        "farmer_name":
            product["farmer_name"],

        "farmer_upi":
            farmer_upi

    })


# =========================================================
# CONSUMER ORDERS
# =========================================================

@app.route(
    "/api/orders/consumer/<int:consumer_id>"
)
def consumer_orders(
    consumer_id
):

    conn = get_db()


    rows = conn.execute(
        """
        SELECT

            orders.*,

            products.name AS product_name,

            products.image AS product_image,

            users.name AS farmer_name

        FROM orders

        JOIN products

        ON orders.product_id =
           products.id

        JOIN users

        ON products.farmer_id =
           users.id

        WHERE orders.consumer_id = ?

        ORDER BY orders.id DESC
        """,
        (consumer_id,)
    ).fetchall()


    conn.close()


    orders = []


    for row in rows:

        orders.append({

            "id":
                row["id"],

            "product_name":
                row["product_name"],

            "farmer_name":
                row["farmer_name"],

            "quantity":
                row["quantity"],

            "total_price":
                row["total_price"],

            "status":
                row["status"],

            "delivery_location":
                row["delivery_location"],

            "payment_method":
                row["payment_method"],

            "upi_id":
                row["upi_id"] or ""

        })


    return jsonify({

        "success": True,

        "orders":
            orders

    })


# =========================================================
# FARMER ORDERS
# =========================================================

@app.route(
    "/api/orders/farmer/<int:farmer_id>"
)
def farmer_orders(
    farmer_id
):

    conn = get_db()


    rows = conn.execute(
        """
        SELECT

            orders.*,

            products.name AS product_name,

            users.name AS consumer_name

        FROM orders

        JOIN products

        ON orders.product_id =
           products.id

        JOIN users

        ON orders.consumer_id =
           users.id

        WHERE products.farmer_id = ?

        ORDER BY orders.id DESC
        """,
        (farmer_id,)
    ).fetchall()


    conn.close()


    orders = []


    for row in rows:

        orders.append({

            "id":
                row["id"],

            "product_name":
                row["product_name"],

            "consumer_name":
                row["consumer_name"],

            "quantity":
                row["quantity"],

            "total_price":
                row["total_price"],

            "status":
                row["status"],

            "delivery_location":
                row["delivery_location"],

            "payment_method":
                row["payment_method"],

            "upi_id":
                row["upi_id"] or ""

        })


    return jsonify({

        "success": True,

        "orders":
            orders

    })


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    init_db()


    print(
        "================================"
    )

    print(
        "🌾 KisaanConnect Backend"
    )

    print(
        "================================"
    )

    print(
        "http://127.0.0.1:5000"
    )

    print(
        "================================"
    )


    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True

    )