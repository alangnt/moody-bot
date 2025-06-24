'use client'

import { useState, useEffect, useRef } from 'react';
import { createMessage, getMessages, getOrCreateAnonymousUser } from '@/app/actions';
import { Snowflake, Cloud, CloudRain, Sun, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Coordinates = {
	latitude: number;
	longitude: number;
}

export type Role = 'user' | 'bot';

export type DraftMessage = Pick<Message, 'content' | 'role'>
export type Message = {
	id: string;
	content: string;
	role: Role;
	authorId: string;
	createdAt: Date;
}

export default function App() {
	const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);
	
	const [currentMood, setCurrentMood] = useState("neutral");
	const [backgroundGradient, setBackgroundGradient] = useState("from-blue-400 to-purple-500")
	
	const [location, setLocation] = useState<string>('');
	const [currentWeather, setCurrentWeather] = useState<string | undefined>(undefined);
	
	const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	
	const [message, setMessage] = useState<string>('');
	const [messagesList, setMessagesList] = useState<Message[]>([]);
	
	const [hasUserSentMessage, setHasUserSentMessage] = useState<boolean>(false);
	
	const messagesEndRef = useRef<HTMLDivElement>(null);
	
	const updateMoodAndBackground = (temperature: number) => {
		if (temperature < 32) {
			setCurrentMood("freezing")
			setBackgroundGradient("from-blue-600 via-blue-400 to-cyan-300")
		} else if (temperature < 50) {
			setCurrentMood("cold")
			setBackgroundGradient("from-blue-500 via-blue-300 to-blue-100")
		} else if (temperature < 70) {
			setCurrentMood("pleasant")
			setBackgroundGradient("from-green-400 via-blue-300 to-purple-400")
		} else if (temperature < 85) {
			setCurrentMood("warm")
			setBackgroundGradient("from-yellow-400 via-orange-300 to-pink-400")
		} else {
			setCurrentMood("hot")
			setBackgroundGradient("from-red-400 via-orange-400 to-yellow-300")
		}
	}
	
	const getMoodEmoji = () => {
		switch (currentMood) {
			case "freezing":
				return "🥶"
			case "cold":
				return "😴"
			case "pleasant":
				return "😊"
			case "warm":
				return "😎"
			case "hot":
				return "🥵"
			default:
				return "🤖"
		}
	}
	
	const getWeatherIcon = (temp?: number) => {
		if (!temp) return <Cloud className="w-4 h-4" />
		if (temp < 32) return <Snowflake className="w-4 h-4 text-blue-300" />
		if (temp < 60) return <CloudRain className="w-4 h-4 text-gray-400" />
		return <Sun className="w-4 h-4 text-yellow-400" />
	}
	
	const getMessagesList = async () => {
		const messages = await getMessages();
		setMessagesList(messages);
	}
	
	const sendMessage = async () => {
		try {
			const messageToSend = message;
			setMessage('');
			
			await createMessage({ content: messageToSend, role: 'user' });
	
			const response = await fetch('/api/sendMessage', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					content: messageToSend, // Send the original message content
					role: 'user',
					temperature: currentWeather,
					location: location,
				}),
			});
			
			if (!response.ok) {
				console.error('Failed to get a response from the bot:', response.status);
				return;
			}
			
			await getMessagesList();
			setIsLoading(true);
			
			setTimeout(() => {
				setHasUserSentMessage(true);
			}, 2000);
		} catch (error) {
			console.log(error);
		}
	};
	
	useEffect(() => {
		if (hasUserSentMessage) {
			getMessagesList().then(() => {
				setHasUserSentMessage(false);
				setIsLoading(false);
			});
		}
	}, [hasUserSentMessage]);
	
	useEffect(() => {
		if (hasUserSentMessage) {
			getMessagesList().then(() => setHasUserSentMessage(false));
		}
	}, [hasUserSentMessage]);
	
	useEffect(() => {
		getOrCreateAnonymousUser().then(() => console.log('Welcome back !'));
	}, []);
	
	useEffect(() => {
		if (!navigator.geolocation) {
			console.log('Geolocation is not supported by this browser');
			return setIsLoading(false);
		}
		
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setUserCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude });
			},
			(error) => console.log(error),
			{ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
		)
	}, []);
	
	useEffect(() => {
		if (!userCoordinates) return;
		
		(async () => {
			try {
				const response = await fetch(
					`https://api.openweathermap.org/data/2.5/weather` +
					`?lat=${userCoordinates.latitude}&lon=${userCoordinates.longitude}` +
					`&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}` +
					`&units=imperial`
				);
				const result = await response.json();
				
				if (result.cod === '404') {
					console.error('No city found for your coordinates');
				} else {
					setLocation(result.name);
					setCurrentWeather(result.main.temp);
				}
			} catch (error) {
				console.error(error)
			} finally {
				setIsLoading(false);
				updateMoodAndBackground(Number(currentWeather));
			}
		})()
	}, [userCoordinates, currentWeather]);
	
	useEffect(() => {
		getMessagesList().then(() => setIsPageLoading(false));
	}, []);
	
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messagesList]);
	
	return (
		<div className={`min-h-screen bg-gradient-to-br ${backgroundGradient} transition-all duration-1000 ease-in-out`}>
			{isPageLoading ? null : (
				<div className="container mx-auto px-4 py-8 max-w-4xl">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 mb-4">
							<span className="text-3xl">{getMoodEmoji()}</span>
							<h1 className="text-2xl font-bold text-white">Moody</h1>
						</div>
						<p className="text-white/80 text-lg">Your weather-sensitive AI companion</p>
					</div>
					
					{/* Chat Container */}
					<Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl rounded-3xl overflow-hidden">
						<div className="h-96 overflow-y-auto p-6 space-y-4">
							{messagesList.length === 0 && (
								<div className="text-center text-white/70 py-8">
									<div className="text-4xl mb-4">{getMoodEmoji()}</div>
									<p className="text-lg mb-2">Hi! I&apos;m Moody, your weather-sensitive AI friend!</p>
									<p className="text-sm">Ask me anything, but watch out, my mood can change! ☀️🌧️❄️</p>
								</div>
							)}
							
							{messagesList.map((message, index) => (
								<div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
									<div
										className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
											message.role === "user"
												? "bg-white/90 text-gray-800 backdrop-blur-sm"
												: "bg-black/20 text-white backdrop-blur-sm border border-white/20"
										}`}
									>
										{message.role === "bot" && (
											<div className="flex items-center gap-2 mb-2">
												<span className="text-lg">{getMoodEmoji()}</span>
												<span className="text-xs text-white/70 uppercase tracking-wide">Moody</span>
											</div>
										)}
										
										<div key={index} className="whitespace-pre-wrap">
											{message.content}
										</div>
										
										<div ref={messagesEndRef} />
									</div>
								</div>
							))}
							
							{isLoading && (
								<div className="flex justify-start">
									<div className="bg-black/20 text-white backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 max-w-xs">
										<div className="flex items-center gap-2">
											<span className="text-lg">{getMoodEmoji()}</span>
											<div className="flex gap-1">
												<div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
												<div
													className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
													style={{ animationDelay: "0.1s" }}
												></div>
												<div
													className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
													style={{ animationDelay: "0.2s" }}
												></div>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
						
						{/* Input Form */}
						<div className="p-6 border-t border-white/20">
							<div className="flex gap-3">
								<Input
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									placeholder="Ask me anything..."
									className="flex-1 bg-white/20 border-white/30 text-black placeholder:text-white/60 rounded-full px-6 py-3 backdrop-blur-sm focus:bg-white/30 transition-all"
									disabled={isLoading}
								/>
								<Button
									disabled={isLoading || !message.trim()}
									className="bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-full px-6 backdrop-blur-sm transition-all"
									onClick={() => sendMessage()}
								>
									<Send className="w-4 h-4" />
								</Button>
							</div>
							
							<div className="flex items-center gap-2 bg-white/20 rounded-lg p-2 mt-2 text-black/70">
								{getWeatherIcon(Number(currentWeather))}
								<span className="text-sm">
	              {location}: {currentWeather}°F
	            </span>
							</div>
						</div>
					</Card>
					
					{/* Mood Indicator */}
					<div className="text-center mt-6">
						<div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
							<span className="text-sm text-white/80">Current mood:</span>
							<span className="text-lg">{getMoodEmoji()}</span>
							<span className="text-sm text-white font-medium capitalize">{currentMood}</span>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
