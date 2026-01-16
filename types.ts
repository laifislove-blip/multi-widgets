export interface HourlyForecast {
  time: string;
  temp: number;
  weatherCode: number;
}

export interface WidgetState {
  time: string;
  day: string;
  date: string;
  temp: number;
  weatherCode: number; // 현재 날씨 코드 추가
  hourly?: HourlyForecast[];
}