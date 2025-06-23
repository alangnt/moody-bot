// All the DB actions
'use server'

import prisma from '@/lib/prisma';
// import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// READ actions
/*
export async function getUsers() {
	try {
		return await prisma.user.findMany({
			orderBy: {
				createdAt: 'desc'
			},
			cacheStrategy: {
				ttl: 60,
				tags: ["users_list"],
			}
		});
	} catch (error) {
		console.error('Error fetching users: ', error);
		throw new Error('Failed to fetch users');
	}
}
*/

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
