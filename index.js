'use strict';


// > Global definitions
const BASE_URL = "https://wttr.in",
      locationForm    = document.getElementById("location-search"),
      convertForm     = document.getElementById("temp-convert"),
      prevSearches    = document.getElementById("prev-searches"),
      inputLocation   = document.getElementById("location"),
      formatJSON      = 'format=j1',
      storedLocations = {},
      farenheitUnit   = '°F';

inputLocation.focus(); 
/**
 * ==================================
 * Form: locationForm - Event listener
 * ==================================
 */   
locationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const { location } = event.target;
    // => Getting data
    getLocationByName(location.value);
    locationForm.reset();
     
});

/**
 * ==================================
 * Form: convertForm - Event listener
 * ==================================
 */
convertForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const temp        = document.getElementById('temp-to-convert'),
          radioInputs = document.getElementsByName('convertOp');
    let convertOp;
    radioInputs.forEach(radio => {
        if(radio.checked){
            convertOp = radio;
        }
    });
    // => Getting data
    convertTemp(temp.value, convertOp.value);
    convertForm.reset();
});

/**
 * ==================================
 * getLocationByName()
 * ==================================
 * Gets an inputted location throught the form to search the current weather, besides the forecast for the next days
 * @param {string} location - A string that represents the name of a city/town
 * @returns {} No specific return. Fetch the data from the API, then creates an object to manage the proper output.
 */
function getLocationByName(location) {
  fetch(`${BASE_URL}/${location}?${formatJSON}`)
    .then((response) => response.json())
    .then(result => {
        const currentList   = document.getElementById('curr-search'),
              prevSearchMessage  = document.querySelector('.widget-prev-searches p'),
              initMessage   = document.querySelector('.current-forecast p'),
              currForecast  = document.querySelector('.current-forecast'),
              dailyForecast = document.querySelector('.daily-forecast'),
              dataSearch    = {};

        // > Removing initial message-s
        initMessage.classList.add('hidden');
        prevSearchMessage.classList.add('hidden');
        // > Refresh data
        currentList.querySelectorAll('*').forEach(node => {node.remove()});
        dailyForecast.querySelectorAll('*').forEach(node => {node.remove()});

        // > Creating object with data 
        dataSearch['img'] = validateWeatherCondition(result.weather[0].hourly[0].chanceofsunshine, 
                                                     result.weather[0].hourly[0].chanceofrain, 
                                                     result.weather[0].hourly[0].chanceofsnow);
        dataSearch['location'] = `${location}`;
        dataSearch[validateArea(location, result.nearest_area[0].areaName[0].value)] = result.nearest_area[0].areaName[0].value;
        dataSearch['Region'] = result.nearest_area[0].region[0].value;
        dataSearch['Country'] = result.nearest_area[0].country[0].value;
        dataSearch['Local time'] = `${(result.current_condition[0].localObsDateTime).substring(10)} <i class="fa fa-solid fa-clock"></i>`;
        dataSearch['Currently'] = `<small>Feels like</small> ${result.current_condition[0].FeelsLikeF}°F <i class="fa fa-solid fa-temperature-full"></i>`;
        dataSearch['Chance of Sunshine'] = `${result.weather[0].hourly[0].chanceofsunshine} <i class="fa fa-solid fa-sun"></i>`;
        dataSearch['Chance of Rain'] = `${result.weather[0].hourly[0].chanceofrain} <i class="fa fa-solid fa-cloud-rain"></i>`;
        dataSearch['Chance of Snow'] = `${result.weather[0].hourly[0].chanceofsnow} <i class="fa fa-thin fa-snowflake"></i>`;
        
        // => Loading current forecast
        getCurrentForecast(dataSearch);
        // => Aside: previous searches
        previousSearches(location, `${result.current_condition[0].FeelsLikeF}°F`);
        recallPreviousLocation();
        // => Loading daily forecast
        getDailyForecast(result.weather);

    })
    .catch((error) => {
        //console.log(error)
        const message = createErrorMessage(error);
        document.querySelector("main").append(message);
    });
}

/**
 * ==================================
 * getCurrentForecast()
 * ==================================
 * Gets an inputted location by the user to search the weather
 * @param {string} data - A string that represents the name of a city
 * @returns {} No specific return. Fetch the data from the API, then creates an object to manage the proper output.
 *
 * EXAMPLE:
 *  getLocationByName(location);
 *  //> 
 */
function getCurrentForecast(data){
    const currForecast = document.querySelector('.current-forecast'),
          dataList     = document.getElementById('curr-search');
    //
    for (const [key, value] of Object.entries(data)) {
        // >
        let dataItem;
        if(key === 'img'){ 
            dataItem = document.createElement('div');
            dataItem.innerHTML = value;
        }
        else if(key === 'location'){ 
            dataItem = document.createElement('h2');
            dataItem.textContent = value;
        }else{
            dataItem = document.createElement('p');
            dataItem.classList.add('item');
            dataItem.innerHTML = `<span class='data-header'>${key} <i class="fa fa-solid fa-ellipsis"></i></span> <span class='data-value'>${value}</span>`;
        }
        
        dataList.append(dataItem);
    }
    
    return dataList;
}

/**
 * ==================================
 * getDailyForecast()
 * ==================================
 * Gets an inputted location by the user to search the weather
 * @param {string} data - A string that represents the name of a city
 * @returns {} No specific return. Fetch the data from the API, then creates an object to manage the proper output.
 *
 * EXAMPLE:
 *  getLocationByName(location);
 *  //> 
 */
function getDailyForecast(data){
    const dailyForecast = document.querySelector('.daily-forecast');
          
    data.forEach((element, index) => {
        const dataList = document.createElement('div'); 
        // > Creating list with data      
        dataList.innerHTML = `
                        ${generateHeaders(index)}
                        <table>
                        <tr>
                            <td>Average Temperature</td>
                            <td><span>${element.avgtempF}°F</span></td>
                        </tr>
                        <tr>
                            <td>Max Temperature</td>
                            <td><span>${element.maxtempF}°F</span></td>
                        </tr>
                        <tr>
                            <td>Min Temperature</td>
                            <td><span>${element.mintempF}°F</span></td>
                        </tr>
                        </table>`;
                        
        dailyForecast.append(dataList);
    });
    return dailyForecast;
}

/**
 * ==================================
 * generateHeaders()
 * ==================================
 * Gets an inputted location by the user to search the weather
 * @param {string} day - A string that represents the name of a city
 * @returns {h4 html element} No specific return. Fetch the data from the API, then creates an object to manage the proper output.
 *
 * EXAMPLE:
 *  getLocationByName(location);
 *  //> 
 */
function generateHeaders(day) {
    const dailyHeaders = ['Today', 'Tomorrow', 'Day After Tomorrow'],
          header = document.createElement('h4');

    // => Looping throught the array of headers
    dailyHeaders.forEach((element, index) => {
        if(day === index){
            header.innerHTML = element;
        }
    });

    return header.outerHTML;
}

/**
 * ==================================
 * previousSearches()
 * ==================================
 * Gets an inputted location by the user to search the weather
 * @param {string} location - A string that represents the name of a city
 * @param {string} temp - A string that represents the name of a city
 * @returns {} No specific return. Fetch the data from the API, then creates an object to manage the proper output.
 *
 * EXAMPLE:
 *  previousSearches(location, );
 *  //> 
 */
function previousSearches(location, temp){
    const searchList        = document.getElementById('prev-searches'),
          prevSearchMessage = document.querySelector('main aside p');
    
    // > Removing all the items, to reganerate the list      
    searchList.querySelectorAll('*').forEach(node => {node.remove()});
    prevSearchMessage.classList.add('hidden');
    
    // > Rename fn
    checkPreviousSearch(location, temp)
    
    // => Looping through the object of previous searches
    for (const [key, value] of Object.entries(storedLocations)) {
        const searchItem = document.createElement('li');
        searchItem.innerHTML = `<a href='javascript:void(0)' rel='${key}'>${key}</a> - ${value} <i class="fa fa-solid fa-temperature-full"></i>`;
        searchList.append(searchItem)
    }    

    return searchList;
}

/**
 * ==================================
 * checkPreviousSearch()
 * ==================================
 * Gets an inputted location by the user to search the weather
 * @param {string} location - A string that represents the name of a city
 * @param {string} temp - A string that represents the name of a city
 * @returns {} No specific return. Fetch the data from the API, then creates an object to manage the proper output.
 *
 * EXAMPLE:
 *  getLocationByName(location);
 *  //> 
 */
function checkPreviousSearch(location, temp){
    // => Adding prevous searches to the obj
    storedLocations[location] = temp;

    return storedLocations;
}

/**
 * ==================================
 * getLocationByName()
 * ==================================
 * Gets an inputted location by the user to search the weather
 * @param {string} location - A string that represents the name of a city
 * @returns {} No specific return. Fetch the data from the API, then creates an object to manage the proper output.
 *
 * EXAMPLE:
 *  getLocationByName(location);
 *  //> 
 */
function recallPreviousLocation(){
    // => Getinng all previous searches
    const prevSearchLink = document.querySelectorAll('#prev-searches a');

    // >> Looping through the node list
    prevSearchLink.forEach(item => {
        item.addEventListener("click", (event) => {
            event.preventDefault();
            getLocationByName(item.getAttribute('rel'));
        });   
    })
}

/**
 * ==================================
 * validateWeatherCondition()
 * ==================================
 * Gets an inputted location by the user to search the weather
 * @param {string} location - A string that represents the name of a city
 * @returns {} No specific return. Fetch the data from the API, then creates an object to manage the proper output.
 *
 * EXAMPLE:
 *  getLocationByName(location);
 *  //> 
 */
function validateWeatherCondition(sunchine, rain, snow){
    let fileName = '';
    // => Validating all the possible conditions
    if(sunchine > 50){
        fileName = '<img src="./assets/icons8-summer.gif" alt="sun" >';   
    }
    else if(rain > 50){
        fileName = '<img src="./assets/icons8-torrential-rain.gif" alt="rain" >';   
    }
    else if(snow > 50){
        fileName = '<img src="./assets/icons8-light-snow.gif" alt="snow" >';   
    }else{
        // => Set a defualt Icon
        //fileName = 'assets/icons8-summer.gif'; 
    }
    return fileName;
}

/**
 * ==================================
 * validateArea()
 * ==================================
 * Gets an inputted location by the user to search the weather
 * @param {string} location - A string that represents the name of a city
 * @param {string} areaName - A string that represents the name of an area
 * @returns {} Fetch the data from the API, then creates an object to manage the proper output.
 *
 * EXAMPLE:
 *  validateArea(location, areaName);
 *  //> 
 */
function validateArea(location, areaName) { 
    let areaKey;
    // => Validating Area name matching with Location name
    if(location === areaName){
        areaKey = 'Area';
    }else{
        areaKey = 'Nearest Area';    
    }

    return areaKey;
}

/**
 * ==================================
 * convertTemp()
 * ==================================
 * Gets an inputted location by the user to search the weather
 * @param {string} temp - A string that represents a temperature
 * @param {string} convertOp - A string that represents the unit to covert
 * @returns {} No specific return. Fetch the data from the API, then creates an object to manage the proper output.
 *
 * EXAMPLE:
 *  convertTemp(100, c)
 *  //> =37.78 °Celsius
 */
function convertTemp(temp, convertOp) { 
    let result = 0;
    let celsiusToFahrenheit = (celsius => {
        let fahrenheit = ( (celsius * (9/5) + 32) ).toFixed(2);
        return fahrenheit;
    });
  
    let fahrenheitToCelsius = (fahrenheit => {
        let celsius = ( (fahrenheit - 32) * (5/9) ).toFixed(2);
        return celsius;
    });

    if (convertOp === 'f') {
        result = celsiusToFahrenheit(temp);
        document.querySelector('.result').innerHTML = ` = ${result} <span>°F <i class="fa fa-solid fa-temperature-full"></i></span>`;
    } 
    else if (convertOp === 'c') {
        result = fahrenheitToCelsius(temp);
        document.querySelector('.result').innerHTML = ` = ${result} <span>°C <i class="fa fa-solid fa-temperature-full"></i></span>`;
    }
}

/**
 * ==================================
 * createErrorMessage()
 * ==================================
 * Gets a specific error generated by the catch method
 * @param {string} message - A string that represents the error 
 * @returns {section html element} Retuns a HTML section
 *
 */
function createErrorMessage(message) {
    const section = document.createElement("section");
    section.classList.add("error");
    section.innerHTML = `<p>There was an error!</p><p class="message">${message}</p>`
  
    return section;
}