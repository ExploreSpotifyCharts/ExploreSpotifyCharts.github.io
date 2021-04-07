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
    
    g.append('g').attr('class', 'info-g')
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
 * Génère l'échelle de couleur
 *
 * @param {object} min la valeur minimum
 * @param {object} max la valeur maximum
 */
 export function createColorScale (min, max) {
    return d3.scaleLinear()
    .domain([min, max])
    .range(['#000000', '#1db954'])
}

/**
 * Met à jour la longeur du svg contenant la vizualisation
 *
 */
 export function updateSvg () {
    let infoHeight = d3.select('#main-g').node().getBBox().height
    d3.select('svg').attr('height', infoHeight+50)
}

