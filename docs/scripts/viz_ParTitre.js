import * as preprocess_Helpers from './preprocess_Helpers.js'
import * as preprocess_ParTitre from './preprocess_ParTitre.js'
import * as helper from './helper.js'
import * as viz from './viz.js'
import * as tooltip from './tooltip.js'
import * as index from '../index.js'

export function createTrackVisualisation(track, countries, start_date, end_date) {

    //à supprimer à terme
    // countries = []
    // countries.push({'code':'be', 'country':'Belgique'})
    // countries.push({'code':'ca', 'country':'Canada'})
    // countries.push({'code':'es', 'country':'Espagne'})
    // countries.push({'code':'fr', 'country':'France'})
    // countries.push({'code':'global', 'country':'Mondial'})
    // countries.push({'code':'jp', 'country':'Japon'})
    //fin suppression à terme

    const target = document.getElementsByClassName('viz-container')[0]
    const spinner = new Spinner(index.spinnerOpts).spin(target)

    const tip = viz.initializeViz()

    start_date = start_date ? start_date : '2017-01-01'
    end_date = end_date ? end_date : '2020-04-20'

    let call_countries = []
    countries.forEach(country => call_countries.push(d3.csv(index.PATH+country['code']+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
        const data_filtered = data.filter(line => line['Track Name'] == track)
        return data_filtered
    })))

    Promise.all(call_countries)
        .then(function(files) {
        const data_preprocessed_titre = preprocess_ParTitre.ExplorerParTitre(files, countries, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
        
        spinner.stop()

        helper.appendTitle(track)
        const colorScales = viz.appendColorScales(data_preprocessed_titre, index.vizWidth)
        viz.appendColumnTitles(index.vizWidth, 'Pays')
        viz.appendDates(start_date, end_date, index.vizWidth)
        viz.appendHeatMaps(data_preprocessed_titre, 'Region', colorScales, index.vizWidth, tip.streams, tip.total)
        helper.updateSvg()
        //here we can continue with the data -> viz
    })
        .catch(function(err) {
        spinner.stop()
        console.log(err)
    })
    
}