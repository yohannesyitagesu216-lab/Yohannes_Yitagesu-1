# AgroVision AI Advanced
Full-stack smart agriculture competition prototype.

Features:
- Crop disease image screening with TensorFlow MobileNetV2
- Soil analysis
- Smart irrigation
- Pest risk
- Yield estimation
- Multilingual UI/chat: English, Amharic, Afaan Oromo, French, Arabic
- AI agriculture chatbot
- 7 lesson Agriculture Academy + quizzes + local progress
- Node.js/Express API + Python/FastAPI AI service

Run:
1) cd ai-service && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
2) Put class-folder images in ai-service/dataset/train/ and run: python train.py
3) uvicorn main:app --reload --port 8000
4) New terminal: cd backend && npm install && npm start
5) New terminal: cd frontend && python3 -m http.server 5500
6) Open http://localhost:5500

Important: Disease predictions only work after a real model is trained. Soil/irrigation/pest/yield are decision-support prototypes and must be validated with local agricultural data.
