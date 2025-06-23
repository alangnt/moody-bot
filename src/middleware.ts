import { NextResponse, NextRequest } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export function middleware(request: NextRequest) {
	const requestHeaders = new Headers(request.headers);
	
	console.log(`[Middleware] Running for path: ${request.nextUrl.pathname}`);
	
	const response = NextResponse.next({
		request: {
			headers: requestHeaders,
		}
	});
	
	if (!request.cookies.get('anon_id')) {
		const anonId = uuidv4();
		console.log(`New anonymous user detected. Assigning ID: ${anonId}`);
		
		response.cookies.set('anon_id', anonId, {
			path: '/',
			maxAge: 60 * 60 * 24 * 30,
			httpOnly: true,
			sameSite: 'lax',
		});
	}
	
	return response;
}
