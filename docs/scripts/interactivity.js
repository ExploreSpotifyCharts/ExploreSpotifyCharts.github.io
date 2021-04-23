import { createCountryVisualisation } from "./viz_ParPays.js"
import { createArtistVisualisation, createArtistVisualisation_Countries } from "./viz_ParArtiste.js"
import { createTrackVisualisation } from "./viz_ParTitre.js"
import { createTrendsVisualisation } from "./viz_ParTendances.js"
import { PATH } from "../index.js"
import { parseTrackName_Artist } from "./preprocess_Helpers.js"

/**
 *  Initialize view element
 */
export function initialize() {
  //Add events listerners to reactive elements
  d3.selectAll('input[type="radio"]').on("click", function() {selectField(this.value)})

  //Using jQuery because d3 do not support submit event
  $('#form').on('submit', submit)

  //Load data
  d3.csv(PATH+'extra/countries'+'.csv', d3.autoType).then(function (data_countries) {
    countries = data_countries.map(line => {
      return {code: String(line['country code']), country: String(line['country'])}
    })
    d3.csv(PATH+'extra/artists_countries'+'.csv', d3.autoType).then(function (data_artists_countries) {
      artists = data_artists_countries.map(line => parseTrackName_Artist(String(line['Artist'])))

      artists_countries = data_artists_countries.map(line => {
        return {artist: parseTrackName_Artist(String(line['Artist'])), countries: String(line['Countries']).split('|')}
      })
      d3.csv(PATH+'extra/tracks_data'+'.csv', d3.autoType).then(function (data_tracks_countries) {
        tracks_data = data_tracks_countries.map(line => {
          return {artist: parseTrackName_Artist(String(line['Artist'])), track: parseTrackName_Artist(String(line['Track Name'])), countries: String(line['Countries']).split('|')}
        })
        d3.csv(PATH+'extra/artists_global'+'.csv', d3.autoType).then(function (data_artists_global) {
          artists_global = data_artists_global.map(line => parseTrackName_Artist(String(line['Artist'])))

          createFormAndViz('Pays')
        })
      })
    })
  }) 
}

/**
 * Navigate to the selected tab
 * @param {HTMLElement} element 
 */
 export function navigate(element,value, additionalValue) {
  const tab = element.innerText
  d3.selectAll('li').attr('class', null)
  d3.select(element).attr('class', 'selected')
  resetForm(tab)
  window.scrollTo(0,0)
  resetDataviz()
  createFormAndViz(tab,value,additionalValue)
}

/* Global var */

var countries = []
var artists = []
var artists_global = []
var artists_countries = []
var tracks_data = []
var artist_Selected_Tracks = []

var state = {
  country: 'Mondial',
  startDate: '2017-01-01',
  endDate: '2020-04-20',
  startDay: '01',
  startMonth: '01',
  endDay: '31',
  endMonth: '12'
}



/* Private function*/

/**
 * Create the header form link to the tab
 * @param {String} tab 
 */
function createFormAndViz(tab, value, additionalValue) {
    let artist
    switch(tab) {
      case "Pays":
        state.country = value ? value : state.country
        createDatePickers()
        createSuggestbox('Pays', countries.map(d => d.country), state.country)
        createToogle(tab)
        createCountryVisualisation(getCountryCode(state.country), state.country, state.startDate, state.endDate)
        break
      case "Tendances":
        createMonthDayPickers()
        createSuggestbox('Pays',  countries.map(d => d.country), state.country)
        createTrendsVisualisation(state.startDay,state.startMonth,state.endDay,state.endMonth,getCountryCode(state.country),state.country)
        break
      case "Artiste":
        artist = value ? value : randomValue(artists_global)
        //Create the elements
        createDatePickers()
        createSuggestbox('Artiste', artists, artist)
        createToogle(tab)
        createSuggestbox('Pays', countries.map(d => d.country), state.country, state.startDate, state.endDate)
        createArtistVisualisation(artist,state.startDate,state.endDate)
        //Change width to feet in the additional elements
        d3.select('.suggestboxes').style('width','1000px')
        d3.select('#suggestbox_Pays').style('margin-left','0px')
        d3.select('.toogle').style('margin','5px 70px 5px 0px')
        break
      case "Titre":
        createDatePickers()
        artist = value ? additionalValue : randomValue(artists)
        artist_Selected_Tracks = getArtistTracks(artist)
        const track = value ? value : randomValue(artist_Selected_Tracks)
        createSuggestbox('Artiste', artists, artist)
        d3.select('#Artiste').on('input',updateTrackList)
        
        createSuggestbox('Titre', artist_Selected_Tracks, track)
        let countries_to_keep = getCountriesForTrackArtist(track, artist)
        const index = countries_to_keep.indexOf('global')
        if (index != -1)
        {
          countries_to_keep.splice(index, 1)
        }
        countries_to_keep = countries.filter(element => countries_to_keep.includes(element.code))
        createTrackVisualisation(track, artist, countries_to_keep, state.startDate, state.endDate)
        break
  }
  //Reset form validation on changes
  d3.selectAll(".suggestboxes input").on("change",function() {
    this.setCustomValidity("")
  }) 
}

/**
 * Empty the form
 */
function resetForm(tab) {
  d3.selectAll('.suggestbox').remove()
  d3.selectAll('.toogle').remove()
  d3.select('.suggestboxes').style('width','700px')
  //Select the right period
  const bool = tab == 'Tendances' ? state.endDay != null : state.endDate != null
  if (bool) {
    d3.select("#day input[type='radio']").property('checked',"true")
    d3.select("#period input[type='radio']").property('checked',"false")
  } else {
    d3.select("#period input[type='radio']").property('checked',"true")
    d3.select("#day input[type='radio']").property('checked',"false")
  }
}

/**
 * Create a suggestbox tag with the given label
 * @param {string} label 
 */
function createSuggestbox(label, data, defaultValue) {
  const suggestboxe = d3.select('form .suggestboxes').append('div').attr('class','suggestbox').attr('id','suggestbox_' + label)

  suggestboxe
  .append('label')
  .attr('for', label)
  .text(label + " :")

  suggestboxe
  .append('input')
  .attr('list', "list" + label)
  .attr('name', label)
  .attr('id', label)
  .attr('value', defaultValue)
  .property('required',true)

  suggestboxe
  .append('datalist')
  .attr('id', "list" + label)
  
  //Faster than D3
  data.forEach((d) => {
    const option = "<option value=\"" + d + "\"></option>"
    $('#list' + label).append(option)
  });
}

/**
 * Create a toogle
 * @param {string} tab 
 */
function createToogle(tab) {
  const value = tab == 'Pays' ? 'Artistes' : 'Pays'
  const container = d3.select('form .suggestboxes').append('div').attr('class','toogle')
  container
  .append('span')
  .text('Vue par :')

  container
  .append('span')
  .text('Titres')
  .style('font-weight','bold')
  .attr('class','option')

  const toogle = container.append('label').attr('class','switch')

  toogle
  .append('input')
  .attr('type','checkbox')
  .attr('value','artist')
  .attr('name','aggregation')

  if (tab == 'Artiste') toogle.select('input').on('click', updateForm)
  else toogle.select('input').on('click', updateSelection)

  toogle.append('span').attr('class','slider')

  container
  .append('span')
  .text(value)
  .attr('class','option')
}

/**
 * Enable/Disable datepicker according to selection
 * @param {string} selection 
 */
function selectField(selection){
  if (selection == "day") {
    d3.selectAll("#day input[type='date']").property("disabled",false)
    d3.selectAll("#period input[type='date']").property("disabled",true)
    //For tendances tab
    d3.selectAll("#day select").property("disabled",false)
    d3.selectAll("#period select").property("disabled",true)
  } else {
    d3.selectAll("#period input[type='date']").property("disabled",false)
    d3.selectAll("#day input[type='date']").property("disabled",true)
    //For tendances tab
    d3.selectAll("#period select").property("disabled",false)
    d3.selectAll("#day select").property("disabled",true)
  }
}

/**
 * Parse parameters
 * @param {string} params 
 * @returns {object[]}
 */
function parseParams(params) {
  let param_array = decodeURIComponent(params).split("&")
  param_array = param_array.map( param => {
    const paramKeyValue = param.split("=")
    return [paramKeyValue[0] ,paramKeyValue[1]]
  })
  return param_array
}

/**
 * Get data from the formular
 * @param {event} e 
 */
function submit(e) {
  //Prevent form to be submitted
  e.preventDefault();
  //Using JQuery to get form data
  const rawParams = $('#form').serialize();
  let params = parseParams(rawParams)
  if (isFormValid(params)) {
    params = processParams(params)
    resetDataviz()
    if(!d3.select('#menuList li:nth-child(1).selected').empty()){ //Pays
      const condition = params.findIndex( v => v[0] == 'aggregation') >= 0
      const offset = condition ? 1 : 0

      const countryCode = params[0][2]
      state.country = params[0][1]
      state.startDate = params[2 + offset][1]
      state.endDate = params[3 + offset] ? params[3 + offset][1] : null
      createCountryVisualisation(countryCode, state.country, state.startDate, state.endDate, condition)
    }
    if(!d3.select('#menuList li:nth-child(2).selected').empty()){  //Artiste
      const condition = params.findIndex( v => v[0] == 'aggregation') >= 0

      const artist = params[0][1]
      const countryCode = params[1][2]
      state.country = params[1][1]
      state.startDate = params[3][1]
      state.endDate = params[4] ? params[4][1] : null
      
      if (condition) {
        let countries_to_keep = getCountriesForArtist(artist)
        const index = countries_to_keep.indexOf('global')
        if (index != -1) { countries_to_keep.splice(index, 1) }
        countries_to_keep = countries.filter(element => countries_to_keep.includes(element.code))
        createArtistVisualisation_Countries(artist, countries_to_keep, state.startDate, state.endDate)
      } else {
        createArtistVisualisation(artist, state.startDate, state.endDate, countryCode, state.country, condition)
      }
    }
    if(!d3.select('#menuList li:nth-child(3).selected').empty()){ //Titre
      const track = params[1][1]
      const artist = params[0][1]
      state.startDate = params[3][1]
      state.endDate = params[4] ?  params[4][1] : null

      let countries_to_keep = getCountriesForTrackArtist(track, artist)
      const index = countries_to_keep.indexOf('global')
      if (index != -1) { countries_to_keep.splice(index, 1) }
      countries_to_keep = countries.filter(element => countries_to_keep.includes(element.code))
      createTrackVisualisation(track, artist, countries_to_keep, state.startDate, state.endDate)
    }
    if(!d3.select('#menuList li:nth-child(4).selected').empty()){ //Tendances
        const countryCode = params[0][2]
        state.country = params[0][1] 
        state.startDay = params[2][1]
        state.startMonth = params[3][1]
        state.endDay = params[4] ? params[4][1] : null
        state.endMonth = params[5] ? params[5][1] : null

        createTrendsVisualisation(state.startDay,state.startMonth,state.endDay,state.endMonth,countryCode,state.country)
    }
  }
}

/**
 * Create the day and month pickers
 */
function createMonthDayPickers(){
  //Using JQuery to append element to a specific position
  const daySelect = "<select name='day' value='01'></select>"
  const monthSelect = "<select name='month' value='01'></select>"

  $("input[type='date']").after(daySelect)
  $("select").after(monthSelect)

  const months = ['01','02','03','04','05','06','07','08','09','10','11','12']
  const days = months.concat(['13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'])

  d3.selectAll("#day select").property("disabled",true)
  d3.selectAll("select[name='day']").selectAll("option").data(days).enter().append("option")
    .attr('selected', d => d == '01' ? "selected" : null)
    .attr('value', d => d)
    .text(d => d)
  d3.selectAll("select[name='month']").selectAll("option").data(months).enter().append("option")
    .attr('selected', d => d == '01' ? "selected" : null)
    .attr('value', d => d)
    .text(d => d)

  if($("#day input[type='radio']").is(":checked")) {
    selectField('day')
  } else { 
    selectField('period')
  }

  d3.selectAll("input[type='date']").remove()

  //Set default value to 31/12 for the period end date
  d3.select("#period select:nth-child(5)").selectAll('option').attr('selected', d => d == '31' ? "selected" : null)
  d3.select("#period select:nth-child(6)").selectAll('option').attr('selected', d => d == '12' ? "selected" : null)

  //Reset form validation on changes
  d3.selectAll("select").on("change",function() {
    this.setCustomValidity("")
  })
}

/**
 * Create the datepickers
 */
function createDatePickers() {
    //Using JQuery to append elements to a specific position
    const datepicker =  "<input type='date' name='date' value='2017-01-01'  min='2017-01-01' max='2020-04-20'></input>"
    $("select[name='month']").after(datepicker)

    if($("#day input[type='radio']").is(":checked")) {
      selectField('day')
    } else { 
      selectField('period')
    }

  //Reset form validation on changes
  d3.selectAll("#period input").on("change",function() {
    this.setCustomValidity("")
  })

  d3.selectAll("select").remove()
  d3.select("#period input[type='date']:nth-child(4)").attr('value','2020-04-20')
}

/**
 * Retrieve all artist's tracks
 * @param {string} artist 
 * @returns {string[]}
 */
function getArtistTracks(artist) {
  return tracks_data
          .filter( track => track.artist == artist)
          .map(track => track.track)
}

/**
 * Retrieve all countries where a track appears
 * @param {string} title
 * @param {string} artist 
 * @returns {string[]}
 */
function getCountriesForTrackArtist(title, artist) {
  return tracks_data
          .filter( track => track.artist == artist && track.track == title)[0].countries
}

/**
 * Retrieve all countries where an artist appears
 * @param {string} artist 
 * @returns {string[]}
 */
function getCountriesForArtist(artist) {
  return artists_countries
          .filter( e => e.artist == artist )[0].countries
}

/**
 * Load the track list related to the selected artist
 */
function updateTrackList() {
  const currentVal = this.value;
  if($('#listArtiste option').filter(function () {
    return this.value.toUpperCase() === currentVal.toUpperCase()
   }).length) {
    artist_Selected_Tracks = getArtistTracks(currentVal)
    d3.select("#Titre").attr('value',randomValue(artist_Selected_Tracks))
    d3.selectAll("#listTitre option").remove()
    d3.select("#listTitre").selectAll("option").data(artist_Selected_Tracks).enter().append('option').attr('value',d => d)
  }
}

/**
 * Check if the date is invalid
 * @param {string} day 
 * @param {string} month 
 * @param {string} duration 
 * @returns {boolean}
 */
function isDateInvalid(day,month,duration) {
  const error = "La date n'existe pas"
  switch(month) {
    case '04':
    case '06':
    case '09':
    case '11':
      if (day=='31') {
        d3.select("#" + duration + " select").node().setCustomValidity(error)
        d3.select("#" + duration + " select").node().reportValidity()
        return true
      }
    case '02':
      if (parseInt(day)>29) {
        d3.select("#" + duration + " select").node().setCustomValidity(error)
        d3.select("#" + duration + " select").node().reportValidity()
        return true
      }
    default:
      return false
  }
}

/**
 * Return true if the form is valid, false otherwise
 * @param {object[][]} params 
 * @returns {boolean}
 */
function isFormValid(params) {
  let validationResult = true;    
  //Date and duration validation
    let index = params.findIndex( v => v[0] == 'duration')
    //Case tab tendances and single day
    if(params[index][0] == 'duration' && params[index][1] == 'day') {
      if (params[index + 1][0] == 'day') {
        const day = params[index + 1][1]
        const month =  params[index + 2][1]
        validationResult = !isDateInvalid(day,month,'day')
      }
    //Case period
    } else {
      let startDate
      let endDate

      //Tab tendances
      if(params[index + 1][0] == 'day')  {
        const startDay = params[index + 1][1]
        const startMonth =  params[index + 2][1]
        const endDay =  params[index + 3][1]
        const endMonth =  params[index + 4][1]
        if (isDateInvalid(startDay,startMonth,'period') && isDateInvalid(endDay,endMonth,'period')) {
          validationResult = false
        }
        startDate = new Date(startMonth + '-' + startDay)
        endDate = new Date(endMonth + '-' + endDay)
      //Other tabs
      } else {
        startDate = new Date(params[index + 1][1])
        endDate = new Date(params[index + 2][1])
      }
    
      if( startDate > endDate) {
        const error = 'Les dates sont incorrectes : la date de début doit être strictement inférieur à la date de fin !'
        d3.select("#period input[type='date']").node()?.setCustomValidity(error)
        d3.select("#period input[type='date']").node()?.reportValidity()   
        d3.select("#period select").node()?.setCustomValidity(error)
        d3.select("#period select").node()?.reportValidity()                
        validationResult = false
      }
    }
    //Artist, Country and track validation
    index = params.findIndex( v => v[0] == 'Pays')
    if (index >= 0) validationResult = validationResult && validateField(params[index][1],'Pays')

    index = params.findIndex( v => v[0] == 'Artiste')
    if (index >= 0) validationResult = validationResult && validateField(params[index][1],'Artiste')

    index = params.findIndex( v => v[0] == 'Titre')
    if (index >= 0) validationResult = validationResult && validateField(params[index][1],'Titre')
  return validationResult
  }

  /**
   * Return true if the field is valid, false otherwise
   * @param {string} fieldValue 
   * @param {string} fieldName 
   * @returns {boolean}
   */
  function validateField(fieldValue, fieldName) {
    let data
    let word = "Le "
    switch(fieldName) {
      case 'Pays':
        data =  countries.map(d => d.country)
        break
      case 'Artiste':
        data = artists
        word = "L' "
        break
      case 'Titre':
        data = artist_Selected_Tracks
        break
    }
    if(data.filter(value => value == fieldValue).length > 0) return true
    //Display error if the field is invalid
    const error = word + fieldName.toLowerCase() + " " + fieldValue +" n'existe pas"
    d3.select("#" + fieldName).node().setCustomValidity(error)
    d3.select("#" + fieldName).node().reportValidity()
    return false
  }

  /**
   * Get a random value from the array
   * @param {any[]} arry 
   * @returns {any}
   */
  function randomValue(array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  function processParams(params) {
    const index = params.findIndex( v => v[0] == 'Pays')
    if(index >= 0) params[index].push(getCountryCode(params[index][1]))
    return params
  }

  /**
   * Return the code of the country
   * @param {string} country 
   * @returns {string}
   */
  function getCountryCode(country) {
    const index = countries.findIndex(v => v.country == country)
    return countries[index].code
  }

  function resetDataviz() {
    d3.selectAll('#main-g').remove()
    //Disable menu and submit button during the load
    d3.selectAll('li').on("click", null)
    d3.select('input[type="submit"]').property('disabled',true)
  }

  /**
   * Hide country suggestbox on toogle click or display it if it was already hidden
   */
  function updateForm() {
    updateSelection(this)
    if(this.checked) {
      d3.select('#suggestbox_Pays').style('opacity','0')
      d3.select('#suggestbox_Pays input').property('disabled',true)
    } else {
      d3.select('#suggestbox_Pays').style('opacity','100')
      d3.select('#suggestbox_Pays input').property('disabled',false)
    }
  }

  /**
   * Put in bold the current aggragation selection
   */
  function updateSelection(element) {
    if(this?.checked || element?.checked) {
      d3.select('.toogle span:nth-child(2)').style('font-weight','normal')
      d3.select('.toogle span:nth-child(4)').style('font-weight','bold')
    } else {
      d3.select('.toogle span:nth-child(2)').style('font-weight','bold')
      d3.select('.toogle span:nth-child(4)').style('font-weight','normal')
    } 
  }