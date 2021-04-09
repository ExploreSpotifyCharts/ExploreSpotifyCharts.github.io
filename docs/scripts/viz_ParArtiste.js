import * as preprocess_Helpers from './preprocess_Helpers.js'
import * as preprocess_ParArtiste from './preprocess_ParArtiste.js'
import * as helper from './helper.js'
import * as viz from './viz.js'
import * as tooltip from './tooltip.js'
import * as index from '../index.js'

/**
 * Affichage des titres des colonnes
 */
 export function appendColumnTitles (vizWidth) {
    //Récupère taille du groupe titre/échelle au dessus pour le décalage
    let infoSize = d3.select('.info-g').node().getBBox()
    let verticalOffset = infoSize.height + 20

    //Définit un groupe qui contiendra les titres avec le bon décalage
    let g = d3.select('.graph-g')
      .append('g')
      .attr('class', 'column-titles-g')
      .attr('transform','translate(0 ,' + verticalOffset + ')')

    //Affichage Titre
    g.append('text').text('Titres').attr('fill', 'white')

    //Affichage Nombre de Streams
    let nbStreams = g.append('text').text('Nombre de Streams').attr('fill', 'white').attr('id', 'nb-streams')
    let HorizontalOffset = vizWidth - nbStreams.node().getComputedTextLength()
    nbStreams.attr('transform','translate('+ HorizontalOffset + ',0)')

}

export function createArtistVisualisation(artist,country,start_date,end_date) {
  const tip = viz.initializeViz()
  const PATH = './assets/data/'
  artist = artist ? artist : 'BTS'
  country = country ? country : 'us'
  start_date = start_date ? start_date : '2017-01-01'
  end_date = end_date ? end_date : '2020-04-20'
  d3.csv(PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
    const data_preprocessed_artist = preprocess_ParArtiste.ExplorerParArtiste(data, artist, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
    helper.appendTitle(artist)
    const colorScales = viz.appendColorScales(data_preprocessed_artist, index.vizWidth)
    appendColumnTitles(index.vizWidth)
    viz.appendDates(start_date, end_date, index.vizWidth)
    viz.appendHeatMaps(data_preprocessed_artist, colorScales, index.vizWidth, tip.streams, tip.total)
    helper.updateSvg()
  })
}


