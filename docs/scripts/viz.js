import * as helper from './helper.js'
import * as viz_ParArtiste from './viz_ParArtiste.js'
import * as legend from './legend.js'

const scaleWidth = 600
const scaleHeight = 25
const scaleTextMargin = 5
const scaleYOffSet = 10

/**
 * Génère l'échelle de couleurs
 *
 * @param {object} data Data pour la construction de l'échelle
 */
 export function appendColorScale(data, windowWidth) {

    //Minimum de stream sur un jour
    let min_stream = Number.POSITIVE_INFINITY
    data.forEach(function(d){
        const min_current = d3.min(d.Streams, k => k.Streams)
        min_stream = Math.min(min_stream, min_current)
    })
    //Maximum de stream sur un jour
    let max_stream = Number.NEGATIVE_INFINITY
    data.forEach(function(d){
        const max_current = d3.max(d.Streams, k => k.Streams)
        max_stream = Math.max(max_stream, max_current)
    })

    //Création de l'échelle de couleurs
    const color_scale = helper.createColorScale(min_stream, max_stream)

    //Affichage de l'échelle de couleurs
    legend.initGradient(color_scale)
    legend.initLegendBar()
    legend.draw((windowWidth - scaleWidth)/2, scaleYOffSet, scaleHeight, scaleWidth, 'url(#gradient)')

    //Affichage des bornes de l'échelle
    let titleHeight = d3.select('.titre-viz').node().getBBox().height

    legend.writeLegendMin(min_stream,(windowWidth - scaleWidth)/2, titleHeight+scaleHeight/2, scaleTextMargin)
    legend.writeLegendMax(max_stream,((windowWidth - scaleWidth)/2)+scaleWidth, titleHeight+scaleHeight/2, scaleTextMargin)
        
}