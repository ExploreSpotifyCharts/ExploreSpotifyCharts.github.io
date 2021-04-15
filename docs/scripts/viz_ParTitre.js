import * as preprocess_Helpers from './preprocess_Helpers.js'
import * as preprocess_ParTitre from './preprocess_ParTitre.js'
import * as helper from './helper.js'
import * as viz from './viz.js'
import * as tooltip from './tooltip.js'
import * as index from '../index.js'

export function createTrackVisualisation(track, artist, countries, start_date, end_date) {
    if(end_date == null) end_date = start_date

    const target = document.getElementsByClassName('viz-container')[0]
    const spinner = new Spinner(index.spinnerOpts).spin(target)

    const tip = viz.initializeViz()

    let call_countries = []
    countries.forEach(country => call_countries.push(d3.csv(index.PATH+country['code']+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
        const data_filtered = data.filter(line => line['Track Name'] == track && line['Artist'] == artist)
        return data_filtered
    })))

    Promise.all(call_countries)
        .then(function(files) {
        const data_preprocessed_titre = preprocess_ParTitre.ExplorerParTitre(files, countries, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
        
        spinner.stop()
        let infog = d3.select('.info-g')

        if (data_preprocessed_titre.length <= 1)
        {
          helper.appendError(infog, index.no_data_error)
        }
        else
        {
            helper.appendTitle(infog, track+' (par '+artist+')')
            const colorScales = viz.appendColorScales(data_preprocessed_titre.slice(0,1), data_preprocessed_titre.slice(1), index.vizWidth, 'Par Pays :')
    
            let graphg = d3.select('.graph-g')
            viz.appendColumnTitles(graphg, index.vizWidth, 'Pays')
            viz.appendDates(graphg, helper.formatDate(start_date), helper.formatDate(end_date), 'Titre')
            viz.appendHeatMaps(graphg, data_preprocessed_titre, 'Region', colorScales, index.vizWidth, tip.streams, tip.total)
            viz.placeDates('Titre')
            helper.updateSvg()
        }
    })
        .catch(function(err) {
        spinner.stop()
        helper.appendError(index.other_error)
        console.log(err)
    })
    
}