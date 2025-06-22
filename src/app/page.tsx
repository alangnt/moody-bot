'use client'

import { useState } from 'react';
import Header, { Weather } from '@/components/Header';
import ChatBot from "@/components/core/ChatBot";

export type Unit = 'metric' | 'imperial' | 'standard';

export default function App() {
	const [weatherPreference, setWeatherPreference] = useState<Weather>('sunny')
	
	const [location, setLocation] = useState<string>('');
	const [currentWeather, setCurrentWeather] = useState<string | undefined>(undefined);
	
	const [unit, setUnit] = useState<Unit>('metric');
	
	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
	
	const getCurrentWeather = async (newUnit?: Unit) => {
		// Avoid using the API if there's nothing written
		if (!location.length) return setErrorMessage('Field cannot be empty');
		
		const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appId=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=${newUnit ? newUnit : unit}`);
		
		const result = await response.json();
		console.log(result);
		if (result.cod === '404') {
			return setErrorMessage('No city found, please try again');
		}
		
		setLocation(result.name);
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
			<Header weatherPreference={weatherPreference} setWeatherPreference={setWeatherPreference}></Header>
			
			<main className={'flex flex-col items-center justify-center gap-y-4 py-12 w-full md:w-1/2 px-4 place-self-center'}>
				<div className={'flex flex-col items-center gap-y-2 border border-gray-300 rounded-lg p-8 w-full'}>
					<input type="text" className={'border border-gray-200 rounded-lg p-2 mb-4'} value={location} onChange={(e) => setLocation(e.target.value)} />
					<button className={'bg-foreground text-background border border-gray-200 rounded-lg py-2 px-4 w-fit hover:bg-background hover:text-foreground duration-100 transition-all cursor-pointer'} onClick={() => getCurrentWeather()}>
						What&apos;s the Weather like ?
					</button>
					
					{/* Switch to a Pipe */}
					{currentWeather && (
						<p>{currentWeather + (unit === 'metric' ? 'C' : unit === 'imperial' ? 'F' : 'K')}</p>
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
			
			<div className={'flex items-center justify-center grow overflow-y-auto pb-12'}>
				<ChatBot temperature={currentWeather} unit={unit} weatherPreference={weatherPreference} location={location}></ChatBot>
			</div>
		</>
	)
}
