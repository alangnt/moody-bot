// All the DB actions
'use server'

// import { Prisma } from "@prisma/client";
import prisma from '@/lib/prisma';
// import { revalidatePath } from 'next/cache';

// READ actions
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

// CREATE actions
/*
export async function createUser({ email, name }: { email: string; name?: string }) {
	if (!email) throw new Error('Email is required');
	
	try {
		const user = await prisma.user.create({
			data: {
				email,
				name,
			},
		});
		
		// Revalidate the home page to show the new user
		revalidatePath('/');
		
		return user;
	} catch (error) {
		// Handle duplicate email error
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new Error('A user with this email already exists');
		throw new Error('Failed to create user');
	}
}
*/
