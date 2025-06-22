import { NextRequest, NextResponse }  from 'next/server';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
	const apiKey = process.env.GROQ_API_KEY || '';
	if (!apiKey.length) return NextResponse.json({ message: 'API key not found' }, { status: 404 });
	
	try {
		const data = await req.json();
		if (!data) return NextResponse.json({ message: 'No message found' }, { status: 409 });
		
		const { text } = await generateText({
			model: groq('llama-3.3-70b-versatile'),
			prompt: data.content,
		});
		
		return NextResponse.json({ message: text, role: 'bot' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: 'An error has been encountered: ' + error });
	}
}
