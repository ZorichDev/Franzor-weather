import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, Navigation, Search, Loader2 } from 'lucide-react';

export default function WeatherApp() {
  const [city, setCity] = useState('London');
  const [searchInput, setSearchInput] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Using a more reliable free weather API
  const API_KEY = 'fe683df909368e6dee620a5c0bd6c278'; // Get free key from OpenWeatherMap

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current weather with error handling
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      
      if (!weatherRes.ok) {
        if (weatherRes.status === 404) {
          throw new Error('City not found. Please check the spelling.');
        } else if (weatherRes.status === 401) {
          throw new Error('Invalid API key. Please check your configuration.');
        } else {
          throw new Error('Failed to fetch weather data');
        }
      }
      
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      // Fetch 5-day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      
      if (!forecastRes.ok) {
        throw new Error('Failed to fetch forecast data');
      }
      
      const forecastData = await forecastRes.json();
      
      // Get one forecast per day (at 12:00 PM)
      const dailyForecasts = forecastData.list.filter((item, index) => 
        index % 8 === 0 // Every 24 hours (3-hour intervals * 8 = 24 hours)
      ).slice(0, 5);
      
      setForecast(dailyForecasts);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setWeather(null);
      setForecast(null);
    }
  };

  useEffect(() => {
    if (city) {
      fetchWeather(city);
    }
  }, [city]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedInput = searchInput.trim();
    if (trimmedInput) {
      setCity(trimmedInput);
      setSearchInput('');
    }
  };

  const getWeatherIcon = (weatherCode) => {
    if (!weatherCode) return <Cloud className="w-16 h-16 text-gray-400" />;
    
    if (weatherCode >= 200 && weatherCode < 300) 
      return <CloudRain className="w-16 h-16 text-blue-600" />;
    if (weatherCode >= 300 && weatherCode < 600) 
      return <CloudRain className="w-16 h-16 text-blue-500" />;
    if (weatherCode >= 600 && weatherCode < 700) 
      return <Cloud className="w-16 h-16 text-blue-300" />;
    if (weatherCode >= 700 && weatherCode < 800) 
      return <Cloud className="w-16 h-16 text-gray-500" />;
    if (weatherCode === 800) 
      return <Sun className="w-16 h-16 text-yellow-500" />;
    if (weatherCode > 800) 
      return <Cloud className="w-16 h-16 text-gray-400" />;
    
    return <Cloud className="w-16 h-16 text-gray-400" />;
  };

  const getDayName = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const handleRetry = () => {
    setCity('London');
    setError(null);
  };

  if (loading && !weather) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <div className="text-xl">Loading Franzor weather data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header and Search */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Franzor Weather Forecast</h1>
          <p className="text-white/80 mb-6">Get accurate weather updates worldwide</p>
          
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="flex gap-2 bg-white/20 backdrop-blur-lg rounded-full p-2">
              <div className="flex items-center pl-4 text-white/70">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter city name..."
                className="flex-1 bg-transparent px-2 py-3 text-white placeholder-white/70 outline-none"
              />
              <button
                type="submit"
                disabled={!searchInput.trim()}
                className="px-6 py-3 bg-white/30 hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-lg rounded-full text-white font-medium transition-all duration-200"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 backdrop-blur-lg border border-red-500/30 rounded-2xl p-6 text-white text-center">
            <h3 className="text-xl font-bold mb-2">Oops! calm down Franzor is here for you</h3>
            <p className="mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-full transition"
            >
              Try Again
            </button>
          </div>
        )}

        {weather && (
          <>
            {/* Main Weather Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 mb-8 text-white shadow-2xl border border-white/20">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="text-center lg:text-left flex-1">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                    <h1 className="text-4xl md:text-5xl font-bold">{weather.name}</h1>
                    <span className="text-2xl opacity-80 bg-white/20 px-3 py-1 rounded-full">
                      {weather.sys.country}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 justify-center lg:justify-start">
                    {getWeatherIcon(weather.weather[0]?.id)}
                    <div>
                      <div className="text-5xl md:text-6xl font-bold mb-2">
                        {Math.round(weather.main.temp)}°C
                      </div>
                      <p className="text-xl md:text-2xl capitalize text-white/90">
                        {weather.weather[0]?.description}
                      </p>
                      <p className="text-white/70 mt-2">
                        Feels like {Math.round(weather.main.feels_like)}°C
                      </p>
                    </div>
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 w-full lg:w-auto">
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-5 h-5" />
                      <span className="text-sm opacity-80">Wind</span>
                    </div>
                    <div className="text-2xl font-bold">{weather.wind.speed} m/s</div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-5 h-5" />
                      <span className="text-sm opacity-80">Humidity</span>
                    </div>
                    <div className="text-2xl font-bold">{weather.main.humidity}%</div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5" />
                      <span className="text-sm opacity-80">Visibility</span>
                    </div>
                    <div className="text-2xl font-bold">{(weather.visibility / 1000).toFixed(1)} km</div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-5 h-5" />
                      <span className="text-sm opacity-80">Pressure</span>
                    </div>
                    <div className="text-2xl font-bold">{weather.main.pressure} hPa</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            {forecast && forecast.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-white/20">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">5-Day Forecast</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {forecast.map((day, index) => (
                    <div
                      key={index}
                      className="bg-white/10 p-5 rounded-2xl text-center hover:bg-white/20 transition-all duration-300 border border-white/10 hover:border-white/20"
                    >
                      <p className="font-bold text-lg mb-3">{getDayName(day.dt)}</p>
                      <div className="flex justify-center mb-3">
                        {getWeatherIcon(day.weather[0]?.id)}
                      </div>
                      <p className="text-2xl font-bold mb-2">{Math.round(day.main.temp)}°C</p>
                      <div className="flex justify-center gap-2 text-sm text-white/70 mb-2">
                        <span>H: {Math.round(day.main.temp_max)}°</span>
                        <span>L: {Math.round(day.main.temp_min)}°</span>
                      </div>
                      <p className="text-sm opacity-80 capitalize">{day.weather[0]?.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* API Key Notice */}
        <div className="mt-8 text-center text-white/60 text-sm">
          <p>To know more about us <a href="https://fran-tech-nine.vercel.app/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80">FranTech</a></p>
        </div>
      </div>
    </div>
  );
}