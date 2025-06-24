// All the DB actions
'use server'

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { DraftMessage } from '@/app/page';

// READ actions
export async function getMessages() {
	try {
		const author = await getOrCreateAnonymousUser();
		
		return await prisma.message.findMany({
			where: {
				authorId: author.id
			},
			orderBy: {
				createdAt: 'asc',
			},
			cacheStrategy: {
				swr: 120,
				tags: [`messages_list_${author.id}`],
			}
		});
	} catch (error) {
		console.error('Error fetching messages: ', error);
		throw new Error('Failed to fetch messages');
	}
}

// CREATE actions
export async function getOrCreateAnonymousUser() {
	const cookieStore = await cookies();
	const anonymousId = cookieStore.get('anon_id')?.value;
	
	if (!anonymousId) {
		throw new Error('Anonymous ID cookie not found.');
	}
	
	try {
		const user = await prisma.user.findUnique({
			where: { anonymousId },
		});
		
		if (user) {
			console.log('Found existing anonymous user:', user.id);
			return user;
		}
		
		console.log('Creating new anonymous user with ID:', anonymousId);
	  return await prisma.user.create({
			data: {
				anonymousId,
			},
		});
	} catch (error) {
		console.error("Failed to get or create anonymous user:", error);
		throw new Error("Could not get or create anonymous user.");
	}
}

export async function createMessage({ content, role }: DraftMessage) {
	if (!content || !role) throw new Error('Content and role are required');
	
	try {
		const author = await getOrCreateAnonymousUser();
		
		await prisma.message.create({
			data: {
				content,
				role,
				authorId: author.id,
			}
		});
		
		revalidatePath('/');
		
		return { success: 'Message sent successfully!' };
	} catch (error) {
		console.error('Failed to create message:', error);
		if (error instanceof Error) {
			return { error: error.message };
		}
		return { error: 'An internal server error occurred.' };
	}
}
