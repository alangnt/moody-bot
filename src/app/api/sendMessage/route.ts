import { NextRequest, NextResponse }  from 'next/server';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { createMessage } from '@/app/actions';
import { Role } from '@/components/core/ChatBot';

export async function POST(req: NextRequest) {
	const apiKey = process.env.GROQ_API_KEY || '';
	if (!apiKey.length) return NextResponse.json({ message: 'API key not found' }, { status: 404 });
	
	try {
		const data = await req.json();
		if (!data.content || !data.role) return NextResponse.json({ message: 'No message found' }, { status: 409 });
		
		const { text } = await generateText({
			model: groq('llama-3.3-70b-versatile'),
			prompt: `You are now a Weather bot, and you answer based on the current weather. Speak like a teenage person, don't talk too much except it's really necessary.
			You prefer a ${data.weatherPreference} weather.
			${data.location ? `Current location is: ${data.location}.` : ''}
			${data.temperature && data.unit ? `Current temperature is : ${data.temperature + data.unit}.` : ''}
			User message is : ${data.content}.`,
		});
		
		await createMessage({ content: text as string, role: 'bot' as Role });
		
		return NextResponse.json({ message: text, role: 'bot' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: 'An error has been encountered: ' + error });
	}
}
