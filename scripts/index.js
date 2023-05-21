// API key for cities API
const CITY_API_KEY = "7h33JV2XkCF7OxfCvjdChQ==gnVSsMgsXhC18k17";
const CITY_BASE_URL = "https://api.api-ninjas.com/v1/city";
const WEATHER_API_KEY = "fbd609a14d53449c9cd101727231405";
const CURRENT_WEATHER_BASE_URL = "https://api.weatherapi.com/v1/current.json";
const FORECAST_WEATHER_BASE_URL = "https://api.weatherapi.com/v1/forecast.json";

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const loader = document.getElementById("loader");
// const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const globalLoaderContainer = document.getElementById(
  "global-loader-container"
);

window.onload = () => {
  hideMainContent();
  getCurrentLocation();
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
    if (!selectedCity.name) {
      selectedCity.name = result.location.name;
    }
    populateCurrentWeather(result.current);
    populateForecastWeather(result.forecast);
    populateForecastGraph(result.forecast.forecastday[0]);
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
      <img class="lg" src="${getWeatherIcon(data.condition.text)}" alt="" />
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
    // let day = days[new Date(it.date).getDay()];

    dayWeatherInnerHTML =
      dayWeatherInnerHTML +
      `
      <div class="forecast-day-weather">
        <div>${it.date}</div>
        <div class="d-flex align-items-center">
          <img src="${getWeatherIcon(it.day.condition.text)}" alt="" />
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

function populateForecastGraph(data) {
  const xValues = [
    "1AM",
    "3AM",
    "5AM",
    "7AM",
    "9AM",
    "11AM",
    "1PM",
    "3PM",
    "5PM",
    "7PM",
    "9PM",
    "11PM",
  ];
  let yValues = data.hour
    .filter((it, idx) => idx % 2 === 1)
    .map((it) => it.temp_c);

  new Chart("myChart", {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          label: "Today Weather",
          data: yValues,
          fill: false,
          borderColor: "rgb(110 178 255)",
          tension: 0,
        },
      ],
    },
    options: {},
  });
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

function getWeatherIcon(key) {
  const weatherIconMap = {
    SUNNY: "resources/animated/day.svg",
    "PATCHY RAIN POSSIBLE": "resources/animated/rainy-2.svg",
    "PARTLY CLOUDY": "resources/animated/cloudy-day-1.svg",
    OVERCAST: "resources/animated/cloudy-day-3.svg",
    "MODERATE RAIN": "resources/animated/rainy-5.svg",
    "HEAVY RAIN": "resources/animated/rainy-7.svg",
    "PATCHY LIGHT RAIN WITH THUNDER": "resources/animated/thunder.svg",
    CLOUDY: "resources/animated/cloudy.svg",
    MIST: "resources/static/misty.svg",
    CLEAR: "resources/static/clear-sky.png",
  };

  return weatherIconMap[key.toUpperCase()];
}

function getCurrentLocation() {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const crds = pos.coords;
      const latitude = crds.latitude;
      const longitude = crds.longitude;
      selectedCity = {
        latitude: latitude,
        longitude: longitude,
      };
      getForecastWeather();
    },
    (error) => {
      console.error(error);
    }
  );
}
