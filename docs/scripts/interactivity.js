/* Private function*/

/**
 * Navigate to the selected tab
 * @param {*} element 
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
  //Mock data for the test
    const countries = ['France','USA','Finlande','Test1', 'Test2']
    const artists = ['Ed Sheran','Angèle','Lompale','Roméo Elvis','Therapie TAXI']
    const titles = ['titre1','titre2','titre3']

    switch(tab) {
      case "Pays":
      case "Tendances":
        createSuggestbox('Pays', countries, 'Monde')
        break
      case "Artiste":
        createSuggestbox('Artiste', artists, '???')
        createSuggestbox('Pays', countries, 'Monde')
        break
      case "Titre":
        createSuggestbox('Titre', titles, '???')
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
function createSuggestbox(label,data, defaultValue) {
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
  .selectAll('option')
  .data(data).enter()
  .append('option')
  .attr('value', d => d)
}


function selectField(element){
  if (element.value == "day") {
    d3.selectAll("#day input[type='date']").property("disabled",false)
    d3.selectAll("#period input[type='date']").property("disabled",true)
  } else {
    d3.selectAll("#period input[type='date']").property("disabled",false)
    d3.selectAll("#day input[type='date']").property("disabled",true)
  }
}

/*Public function*/

/* Initialize view element */
export function initialize() {
  //Add events listerners to reactive elements
  d3.selectAll('li').on("click", function() {navigate(this)})
  d3.selectAll('input[type="radio"]').on("click", function() {selectField(this)})

  createForm('Pays')
}