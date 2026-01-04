import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Gemini setup ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelName = "gemini-3-flash-preview";

// --- Paths ---
const CHARACTERS_DIR = path.join(__dirname, "characters");
const CONVERSATIONS_DIR = path.join(__dirname, "conversations");

// Ensure conversations directory exists
if (!fs.existsSync(CONVERSATIONS_DIR)) {
  fs.mkdirSync(CONVERSATIONS_DIR, { recursive: true });
}

// --- Helper Functions ---

/**
 * Load all characters from characters/ directory
 */
function loadCharacters() {
  const characters = {};
  const files = fs.readdirSync(CHARACTERS_DIR);

  files
    .filter((f) => f.endsWith(".json"))
    .forEach((file) => {
      try {
        const filePath = path.join(CHARACTERS_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        const key = file.replace(".json", "");
        characters[key] = data.character_profile;
      } catch (error) {
        console.error(`Error loading character ${file}:`, error.message);
      }
    });

  return characters;
}

/**
 * Get conversation history file path for a character
 */
function getConversationPath(characterId) {
  return path.join(CONVERSATIONS_DIR, `${characterId}.json`);
}

/**
 * Load conversation history for a character
 */
function loadConversation(characterId) {
  const filePath = getConversationPath(characterId);

  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      return data.messages || [];
    } catch (error) {
      console.error(`Error loading conversation for ${characterId}:`, error.message);
      return [];
    }
  }

  return [];
}

/**
 * Save conversation history for a character
 */
function saveConversation(characterId, messages) {
  const filePath = getConversationPath(characterId);
  const data = {
    characterId,
    lastUpdated: new Date().toISOString(),
    messages,
  };

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error saving conversation for ${characterId}:`, error.message);
  }
}

/**
 * Build system prompt from character profile
 */
function buildSystemPrompt(characterProfile) {
  return `Sen aşağıda özellikleri belirtilen JSON dosyasındaki karakterisin. Tüm cevaplarını bu JSON'daki personality_traits, communication_style ve interaction_rules parametrelerine sıkı sıkıya bağlı kalarak ver. Karaktere bağlı kalarak kendine özgü cümleler üretebilirsin. Tekrardan kaçınmaya çalış 

${JSON.stringify(characterProfile, null, 2)}`;
}

/**
 * Convert messages to Gemini chat history format
 * Only send last 50 messages to API
 */
function toGeminiHistory(messages) {
  const recentMessages = messages.slice(-50);

  return recentMessages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.text }],
  }));
}

// --- API Endpoints ---

/**
 * GET /characters - Get list of all available characters
 */
app.get("/characters", (req, res) => {
  try {
    const characters = loadCharacters();

    const characterList = Object.entries(characters).map(([id, profile]) => ({
      id,
      name: profile.identity?.name || id,
      avatar: profile.identity?.avatar || "/avatars/default.png",
      description: profile.identity?.description || "",
    }));

    res.json(characterList);
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).json({ error: "Karakterler yüklenemedi." });
  }
});

/**
 * GET /history/:characterId - Get conversation history for a character
 */
app.get("/history/:characterId", (req, res) => {
  try {
    const { characterId } = req.params;
    const messages = loadConversation(characterId);
    res.json({ characterId, messages });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Konuşma geçmişi yüklenemedi." });
  }
});

/**
 * DELETE /history/:characterId - Clear conversation history for a character
 */
app.delete("/history/:characterId", (req, res) => {
  try {
    const { characterId } = req.params;
    const filePath = getConversationPath(characterId);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: "Konuşma geçmişi temizlendi." });
  } catch (error) {
    console.error("Error clearing history:", error);
    res.status(500).json({ error: "Konuşma geçmişi temizlenemedi." });
  }
});

/**
 * POST /ask - Send a message to a character
 */
app.post("/ask", async (req, res) => {
  const { message, characterId } = req.body;

  if (!message || !characterId) {
    return res.status(400).json({ error: "Mesaj ve karakter ID gerekli." });
  }

  try {
    // Load character profile
    const characters = loadCharacters();
    const characterProfile = characters[characterId];

    if (!characterProfile) {
      return res.status(404).json({ error: "Karakter bulunamadı." });
    }

    // Load conversation history
    const messages = loadConversation(characterId);

    // Build system prompt
    const systemPrompt = buildSystemPrompt(characterProfile);

    // Initialize Gemini model with system instruction
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    // Start chat with history
    const chat = model.startChat({
      history: toGeminiHistory(messages),
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const reply =
      result.response.text() ||
      result.response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Yanıt alınamadı.";

    // Add new messages to history
    const timestamp = new Date().toISOString();
    messages.push({ role: "user", text: message, timestamp });
    messages.push({ role: "model", text: reply, timestamp });

    // Save updated conversation
    saveConversation(characterId, messages);

    res.json({ reply });
  } catch (error) {
    console.error("Error in /ask:", error);

    if (error.status === 503) {
      return res.status(503).json({ error: "Servis geçici olarak kullanılamıyor. Lütfen tekrar deneyin." });
    }

    res.status(error.status || 500).json({
      error: error.statusText || "Bir hata oluştu.",
    });
  }
});

// --- Static files ---
app.use(express.static("public"));

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Hayalet Mentor API ${PORT} portunda calisiyor`);
  console.log(`Karakterler: ${Object.keys(loadCharacters()).join(", ")}`);
});
