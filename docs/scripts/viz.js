import * as helper from './helper.js'
import * as legend from './legend.js'

const scaleWidth = 500
const scaleHeight = 15
const scaleTextMargin = 6 //La moitié de la taille de police du texte de légende
const scaleYOffSet = 10
const heatmapWidth = 700

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
    legend.draw((vizWidth - scaleWidth)/2, scaleYOffSet, scaleHeight, scaleWidth, 'url(#gradient)')

    //Affichage des bornes de l'échelle
    let titleHeight = d3.select('.titre-viz').node().getBBox().height

    legend.writeLegendMin(min_stream,(vizWidth - scaleWidth)/2, titleHeight+scaleHeight/2, scaleTextMargin)
    legend.writeLegendMax(max_stream,((vizWidth - scaleWidth)/2)+scaleWidth, titleHeight+scaleHeight/2, scaleTextMargin)
        
}

/**
 * Génère l'échelle de couleurs
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
    console.log(HorizontalOffsetStart)
    startDateText.attr('transform', 'translate(' + HorizontalOffsetStart + ', 0)')

    let offset = endDateText.node().getComputedTextLength()
    let HorizontalOffsetEnd = (vizWidth - heatmapWidth)/2 + heatmapWidth - offset
    endDateText.attr('transform', 'translate(' + HorizontalOffsetEnd + ', 0)')


 }