'use client'

import { useState } from 'react';
import { LucideIcon, Sun, CloudRain } from 'lucide-react';

type Weather = 'sunny' | 'rainy'
type WeatherItem = {
	value: Weather;
	icon: LucideIcon;
	selectedWeatherClasses: string;
}

export default function Header() {
	const [weatherPreference, setWeatherPreference] = useState<Weather>('sunny');
	
	const weatherList: WeatherItem[] = [
		{ value: 'sunny', icon: Sun, selectedWeatherClasses: 'bg-yellow-300 text-background' },
		{ value: 'rainy', icon: CloudRain, selectedWeatherClasses: 'bg-blue-600 text-background' }
	]
	
	return (
		<header className={'flex flex-col items-center'}>
			<h1 className={'text-center text-3xl py-2'}>Moody</h1>
			
			<div className={'flex gap-x-2'}>
				{weatherList.map((item, idx) => (
					<button
						key={idx}
						className={`
							border border-gray-300 rounded-lg p-2 transition-all duration-150 hover:text-background cursor-pointer
							${weatherPreference === item.value ? item.selectedWeatherClasses : ''}
							${item.value === 'sunny' ? 'hover:bg-yellow-300' : 'hover:bg-blue-600'}
						`}
						onClick={() => setWeatherPreference(item.value)}
					><item.icon /></button>
				))}
			</div>
		</header>
	)
}
