const bookingRoutes = require('./routes/bookingRoutes');
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/api', bookingRoutes);
app.use("/generated_pdfs", express.static("generated_pdfs"));


// const db = new sqlite3.Database("/app/data/travel_storing.db", (err) => {
//   if (err) console.error("DB Error:", err.message);
//   else console.log("✅ Connected to SQLite database");
// });

//const path = require("path");

const dbPath = process.env.NODE_ENV === "production"
  ? "/app/data/travel_storing.db"
  : path.join(__dirname, "travel.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB Error:", err.message);
  else console.log("✅ Connected to SQLite database");
});

/* ---------- CREATE TABLES ---------- */

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS travel_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      current_city TEXT,
      destination TEXT,
      start_date TEXT,
      end_date TEXT,
      budget TEXT,
      group_type TEXT,
      travel_style TEXT,
      food_preference TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS travel_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      request_id INTEGER,
      final_itinerary TEXT,
      pdf_path TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

});

/* ---------- SYNC USER ---------- */

app.post("/sync-user", (req, res) => {
  const { id, name, email } = req.body;
    if (!id || !name || !email) {
    return res.status(400).json({ error: "Missing user data" });
  }

  const query = `
    INSERT INTO users (id, name, email)
    VALUES (?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      email = excluded.email
  `;

  db.run(query, [id, name, email], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "User synced successfully" });
  });
});

/* ---------- SAVE TRAVEL + AI ---------- */

app.post("/save-travel", (req, res) => {
  const travelData = req.body;

  if (!travelData.user_id) {
    return res.status(400).json({ error: "User ID required" });
  }

  const insertSQL = `
    INSERT INTO travel_requests
    (user_id, current_city, destination, start_date, end_date, budget, group_type, travel_style, food_preference)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    insertSQL,
    [
      travelData.user_id,
      travelData.current_city,
      travelData.destination,
      travelData.start_date,
      travelData.end_date,
      travelData.budget,
      travelData.group_type,
      travelData.travel_style,
      travelData.food_preference
    ],
    function (err) {
      if (err) {
        console.error("Travel Insert Error:", err.message);
        return res.status(500).json({ error: err.message });
      }

      const requestId = this.lastID;

      // 🔥 Spawn Python with correct absolute path
      const pythonProcess = spawn("python", [
        path.join(__dirname, "ai_travel.py"),
        JSON.stringify(travelData)
      ]);

      let resultData = "";

      pythonProcess.stdout.on("data", (data) => {
        resultData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error("Python Error:", data.toString());
      });

      pythonProcess.on("close", () => {

        let aiResult;

        try {
          aiResult = JSON.parse(resultData.trim());
        } catch (err) {
          console.error("JSON Parse Error:", resultData);
          return res.status(500).json({ error: "Invalid AI response" });
        }

        if (aiResult.error) {
          return res.status(500).json({ error: aiResult.error });
        }

        if (!aiResult.itinerary) {
          return res.status(500).json({ error: "AI did not return itinerary" });
        }

        // 🔥 Save itinerary + optional PDF
        // ✅ Save itinerary only (NO PDF here)
      db.run(
      `INSERT INTO travel_plans (user_id, request_id, final_itinerary)
       VALUES (?, ?, ?)`,
       [
        travelData.user_id,
        requestId,
         aiResult.itinerary
       ],

          function (err) {
            if (err) {
              console.error("Travel Plan Insert Error:", err.message);
              return res.status(500).json({ error: err.message });
            }
            res.json({
            message: "Travel plan created successfully!",
             request_id: requestId,
            itinerary: aiResult.itinerary
          });


          }
        );
      });
    }
  );
});


/* ---------- TRAVEL HISTORY ---------- */


app.get("/travel-history/:userId", (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 
      travel_plans.id,
      travel_plans.request_id,   -- 🔥 ADD THIS
      travel_plans.final_itinerary,
      travel_plans.created_at,
      travel_requests.destination,
      travel_requests.start_date,
      travel_requests.end_date
    FROM travel_plans
    JOIN travel_requests 
      ON travel_plans.request_id = travel_requests.id
    WHERE travel_plans.user_id = ?
    ORDER BY travel_plans.created_at DESC
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ===================================================
// 💬 CHAT ROUTE (NOW CORRECTLY USING chat_loop.py)
// ===================================================

app.post("/chat", (req, res) => {

  const { request_id, user_message, pending_update } = req.body;

  if (!request_id || !user_message) {
    return res.status(400).json({ error: "Missing data" });
  }

  db.get(
    "SELECT final_itinerary FROM travel_plans WHERE request_id = ?",
    [request_id],
    (err, row) => {

      if (err || !row) {
        return res.status(500).json({ error: "Itinerary not found" });
      }

      const python = spawn("python", [
        path.join(__dirname, "chat_loop.py"),   // 🔥 FIXED HERE
        JSON.stringify({
          user_message,
          current_itinerary: row.final_itinerary,
          pending_update
        })
      ]);

      let dataString = "";

      python.stdout.on("data", (data) => {
        dataString += data.toString();
      });

      python.stderr.on("data", (data) => {
        console.error("Python Error:", data.toString());
      });

      python.on("close", () => {

        try {

          const result = JSON.parse(dataString.trim());

          // ===== CONFIRM UPDATE =====
          if (result.action === "confirm_update") {

  console.log("🔥 CONFIRM UPDATE TRIGGERED");
  console.log("Request ID:", request_id);
  console.log("Updated itinerary length:", result.updated_itinerary.length);

  db.run(
    `UPDATE travel_plans 
     SET final_itinerary = ? 
     WHERE request_id = ?`,
    [result.updated_itinerary, request_id],
    function (err) {

      if (err) {
        console.error("❌ UPDATE ERROR:", err);
        return res.status(500).json({ error: err.message });
      }

      console.log("Rows updated:", this.changes);

      res.json({
        reply: "✅ Your itinerary has been updated successfully!",
        updated: true,
        itinerary: result.updated_itinerary
      });
    }
  );
}

          // ===== PENDING UPDATE =====
          else if (result.action === "pending_update") {
            res.json({
              reply: result.reply,
              pending_update: result.updated_itinerary
            });
          }

          // ===== CANCEL OR NORMAL =====
          else {
            res.json({ reply: result.reply });
          }

        } catch (err) {
          console.error("Chat JSON Parse Error:", err);
          res.status(500).json({ error: "Invalid AI response" });
        }
      });
    }
  );
});

app.get("/download-pdf/:request_id", (req, res) => {

  const requestId = req.params.request_id;

  if (!requestId) {
    return res.status(400).json({ error: "Request ID missing" });
  }

  db.get(
    `SELECT final_itinerary, user_id 
     FROM travel_plans 
     WHERE request_id = ?`,
    [requestId],
    (err, row) => {

      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Plan not found" });

      const pythonProcess = spawn("python", [
        path.join(__dirname, "generate_pdf.py"),
        JSON.stringify({
          itinerary: row.final_itinerary,
          user_id: row.user_id
        })
      ]);

      let resultData = "";

      pythonProcess.stdout.on("data", (data) => {
        resultData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error("PDF Python Error:", data.toString());
      });

      pythonProcess.on("close", () => {

        try {
          const result = JSON.parse(resultData.trim());

          if (!result.pdf_path) {
            return res.status(500).json({ error: "PDF generation failed" });
          }

          const absolutePath = path.resolve(result.pdf_path);

          res.download(absolutePath, (err) => {
            if (err) {
              console.error("Download Error:", err);
            }
          });

        } catch (err) {
          console.error("PDF JSON Parse Error:", err);
          res.status(500).json({ error: "Invalid PDF response" });
        }
      });
    }
  );
});

app.listen(PORT, () => {
  console.log("🚀 Server running → http://localhost:5000");
});