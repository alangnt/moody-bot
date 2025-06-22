'use client'

import { useState } from 'react';
import { RefreshCcw } from 'lucide-react';

type Role = 'user' | 'bot';
type Message = {
	content: string;
	role: Role;
}

export default function ChatBot() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	
	const [message, setMessage] = useState<string>('');
	const [messagesList, setMessagesList] = useState<Message[]>([]);
	
	const sendMessage = async () => {
		if (!message.length) return;
		
		setIsLoading(true);
		setMessagesList([...messagesList, { content: message, role: 'user' }]);
		
		try {
			const response = await fetch('/api/sendMessage', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ content: message, role: 'user' }),
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
		<section>
			{/* Messages List */}
			<div className={'flex flex-col'}>
				{messagesList.map((message, index) => (
					<p key={index}>{message.content}</p>
				))}
			</div>
			
			<div className={'flex gap-x-2 items-center'}>
				<input type="text" className={'border border-gray-200 rounded-lg p-2'} value={message} onChange={(e) => setMessage(e.target.value)} />
				<button
					className={'bg-foreground text-background border border-gray-200 rounded-lg py-2 px-4 w-fit hover:bg-background hover:text-foreground duration-100 transition-all cursor-pointer'}
					onClick={() => sendMessage()}
				>
					{isLoading ? (
						<RefreshCcw className="p-1 animate-spin transition-all ease-in-out" />
					) : 'Send'}
				</button>
			</div>
		</section>
	)
}
