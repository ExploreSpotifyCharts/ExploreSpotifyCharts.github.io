import * as helper from './helper.js'
import * as legend from './legend.js'

//Constantes pour l'échelle
const scaleWidth = 500
const scaleHeight = 15
const scaleTextMargin = 6 //La moitié de la taille de police du texte de légende
const scaleYMarginTop = 10

//Constante pour la heatmap
const heatmapWidth = 700
const heat_map_height = 20 //px
const heat_map_padding = 5 //px

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
    let verticalOffset = infoSize.height + titleSize.height + 10

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
 * Génère une ligne de heatmap
 *
 * @param {object} data_line L'objet contenant les données pour la ligne
 * @param {int} key L'index pour le marquage de la données
 * @param {object} color L'échelle de couleur utilisée
 * @param {int} svgWidth La largeur de la heatmap au complet
 * @param {int} heat_map_height Hauteur de la heatmap
 * @param {int} y Positionnement de la heatmap en vertical
 */
export function createHeatMap (data_line, key, color, svgWidth, heat_map_height, y) {
    const width_size = svgWidth/data_line.length
    d3.select('.graph-g')
      .selectAll("rect.marker"+String(key))
      .data(data_line)
      .enter()
      .append("rect")
      .attr("x", (d, i) => String(width_size*i)+"px")
      .attr("y", y)
      .attr('height', String(heat_map_height)+"px")
      .attr('width', width_size)
      .attr('fill',d => color(d.Streams))
  }

/**
 * Génère les lignes
 *
 * @param {object} data La data à afficher
 */
 export function appendHeatMaps(data, colorScale, vizWidth) {
    let infoSize = d3.select('.info-g').node().getBBox()
    let titleSize = d3.select('.column-titles-g').node().getBBox()
    let datesSize = d3.select('.dates-g').node().getBBox()
    const y_start = infoSize.height + titleSize.height + datesSize.height + 10
    data.forEach(function (track, index)
      {
        createHeatMap(track.Streams, index, colorScale, vizWidth, heat_map_height, y_start + index*(heat_map_height+heat_map_padding))
      }
    )
 }


