import * as viz from './viz.js'
import * as index from '../index.js'
import * as preprocess_Helpers from './preprocess_Helpers.js'
import * as preprocess_ParTendance from './preprocess_ParTendance.js'
import * as helper from './helper.js'

export function createTrendsVisualisation(country, country_name, start_day,start_month,end_day,end_month) {
    const target = document.getElementsByClassName('viz-container')[0]
    const spinner = new Spinner(index.spinnerOpts).spin(target)

    const tip = viz.initializeViz()

    country = country ? country : 'global'
    country_name = country_name ? country_name : 'Mondial'
    start_day = start_day ? start_day : '01'
    start_month = start_month ? start_month : '01'
    end_day = end_day ? end_day : '31'
    end_month = end_month ? end_month : '12'

    let start_date = start_day +'/'+ start_month
    let end_date = end_day +'/'+ end_month

    d3.csv(index.PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
        const data_preprocessed_tendance = preprocess_ParTendance.ExplorerParTendance(data, start_day, start_month, end_day, end_month)
        spinner.stop()

        //Formatage de la data pour la construction des échelles de couleurs
        console.log(data_preprocessed_tendance)
        let concatDataTotal = []
        let concatDataStreams = []
        data_preprocessed_tendance.forEach(function(year){
            concatDataTotal.push(year.Tracks[0])
            concatDataStreams.push(...year.Tracks.slice(1))
        })

        //En-tête de la visualisation
        let infog = d3.select('.info-g')
        helper.appendTitle(infog, 'Tendances ('+country_name+')')
        const colorScales = viz.appendColorScales(concatDataTotal, concatDataStreams, index.vizWidth)

        //Affichage des visualisations
        let trendVizWidth = index.vizWidth/2 - 10
        data_preprocessed_tendance.forEach(function(year, index){
            let column = (index%2)==1 ? 1 : 0
            let row = index>1 ? 1 : 0

            let g = d3.select('.graph-g').append('g').attr('id', year.Year)

            if (row == 0) viz.appendColumnTitles(g, trendVizWidth, 'Titres')

            let yearTitle = helper.appendTitle(g, year.Year)
            let offset = d3.select('.info-g').node().getBBox().height + d3.select('.column-titles-g').node().getBBox().height + 20
            yearTitle.style('font-size', '20px').attr('transform', 'translate(0, '+ offset +')')

            if (row == 0) viz.appendDates(g, start_date, end_date, year.Year) 

            viz.appendHeatMaps(g, year.Tracks, 'Track Name', colorScales, trendVizWidth, tip.streams, tip.total, year.Year)

            if (row == 0) viz.placeDates(year.Year)  

            let vizHeight = g.node().getBBox().height
            g.attr('transform', 'translate('+ column*(trendVizWidth + 20) +','+ row*(vizHeight + 20) + ')')
        })
        
    }, function(error)
    {
        spinner.stop()
        console.log(error)
    })
}