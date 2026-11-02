import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'Granary AI Video Studio', geminiConfigured: Boolean(process.env.GEMINI_API_KEY), model }));

function safeJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

app.post('/api/generate-script', async (req, res) => {
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'ยังไม่ได้ตั้งค่า GEMINI_API_KEY ในไฟล์ .env ของ Backend' });
  const { topic, category = 'หนังสั้นคริสเตียน', tone = 'อบอุ่น', audience = 'ผู้ชมทั่วไป', duration = 5 } = req.body || {};
  if (typeof topic !== 'string' || topic.trim().length < 2 || topic.length > 500) return res.status(400).json({ error: 'กรุณาระบุหัวข้อ 2–500 ตัวอักษร' });

  const prompt = `คุณเป็นนักเขียนบทและผู้กำกับหนังสั้นคริสเตียนมืออาชีพของ Granary Church ศาลาธรรมยุ้งฉาง เขียนเป็นภาษาไทยธรรมชาติ เข้าใจง่าย มีโครงเรื่องชัดเจนและจบอย่างมีความหวังโดยยึดพระเยซูคริสต์เป็นศูนย์กลางเมื่อเหมาะสม\nหัวข้อ: ${topic}\nประเภท: ${category}\nอารมณ์: ${tone}\nกลุ่มเป้าหมาย: ${audience}\nความยาวเป้าหมาย: ${duration} นาที\nสร้าง 5–8 ฉากตามความเหมาะสม บทพากย์แบ่งวรรคหายใจด้วย / และระบุภาพ/การเคลื่อนไหว/มุมกล้อง/เสียงประกอบให้ทุกฉาก ตัวละครหลักต้องมีคำอธิบายรูปลักษณ์คงที่เพื่อรักษาความต่อเนื่อง หลีกเลี่ยงการแต่งคำพระคัมภีร์เป็นคำอ้างตรง หากไม่มั่นใจให้ระบุเพียงข้ออ้างอิงและเตือนให้ตรวจสอบฉบับพระคัมภีร์ก่อนเผยแพร่\nตอบเป็น JSON เท่านั้น ตาม schema: {"title":"","logline":"","theme":"","duration_minutes":${Number(duration)||5},"characters":[{"name":"","description":"","continuity_prompt":""}],"scripture":{"reference":"","note":"ตรวจสอบข้อความกับพระคัมภีร์ฉบับที่ใช้ก่อนเผยแพร่"},"scenes":[{"sceneNum":1,"timecode":"00:00-00:30","location":"","action":"","dialogue":"","narration":"","camera":"","motion":"","prompt":"English cinematic image/video prompt, 16:9, include character continuity","audio":"","transition":""}],"ending":"","review_checklist":["ตรวจข้อพระคัมภีร์","ตรวจบทและคำสะกด","ตรวจสิทธิ์ภาพ/เสียง"]}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.7 } })
    });
    const payload = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: payload?.error?.message || 'Gemini API request failed' });
    const output = payload?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n');
    if (!output) return res.status(502).json({ error: 'Gemini ไม่ส่งเนื้อหากลับมา' });
    const data = safeJson(output);
    if (!Array.isArray(data.scenes) || !data.scenes.length) return res.status(502).json({ error: 'ผลลัพธ์ไม่มีรายการฉากที่ถูกต้อง' });
    res.json({ ...data, provider: 'Google Gemini API', model });
  } catch (error) {
    res.status(502).json({ error: `ประมวลผลไม่สำเร็จ: ${error.message}` });
  }
});

app.listen(port, () => console.log(`Granary AI Video Studio running at http://localhost:${port}`));
