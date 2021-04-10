import * as preprocess_Helpers from './preprocess_Helpers.js'
import * as preprocess_ParTitre from './preprocess_ParTitre.js'
import * as helper from './helper.js'
import * as viz from './viz.js'
import * as tooltip from './tooltip.js'
import * as index from '../index.js'

export function createTrackVisualisation(track, start_date, end_date) {
    /*let countries = [
        'ar', 'at', 'au',
        'be', 'bo', 'br',
        'ca', 'ch', 'cl', 'co', 'cr', 'cz',
        'de', 'dk', 'do',
        'ec', 'es',
        'fi', 'fr',
        'gb', 'gr', 'gt',
        'hk', 'hn', 'hu',
        'id', 'ie', 'is', 'it',
        'jp',
        'lt', 'lv',
        'mx', 'my',
        'nl', 'no', 'nz',
        'pa', 'ph', 'pl', 'pt', 'py',
        'se', 'sg', 'sk', 'sv',
        'tr', 'tw',
        'us', 'uy'
    ]
    */
    let countries = ['be', 'ca', 'es', 'fr', 'gb', 'it', 'jp', 'us'] //à remplacer à terme par la liste complètes des country code (cf plus haut)

    const tip = viz.initializeViz()
    track = track ? track : 'Shape Of You'
    start_date = start_date ? start_date : '2017-01-01'
    end_date = end_date ? end_date : '2020-04-20'

    let call_countries = []
    countries.forEach(country => call_countries.push(d3.csv(index.PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
        const data_filtered = data.filter(line => line['Track Name'] == track)
        return data_filtered
    })))

    Promise.all(call_countries)
        .then(function(files) {
        const data_preprocessed_titre = preprocess_ParTitre.ExplorerParTitre(files, countries, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
        console.log(data_preprocessed_titre)
        helper.appendTitle(track)
        const colorScales = viz.appendColorScales(data_preprocessed_titre, index.vizWidth)
        viz.appendColumnTitles(index.vizWidth, 'Pays')
        viz.appendDates(start_date, end_date, index.vizWidth)
        viz.appendHeatMaps(data_preprocessed_titre, 'Region', colorScales, index.vizWidth, tip.streams, tip.total)
        helper.updateSvg()
        //here we can continue with the data -> viz
    })
        .catch(function(err) {
        // handle error here
        console.log(err)
    })
    
}