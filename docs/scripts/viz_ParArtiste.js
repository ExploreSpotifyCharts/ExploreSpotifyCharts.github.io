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

  const tip = viz.initializeViz(artist)
  
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
      let viz_title = "Popularité des titres de "+artist+" ("+country_name+")"
      helper.appendTitle(infog, viz_title)
      const colorScales = viz.appendColorScales(data_preprocessed_artist.slice(0,1), data_preprocessed_artist.slice(1), index.vizWidth, 'Par Titre :')
      let graphg = d3.select('.graph-g')
      viz.appendColumnTitles(graphg, index.vizWidth, 'Titres')
      let timeScale = viz.appendAxisDates(graphg, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
      viz.appendHeatMaps(graphg, data_preprocessed_artist, 'Track_Name', colorScales, index.vizWidth, tip.streams, tip.total, tip.track)
      viz.placeAxisDates(graphg, timeScale, 4)
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

//-----------------------------------------------------------------------------------------------------------------------------------------------


export function createArtistVisualisation_Countries(artist, countries, start_date, end_date) {
  if(end_date == null) end_date = start_date

  const target = document.getElementsByClassName('viz-container')[0]
  const spinner = new Spinner(index.spinnerOpts).spin(target)

  const tip = viz.initializeViz(artist)

  let call_countries = []
  countries.forEach(country => call_countries.push(d3.csv(index.PATH+country['code']+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
      const data_filtered = data.filter(line => line['Artist'] == artist)
      return data_filtered
  })))

  Promise.all(call_countries)
      .then(function(files) {
      const data_preprocessed_artist = preprocess_ParArtiste.ExplorerParArtiste_Countries(files, countries, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
      
      console.log()
      spinner.stop()
      let infog = d3.select('.info-g')

      if (data_preprocessed_artist.length <= 1)
      {
        helper.appendError(infog, index.no_data_error)
      }
      else
      {
        let viz_title = "Popularité des titres de "+artist+" en fonction des pays"
        helper.appendTitle(infog, viz_title)
        const colorScales = viz.appendColorScales(data_preprocessed_artist.slice(0,1), data_preprocessed_artist.slice(1), index.vizWidth, 'Par Pays :')

        let graphg = d3.select('.graph-g')
        viz.appendColumnTitles(graphg, index.vizWidth, 'Pays')
        let timeScale = viz.appendAxisDates(graphg, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
        viz.appendHeatMaps(graphg, data_preprocessed_artist, 'Region', colorScales, index.vizWidth, tip.streams, tip.total)
        viz.placeAxisDates(graphg, timeScale, 4)
        helper.updateSvg()

      }
      helper.enabledInteraction()
  })
      .catch(function(err) {
      spinner.stop()
      helper.appendError(index.other_error)
      helper.enabledInteraction()
      console.log(err)
  })
  
}