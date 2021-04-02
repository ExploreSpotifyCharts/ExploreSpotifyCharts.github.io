/*Change viz and menu color on click*/
function navigate(element) {
  console.log(element.innerText)
  d3.selectAll('li').attr('class', null)
  d3.select(element).attr('class', 'selected')
}


function createForm() {
    const data = ['','France','USA','Finlande','Test1', 'Test2']
    createSuggestbox('Pays', data)
}

function destroyFrom() {

}

function refresh(element) {
  element.nextElementSibling.value = element.value
}

/**
 * Create a suggestbox tag with the given label
 * @param {string} label 
 */
function createSuggestbox(label,data) {
  const form = d3.select('form')

  form.append('label')
  .attr('for', label)
  .text(label + ":")

  form.append('input')
  .attr('list', "list" + label)
  .attr('name', label.slice(0,label.length))
  .attr('id', label)

  form
  .append('datalist')
  .attr('id', "list" + label)
  .selectAll('option')
  .data(data).enter()
  .append('option')
  .attr('value', d => d)
}

/* Initialize view element */
export function initialize() {
  d3.selectAll('li').on("click", function() {navigate(this)})
  createForm()
}