import { createCountryVisualisation } from "./viz_ParPays.js"
import { createArtistVisualisation, createArtistVisualisation_Countries } from "./viz_ParArtiste.js"
import { createTrackVisualisation } from "./viz_ParTitre.js"
import { createTrendsVisualisation } from "./viz_ParTendances.js"
import { PATH } from "../index.js"
import { parseTrackName_Artist } from "./preprocess_Helpers.js"

/**
 *  Initialise la vue
 */
export function initialize() {
  //Ajout des listeners aux éléments réactifs
  d3.selectAll('input[type="radio"]').on("click", function() {selectField(this.value)})

  //On utilise jQuery car d3 ne supporte pas un évènement submit
  $('#form').on('submit', submit)

  //Chargement des données utiles à l'interaction
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
        artists_countries.forEach( element => {
          element.countries.forEach( country => {
            if (typeof artists_grouped_by_countries[country] == 'undefined') artists_grouped_by_countries[country] = []
            artists_grouped_by_countries[country].push(element.artist)
          })
        })

        createFormAndViz('Pays')
      })
    })
  }) 
}

/**
 * Navigue vers l'onglet du menu approprié
 * @param {HTMLElement} element Élément du menu cliqué
 * @param {string} value Potentielle valeur avec laquelle initialiser la nouvelle vue (pays ou artiste ou titre)
 * @param {string} additionalValue Potentielle valeur additionnelle utile avec laquelle initialiser la nouvelle vue (artiste associé au titre)
 */
 export function navigate(element, value, additionalValue) {
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
var artists_grouped_by_countries = {}
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
  endMonth: '12',
  isArtist: false,
  isCountries: false
}



/* Private function*/

/**
 * Create the header form link to the tab
 * @param {string} tab Nom de la vue à générer (Pays, Tendances, Artiste ou Titre)
 * @param {string} value Potentielle valeur avec laquelle initialiser la nouvelle vue (pays ou artiste ou titre)
 * @param {string} additionalValue Potentielle valeur additionnelle utile avec laquelle initialiser la nouvelle vue (artiste associé au titre)
 */
function createFormAndViz(tab, value, additionalValue) {
    let artist
    switch(tab) {
      case "Pays":
        state.country = value ? value : state.country
        createDatePickers()
        createSuggestbox('Pays', countries.map(d => d.country), state.country)
        createToogle(tab)
        createCountryVisualisation(getCountryCode(state.country), state.country, state.startDate, state.endDate, state.isArtist)
        break
      case "Tendances":
        createMonthDayPickers()
        createSuggestbox('Pays',  countries.map(d => d.country), state.country)
        createTrendsVisualisation(state.startDay,state.startMonth,state.endDay,state.endMonth,getCountryCode(state.country),state.country)
        break
      case "Artiste":
        artist = value ? value : randomValue(artists_grouped_by_countries[getCountryCode(state.country)])
        //Création des éléments
        createDatePickers()
        createSuggestbox('Artiste', artists, artist)
        createToogle(tab)
        createSuggestbox('Pays', countries.map(d => d.country), state.country, state.startDate, state.endDate)
        if (state.isCountries) {
          let countries_to_keep = getCountriesForArtist(artist)
          const index = countries_to_keep.indexOf('global')
          if (index != -1) { countries_to_keep.splice(index, 1) }
          countries_to_keep = countries.filter(element => countries_to_keep.includes(element.code))
          createArtistVisualisation_Countries(artist, countries_to_keep, state.startDate, state.endDate)
        } else createArtistVisualisation(artist,state.startDate,state.endDate, getCountryCode(state.country), state.country)
        //Adaptation de la largeur pour s'adapter aux éléments supplémentaires
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
  //Reset de la validation des changements
  d3.selectAll(".suggestboxes input").on("change",function() {
    this.setCustomValidity("")
  }) 
}

/**
 * Reset le formulaire (header)
 * @param {string} tab Nom de la vue (Pays, Tendances, Artiste ou Titre)
 */
function resetForm(tab) {
  d3.selectAll('.suggestbox').remove()
  d3.selectAll('.toogle').remove()
  d3.select('.suggestboxes').style('width','700px')
  //Selection du bon choix de temps (jour VS période)
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
 * Crée une suggestox étant donné le label
 * @param {string} label Label à utiliser
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
  
  //Plus rapide que D3
  data.forEach((d) => {
    const option = "<option value=\"" + d + "\"></option>"
    $('#list' + label).append(option)
  });
}

/**
 * Crée le toggle associé à la vue
 * @param {string} tab Nom de la vue (Pays, Tendances, Artiste ou Titre)
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

  const input = toogle
  .append('input')
  .attr('type','checkbox')
  .attr('value','artist')
  .attr('name','aggregation')

  if (tab == 'Artiste') input.on('click', function() {updateForm(this)})
  else input.on('click', updateSelection)

  toogle.append('span').attr('class','slider')

  container
  .append('span')
  .text(value)
  .attr('class','option')

  if (tab == 'Artiste' && state.isCountries) {
    input.property('checked','true')
    updateForm(input.node())
  }
  else if (tab == 'Pays' && state.isArtist) {
    input.property('checked','true')
    updateSelection(input.node())
  }
}

/**
 * Active/Désactive le datepicker conformément à la sélection
 * @param {string} selection Jour ou période
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
 * Parse les paramètres
 * @param {string} params Paramètres à parser
 * @returns {object[]} Paramètres parsés
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
 * Récupère les données du formulaire
 * @param {event} e Évènement de soumission du formulaire
 */
function submit(e) {
  //Prévention de la soumission par défaut
  e.preventDefault();
  //Utilisation de JQuery pour récupèrer les données
  const rawParams = $('#form').serialize();
  let params = parseParams(rawParams)
  if (isFormValid(params)) {
    params = processParams(params)
    resetDataviz()
    if(!d3.select('#menuList li:nth-child(1).selected').empty()){ //Pays
      state.isArtist = params.findIndex( v => v[0] == 'aggregation') >= 0
      const offset = state.isArtist ? 1 : 0

      const countryCode = params[0][2]
      state.country = params[0][1]
      state.startDate = params[2 + offset][1]
      state.endDate = params[3 + offset] ? params[3 + offset][1] : null
      createCountryVisualisation(countryCode, state.country, state.startDate, state.endDate, state.isArtist)
    }
    if(!d3.select('#menuList li:nth-child(2).selected').empty()){  //Artiste
      state.isCountries = params.findIndex( v => v[0] == 'aggregation') >= 0

      const artist = params[0][1]
      state.startDate = params[3][1]
      state.endDate = params[4] ? params[4][1] : null
      
      if (state.isCountries) {
        let countries_to_keep = getCountriesForArtist(artist)
        const index = countries_to_keep.indexOf('global')
        if (index != -1) { countries_to_keep.splice(index, 1) }
        countries_to_keep = countries.filter(element => countries_to_keep.includes(element.code))
        createArtistVisualisation_Countries(artist, countries_to_keep, state.startDate, state.endDate)
      } else {
        const countryCode = params[1][2]
        state.country = params[1][1]
        createArtistVisualisation(artist, state.startDate, state.endDate, countryCode, state.country)
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
 * Crée les champs de sélection jour et mois (pour Tendances)
 */
function createMonthDayPickers(){
  //Utilisation de JQuery pour ajouter les éléments à une position spécifique
  const daySelect = "<select name='day' value='01'></select>"
  const monthSelect = "<select name='month' value='01'></select>"

  $("input[type='date']").after(daySelect)
  $("select").after(monthSelect)

  const months = ['01','02','03','04','05','06','07','08','09','10','11','12']
  const days = months.concat(['13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'])

  d3.selectAll("#day select").property("disabled",true)
  d3.selectAll("select[name='day']").selectAll("option").data(days).enter().append("option")
    .attr('selected', d => d == state.startDay ? "selected" : null)
    .attr('value', d => d)
    .text(d => d)
  d3.selectAll("select[name='month']").selectAll("option").data(months).enter().append("option")
    .attr('selected', d => d == state.startMonth ? "selected" : null)
    .attr('value', d => d)
    .text(d => d)

  if($("#day input[type='radio']").is(":checked")) {
    selectField('day')
  } else { 
    selectField('period')
  }

  d3.selectAll("input[type='date']").remove()

  //Set des valeurs par défaut
  const endDay = state.endDay ? state.endDay : '31'
  const endMonth = state.endMonth ? state.endMonth : '12'
  d3.select("#period select:nth-child(5)").selectAll('option').attr('selected', d => d == '31' ? "selected" : null)
  d3.select("#period select:nth-child(6)").selectAll('option').attr('selected', d => d == '12' ? "selected" : null)

  //Reset de la validation des changements
  d3.selectAll("select").on("change",function() {
    this.setCustomValidity("")
  })
}

/**
 * Crée les champs de sélection de date (pour Pays, Artiste et Titre)
 */
function createDatePickers() {
    //Utilisation de JQuery pour ajouter les éléments à une position spécifique
    const datepicker =  "<input type='date' name='date' value='" + state.startDate +"' min='2017-01-01' max='2020-04-20'></input>"
    const endDate = state.endDate ? state.endDate : '2020-04-20'
    $("select[name='month']").after(datepicker)

    if($("#day input[type='radio']").is(":checked")) {
      selectField('day')
    } else { 
      selectField('period')
    }

  //Reset de la validation des changements
  d3.selectAll("#period input").on("change",function() {
    this.setCustomValidity("")
  })

  d3.selectAll("select").remove()
  d3.select("#period input[type='date']:nth-child(4)").attr('value',endDate)
}

/**
 * Récupère tous les titres d'un artiste
 * @param {string} artist L'artiste
 * @returns {string[]} Les titres de l'artiste
 */
function getArtistTracks(artist) {
  return tracks_data
          .filter( track => track.artist == artist)
          .map(track => track.track)
}

/**
 * Récupère tous les pays dans lesquels le titre apparaît
 * @param {string} title Le titre
 * @param {string} artist L'artiste associé au titre
 * @returns {string[]} Les pays
 */
function getCountriesForTrackArtist(title, artist) {
  return tracks_data
          .filter( track => track.artist == artist && track.track == title)[0].countries
}

/**
 * Récupère tous les pays dans lesquels l'artiste apparaît
 * @param {string} artist L'artiste
 * @returns {string[]} Les pays
 */
function getCountriesForArtist(artist) {
  return artists_countries
          .filter( e => e.artist == artist )[0].countries
}

/**
 * Charge les titres associés à l'artiste sélectionné
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
 * Vérifie si une date est valide
 * @param {string} day Jour sélectionné
 * @param {string} month Mois sélectionné
 * @param {string} duration 
 * @returns {boolean} Vrai si la date est valide
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
 * Vérifie la validité des données du formulaire
 * @param {object[][]} params Données entrées dans le formulaire
 * @returns {boolean} Vrai si le formulaire est valide
 */
function isFormValid(params) {
  let validationResult = true;    
  //Validation : Jour
    let index = params.findIndex( v => v[0] == 'duration')
    //Tab tendances
    if(params[index][0] == 'duration' && params[index][1] == 'day') {
      if (params[index + 1][0] == 'day') {
        const day = params[index + 1][1]
        const month =  params[index + 2][1]
        validationResult = !isDateInvalid(day,month,'day')
      }
    //Validation : Période
    } else {
      let startDate
      let endDate

      //Tab tendances
      if(params[index + 1][0] == 'day')  {
        const startDay = params[index + 1][1]
        const startMonth =  params[index + 2][1]
        const endDay =  params[index + 3][1]
        const endMonth =  params[index + 4][1]
        if (isDateInvalid(startDay,startMonth,'period') || isDateInvalid(endDay,endMonth,'period')) {
          validationResult = false
        }
        startDate = new Date(startMonth + '-' + startDay)
        endDate = new Date(endMonth + '-' + endDay)
      //Autres tabs
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
    //Validation Artiste, Pays et Titre
    index = params.findIndex( v => v[0] == 'Pays')
    if (index >= 0) validationResult = validationResult && validateField(params[index][1],'Pays')

    index = params.findIndex( v => v[0] == 'Artiste')
    if (index >= 0) validationResult = validationResult && validateField(params[index][1],'Artiste')

    index = params.findIndex( v => v[0] == 'Titre')
    if (index >= 0) validationResult = validationResult && validateField(params[index][1],'Titre')
  return validationResult
  }

  /**
   * Vérifie la validité d'un champ du formulaire
   * @param {string} fieldValue Valeur du champ
   * @param {string} fieldName  Nom du champ
   * @returns {boolean} Vrai si le champ est valide
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
    
    //Affichage d'une erreur
    const error = word + fieldName.toLowerCase() + " " + fieldValue +" n'existe pas"
    d3.select("#" + fieldName).node().setCustomValidity(error)
    d3.select("#" + fieldName).node().reportValidity()
    return false
  }

  /**
   * Choix d'une valeur aléatoire dans un tableau
   * @param {any[]} array Tableau
   * @returns {any} Élément sélectionné aléatoirement
   */
  function randomValue(array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  /**
   * Process des paramètres du formulaire
   * @param {object[][]} params Paramètres entrés dans le formulaire
   * @returns {object[][]} Paramètres après process
   */
  function processParams(params) {
    const index = params.findIndex( v => v[0] == 'Pays')
    if(index >= 0) params[index].push(getCountryCode(params[index][1]))
    return params
  }

  /**
   * Retourne le code associé à un pays
   * @param {string} country Nom du pays
   * @returns {string} Code du pays
   */
  function getCountryCode(country) {
    const index = countries.findIndex(v => v.country == country)
    return countries[index].code
  }

  /**
   * Réinitialise la vue
   */
  function resetDataviz() {
    d3.selectAll('#main-g').remove()
    //Disable menu and submit button during the load
    d3.selectAll('li').on("click", null)
    d3.select('input[type="submit"]').property('disabled',true)
  }

  /**
   * Cache/Montre la suggestbox Pays en fonction de la position du toggle (Explorer par Artiste)
   * @param {object} element La suggestbox
   */
  function updateForm(element) {
    updateSelection(element)
    if(element.checked) {
      d3.select('#suggestbox_Pays').style('opacity','0')
      d3.select('#suggestbox_Pays input').property('disabled',true)
    } else {
      d3.select('#suggestbox_Pays').style('opacity','100')
      d3.select('#suggestbox_Pays input').property('disabled',false)
    }
  }

  /**
   * Met en gras le texte de la sélection courante du toggle (Explorer par Artiste)
   * @param {object} element La suggestbox
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
