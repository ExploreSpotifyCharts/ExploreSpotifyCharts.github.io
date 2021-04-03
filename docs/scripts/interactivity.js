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
    const titles = []

    switch(tab) {
      case "Pays":
      case "Tendances":
        createSuggestboxe('Pays', countries)
        break
      case "Artiste":
        createSuggestboxe('Artiste', artists)
        createSuggestboxe('Pays', countries)
        break
      case "Titre":
        createSuggestboxe('Titre', titles)
        break
    }

    createDatePickers()  
}

/**
 * Empty the form
 */
function resetForm() {
  d3.selectAll('.suggestboxe').remove()
}

/**
 * Create a suggestbox tag with the given label
 * @param {string} label 
 */
function createSuggestboxe(label,data) {
  const suggestboxe = d3.select('form .suggestboxes').append('div').attr('class','suggestboxe')

  suggestboxe
  .append('label')
  .attr('for', label)
  .text(label + ":")

  suggestboxe
  .append('input')
  .attr('list', "list" + label)
  .attr('name', label)
  .attr('id', label)

  suggestboxe
  .append('datalist')
  .attr('id', "list" + label)
  .selectAll('option')
  .data(data).enter()
  .append('option')
  .attr('value', d => d)
}

function createDatePickers(){
  
}

/*Public function*/

/* Initialize view element */
export function initialize() {
  d3.selectAll('li').on("click", function() {navigate(this)})
  createForm()
}