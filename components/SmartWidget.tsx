import React, { useState } from 'react';
import { HourlyForecast } from '../types';

interface SmartWidgetProps {
  time: string;
  day: string;
  date: string;
  temp: number;
  weatherCode: number;
  hourly?: HourlyForecast[];
  isLoading?: boolean;
  cityName?: string;
  onCityChange?: (city: string) => void;
}

const getWeatherIcon = (code: number) => {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '⛅';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌧️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95 && code <= 99) return '⛈️';
  return '🌡️';
};

const formatHourlyTime = (timeStr: string) => {
  const date = new Date(timeStr);
  return new Intl.DateTimeFormat('en-US', { 
    hour: 'numeric', 
    hour12: true 
  }).format(date);
};

export const SmartWidget: React.FC<SmartWidgetProps> = ({ 
  time, day, date, temp, weatherCode, hourly, isLoading, cityName, onCityChange 
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [searchInput, setSearchInput] = useState('');

  const realNow = new Date();
  const realMonth = realNow.getMonth();
  const realDate = realNow.getDate();
  const realYear = realNow.getFullYear();

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const firstDayOfMonth = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(viewDate);

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim() && onCityChange) {
      onCityChange(searchInput.trim());
      setSearchInput('');
    }
  };

  return (
    <div className="relative w-[85vmin] h-[85vmin] bg-[#FF9500] rounded-[15vmin] p-[6vmin] flex flex-col gap-[5vmin] shadow-lg overflow-hidden select-none transition-all duration-500">
      
      {/* Top Section: Clock (Black Box) */}
      <div 
        className={`h-[45%] bg-[#121212] rounded-[10vmin] flex items-center justify-center relative overflow-hidden transition-all duration-500 ${(showCalendar || showForecast) ? 'opacity-20 scale-95' : 'opacity-100'}`}
      >
        {/* Dot Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:2.5vmin_2.5vmin]"></div>
        
        <span className="text-white text-[24vmin] font-normal tracking-tight leading-none tabular-nums z-10">
          {time}
        </span>
      </div>

      {/* Bottom Section: Date and Weather Circle */}
      <div className={`h-[45%] flex gap-[5vmin] transition-all duration-500 ${(showCalendar || showForecast) ? 'opacity-20 scale-95' : 'opacity-100'}`}>
        
        {/* Date Box (White Box) */}
        <button 
          type="button"
          onClick={() => { setShowForecast(false); setShowCalendar(true); setViewDate(new Date()); }}
          className="flex-1 bg-white rounded-[10vmin] flex flex-col justify-center px-[8vmin] shadow-sm transform hover:scale-[1.02] transition-all active:scale-95 border-none cursor-pointer text-left"
        >
          {/* 요일은 Bold 유지 */}
          <span className="text-black text-[10vmin] font-extrabold tracking-tight leading-[0.9]">{day}</span>
          {/* 날짜는 볼드 해제 (Light로 설정하여 이미지 대비 강조) */}
          <span className="text-black text-[12vmin] font-light tracking-tighter leading-[1] mt-[1vmin]">{date}</span>
        </button>

        {/* Weather Circle (Dark Navy Circle) */}
        <button 
          type="button"
          onClick={() => { setShowCalendar(false); setShowForecast(true); }}
          className={`aspect-square h-full rounded-full flex items-center justify-center shadow-sm transform hover:scale-[1.02] transition-all active:scale-95 border-none cursor-pointer ${isLoading ? 'bg-[#0B1B32]/80' : 'bg-[#0B1B32]'}`}
        >
            {isLoading ? (
              <div className="flex space-x-[1vmin]">
                <div className="w-[1.5vmin] h-[1.5vmin] bg-white/40 rounded-full animate-bounce"></div>
                <div className="w-[1.5vmin] h-[1.5vmin] bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              </div>
            ) : (
              <div className="flex items-start">
                <span className="text-white text-[16vmin] font-light leading-none">{temp}</span>
                <span className="text-white text-[6vmin] font-light mt-[1.5vmin]">°</span>
              </div>
            )}
        </button>
      </div>

      {/* Overlay: Calendar */}
      {showCalendar && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col px-[8vmin] pt-[6vmin] pb-[4vmin] animate-in fade-in zoom-in duration-300 rounded-[15vmin]">
           <div className="flex justify-between items-center mb-[2vmin]">
            <div className="flex items-center gap-[3vmin]">
              <button type="button" onClick={handlePrevMonth} className="w-[8vmin] h-[8vmin] flex items-center justify-center text-[#C7C7CC] hover:text-black transition-colors text-[6vmin] bg-transparent border-none cursor-pointer">‹</button>
              <h2 className="text-black text-[7vmin] font-bold min-w-[35vmin] text-center">{monthName}</h2>
              <button type="button" onClick={handleNextMonth} className="w-[8vmin] h-[8vmin] flex items-center justify-center text-[#C7C7CC] hover:text-black transition-colors text-[6vmin] bg-transparent border-none cursor-pointer">›</button>
            </div>
            <button type="button" onClick={() => setShowCalendar(false)} className="w-[9vmin] h-[9vmin] rounded-full bg-[#F2F2F7] border-none flex items-center justify-center cursor-pointer text-[4vmin] font-bold text-gray-400 hover:text-black transition-colors">✕</button>
          </div>
          
          <div className="grid grid-cols-7 mb-[1.5vmin]">
            {weekDays.map((wd, i) => (
              <div key={i} className={`text-center text-[3vmin] font-bold ${i >= 5 ? 'text-red-500' : 'text-[#C7C7CC]'}`}>{wd}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-y-[0.5vmin] flex-1 items-center">
            {days.map((d, i) => {
              const isWeekend = i % 7 >= 5;
              const isToday = d === realDate && currentMonth === realMonth && currentYear === realYear;
              return (
                <div key={i} className={`flex items-center justify-center aspect-square text-[4vmin] ${isToday ? 'bg-[#FF9500] text-white rounded-full font-bold' : isWeekend && d !== null ? 'text-red-500' : 'text-black'}`}>
                  {d}
                </div>
              );
            })}
          </div>
          <div className="flex justify-center pt-[2vmin]"><button type="button" onClick={() => setShowCalendar(false)} className="w-[30vmin] h-[1.5vmin] bg-black/10 rounded-full border-none cursor-pointer" /></div>
        </div>
      )}

      {/* Overlay: Forecast */}
      {showForecast && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col px-[8vmin] py-[8vmin] animate-in slide-in-from-bottom duration-300 rounded-[15vmin]">
           <div className="flex justify-between items-start mb-[4vmin]">
            <div className="flex flex-col">
              <h2 className="text-black text-[8vmin] font-bold leading-none">Weather</h2>
              <span className="text-[4.5vmin] text-[#FF9500] font-medium mt-[1vmin]">{cityName}</span>
            </div>
            <button type="button" onClick={() => setShowForecast(false)} className="w-[9vmin] h-[9vmin] rounded-full bg-[#F2F2F7] border-none flex items-center justify-center cursor-pointer text-[4vmin]">✕</button>
          </div>

          <form onSubmit={handleSearchSubmit} className="mb-[4vmin] relative">
            <input type="text" placeholder="Enter city" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full bg-[#F2F2F7] border-none rounded-[4vmin] py-[3.5vmin] px-[5vmin] text-[4.5vmin] outline-none focus:ring-2 focus:ring-[#FF9500]" />
            <button type="submit" className="absolute right-[4vmin] top-1/2 -translate-y-1/2 text-[#FF9500] font-bold text-[4vmin]">Search</button>
          </form>

          <div className="flex-1 overflow-y-auto pr-[2vmin] scrollbar-hide">
            {hourly?.slice(0, 10).map((hour, idx) => (
              <div key={idx} className="flex justify-between items-center py-[2.5vmin] border-b border-gray-100">
                <span className="text-[4vmin] text-gray-500 w-[20vmin]">{idx === 0 ? 'Now' : formatHourlyTime(hour.time)}</span>
                <span className="text-[6.5vmin] flex-1 text-center">{getWeatherIcon(hour.weatherCode)}</span>
                <span className="text-[5vmin] font-bold text-black w-[15vmin] text-right">{hour.temp}°</span>
              </div>
            ))}
          </div>
          <div className="mt-auto flex justify-center pt-[4vmin]"><button type="button" onClick={() => setShowForecast(false)} className="w-[30vmin] h-[1.5vmin] bg-black/10 rounded-full border-none cursor-pointer" /></div>
        </div>
      )}
    </div>
  );
};