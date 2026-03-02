// server.js
require("dotenv").config();


const express = require("express");
const cors = require("cors");




const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const path = require("path");
app.use(express.static(path.join(__dirname, "public"))); // если site на уровень выше


const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.get("/", (req, res) => {
  res.send("OK ✅ Server is running");
});

app.post("/lead", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { name, contact, city, message } = req.body || {};

    if (!name || !contact) {
      return res.status(400).json({ ok: false, error: "name/contact required" });
    }

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ ok: false, error: "BOT_TOKEN/CHAT_ID missing in .env" });
    }

    const text =
      `Новая заявка (RE:AI)\n\n +
      Имя: ${name}\n +
      Контакт: ${contact}\n +
      Город/тип: ${city || "-"}\n +
      Сообщение: ${message || "-"}`;

    const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const tgRes = await fetch(tgUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
      }),
    });

    const tgData = await tgRes.json();
    if (!tgData.ok) {
      console.log("TG ERROR:", tgData);
      return res.status(500).json({ ok: false, error: "Telegram send failed", tgData });
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error("SERVER ERROR:", e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server listening on " + PORT);
});