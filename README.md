# Granary AI Video Studio — Gemini Backend MVP

## สิ่งที่ทำงานได้ในชุดนี้
- ใช้หน้า Granary AI Video Studio เดิมเป็นหน้าหลัก
- เพิ่ม Backend Node.js/Express สำหรับเก็บ Gemini API Key ฝั่งเซิร์ฟเวอร์
- `/api/health` ตรวจสถานะบริการและการตั้งค่า Key โดยไม่เปิดเผย Key
- `/api/generate-script` เรียก Gemini API เพื่อสร้างบทหนังสั้นแบบ JSON: ตัวละคร, ฉาก, บทพากย์, camera, motion, prompt, audio และ checklist
- จำกัดอัตราการเรียก API เบื้องต้น

## เริ่มต้น
1. ติดตั้ง Node.js 20+
2. แตก ZIP และเปิดโฟลเดอร์นี้ใน Terminal
3. รัน `npm install`
4. คัดลอก `.env.example` เป็น `.env`
5. ใส่ Gemini API Key ใน `.env` ที่ `GEMINI_API_KEY=` ห้ามใส่ใน HTML/JavaScript
6. รัน `npm start`
7. เปิด `http://localhost:3000`

## ขอบเขตที่ยังต้องเชื่อมต่อก่อนใช้งานผลิตจริงครบวงจร
- การสร้างภาพ/วิดีโอจริงต้องต่อผู้ให้บริการโมเดลภาพ/วิดีโอที่บัญชีมีสิทธิ์ พร้อมจัดการงาน async และค่าใช้จ่าย
- เสียงพากย์จริงต้องใช้บริการ TTS และ credentials แยกต่างหาก (Gemini API Key ไม่ใช่ Cloud Text-to-Speech credential)
- การตัดต่อ/เรนเดอร์ MP4 ระดับ production ต้องเพิ่ม media worker เช่น FFmpeg, object storage, queue และระบบติดตามสถานะงาน
- ต้องเพิ่มฐานข้อมูล, ระบบสมาชิก/สิทธิ์, การจัดเก็บโปรเจ็กต์ และ deployment HTTPS ก่อนเปิดให้ทีมใช้งานร่วมกัน
- ผลพระคัมภีร์และบทต้องผ่านการตรวจสอบโดยมนุษย์ก่อนเผยแพร่

## ความปลอดภัย
- `.env` ไม่ควร commit หรืออัปโหลดขึ้น Git
- จำกัด API key ตาม API ที่จำเป็นและตั้งงบ/โควตาใน Google Cloud
- หาก Key เคยถูกเปิดเผย ให้เพิกถอนและออก Key ใหม่
