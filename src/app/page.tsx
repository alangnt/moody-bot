'use client'

import { useState } from 'react';
import Header from '@/components/Header';
import ChatBot from "@/components/core/ChatBot";

type Unit = 'metric' | 'imperial' | 'standard';

export default function App() {
	const [location, setLocation] = useState<string>('');
	const [currentWeather, setCurrentWeather] = useState<string | undefined>(undefined);
	
	const [unit, setUnit] = useState<Unit>('metric');
	
	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
	
	const getCurrentWeather = async (newUnit?: Unit) => {
		// Avoid using the API if there's nothing written
		if (!location.length) return setErrorMessage('Field cannot be empty');
		
		const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appId=${"fc7d8227a7aa8b3bb26114f539a381fa"}&units=${newUnit ? newUnit : unit}`);
		
		const result = await response.json();
		console.log(result);
		
		if (result.cod === '404') {
			return setErrorMessage('No city found, please try again');
		}
		
		setErrorMessage(undefined);
		setCurrentWeather(result.main.temp);
	}
	
	const switchUnit = async (newUnit: Unit) => {
		setUnit(newUnit);
		await getCurrentWeather(newUnit);
	}
	
	return (
		<>
			{/* HEADER */}
			<Header></Header>
			
			<main className={'flex flex-col items-center justify-center gap-y-4 py-12'}>
				<div className={'flex flex-col items-center gap-y-2 border border-gray-300 rounded-lg p-8 w-fit'}>
					<input type="text" className={'border border-gray-200 rounded-lg p-2 mb-4'} onChange={(e) => setLocation(e.target.value)} />
					<button className={'bg-foreground text-background border border-gray-200 rounded-lg py-2 px-4 w-fit hover:bg-background hover:text-foreground duration-100 transition-all cursor-pointer'} onClick={() => getCurrentWeather()}>
						What&apos;s the Weather like ?
					</button>
					
					{/* Switch to a Pipe */}
					{currentWeather && (
						<p>{currentWeather}{unit === 'metric' ? 'C' : unit === 'imperial' ? 'F' : 'K'}</p>
					)}
					
					{errorMessage && (
						<p className={'text-red-500 text-sm'}>{errorMessage}</p>
					)}
				</div>
				
				<div className={'flex items-center'}>
					<select name="unit" id="unit" value={unit} onChange={(e) => switchUnit(e.target.value as Unit)}>
						<option value="metric">C</option>
						<option value="imperial">F</option>
						<option value="standard">K</option>
					</select>
				</div>
			</main>
			
			<div className={'flex items-center justify-center mt-12 grow'}>
				<ChatBot></ChatBot>
			</div>
			
		</>
	)
}
