import * as preprocess_Helpers from './preprocess_Helpers.js'
import * as preprocess_ParArtiste from './preprocess_ParArtiste.js'
import * as helper from './helper.js'
import * as viz from './viz.js'
import * as tooltip from './tooltip.js'
import * as index from '../index.js'

export function createArtistVisualisation(artist, country, start_date, end_date) {
  const tip = viz.initializeViz()
  artist = artist ? artist : 'BTS'
  country = country ? country : 'us'
  start_date = start_date ? start_date : '2017-01-01'
  end_date = end_date ? end_date : '2020-04-20'
  d3.csv(index.PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
    const data_preprocessed_artist = preprocess_ParArtiste.ExplorerParArtiste(data, artist, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
    helper.appendTitle(artist)
    const colorScales = viz.appendColorScales(data_preprocessed_artist, index.vizWidth)
    viz.appendColumnTitles(index.vizWidth, 'Titres')
    viz.appendDates(start_date, end_date, index.vizWidth)
    viz.appendHeatMaps(data_preprocessed_artist, 'Track_Name', colorScales, index.vizWidth, tip.streams, tip.total)
    helper.updateSvg()
  })
}