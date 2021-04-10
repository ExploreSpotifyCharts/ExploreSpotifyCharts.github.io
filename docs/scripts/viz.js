import * as helper from './helper.js'
import * as legend from './legend.js'

//Constantes pour l'échelle
const scaleDimensions = {
  width: 300,
  height: 18,
  textMargin: 3,
  marginTop: 30,
}

const legendWidth = 400

//Constante pour la heatmap
const heatmap = {
  width: 700,
  height: 20,
  padding: 5
}

/**
 * Affiche les échelles de couleurs
 *
 * @param {object} data Data pour la construction des échelles
 * @param {int} vizWidth Largeur de la viz pour le placement des éléments
 * @returns {object} Les colorscale à utiliser pour les heatmap
 */
 export function appendColorScales(data, vizWidth) {
  //Valeurs extrêmes pour les bornes de l'échelle
  var minMaxStreams = helper.getMinMaxStreams(data.slice(1))
  var minMaxTotal = helper.getMinMaxStreams(data.slice(0,1))

  //Création des échelles de couleur
  const colorScaleStreams = legend.createColorScale(minMaxStreams.min, minMaxStreams.max, '#000000', '#1DB954')
  const colorScaleTotal = legend.createColorScale(minMaxTotal.min, minMaxTotal.max,'#000000', '#FF7C00')
  var colorScales = {streams: colorScaleStreams, total: colorScaleTotal}

  //Variables pour le placement des éléments
  const placingVariables = {
    titleHeight: d3.select('.titre-viz').node().getBBox().height,
    xLegend: vizWidth - legendWidth, 
    xScale: vizWidth - scaleDimensions.width,
  }
  placingVariables.legendTitleHeight = legend.writeLegendTitle(placingVariables.xLegend, placingVariables.titleHeight, legendWidth), //Affichage du titre
  placingVariables.yText = placingVariables.titleHeight + placingVariables.legendTitleHeight + scaleDimensions.height/2

  //Id suivant les échelles
  const idTotal = {gradient: 'gradientTotal', scale: 'scaleTotal'}
  const idStreams = {gradient: 'gradientStreams', scale: 'scaleStreams'}

  //Affichage des échelles
  legend.appendScale('Total : ', placingVariables, colorScaleTotal, idTotal, scaleDimensions, minMaxTotal, 0)
  legend.appendScale('Par Titre: ', placingVariables, colorScaleStreams, idStreams, scaleDimensions, minMaxStreams, scaleDimensions.height+2)

  return colorScales
      
}


/**
 * Génère les dates
 *
 * @param {string} startDate Date de début de l'affichage des données
 * @param {string} endDate Date de fin de l'affichage des données
 * @param {int} vizWidth Largeur de la viz pour le placement
 */
 export function appendDates(startDate, endDate, vizWidth) {
    let infoSize = d3.select('.info-g').node().getBBox()
    let titleSize = d3.select('.column-titles-g').node().getBBox()
    let verticalOffset = infoSize.height + titleSize.height + 20

    //Définit un groupe qui contiendra les dates avec le bon décalage
    let g = d3.select('.graph-g')
      .append('g')
      .attr('class', 'dates-g')
      .attr('transform','translate(0 ,' + verticalOffset + ')')

    //Affichage Dates
    let startDateText = g.append('text').text(helper.formatDate(startDate)).attr('fill', 'white').attr('class', 'date-viz')
    let endDateText = g.append('text').text(helper.formatDate(endDate)).attr('fill', 'white').attr('class', 'date-viz')

    //Placement des dates
    let HorizontalOffsetStart = (vizWidth - heatmap.width)/2
    startDateText.attr('transform', 'translate(' + HorizontalOffsetStart + ', 0)')

    let offset = endDateText.node().getComputedTextLength()
    let HorizontalOffsetEnd = (vizWidth - heatmap.width)/2 + heatmap.width - offset
    endDateText.attr('transform', 'translate(' + HorizontalOffsetEnd + ', 0)')
  
 }

/**
 * Génère le titre de la chanson pour une ligne
 *
 * @param {object} g La sélection dans laquelle on ajoute le titre
 * @param {string} trackName Titre de la chanson
 * @param {int} key L'index de la chanson pour la classe personnalisée
 */
 export function createTrack (g, trackName, key, isTotal) {
    if (trackName.length > 25) { //Si le titre est trop long, on le tronque
        trackName = trackName.slice(0, 24)
        trackName = trackName + '...'
    }
    let textSvg = g.append('text')
     .text(trackName)
     .attr('class', 'trackname-viz track'+String(key))
     .attr('fill', 'white')

    if(isTotal){
      textSvg.style('font-weight', 'bold')
    }
 }

 /**
 * Génère les statistiques pour une chanson
 *
 * @param {object} g La sélection dans laquelle on ajoute les nombress
 * @param {int} streams Le nombre de streams sur la période donnée
 * @param {int} proportion Le pourcentage que représente le nombre de streams sur le nombre de streams total de l'artiste
 * @param {int} vizWidth La largeur de la viz pour le placement du text
 */
  export function createStreamStats (g, streams, proportion, vizWidth) {
    let statText = '(' + (Math.round(proportion*100)/100).toFixed(2) + '%)'
    let percentage = g.append('text')
     .text(statText)
     .attr('class', 'percentage-streams')
     .attr('fill', 'white')

    let nbstreams = g.append('text')
     .text(helper.formatNumber(streams))
     .attr('class', 'nbstreams-values')
     .attr('fill', 'white')

    let percentageOffset = vizWidth - percentage.node().getComputedTextLength()
    percentage.attr('transform', 'translate('+ percentageOffset + ',0)')

    
    let streamOffset = vizWidth -  (d3.select('#nb-streams').node().getComputedTextLength()/2) - nbstreams.node().getComputedTextLength()
    nbstreams.attr('transform', 'translate('+ streamOffset + ',0)')

    
 }

/**
 * Génère une ligne de heatmap
 *
 * @param {object} g La sélection dans laquelle on ajoute la heatmap
 * @param {object} data_line L'objet contenant les données pour la ligne
 * @param {int} key L'index pour le marquage de la données
 * @param {object} color L'échelle de couleur utilisée
 * @param {int} xOffset Le décalaga initial de la heatmap
 * @param {int} y Positionnement de la heatmap en vertical
 */
export function createHeatMap (g, data_line, key, color, xOffset, y) {
    const width_size = heatmap.width/data_line.length
      g.selectAll("rect.marker"+String(key))
      .data(data_line)
      .enter()
      .append("rect")
      .attr("class", "marker"+String(key))
      .attr("x", (d, i) => String(xOffset + width_size*i)+"px")
      .attr("y", -y) //Décalage du au fait que le rect se positionne automatiquement sous le texte dans le g
      .attr('height', heatmap.height + "px")
      .attr('width', width_size + "px")
      .attr('fill',d => color(d.Streams))
  }

/**
 * Map du hover (tooltip) pour l'interaction avec les rectangles des heatmaps
 *
 * @param {object} g La sélection dans laquelle on récupère les objets à map avec le tooltip
 * @param {*} tip_streams Le tooltip pour les streams
 * @param {*} tip_total Le tooltip pour le total
 */
export function setHoverHandler (g, tip) {
  g.selectAll("rect")
  .on('mouseover', function(d) {
    tip.show(d, this)
  })
  .on('mouseout',  function(d) {
    tip.hide(d, this)
  })
  
}

/**
 * Génère les lignes
 *
 * @param {object} data La data à afficher
 * @param {object} colorScale L'échelle de couleur utilisée pour la heatmap
 * @param {object} vizWidth Largeur de la viz pour le placement des éléments
 * @param {object} tip_streams Tooltip à associer aux streams
 * @param {object} tip_total Tooltip à associer au total
 */
 export function appendHeatMaps(data, colorScales, vizWidth, tip_streams, tip_total) {
    //Calcul du placement par rapport aux éléments précédents
    let infoSize = d3.select('.info-g').node().getBBox()
    let titleSize = d3.select('.column-titles-g').node().getBBox()
    let datesSize = d3.select('.dates-g').node().getBBox()
    const initialOffset = infoSize.height + titleSize.height + datesSize.height + 25
    const horizontalOffset = (vizWidth - heatmap.width)/2

    //Affichage de la ligne de total
    appendLine(initialOffset, horizontalOffset, 0, data.slice(0,1)[0], colorScales.total, tip_total, vizWidth, true)

    //Affichage de chaque ligne
    data.slice(1).forEach(function (track, index)
      {
        appendLine(initialOffset+50, horizontalOffset, index, track, colorScales.streams, tip_streams, vizWidth, false)
      }
    )
 }


/**
 * Génère une ligne
 *
 * @param {object} data La data à afficher
 * @param {object} colorScale L'échelle de couleur utilisée pour la heatmap
 * @param {object} vizWidth Largeur de la viz pour le placement des éléments
 */
export function appendLine(initialOffset, horizontalOffset, index, track, colorScale, tip, vizWidth, isTotal) {
  //Création du groupe contenant les informations de la ligne
  const verticalOffset = (initialOffset + index*(heatmap.height+heatmap.padding))
  let g = d3.select('.graph-g')
            .append('g')
            .attr('class', "line"+String(index))
            .attr('transform', 'translate(0, '+ verticalOffset +')')
  
  //Affichage du titre
  createTrack(g, track.Track_Name, index, isTotal)

  //Affichage de la heatmap
  let trackHeight = d3.select('.track'+String(index)).node().getBBox().height
  createHeatMap(g, track.Streams, index, colorScale, horizontalOffset, trackHeight)
  setHoverHandler(g, tip)

  //Affichage du nombre de streams et des statistiques
  createStreamStats(g, track.Count_total_streams, track.Proportion_total_streams*100, vizWidth)
}


