import * as helper from './helper.js'
import * as legend from './legend.js'

//Constantes pour l'échelle
const scaleWidth = 500
const scaleHeight = 15
const scaleTextMargin = 6 //La moitié de la taille de police du texte de légende
const scaleYMarginTop = 10

//Constante pour la heatmap
const heatmapWidth = 700
const heatmapHeight = 20 //px
const heatmapPadding = 5 //px

/**
 * Génère l'échelle de couleurs
 *
 * @param {object} data Data pour la construction de l'échelle
 * @param {int} vizWidth Largeur de la viz pour le placement des éléments
 */
 export function appendColorScale(data, vizWidth) {

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

    //Création de l'échelle de couleurs
    const color_scale = helper.createColorScale(min_stream, max_stream)

    //Affichage de l'échelle de couleurs
    legend.initGradient(color_scale)
    legend.initLegendBar()
    legend.draw((vizWidth - scaleWidth)/2, scaleYMarginTop, scaleHeight, scaleWidth, 'url(#gradient)')

    //Affichage des bornes de l'échelle
    let titleHeight = d3.select('.titre-viz').node().getBBox().height

    legend.writeLegendMin(min_stream,(vizWidth - scaleWidth)/2, titleHeight+scaleHeight/2, scaleTextMargin)
    legend.writeLegendMax(max_stream,((vizWidth - scaleWidth)/2)+scaleWidth, titleHeight+scaleHeight/2, scaleTextMargin)

    return color_scale
        
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

    //Définit un groupe qui contiendra les titres avec le bon décalage
    let g = d3.select('.graph-g')
      .append('g')
      .attr('class', 'dates-g')
      .attr('transform','translate(0 ,' + verticalOffset + ')')

    //Affichage Dates
    let startDateText = g.append('text').text(startDate).attr('fill', 'white').attr('class', 'date-viz')
    let endDateText = g.append('text').text(endDate).attr('fill', 'white').attr('class', 'date-viz')

    //Placement des dates
    let HorizontalOffsetStart = (vizWidth - heatmapWidth)/2
    startDateText.attr('transform', 'translate(' + HorizontalOffsetStart + ', 0)')

    let offset = endDateText.node().getComputedTextLength()
    let HorizontalOffsetEnd = (vizWidth - heatmapWidth)/2 + heatmapWidth - offset
    endDateText.attr('transform', 'translate(' + HorizontalOffsetEnd + ', 0)')
  
 }

/**
 * Génère le titre de la chanson pour une ligne
 *
 * @param {object} g La sélection dans laquelle on ajoute le titre
 * @param {string} trackName Titre de la chanson
 * @param {int} key L'index de la chanson pour la classe personnalisée
 */
 export function createTrack (g, trackName, key) {
    if (trackName.length > 25) { //Si le titre est trop long, on le tronque
        trackName = trackName.slice(0, 24)
        trackName = trackName + '...'
    }
    g.append('text')
     .text(trackName)
     .attr('class', 'trackname-viz track'+String(key))
     .attr('fill', 'white')
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
     .text(String(streams))
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
    const width_size = heatmapWidth/data_line.length
      g.selectAll("rect.marker"+String(key))
      .data(data_line)
      .enter()
      .append("rect")
      .attr("x", (d, i) => String(xOffset + width_size*i)+"px")
      .attr("y", -y) //Décalage du au fait que le rect se positionne automatiquement sous le texte dans le g
      .attr('height', heatmapHeight + "px")
      .attr('width', width_size + "px")
      .attr('fill',d => color(d.Streams))
  }

/**
 * Map du hover (tooltip) pour l'interaction avec les rectangles des heatmaps
 *
 * @param {object} g La sélection dans laquelle on récupère les objets à map avec le tooltip
 * @param {*} tip Le tooltip
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
 */
 export function appendHeatMaps(data, colorScale, vizWidth, tip) {
    //Calcul du placement par rapport aux éléments précédents
    let infoSize = d3.select('.info-g').node().getBBox()
    let titleSize = d3.select('.column-titles-g').node().getBBox()
    let datesSize = d3.select('.dates-g').node().getBBox()
    const initialOffset = infoSize.height + titleSize.height + datesSize.height + 25
    const horizontalOffset = (vizWidth - heatmapWidth)/2

    //Affichage de chaque ligne
    data.forEach(function (track, index)
      {
        const verticalOffset = (initialOffset + index*(heatmapHeight+heatmapPadding))
        let g = d3.select('.graph-g')
                  .append('g')
                  .attr('class', "line"+String(index))
                  .attr('transform', 'translate(0, '+ verticalOffset +')')

        createTrack(g, track.Track_Name, index)

        let trackHeight = d3.select('.track'+String(index)).node().getBBox()
        createHeatMap(g, track.Streams, index, colorScale, horizontalOffset, trackHeight.height)
        setHoverHandler(g, tip)

        createStreamStats(g, track.Count_total_streams, track.Proportion_total_streams*100, vizWidth)
      }
    )
 }


