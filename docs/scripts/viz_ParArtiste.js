import * as preprocess_Helpers from './preprocess_Helpers.js'
import * as preprocess_ParArtiste from './preprocess_ParArtiste.js'
import * as helper from './helper.js'
import * as viz from './viz.js'
import * as tooltip from './tooltip.js'
import * as index from '../index.js'

export function createArtistVisualisation(artist, country, country_name, start_date, end_date) {

  const target = document.getElementsByClassName('viz-container')[0]
  const spinner = new Spinner(index.spinnerOpts).spin(target)

  const tip = viz.initializeViz()

  country = country ? country : 'global'
  country_name = country_name ? country_name : 'Mondial'
  start_date = start_date ? start_date : '2017-01-01'
  end_date = end_date ? end_date : '2020-04-20'
  
  d3.csv(index.PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
    const data_preprocessed_artist = preprocess_ParArtiste.ExplorerParArtiste(data, artist, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
    
    spinner.stop()
    
    if (data_preprocessed_artist.length <= 1)
    {
      helper.appendError(index.no_data_error)
    }
    else
    {
      let infog = d3.select('.info-g')
      helper.appendTitle(infog, artist+' ('+country_name+')')
      const colorScales = viz.appendColorScales(data_preprocessed_artist.slice(0,1), data_preprocessed_artist.slice(1), index.vizWidth)
      let graphg = d3.select('.graph-g')
      viz.appendColumnTitles(graphg, index.vizWidth, 'Titres')
      viz.appendDates(graphg, helper.formatDate(start_date), helper.formatDate(end_date), 'Artiste')
      viz.appendHeatMaps(graphg, data_preprocessed_artist, 'Track_Name', colorScales, index.vizWidth, tip.streams, tip.total)
      viz.placeDates('Artiste')
    helper.updateSvg()
    }
  }, function(error)
  {
      spinner.stop()
      helper.appendError(index.other_error)
      console.log(error)
  })
}