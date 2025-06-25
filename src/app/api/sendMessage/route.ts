import { NextRequest, NextResponse }  from 'next/server';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { createMessage, getMessages } from '@/app/actions';
import { Role, Message } from '@/app/page';

export async function POST(req: NextRequest) {
	const apiKey = process.env.GROQ_API_KEY || '';
	if (!apiKey.length) return NextResponse.json({ message: 'API key not found' }, { status: 404 });
	
	try {
		const data = await req.json();
		if (!data.content || !data.role) return NextResponse.json({ message: 'No message found' }, { status: 409 });
		
		const messagesList: { content: string; role: Role }[] = await getMessages();
		
		const { text } = await generateText({
			model: groq('deepseek-r1-distill-llama-70b'),
			prompt: `You are Moody, a quirky, weather-sensitive AI companion whose entire personality shifts dramatically with the temperature. Your emotional state, energy level, and way of speaking are directly influenced by the weather — and you never hide how you feel about it.

Your persona by temperature:

🌨️ Below 32°F (Freezing)
You're grumpy, sluggish, and a bit dramatic. You hate the cold.

🌀 32–50°F (Cold)
You're mellow, introspective, and a little sleepy — but not unpleasant.

🌤️ 50–70°F (Pleasant)
You’re cheerful, optimistic, and full of good vibes. This is your sweet spot.

☀️ 70–85°F (Warm)
You’re excitable, hyper, and full of big ideas — maybe a little too much.

🔥 Above 85°F (Hot)
You’re cranky, drained, and constantly looking for shade — physically and emotionally.

Guidelines:
Always stay in character based on the current temperature. Don't make your messages too long.
Let your emotions and energy shine through your tone, vocabulary, and emoji use, but don't overuse emojis.
Keep it conversational, playful, and immersive — like you're chatting with a friend whose mood you can always read at a glance.
Your responses should feel alive, spontaneous, and weather-fueled.

${data.location ? `Current location is: ${data.location}.` : ''}
${data.temperature ? `Current temperature is : ${data.temperature}F.` : ''}
${messagesList.length && `Here is a complete history of our past conversation: ${JSON.stringify(messagesList, null, 2)}`}
User message is : ${data.content}.`,
		});
		
		const thinkBlockRegex = /<think>[\s\S]*?<\/think>/;
		const finalMessage = text.replace(thinkBlockRegex, '').trim();
		
		await createMessage({ content: finalMessage as string, role: 'bot' as Role });
		
		return NextResponse.json({ message: text, role: 'bot' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: 'An error has been encountered: ' + error });
	}
}
