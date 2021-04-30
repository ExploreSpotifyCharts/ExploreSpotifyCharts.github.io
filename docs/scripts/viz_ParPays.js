import * as preprocess_Helpers from './preprocess_Helpers.js'
import * as preprocess_ParPays from './preprocess_ParPays.js'
import * as helper from './helper.js'
import * as viz from './viz.js'
import * as tooltip from './tooltip.js'
import * as index from '../index.js'

/**
 * Crée la visualisation pour Explorer Par Pays (Toggle sur Titres ou sur Artistes)
 *
 * @param {string} country Code du pays sélectionné
 * @param {string[]} country_name Nom du pays sélectionné
 * @param {string} start_date Début de la période sélectionnée
 * @param {string} end_date Fin de la période sélectionnée
 * @param {boolean} isArtist Vrai si le toggle est sur Artistes
 */
export function createCountryVisualisation(country, country_name, start_date, end_date, isArtist) {
    if(end_date == null) end_date = start_date

    const target = document.getElementsByClassName('viz-container')[0]
    const spinner = new Spinner(index.spinnerOpts).spin(target)

    const tip = viz.initializeViz(country)

    d3.csv(index.PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
        let data_preprocessed
        let columnTitle
        let lineTitle
        let legendDescription
        let viz_title
        if (!isArtist){
            data_preprocessed = preprocess_ParPays.ExplorerParPays_Track(data, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
            columnTitle = 'Titres'
            lineTitle = 'Track_Name'
            legendDescription = 'Par Titre :'
            viz_title = "Top-50 des titres les plus écoutés ("+country_name+")"
        }  
        else {
            data_preprocessed = preprocess_ParPays.ExplorerParPays_Artist(data, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
            columnTitle = 'Artistes'
            lineTitle = 'Artist'
            legendDescription = 'Par Artiste :'
            viz_title = "Top-50 des artistes les plus écoutés ("+country_name+")"
        }
        spinner.stop()

        let infog = d3.select('.info-g')
        if (data_preprocessed.length <= 1)
        {
          helper.appendError(infog, index.no_data_error)
        }
        else
        {
            helper.appendTitle(infog, viz_title)
            const colorScales = viz.appendColorScales(data_preprocessed.slice(0,1), data_preprocessed.slice(1), index.vizWidth, legendDescription)

            let graphg = d3.select('.graph-g')
            viz.appendColumnTitles(graphg, index.vizWidth, columnTitle)
            let timeScale = viz.appendAxisDates(graphg, preprocess_Helpers.parseDate(start_date), preprocess_Helpers.parseDate(end_date))
            viz.appendHeatMaps(graphg, data_preprocessed, lineTitle, colorScales, index.vizWidth, tip.streams, tip.total, tip.track)
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