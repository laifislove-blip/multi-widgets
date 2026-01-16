import React, { useState, useEffect, useCallback } from 'react';
import { SmartWidget } from './components/SmartWidget';
import { WidgetState, HourlyForecast } from './types';

const App: React.FC = () => {
  const [cityName, setCityName] = useState('Seoul');
  const [widgetData, setWidgetData] = useState<WidgetState>({
    time: '--:--',
    day: '...',
    date: '..',
    temp: 0,
    weatherCode: 0,
    hourly: [],
  });
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
      const dateFormatter = new Intl.DateTimeFormat('en-US', { day: 'numeric' });

      setWidgetData(prev => ({
        ...prev,
        time: timeFormatter.format(now),
        day: dayFormatter.format(now).toUpperCase(),
        date: dateFormatter.format(now),
      }));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchWeatherByCity = useCallback(async (name: string) => {
    setLoadingWeather(true);
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found");
      }

      const { latitude, longitude, name: officialName } = geoData.results[0];
      setCityName(officialName);

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,weathercode&timezone=auto`
      );
      const data = await response.json();
      
      if (data.current_weather && data.hourly) {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now.getTime() - offset).toISOString().substring(0, 13) + ":00";
        
        const startIndex = data.hourly.time.findIndex((t: string) => t === localISOTime);
        const finalStartIndex = startIndex === -1 ? 0 : startIndex;

        const currentTemp = Math.round(data.current_weather.temperature);
        const currentWeatherCode = data.current_weather.weathercode;

        const hourlyData: HourlyForecast[] = data.hourly.time
          .slice(finalStartIndex, finalStartIndex + 24)
          .map((time: string, index: number) => {
            const actualIndex = finalStartIndex + index;
            return {
              time: time,
              temp: index === 0 ? currentTemp : Math.round(data.hourly.temperature_2m[actualIndex]),
              weatherCode: data.hourly.weathercode[actualIndex],
            };
          });

        setWidgetData(prev => ({
          ...prev,
          temp: currentTemp,
          weatherCode: currentWeatherCode,
          hourly: hourlyData,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch weather:", err);
    } finally {
      setLoadingWeather(false);
    }
  }, []);

  useEffect(() => {
    fetchWeatherByCity('Seoul');
  }, [fetchWeatherByCity]);

  return (
    <div className="w-screen h-screen flex items-center justify-center p-4 bg-white">
      <div className="relative group">
        <div className={`absolute -inset-2 bg-gradient-to-r ${loadingWeather ? 'from-gray-200 to-gray-100' : 'from-blue-200 to-cyan-100'} rounded-[15vmin] blur-2xl opacity-30 transition duration-1000`}></div>
        <SmartWidget 
          time={widgetData.time}
          day={widgetData.day}
          date={widgetData.date}
          temp={widgetData.temp}
          weatherCode={widgetData.weatherCode}
          hourly={widgetData.hourly}
          isLoading={loadingWeather}
          cityName={cityName}
          onCityChange={fetchWeatherByCity}
        />
      </div>
    </div>
  );
};

export default App;