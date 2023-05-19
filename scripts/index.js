// API key for cities API
const CITY_API_KEY = "7h33JV2XkCF7OxfCvjdChQ==gnVSsMgsXhC18k17";
const CITY_BASE_URL = "https://api.api-ninjas.com/v1/city";
const WEATHER_API_KEY = "fbd609a14d53449c9cd101727231405";
const CURRENT_WEATHER_BASE_URL = "http://api.weatherapi.com/v1/current.json";
const FORECAST_WEATHER_BASE_URL = "http://api.weatherapi.com/v1/forecast.json";

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const loader = document.getElementById("loader");
const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const globalLoaderContainer = document.getElementById(
  "global-loader-container"
);

window.onload = () => {
  hideMainContent();
};

let selectedCity = {};

// Add Event Listener on City Input
cityInput.addEventListener("input", (e) => {
  const cityQuery = e.target.value;
  if (cityQuery.length >= 3) getCityRecommendations(cityQuery);
  else {
    clearCityRecommendations();
  }
});

// onSearch
searchBtn.addEventListener("click", getWeather);

function getWeather() {
  // getCurrentWeather();
  getForecastWeather();
}

async function getCurrentWeather() {
  const latitude = selectedCity.latitude;
  const longitude = selectedCity.longitude;
  const url = `${CURRENT_WEATHER_BASE_URL}?key=${WEATHER_API_KEY}&q=${latitude},${longitude}`;
  const options = {
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  };

  try {
    globalLoaderContainer.classList.add("loader-container");
    const response = await fetch(url, options);
    const result = await response.json();
    populateCurrentWeather(result);
    globalLoaderContainer.classList.remove("loader-container");
  } catch (error) {
    console.error(error);
    globalLoaderContainer.classList.remove("loader-container");
  }
}

async function getForecastWeather() {
  const latitude = selectedCity.latitude;
  const longitude = selectedCity.longitude;
  const url = `${FORECAST_WEATHER_BASE_URL}?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&days=7`;
  const options = {
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  };

  try {
    globalLoaderContainer.classList.add("loader-container");
    hideMainContent();
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(result);
    populateCurrentWeather(result.current);
    populateForecastWeather(result.forecast);
    showMainContent();
    globalLoaderContainer.classList.remove("loader-container");
  } catch (error) {
    console.error(error);
    hideMainContent();
    globalLoaderContainer.classList.remove("loader-container");
  }
}

// get 30 city recommendations
async function getCityRecommendations(query) {
  const url = encodeURI(`${CITY_BASE_URL}?name=${query}&limit=30`);
  const options = {
    method: "GET",
    headers: {
      "X-Api-Key": CITY_API_KEY,
      "content-type": "application/json",
      referer: "https://api.api-ninjas.com",
    },
  };

  try {
    loader.classList.add("loader");
    const response = await fetch(url, options);
    const result = await response.json();
    loader.classList.remove("loader");
    showCityRecommendations(result);
  } catch (error) {
    console.error(error);
    loader.classList.remove("loader");
  }
}

// show city recommendations
function showCityRecommendations(cities) {
  clearCityRecommendations();
  const itemList = document.getElementById("autocomplete-items");
  cities.forEach((city) => {
    let li = document.createElement("li");
    li.innerHTML = city.name;
    itemList.appendChild(li);

    li.addEventListener("click", (e) => {
      selectedCity = city;
      clearCityRecommendations();
      cityInput.value = selectedCity.name;
    });
  });
}

function clearCityRecommendations() {
  const itemList = document.getElementById("autocomplete-items");
  itemList.innerHTML = null;
}

function populateCurrentWeather(data) {
  const currentWeather = document.getElementById("current-weather");
  currentWeather.innerHTML = "";
  currentWeather.innerHTML = `
    <div class="location-temprature">
      <div class="location">
        <h2>${selectedCity.name}</h2>
        <p>Chance of rain: ${data.cloud}%</p>
      </div>
      <div class="temperature">
        <h2>${data.temp_c}&deg;</h2>
      </div>
    </div>
    <div class="weather-icon">
      <img class="lg" src="resources/animated/cloudy-day-2.svg" alt="" />
    </div>
  `;
}

function populateForecastWeather(data) {
  let forecastWeather = document.getElementById("forecast-weather");
  let dayWeatherInnerHTML = "";
  data.forecastday.forEach((it) => {
    let temperatures = it.hour.map((item) => item.temp_c);
    let maxTemperature = Math.max(...temperatures);
    let minTemperature = Math.min(...temperatures);
    let day = days[new Date(it.date).getDay()];

    console.log(day);
    dayWeatherInnerHTML =
      dayWeatherInnerHTML +
      `
      <div class="forecast-day-weather">
        <div>${day}</div>
        <div class="text-align-center d-flex align-items-center">
          <img src="resources/animated/cloudy.svg" alt="" />
          <p>${it.day.condition.text.toUpperCase()}</p>
        </div>
        <div class="text-align-right">
          <p>${maxTemperature} / <span class="color-dim">${minTemperature}</span></p>
        </div>
      </div>
    `;
  });
  let innerHTML = `
    <h3>7-DAY FORECAST</h3>
    <div>
      ${dayWeatherInnerHTML}
    </div>
  `;
  forecastWeather.innerHTML = innerHTML;
}

function hideMainContent() {
  const mainContent = document.getElementById("layout-grid");
  mainContent.classList.remove("visible");
  mainContent.classList.add("invisible");
}
function showMainContent() {
  const mainContent = document.getElementById("layout-grid");
  mainContent.classList.remove("invisible");
  mainContent.classList.add("visible");
}
