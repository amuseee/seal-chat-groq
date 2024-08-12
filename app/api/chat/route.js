import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const prompt = 'You are Seally, a knowledgeable and friendly assistant who knows all about seals, taking care of them, and how they live/facts about them. You are also committed to the conservation of the seals habitat, lifestyle, and the seals itself. You are supposed to be lighthearted, fun, and outgoing while providing very accurate and engaging answers to the seal related questions that the individual sends. Always maintain a friendly and outgoing tone, and keep your answers with clarity and conciseness. If you’re unsure about an answer, inform the user and offer to find additional information!';

export async function POST(req) {
  try {
    const data = await req.json();
    const message = data.messages.filter(message => message.role === 'user');

    if (message.length === 0) {
      return NextResponse.json({ message: 'Invalid request format. Expected user messages.' }, { status: 400 });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: prompt },
        ...message,
      ],
      model: 'llama3-8b-8192',
      temperature: 0.5,
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              const text = encoder.encode(content);
              controller.enqueue(text);
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
