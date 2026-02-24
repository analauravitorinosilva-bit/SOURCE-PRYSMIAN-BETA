import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("suppliers.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    registration_code TEXT,
    items TEXT,
    address TEXT,
    phone TEXT,
    category_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`);

// Seed initial data if empty
const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
if (categoryCount.count === 0) {
  const insertCat = db.prepare("INSERT INTO categories (name) VALUES (?)");
  insertCat.run("Eletrônicos");
  insertCat.run("Mobiliário");
  insertCat.run("Serviços de TI");
  insertCat.run("Logística");

  const insertSupp = db.prepare("INSERT INTO suppliers (name, email, registration_code, items, address, phone, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
  insertSupp.run("TechFlow Solutions", "contato@techflow.com", "TF-001", "Servidores, Laptops, Redes", "Av. Paulista, 1000, SP", "(11) 99999-9999", 3);
  insertSupp.run("OfficeMax Pro", "vendas@officemax.com", "OM-99", "Cadeiras, Mesas, Armários", "Rua das Flores, 123, RJ", "(21) 88888-8888", 2);
  insertSupp.run("Global Logistics", "info@globallog.com", "GL-42", "Transporte, Armazenagem", "Porto de Santos, S/N", "(13) 77777-7777", 4);
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  app.get("/api/suppliers", (req, res) => {
    const { q, categoryId } = req.query;
    let query = "SELECT s.*, c.name as category_name FROM suppliers s LEFT JOIN categories c ON s.category_id = c.id WHERE 1=1";
    const params: any[] = [];

    if (q) {
      query += " AND (s.name LIKE ? OR s.items LIKE ? OR s.email LIKE ? OR s.address LIKE ? OR s.phone LIKE ?)";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (categoryId) {
      query += " AND s.category_id = ?";
      params.push(categoryId);
    }

    const suppliers = db.prepare(query).all(...params);
    res.json(suppliers);
  });

  app.post("/api/suppliers", (req, res) => {
    const { name, email, registration_code, items, address, phone, category_id } = req.body;
    try {
      const info = db.prepare("INSERT INTO suppliers (name, email, registration_code, items, address, phone, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .run(name, email, registration_code, items, address, phone, category_id);
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/categories", (req, res) => {
    const { name } = req.body;
    try {
      const info = db.prepare("INSERT INTO categories (name) VALUES (?)").run(name);
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
