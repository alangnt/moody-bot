import { NextRequest, NextResponse }  from 'next/server';

export async function POST(req: NextRequest) {
	try {
		const data = await req.json();
		if (!data) return NextResponse.json({ message: 'No message found' }, { status: 409 });
		
		
	} catch (error) {
		return NextResponse.json({ error: 'An error has been encountered: ' + error });
	}
}
