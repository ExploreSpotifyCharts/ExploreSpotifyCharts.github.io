import { createCountryVisualisation } from "./viz_ParPays.js"
import { createArtistVisualisation } from "./viz_ParArtiste.js"
import { createTrackVisualisation } from "./viz_ParTitre.js"
import { createTrendsVisualisation } from "./viz_ParTendances.js"
import { PATH } from "../index.js"
import { parseTrackName_Artist } from "./preprocess_Helpers.js"

/**
 *  Initialize view element
 */
export function initialize() {
  //Add events listerners to reactive elements
  d3.selectAll('li').on("click", function() {navigate(this)})
  d3.selectAll('input[type="radio"]').on("click", function() {selectField(this.value)})

  //Using jQuery because d3 do not support submit event
  $('#form').on('submit', submit)

  //Load data
  d3.csv(PATH+'extra/countries'+'.csv', d3.autoType).then(function (data_countries) {
    countries = data_countries.map(line => {
      return {code: String(line['country code']), country: String(line['country'])}
    })
    d3.csv(PATH+'extra/artist_track'+'.csv', d3.autoType).then(function (data_titres) {
      artists_tracks = data_titres.map(line => {
        return {Artist: parseTrackName_Artist(String(line['Artist'])), Track: parseTrackName_Artist(String(line['Track Name']))}
      })
      d3.csv(PATH+'extra/artist_countries'+'.csv', d3.autoType).then(function (data_artists_countries) {
        artists = data_artists_countries.map(line => parseTrackName_Artist(String(line['Artist'])))

        artists_countries = data_artists_countries.map(line => {
          return {artist: parseTrackName_Artist(String(line['Artist'])), countries: String(line['Countries']).split('|')}
        })
        d3.csv(PATH+'extra/track_countries'+'.csv', d3.autoType).then(function (data_tracks_countries) {
          tracks_countries = data_tracks_countries.map(line => {
            return {track: parseTrackName_Artist(String(line['Track Name'])), countries: String(line['Countries']).split('|')}
          })
          d3.csv(PATH+'extra/artists_global'+'.csv', d3.autoType).then(function (data_artists_global) {
            artists_global = data_artists_global.map(line => parseTrackName_Artist(String(line['Artist'])))

            createFormAndViz('Pays')
          })
        })
      })
    })
  })  
}

/**
 * Navigate to the selected tab
 * @param {HTMLElement} element 
 */
 export function navigate(element,value) {
  const tab = element.innerText
  d3.selectAll('li').attr('class', null)
  d3.select(element).attr('class', 'selected')
  resetForm()
  resetDataviz()
  createFormAndViz(tab,value)
}

/* Global var */

var countries = []
var artists_tracks = []
var artists = []
var artists_global = []
var artists_countries = []
var tracks_countries = []
var artist_Selected_Tracks = []

/* Private function*/

/**
 * Create the header form link to the tab
 * @param {String} tab 
 */
function createFormAndViz(tab, value) {
    let artist
    let country
    switch(tab) {
      case "Pays":
        country = value ? value : 'Mondial'
        createDatePickers()
        createSuggestbox('Pays', countries.map(d => d.country), country)
        createToogle()
        createCountryVisualisation(getCountryCode(country), country)
        break
      case "Tendances":
        createMonthDayPickers()
        createSuggestbox('Pays',  countries.map(d => d.country), 'Mondial')
        createTrendsVisualisation()
        break
      case "Artiste":
        artist = value ? value : randomValue(artists_global)
        createDatePickers()
        createSuggestbox('Artiste', artists, artist)
        createSuggestbox('Pays', countries.map(d => d.country), 'Mondial')
        createArtistVisualisation(artist)
        break
      case "Titre":
        createDatePickers()
        artist = value ? getArtistByTrack(value) : randomValue(artists)
        artist_Selected_Tracks = getArtistTracks(artist)
        const track = value ? value : randomValue(artist_Selected_Tracks)
        createSuggestbox('Artiste', artists, artist)
        d3.select('#Artiste').on('input',updateTrackList)
        
        createSuggestbox('Titre', artist_Selected_Tracks, track)
        let countries_to_keep = tracks_countries.filter(element => element.track == track)[0].countries
        const index = countries_to_keep.indexOf('global')
        if (index != -1)
        {
          countries_to_keep.splice(index, 1)
        }
        countries_to_keep = countries.filter(element => countries_to_keep.includes(element.code))
        createTrackVisualisation(track, countries_to_keep)
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
function resetForm() {
  d3.selectAll('.suggestbox').remove()
}

/**
 * Create a suggestbox tag with the given label
 * @param {string} label 
 */
function createSuggestbox(label, data, defaultValue) {
  const suggestboxe = d3.select('form .suggestboxes').append('div').attr('class','suggestbox')

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
 */
function createToogle() {
  const container = d3.select('form .suggestboxes').append('div').attr('class','suggestbox')
  container.append('span').text('Titre').style('padding-right','10px')

  const toogle = container.append('label').attr('class','switch')

  toogle.append('input').attr('type','checkbox').attr('value','artist').attr('name','aggregation')
  toogle.append('span').attr('class','slider')

  container.append('span').text('Artiste').style('padding-left','10px')
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
  console.log(params)
  if (isFormValid(params)) {
    params = processParams(params)
    resetDataviz()
    if(!d3.select('#menuList li:nth-child(1).selected').empty()){ //Pays
      const condition = params.findIndex( v => v[0] == 'aggregation') >= 0
      const offset = condition ? 1 : 0

      const country = params[0][2]
      const country_name = params[0][1]
      const period_start = params[2 + offset][1]
      const period_end = params[3 + offset][1]
      createCountryVisualisation(country, country_name, period_start, period_end, condition)
    }
    if(!d3.select('#menuList li:nth-child(2).selected').empty()){  //Artiste
      const artist = params[0][1]
      const country = params[1][2]
      const country_name = params[1][1]
      const period_start = params[3][1]
      const period_end = params[4][1]

      createArtistVisualisation(artist, country, country_name, period_start, period_end)
    }
    if(!d3.select('#menuList li:nth-child(3).selected').empty()){ //Titre
      const track = params[1][1]
      const artist = params[0][1]
      const period_start = params[3][1]
      const period_end = params[4][1]

      let countries_to_keep = tracks_countries.filter(element => element.track == track)[0].countries
      const index = countries_to_keep.indexOf('global')
      if (index != -1)
      {
        countries_to_keep.splice(index, 1)
      }
      countries_to_keep = countries.filter(element => countries_to_keep.includes(element.code))
      
      createTrackVisualisation(track, countries_to_keep, period_start, period_end)
    }
    if(!d3.select('#menuList li:nth-child(4).selected').empty()){ //Tendances
      createTrendsVisualisation(params[0][2],params[0][1],params[2][1],params[3][1],params[4][1],params[5][1])
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
  return artists_tracks
          .filter( track => track.Artist == artist)
          .map(track => track.Track)
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

  /**
   * Return the track's artist
   * @param {string} track 
   * @returns {string}
   */
  function getArtistByTrack(track) {
    return artists_tracks.filter( d => d.Track == track)[0].Artist
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
  }