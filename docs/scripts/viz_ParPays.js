import * as preprocess_Helpers from './preprocess_Helpers.js'
import * as preprocess_ParPays from './preprocess_ParPays.js'
import * as helper from './helper.js'
import * as viz from './viz.js'
import * as tooltip from './tooltip.js'
import * as index from '../index.js'

export function createCountryVisualisation(country, country_name, start_date, end_date, isArtist) {
    if(end_date == null) end_date = start_date

    const target = document.getElementsByClassName('viz-container')[0]
    const spinner = new Spinner(index.spinnerOpts).spin(target)

    const tip = viz.initializeViz()

    d3.csv(index.PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
        let data_preprocessed
        let columnTitle
        let lineTitle
        if (!isArtist){
            data_preprocessed = preprocess_ParPays.ExplorerParPays_Track(data, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
            columnTitle = 'Titres'
            lineTitle = 'Track_Name'
        }  
        else {
            data_preprocessed = preprocess_ParPays.ExplorerParPays_Artist(data, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
            columnTitle = 'Artistes'
            lineTitle = 'Artist'
        }
        spinner.stop()

        let infog = d3.select('.info-g')
        if (data_preprocessed.length <= 1)
        {
          helper.appendError(infog, index.no_data_error)
        }
        else
        {
            helper.appendTitle(infog, country_name)
            const colorScales = viz.appendColorScales(data_preprocessed.slice(0,1), data_preprocessed.slice(1), index.vizWidth, 'Par Titre :')

            let graphg = d3.select('.graph-g')
            viz.appendColumnTitles(graphg, index.vizWidth, columnTitle)
            viz.appendDates(graphg, helper.formatDate(start_date), helper.formatDate(end_date), 'Pays')
            viz.appendHeatMaps(graphg, data_preprocessed, lineTitle, colorScales, index.vizWidth, tip.streams, tip.total, tip.track)
            viz.placeDates('Pays')
            helper.updateSvg()
        }
    }, function(error)
    {
        spinner.stop()
        helper.appendError(index.other_error)
        console.log(error)
    })
}