import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Resize and compress image
    const resizedBuffer = await sharp(buffer)
      .resize(512)
      .jpeg({ quality: 70 })
      .toBuffer();

    // Convert to base64
    const base64Image = resizedBuffer.toString('base64');

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Call OpenAI Vision API using SDK
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Read the odometer number from this bike photo. Return only the number.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 10
    });

    const odo = response.choices[0].message.content?.trim();

    return NextResponse.json({ odo });
  } catch (error) {
    console.error('Error detecting ODO:', error);
    return NextResponse.json({ error: 'Failed to detect ODO' }, { status: 500 });
  }
} 