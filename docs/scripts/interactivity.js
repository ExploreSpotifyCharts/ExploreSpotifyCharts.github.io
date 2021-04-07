
/*Public function*/

/* Initialize view element */
export function initialize() {
  //Add events listerners to reactive elements
  d3.selectAll('li').on("click", function() {navigate(this)})
  d3.selectAll('input[type="radio"]').on("click", function() {selectField(this.value)})

  //Using jQuery because d3 do not support submit event
  $('#form').on('submit', submit)

  createForm('Pays')

  //Load data
  const PATH = './' //for Tanguy : './'
  d3.csv(PATH+'artistes'+'.csv', d3.autoType).then(function (data_artistes) {
    array_artistes = data_artistes.map(line => String(line['Artist']))
    d3.csv(PATH+'titres'+'.csv', d3.autoType).then(function (data_titres) {
      array_titles = data_titres.map(line => {
        return {Artist: String(line['Artist']), Track: String(line['Track Name'])}
      })
    })  
  })
}

/* Global var */

var array_titles = [];
var array_artistes = [];
const countries = ['France','USA','Finlande']
var artistTracks = []

/* Private function*/

/**
 * Navigate to the selected tab
 * @param {HTMLElement} element 
 */
function navigate(element) {
  const tab = element.innerText
  d3.selectAll('li').attr('class', null)
  d3.select(element).attr('class', 'selected')
  resetForm()
  createForm(tab)
}

/**
 * Create the header form link to the tab
 * @param {String} tab 
 */
function createForm(tab) {

    switch(tab) {
      case "Pays":
        createDatePickers()
        createSuggestbox('Pays', countries, 'Monde')
        break
      case "Tendances":
        createMonthDayPickers()
        createSuggestbox('Pays', countries, 'Monde')
        break
      case "Artiste":
        createDatePickers()
        createSuggestbox('Artiste', array_artistes, 'Angèle')
        createSuggestbox('Pays', countries, 'Monde')
        break
      case "Titre":
        createDatePickers()
        createSuggestbox('Artiste', array_artistes, 'Angèle')

        $('#Artiste').on('input',updateTrackList)
        
        artistTracks = getArtistTracks('Angèle')
        createSuggestbox('Titre', artistTracks, artistTracks[0])
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
  .text(label + ":")

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
    return [paramKeyValue[0] , paramKeyValue[1]]
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
  const params = parseParams(rawParams)
  console.log(params)
  if (isFormValid(params)) {
    console.log(params)
    /* Do something with the parameters */
  } else {
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
    const datepicker =  "<input type='date' name='date' value='2017-01-01'  min='2017-01-01' max='2021-01-01'></input>"
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
}

/**
 * Retrieve all artist's tracks
 * @param {string} artist 
 * @returns {string[]}
 */
function getArtistTracks(artist) {
  return array_titles
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
    const artistTracks = getArtistTracks(currentVal)
    d3.select("#Titre").attr('value',artistTracks[0])
    d3.selectAll("#listTitre option").remove()
    d3.select("#listTitre").selectAll("option").data(artistTracks).enter().append('option').attr('value',d => d)
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
        $("#" + duration + " select")[0].setCustomValidity(error)
        $("#" + duration + " select")[0].reportValidity()
        return false
      }
    case '02':
      if (parseInt(day)>29) {
        $("#" + duration + " select")[0].setCustomValidity(error)
        $("#" + duration + " select")[0].reportValidity()
        return false
      }
    default:
      return true
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
        $("#period input[type='date']")[0]?.setCustomValidity(error)
        $("#period input[type='date']")[0]?.reportValidity()   
        $("#period select")[0]?.setCustomValidity(error)
        $("#period select")[0]?.reportValidity()                
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
        data = countries
        break
      case 'Artiste':
        data = array_artistes
        word = "L' "
        break
      case 'Titre':
        data = artistTracks
        break
    }
    if(data.filter(value => value == fieldValue).length > 0) return true
    //Display error if the field is invalid
    const error = word + fieldName.toLowerCase() + " " + fieldValue +" n'existe pas"
    $("#" + fieldName)[0].setCustomValidity(error)
    $("#" + fieldName)[0].reportValidity()
    return false
  }