/**
 * Initialisation du gradient de couleur pour l'échelle
 *
 * @param {*} colorScale L'échelle de couleurs
 */
 export function initGradient (colorScale, id) {
  
    const defs = d3.select('.info-g').append('defs')
  
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
 */
export function initLegendBar (id) {
  d3.select('.info-g').append('rect').attr('id', id)
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
 export function draw (x, y, height, width, fill, id) {
    d3.select(id)
        .attr('x',x)
        .attr('y',y)
        .attr('height',height)
        .attr('width',width)
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
    d3.select('.info-g').append('text')
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
    let textSvg = d3.select('.info-g').append('text')
      .attr('class', 'legend max')
      .attr('fill', 'white')
      .text(max)
    
    let offset = textSvg.node().getComputedTextLength()

    textSvg.attr('x', x-offset-margin).attr('y', y-margin)
}

