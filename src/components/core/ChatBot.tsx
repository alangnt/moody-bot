'use client'

import { useState } from 'react';

type Message = {
	content: string;
	role: 'user' | 'bot';
}

export default function ChatBot() {
	const [message, setMessage] = useState<string>('');
	const [messagesList, setMessagesList] = useState<Message[]>([]);
	
	const sendMessage = () => {
		if (!message.length) return;
		
		setMessagesList([...messagesList, { content: message, role: 'user' }]);
		setMessage('');
	}
	
	return (
		<section>
			{/* Messages List */}
			<div>
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
					Send
				</button>
			</div>
		</section>
	)
}
