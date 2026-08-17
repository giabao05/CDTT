import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    // Prepare the parts for Gemini
    const parts = [
      {
        inlineData: {
          data: imageBase64.split(',')[1], // Remove the data:image/jpeg;base64, prefix
          mimeType: imageBase64.split(';')[0].split(':')[1],
        },
      },
      { text: "You are a smartphone expert. Identify the smartphone model in this image. Make your best guess even if you are not 100% sure. Return ONLY the most likely model name (e.g., iPhone 15 Pro Max, Samsung Galaxy S24 Ultra, Xiaomi 14). Do not include any other text or explanation. Only return 'unknown' if the image is clearly not a phone or electronic device." },
    ];

    const result = await model.generateContent(parts);
    const responseText = result.response.text().trim();

    return NextResponse.json({ modelName: responseText });
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    import('fs').then(fs => fs.writeFileSync('debug-gemini.log', String(error?.stack || error)));
    return NextResponse.json({ error: error.message || 'Failed to analyze image' }, { status: 500 });
  }
}
