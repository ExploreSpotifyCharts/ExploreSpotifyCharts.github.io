/**
 * Génère l'échelle de couleur
 *
 * @param {int} min la valeur minimum
 * @param {int} max la valeur maximum
 * @param {string} startingColor code hexa de la couleur de début de l'échelle
 * @param {string} endingColor code hexa de la couleur de fin de l'échelle
 * @returns {object} l'échelle générée
 */
 export function createColorScale (min, max, startingColor, endingColor) {
  return d3.scaleLinear()
  .domain([min, max])
  .range([startingColor, endingColor])
}

/**
 * Affichage du titre de la légende
 * @param {int} x La position du titre et de la ligne en largeur
 * @param {int} y La position du titre en hauteur
 * @param {int} legendWidth La largeur totale de la légende
 * @returns {int} La hauteur du titre de la légende
 */
 export function writeLegendTitle (x, y, legendWidth) {
  let textSvg = d3.select('.legend-g').append('text')
    .attr('id', 'legendtitle')
    .attr('fill', 'white')
    .text('Échelles')

  textSvg.attr('x',x).attr('y', y)

  let lineSvg = d3.select('.legend-g').append('line')
    .attr('x1', x)
    .attr('x2', x+legendWidth)
    .attr('y1', y+5)
    .attr('y2', y+5)
    .style('stroke-width', 2)
    .style('stroke', 'white')

  return textSvg.node().getBBox().height + lineSvg.node().getBBox().height
}

/**
 * Affichage du label d'une échelle
 * @param {string} label Le label à écrire
 * @param {int} x Le positionnement horizontal du label
 * @param {int} y Le positionnement vertical du label
 */
 export function writeLabel(label, x, y) {
  let textSvg = d3.select('.legend-g').append('text')
    .attr('fill','white')
    .attr('class', 'legendlabel')
    .text(label)
    .attr('y',y)
    .attr('x',x)
}

/**
 * Initialisation du gradient de couleur pour l'échelle
 *
 * @param {*} colorScale L'échelle de couleurs
 * @param {string} id L'id du gradient
 */
 export function initGradient (colorScale, id) {
  
    const defs = d3.select('.legend-g').append('defs')
  
    const linearGradient = defs
      .append('linearGradient')
      .attr('id', id)
      .attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%')
  
    linearGradient.selectAll('stop')
      .data(colorScale.ticks().map((tick, i, nodes) => (
        {
          offset: `${100 * (i / nodes.length)}%`,
          color: colorScale(tick)
        })))
      .join('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color)
  }
  
/**
 * Initialisation du rectangle contenant le gradient
 * @param {string} id L'id du rect
 */
export function initLegendBar (id) {
  d3.select('.legend-g').append('rect').attr('id', id)
  }

/**
 * Affichage du gradient
 *
 * @param {number} x La position x de l'échelle
 * @param {number} y La position y de l'échelle
 * @param {number} height La hauteur de l'échelle
 * @param {number} width La largeur de l'échelle
 * @param {string} fill Le remplissage de l'échelle
 */
 export function draw (x, scaleDimensions, fill, id, offset) {
    d3.select(id)
        .attr('x',x)
        .attr('y',scaleDimensions.marginTop+offset)
        .attr('height',scaleDimensions.height)
        .attr('width',scaleDimensions.width)
        .attr('fill',fill)
    }

/**
 * Affichage de la borne minimale de l'échelle
 * @param {number} min La borne à afficher
 * @param {number} x La position x du texte
 * @param {number} y La position y du text
 * @param {number} margin La marge par rapport au rectangle du gradient
*/
    export function writeLegendMin (min, x, y, margin) {
    d3.select('.legend-g').append('text')
      .attr('class', 'legend min')
      .attr('x', x+margin)
      .attr('y', y-margin)
      .attr('fill', 'white')
      .text(min)
}

/**
 * Affichage de la borne maximale de l'échelle
 * @param {number} max La borne à afficher
 * @param {number} x La position x du texte
 * @param {number} y La position y du text
 * @param {number} margin La marge par rapport au rectangle du gradient
 */
 export function writeLegendMax (max, x, y, margin) {
    let textSvg = d3.select('.legend-g').append('text')
      .attr('class', 'legend max')
      .attr('fill', 'white')
      .text(max)
    
    let offset = textSvg.node().getComputedTextLength()

    textSvg.attr('x', x-offset-margin).attr('y', y-margin)
}

/**
 * Affichage d'une échelle
 * @param {string} label Le label écrit devant l'échelle
 * @param {object} placingVariables Un objet contenant toutes la variables nécessaires au placement des éléments
 * @param {*} colorScale L'échelle de couleur pour la création du gradient
 * @param {object} ids Un objet contenant les id des différents éléments à créer
 * @param {object} scaleDimensions Un objet contenant les différentes dimensions ayant attrait à une échelle
 * @param {object} minMax Un objet contenant les valeurs max et min de l'échelle
 * @param {int} offset Le décalage vertical de l'échelle
 */
export function appendScale (label, placingVariables, colorScale, ids, scaleDimensions, minMax, offset) {
  //Ecriture du label
  writeLabel(label, placingVariables.xLegend, placingVariables.yText+offset)
  //Affichage du gradient
  initGradient(colorScale, ids.gradient)
  initLegendBar(ids.scale)
  draw(placingVariables.xScale, scaleDimensions, 'url(#' + ids.gradient +')', '#'+ids.scale, offset)
  //Affichage des bornes de l'échelle
  writeLegendMin(minMax.min, placingVariables.xScale, placingVariables.yText+offset, scaleDimensions.textMargin)
  writeLegendMax(minMax.max, placingVariables.xScale+scaleDimensions.width, placingVariables.yText+offset, scaleDimensions.textMargin)
}
