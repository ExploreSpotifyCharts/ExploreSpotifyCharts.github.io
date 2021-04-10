import * as preprocess_Helpers from './preprocess_Helpers.js'
import * as preprocess_ParPays from './preprocess_ParPays.js'
import * as helper from './helper.js'
import * as viz from './viz.js'
import * as tooltip from './tooltip.js'
import * as index from '../index.js'

export function createCountryVisualisation(country_code, start_date, end_date) {
    const tip = viz.initializeViz()
    const PATH = './assets/data/'
    country_code = country_code ? country_code : 'global'
    start_date = start_date ? start_date : '2017-01-01'
    end_date = end_date ? end_date : '2020-04-20'
    d3.csv(PATH+country_code+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
        d3.csv(PATH+'country'+'.csv', d3.autoType).then(function (data_countries) {
            const data_preprocessed_countrytrack = preprocess_ParPays.ExplorerParPays_Track(data, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
            const country_name = data_countries.filter(line => line['country code'] == country_code)[0]['country']
            helper.appendTitle(country_name)
            const colorScales = viz.appendColorScales(data_preprocessed_countrytrack, index.vizWidth)
            viz.appendColumnTitles(index.vizWidth, 'Titres')
            viz.appendDates(start_date, end_date, index.vizWidth)
            viz.appendHeatMaps(data_preprocessed_countrytrack, 'Track_Name', colorScales, index.vizWidth, tip.streams, tip.total)
            helper.updateSvg()
        })
    })
}