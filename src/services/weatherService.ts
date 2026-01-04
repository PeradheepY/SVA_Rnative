import * as Location from 'expo-location';
import axios from 'axios';

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  feelsLike: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  sunrise: string;
  sunset: string;
  forecast: WeatherForecast[];
  icon: string;
  description: string;
  coords?: {
    latitude: number;
    longitude: number;
  };
}

export interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipitation: number;
  date: string;
}

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Get weather icon emoji based on condition code
 */
const getWeatherIcon = (code: number, isDay: boolean = true): string => {
  if (code >= 200 && code < 300) return '⛈️'; // Thunderstorm
  if (code >= 300 && code < 400) return '🌦️'; // Drizzle
  if (code >= 500 && code < 600) return '🌧️'; // Rain
  if (code >= 600 && code < 700) return '❄️'; // Snow
  if (code >= 700 && code < 800) return '🌫️'; // Atmosphere (fog, mist, etc)
  if (code === 800) return isDay ? '☀️' : '🌙'; // Clear
  if (code > 800) return '☁️'; // Clouds
  return '🌤️'; // Default
};

/**
 * Format timestamp to time string
 */
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

/**
 * Get day name from date string
 */
const getDayName = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Get user's current location
 */
export const getUserLocation = async (): Promise<Location.LocationObject | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Location permission denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return location;
  } catch (error) {
    console.error('Error getting location:', error);
    return null;
  }
};

/**
 * Get city name from coordinates
 */
export const getCityFromCoords = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await axios.get(
      `${WEATHER_API_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}`
    );
    return response.data.name || 'Unknown Location';
  } catch (error) {
    console.error('Error getting city name:', error);
    return 'Unknown Location';
  }
};

/**
 * Fetch real weather data from OpenWeatherMap API
 */
export const getWeatherData = async (): Promise<WeatherData> => {
  try {
    // Get user's location
    const location = await getUserLocation();
    
    let latitude = 28.6139; // Default: New Delhi
    let longitude = 77.2090;
    let cityName = 'Delhi, India';

    if (location) {
      latitude = location.coords.latitude;
      longitude = location.coords.longitude;
      cityName = await getCityFromCoords(latitude, longitude);
    }

    // Fetch current weather
    const currentWeatherResponse = await axios.get(
      `${WEATHER_API_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
    );

    // Fetch forecast
    const forecastResponse = await axios.get(
      `${WEATHER_API_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
    );

    const current = currentWeatherResponse.data;
    const forecastData = forecastResponse.data;

    // Process forecast data - get one forecast per day
    const dailyForecasts: WeatherForecast[] = [];
    const processedDates = new Set<string>();

    forecastData.list.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0];
      
      if (!processedDates.has(date) && dailyForecasts.length < 5) {
        processedDates.add(date);
        dailyForecasts.push({
          day: getDayName(date),
          date: date,
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          condition: item.weather[0].main,
          icon: getWeatherIcon(item.weather[0].id),
          precipitation: item.pop ? Math.round(item.pop * 100) : 0,
        });
      }
    });

    return {
      temperature: Math.round(current.main.temp),
      condition: current.weather[0].main,
      description: current.weather[0].description,
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed * 3.6), // Convert m/s to km/h
      location: cityName,
      feelsLike: Math.round(current.main.feels_like),
      uvIndex: current.uvi || 0,
      visibility: Math.round(current.visibility / 1000), // Convert to km
      pressure: current.main.pressure,
      sunrise: formatTime(current.sys.sunrise),
      sunset: formatTime(current.sys.sunset),
      icon: getWeatherIcon(current.weather[0].id, true),
      forecast: dailyForecasts,
      coords: {
        latitude,
        longitude,
      },
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Return fallback mock data
    return getFallbackWeatherData();
  }
};

/**
 * Fallback weather data if API fails
 */
const getFallbackWeatherData = (): WeatherData => {
  return {
    temperature: 28,
    condition: 'Partly Cloudy',
    description: 'partly cloudy',
    humidity: 65,
    windSpeed: 12,
    location: 'Delhi, India',
    feelsLike: 32,
    uvIndex: 7,
    visibility: 10,
    pressure: 1013,
    sunrise: '06:15 AM',
    sunset: '06:45 PM',
    icon: '⛅',
    forecast: [
      {
        day: 'Today',
        date: new Date().toISOString().split('T')[0],
        high: 30,
        low: 22,
        condition: 'Partly Cloudy',
        icon: '⛅',
        precipitation: 20,
      },
      {
        day: 'Tomorrow',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        high: 32,
        low: 24,
        condition: 'Sunny',
        icon: '☀️',
        precipitation: 5,
      },
      {
        day: 'Wed',
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        high: 29,
        low: 21,
        condition: 'Rainy',
        icon: '🌧️',
        precipitation: 80,
      },
      {
        day: 'Thu',
        date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        high: 27,
        low: 20,
        condition: 'Cloudy',
        icon: '☁️',
        precipitation: 40,
      },
      {
        day: 'Fri',
        date: new Date(Date.now() + 345600000).toISOString().split('T')[0],
        high: 31,
        low: 23,
        condition: 'Sunny',
        icon: '☀️',
        precipitation: 10,
      },
    ],
  };
};
