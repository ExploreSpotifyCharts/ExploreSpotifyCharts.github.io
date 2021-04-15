import * as preprocess_Helpers from './preprocess_Helpers.js'
import * as preprocess_ParArtiste from './preprocess_ParArtiste.js'
import * as helper from './helper.js'
import * as viz from './viz.js'
import * as tooltip from './tooltip.js'
import * as index from '../index.js'

export function createArtistVisualisation(artist, start_date, end_date, country, country_name) {
  if(end_date == null) end_date = start_date

  const target = document.getElementsByClassName('viz-container')[0]
  const spinner = new Spinner(index.spinnerOpts).spin(target)

  const tip = viz.initializeViz()

  country = country ? country : 'global'
  country_name = country_name ? country_name : 'Mondial'
  
  d3.csv(index.PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
    const data_preprocessed_artist = preprocess_ParArtiste.ExplorerParArtiste(data, artist, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
    
    spinner.stop()

    let infog = d3.select('.info-g')
    if (data_preprocessed_artist.length <= 1)
    {
      helper.appendError(infog, index.no_data_error)
    }
    else
    {
      helper.appendTitle(infog, artist+' ('+country_name+')')
      const colorScales = viz.appendColorScales(data_preprocessed_artist.slice(0,1), data_preprocessed_artist.slice(1), index.vizWidth, 'Par Titre :')
      let graphg = d3.select('.graph-g')
      viz.appendColumnTitles(graphg, index.vizWidth, 'Titres')
      viz.appendDates(graphg, helper.formatDate(start_date), helper.formatDate(end_date), 'Artiste')
      viz.appendHeatMaps(graphg, data_preprocessed_artist, 'Track_Name', colorScales, index.vizWidth, tip.streams, tip.total)
      viz.placeDates('Artiste')
    helper.updateSvg()

    }
    helper.enabledInteraction()
  }, function(error)
  {
      spinner.stop()
      helper.appendError(index.other_error)
      helper.enabledInteraction()
      console.log(error)
  })
}