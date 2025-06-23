'use client'

import { useState, useEffect } from 'react';
import Header, { Weather } from '@/components/Header';
import ChatBot from '@/components/core/ChatBot';
import { getOrCreateAnonymousUser } from '@/app/actions';

export type Unit = 'metric' | 'imperial' | 'standard';
type Coordinates = {
	latitude: number;
	longitude: number;
}

export default function App() {
	const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);
	const [weatherPreference, setWeatherPreference] = useState<Weather>('sunny')
	
	const [location, setLocation] = useState<string>('');
	const [currentWeather, setCurrentWeather] = useState<string | undefined>(undefined);
	
	const [unit, setUnit] = useState<Unit>('imperial');
	
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
	
	const switchUnit = async (newUnit: Unit) => {
		setUnit(newUnit);
		await getCurrentWeather(newUnit);
	}
	
	const getCurrentWeather = async (newUnit?: Unit) => {
		// Avoid using the API if there's nothing written
		if (!location.length) return setErrorMessage('Field cannot be empty');
		
		const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appId=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=${newUnit ? newUnit : unit}`);
		
		const result = await response.json();
		if (result.cod === '404') return setErrorMessage('No city found, please try again');
		
		setLocation(result.name);
		setErrorMessage(undefined);
		setCurrentWeather(result.main.temp);
	};
	
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
					setErrorMessage('No city found for your coordinates');
				} else {
					setLocation(result.name);
					setCurrentWeather(result.main.temp);
				}
			} catch (error) {
				console.error(error)
				setErrorMessage('Error fetching weather');
			} finally {
				setIsLoading(false);
			}
		})()
	}, [userCoordinates]);
	
	return (
		<>
			{!isLoading && (
				<>
					{/* HEADER */}
					<Header weatherPreference={weatherPreference} setWeatherPreference={setWeatherPreference}></Header>
					
					<main className={'flex flex-col items-center justify-center gap-y-4 py-12 w-full md:w-1/2 px-4 place-self-center'}>
						<div className={'flex flex-col items-center gap-y-2 border border-gray-300 rounded-lg p-8 w-full'}>
							<input type="text" className={'border border-gray-200 rounded-lg p-2 mb-4'} value={location} onChange={(e) => setLocation(e.target.value)} />
							<button
								className={'bg-foreground text-background border border-gray-200 rounded-lg py-2 px-4 w-fit hover:bg-background hover:text-foreground duration-100 transition-all cursor-pointer'}
								onClick={() => getCurrentWeather()}
							>
								What&apos;s the Weather like ?
							</button>
							
							<div className={'flex gap-x-1 items-center'}>
								<p>{currentWeather}</p>
								
								<select name="unit" id="unit" value={unit} onChange={(e) => switchUnit(e.target.value as Unit)}>
									<option value="metric">C</option>
									<option value="imperial">F</option>
									<option value="standard">K</option>
								</select>
							</div>
							
							{errorMessage && (
								<p className={'text-red-500 text-sm'}>{errorMessage}</p>
							)}
						</div>
					</main>
					
					<div className={'flex items-center justify-center grow overflow-y-auto pb-12'}>
						<ChatBot temperature={currentWeather} unit={unit} weatherPreference={weatherPreference} location={location}></ChatBot>
					</div>
				</>
			)}
		</>
	)
}
