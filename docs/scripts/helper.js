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
 export function appendTitle (title) {
    d3.select('.info-g')
     .append('text')
     .attr('class', 'titre-viz')
     .attr('fill', 'white')
     .text(title)
}

/**
 * Détermine les valeurs min et max des streams
 *
 * @param {object} data la data à étudier
 * @returns {object} un objet avec le min et le max
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

