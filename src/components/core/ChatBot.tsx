'use client'

import { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Unit } from '@/app/page';
import { Weather } from '@/components/Header';
import { createMessage } from '@/app/actions';

export type Role = 'user' | 'bot';
export type Message = {
	content: string;
	role: Role;
}

interface Props {
	temperature: string | undefined;
	unit: Unit;
	weatherPreference: Weather;
	location: string;
}

export default function ChatBot({ temperature, unit, weatherPreference, location }: Props) {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	
	const [message, setMessage] = useState<string>('');
	const [messagesList, setMessagesList] = useState<Message[]>([]);
	
	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
	
	const sendMessage = async () => {
		if (!message.length) return setErrorMessage('Field cannot be empty');
		
		setErrorMessage(undefined);
		setIsLoading(true);
		setMessagesList([...messagesList, { content: message, role: 'user' }]);
		
		try {
			await createMessage({ content: message, role: 'user' });
			
			const response = await fetch('/api/sendMessage', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					content: message,
					role: 'user',
					temperature: temperature,
					unit: unit,
					weatherPreference: weatherPreference,
					location: location,
				}),
			})
			if (!response.ok) return console.log(response.status);
			
			const result = await response.json();
			
			setTimeout(() => {
				setMessagesList(prev => [...prev, { content: result.message, role: result.role }]);
				setMessage('');
				setIsLoading(false);
			}, 1000);
		} catch (error) {
			console.log(error);
			setIsLoading(false);
		}
	}
	
	return (
		<section className={'flex flex-col gap-y-4 items-center pb-16 w-full'}>
			{/* Messages List */}
			<div className={'flex flex-col w-full md:w-1/2 gap-y-2 overflow-y-auto px-4'}>
				{messagesList.map((message, index) => (
					<p
						key={index}
						className={`border rounded-lg py-2 px-4 max-w-[90%]
							${message.role === 'user' ? 'place-self-end rounded-br-none border-gray-200 text-right' : 'bg-foreground text-background rounded-bl-none'}
						`}
					>{message.content}</p>
				))}
			</div>
			
			<div className={'flex flex-col gap-y-2 items-center absolute bottom-0 bg-background w-full py-4'}>
				<div className={'flex gap-x-2 w-full md:w-1/2 px-4'}>
					<input type="text" className={'border border-gray-200 rounded-lg p-2 w-full'} value={message} onChange={(e) => setMessage(e.target.value)} />
					<button
						disabled={isLoading}
						className={` border rounded-lg py-2 px-4 w-fit hover:bg-background hover:text-foreground duration-100 transition-all cursor-pointer
							${isLoading ? 'bg-gray-700 text-gray-400' : 'bg-foreground text-background'}
						`}
						onClick={() => sendMessage()}
					>
						{isLoading ? (
							<RefreshCcw className="p-1 animate-spin transition-all ease-in-out" />
						) : 'Send'}
					</button>
				</div>
				
				{errorMessage && (
					<p className={'text-red-500 text-sm'}>{errorMessage}</p>
				)}
			</div>
		</section>
	)
}
