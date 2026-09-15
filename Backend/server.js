const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,

  connectTimeout: 10000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ==============================
// Password Hash
// ==============================

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  try {
    const parts = storedPassword.split(":");

    if (parts.length !== 2) {
      return false;
    }

    const salt = parts[0];
    const storedHash = parts[1];

    const hash = crypto
      .scryptSync(password, salt, 64)
      .toString("hex");

    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(storedHash, "hex")
    );
  } catch (error) {
    return false;
  }
}

// ==============================
// JWT Middleware
// ==============================

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Missing or invalid token",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
}

// ==============================
// Test API
// ==============================

app.get("/api", (req, res) => {
  res.json({
    message: "API is running",
  });
});

// ==============================
// Register
// ==============================

app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const cleanUsername = String(username).trim();

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 3 characters",
      });
    }

    if (String(password).length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters",
      });
    }

    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [cleanUsername]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    const hashedPassword = hashPassword(
      String(password)
    );

    await db.query(
      `
      INSERT INTO users
      (username, password, role)
      VALUES (?, ?, 'user')
      `,
      [
        cleanUsername,
        hashedPassword,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        username: cleanUsername,
        role: "user",
      },
    });
  } catch (error) {
    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Database error",
      message: error.message,
      code: error.code,
    });
  }
});

// ==============================
// Login
// ==============================

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Admin Login
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        {
          username: username,
          role: "admin",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "2h",
        }
      );

      return res.json({
        success: true,
        message: "Login successful",
        token: token,
        user: {
          username: username,
          role: "admin",
        },
      });
    }

    // Default User Login
    if (
      username === process.env.USER_USERNAME &&
      password === process.env.USER_PASSWORD
    ) {
      const token = jwt.sign(
        {
          username: username,
          role: "user",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "2h",
        }
      );

      return res.json({
        success: true,
        message: "Login successful",
        token: token,
        user: {
          username: username,
          role: "user",
        },
      });
    }

    // Registered User Login
    const [users] = await db.query(
      `
      SELECT id, username, password, role
      FROM users
      WHERE username = ?
      LIMIT 1
      `,
      [username]
    );

    if (users.length > 0) {
      const user = users[0];

      const passwordCorrect =
        verifyPassword(
          String(password || ""),
          user.password
        );

      if (passwordCorrect) {
        const token = jwt.sign(
          {
            username: user.username,
            role: user.role,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "2h",
          }
        );

        return res.json({
          success: true,
          message: "Login successful",
          token: token,
          user: {
            username: user.username,
            role: user.role,
          },
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Database error",
      message: error.message,
      code: error.code,
    });
  }
});

// ==============================
// Test MySQL
// ==============================

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT 1 AS test"
    );

    res.json({
      success: true,
      message: "Database connected",
      result: rows,
    });
  } catch (error) {
    console.error(
      "DATABASE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Database connection failed",
      message: error.message,
      code: error.code,
    });
  }
});

// ==============================
// Get Products + Search
// ==============================

app.get(
  "/api/products",
  requireAuth,
  async (req, res) => {
    try {
      const q = String(
        req.query.q || ""
      ).trim();

      let sql = `
        SELECT
          id,
          Name,
          Price,
          Image,
          stock
        FROM products
      `;

      let params = [];

      if (q !== "") {
        sql += `
          WHERE Name LIKE ?
          OR CAST(Price AS CHAR) LIKE ?
          OR Image LIKE ?
          OR CAST(stock AS CHAR) LIKE ?
        `;

        const search = `%${q}%`;

        params = [
          search,
          search,
          search,
          search,
        ];
      }

      sql += " ORDER BY id DESC";

      const [rows] = await db.query(
        sql,
        params
      );

      res.json(rows);
    } catch (error) {
      console.error(
        "PRODUCT DATABASE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        error: "Database error",
        message: error.message,
        code: error.code,
      });
    }
  }
);

// ==============================
// Add Product
// Admin only
// ==============================

app.post(
  "/api/products",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        Name,
        Price,
        Image,
        stock,
      } = req.body;

      if (!Name) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      const productStock =
        Number.isFinite(Number(stock))
          ? Math.max(0, Number(stock))
          : 0;

      const [result] =
        await db.query(
          `
          INSERT INTO products
          (Name, Price, Image, stock)
          VALUES (?, ?, ?, ?)
          `,
          [
            Name,
            Price,
            Image,
            productStock,
          ]
        );

      res.status(201).json({
        success: true,
        productId: result.insertId,
        stock: productStock,
      });
    } catch (error) {
      console.error(
        "ADD PRODUCT ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        error: "Database error",
        message: error.message,
        code: error.code,
      });
    }
  }
);

// ==============================
// Edit Product
// Admin only
// ==============================

app.post(
  "/api/products/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        Name,
        Price,
        Image,
        stock,
      } = req.body;

      if (!Name) {
        return res.status(400).json({
          success: false,
          message: "Name is required",
        });
      }

      const productStock =
        Number.isFinite(Number(stock))
          ? Math.max(0, Number(stock))
          : 0;

      const [result] =
        await db.query(
          `
          UPDATE products
          SET Name = ?,
              Price = ?,
              Image = ?,
              stock = ?
          WHERE id = ?
          `,
          [
            Name,
            Price,
            Image,
            productStock,
            id,
          ]
        );

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message:
          "Product updated successfully",
        stock: productStock,
      });
    } catch (error) {
      console.error(
        "EDIT PRODUCT ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        error: "Database error",
        message: error.message,
        code: error.code,
      });
    }
  }
);

// ==============================
// Delete Product
// Admin only
// ==============================

app.delete(
  "/api/products/:id",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const [result] =
        await db.query(
          "DELETE FROM products WHERE id = ?",
          [id]
        );

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        message:
          "Product deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        error: "Database error",
        message: error.message,
        code: error.code,
      });
    }
  }
);

// ==============================
// Start Server
// ==============================

const PORT =
  process.env.PORT || 3097;

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `API running on port ${PORT}`
    );
  }
);