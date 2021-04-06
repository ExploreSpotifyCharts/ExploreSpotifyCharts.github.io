
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
        
        const artistTracks = getArtistTracks('Angèle')
        createSuggestbox('Titre', artistTracks, artistTracks[0])
        break
    } 
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
    let objParam = {}
    objParam[paramKeyValue[0]] = paramKeyValue[1]
    return objParam
  })
  return param_array
}

/**
 * Get data from the formular
 * @param {event} e 
 */
function submit(e) {
  //Prevent formt to be submitted
  e.preventDefault();
  //Using JQuery to get form data
  const rawParams = $('#form').serialize();
  const params = parseParams(rawParams)
  console.log(params)
  //Do something with the data
}

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
}

function createDatePickers() {
    //Using JQuery to append elements to a specific position
    const datepicker =  "<input type='date' name='date' value='2017-01-01'  min='2017-01-01' max='2021-01-01'></input>"
    $("select[name='month']").after(datepicker)

    if($("#day input[type='radio']").is(":checked")) {
      selectField('day')
    } else { 
      selectField('period')
    }

    d3.selectAll("select").remove()
}

function getArtistTracks(artist) {
  return array_titles
          .filter( track => track.Artist == artist)
          .map(track => track.Track)
}

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