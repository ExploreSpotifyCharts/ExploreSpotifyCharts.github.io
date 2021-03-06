import {navigate} from './interactivity.js'

/**
 * Génère le SVG qui contient toute la visualisation
 *
 * @param {object} margin Les marges autour du svg
 * @returns {*} La sélection contenant le g créé
 */
 export function generateG (margin, svgWidth, svgHeight) {
  d3.select('.viz-container')
  .select('svg').attr('width', svgWidth).attr('height', svgHeight)

    let g = d3.select('.viz-container')
      .select('svg')
      .append('g')
      .attr('id', 'main-g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')')
    
    let info = g.append('g').attr('class', 'info-g')
    info.append('g').attr('class', 'legend-g')
    g.append('g').attr('class', 'graph-g')

    return g
}

/**
 * Génère le titre de la visualisation
 *
 * @param {object} g Le svg dans lequel on ajoute le titre
 * @param {object} title Le titre à afficher
 */
 export function appendTitle (g, title) {
     return g.append('text')
     .attr('class', 'titre-viz')
     .attr('fill', 'white')
     .text(title)
}

/**
 * Détermine les valeurs min et max des streams
 *
 * @param {object} data La data à étudier
 * @returns {object} Un objet avec le min et le max
 */
 export function getMinMaxStreams (data) {
  //Valeurs extrêmes de stream sur un jour
  let min_stream = Number.POSITIVE_INFINITY
  let max_stream = Number.NEGATIVE_INFINITY
  data.forEach(function(d){
      //Minimum
      const min_current = d3.min(d.Streams, k => k.Streams)
      min_stream = Math.min(min_stream, min_current)
      //Maximum
      const max_current = d3.max(d.Streams, k => k.Streams)
      max_stream = Math.max(max_stream, max_current)
  })
  var result = {min: min_stream, max: max_stream}
  return result
}


/**
 * Met à jour la longeur du svg contenant la vizualisation
 *
 */
 export function updateSvg () {
    let infoHeight = d3.select('#main-g').node().getBBox().height
    d3.select('svg').attr('height', infoHeight+50)
}

/**
 * Formate un nombre long en introduisant des espaces entre trois digits
 * @param {number} num Le nombre long à formater
 * @returns {string} Le nombre long formaté
 */
export function formatNumber(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
}

/**
 * Formate une date de YYYY-MM-DD à DD/MM/YYYY
 * @param {string} input La date à formater
 * @returns {string} La date formatée
 */
export function formatDate(input) {
  if(input == null) return null
  let datePart = input.split('-')
  let year = datePart[0]
  let month = datePart[1]
  let day = datePart[2]

  return day+'/'+month+'/'+year;
}

/**
 * Génère un texte affichant une erreur
 *
 * @param {string} error L'erreur à afficher
 */
export function appendError (g, error) {
  return g.append('text')
   .attr('class', 'error-viz')
   .attr('fill', 'white')
   .text(error)
}


/**
 * Vérifie si un objet est vide ou non
 *
 * @param {object} object L'objet à étudier
 * @returns {bool} Vrai si l'objet est vide
 */
 export function isEmptyObject (object) {
  return Object.keys(object).length === 0
}

/**
 * Autorise l'interaction puisque la visualisation est chargée
 */
export function enabledInteraction() {
   d3.selectAll('li').on("click", function() {navigate(this)})
   d3.select("input[type=submit]").property('disabled',false)
}
