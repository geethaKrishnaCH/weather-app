// API key for cities API
const CITY_API_KEY = "7h33JV2XkCF7OxfCvjdChQ==gnVSsMgsXhC18k17";
const CITY_BASE_URL = "https://api.api-ninjas.com/v1/city";
const WEATHER_API_KEY = "fbd609a14d53449c9cd101727231405";
const WEATHER_BASE_URL = "http://api.weatherapi.com/v1/current.json";

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const loader = document.getElementById("loader");
const globalLoaderContainer = document.getElementById(
  "global-loader-container"
);

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

async function getWeather() {
  const latitude = selectedCity.latitude;
  const longitude = selectedCity.longitude;
  const url = `${WEATHER_BASE_URL}?key=${WEATHER_API_KEY}&q=${latitude},${longitude}`;
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
    globalLoaderContainer.classList.remove("loader-container");
  } catch (error) {
    console.error(error);
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

function populateWeather(data) {}
