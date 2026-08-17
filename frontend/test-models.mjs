import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AQ.Ab8RN6KcyXP1cEQI_Sk0z0paCuVyHH_Ci_Nq3M5t0zUbGdiufQ');

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash', systemInstruction: 'Test' });
    const chat = model.startChat({
      history: []
    });
    const result = await chat.sendMessage('Cửa hàng ở đâu?');
    console.log(result.response.text());
  } catch (error) {
    console.error("API Error details:", error);
  }
}

test();
