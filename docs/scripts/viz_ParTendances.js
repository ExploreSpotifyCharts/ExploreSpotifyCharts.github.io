import * as viz from './viz.js'
import * as index from '../index.js'
import * as preprocess_Helpers from './preprocess_Helpers.js'
import * as preprocess_ParTendance from './preprocess_ParTendance.js'
import * as helper from './helper.js'

export function createTrendsVisualisation(start_day,start_month,end_day,end_month,country,country_name) {
    if(end_day == null) end_day = start_day
    if(end_month == null) end_month = start_month

    const target = document.getElementsByClassName('viz-container')[0]
    const spinner = new Spinner(index.spinnerOpts).spin(target)

    const tip = viz.initializeViz('Tendances')

    let start_date = '-' + start_month +'-'+ start_day
    let end_date = '-' + end_month +'-'+ end_day
    d3.csv(index.PATH+country+'.csv', preprocess_Helpers.SpotifyDataParser).then(function (data) {
        const data_preprocessed_tendance = preprocess_ParTendance.ExplorerParTendance(data, start_day, start_month, end_day, end_month)
        spinner.stop()

        //Formatage de la data pour la construction des échelles de couleurs
        let concatDataTotal = []
        let concatDataStreams = []
        data_preprocessed_tendance.forEach(function(year){
            if(year.Tracks.length > 0) {
                concatDataTotal.push(year.Tracks[0])
                concatDataStreams.push(...year.Tracks.slice(1))
            }
        })

        //En-tête de la visualisation
        let infog = d3.select('.info-g')
        helper.appendTitle(infog, 'Tendances ('+country_name+')')
        const colorScales = viz.appendColorScales(concatDataTotal, concatDataStreams, index.vizWidth, 'Par Titre :')
        //Paramètres de placement des vizu
        let betweenPaddingHorizontal = 20
        let trendVizWidth = index.vizWidth/2 - betweenPaddingHorizontal/2
        let trendVizHeight = 0 //Sera mis à jour
        let betweenPaddingVertical = 40
        let infogHeight = d3.select('.info-g').node().getBBox().height
        let yearTitleHeight = 0 //Sera mis à jour

        //Affichage des visualisations
        data_preprocessed_tendance.forEach(function(year, i){
            
                let column = (i%2)==1 ? 1 : 0
                let row = i>1 ? 1 : 0
                //Groupe contenant une sous-vizu
                let g = d3.select('.graph-g').append('g').attr('id', year.Year)
                //Titre d'année et placement
                let yearTitle = helper.appendTitle(g, year.Year).attr('class', 'yearTitle')
                yearTitle.style('font-size', '20px').attr('transform', 'translate(0, '+ infogHeight +')')
                yearTitleHeight = d3.select('.yearTitle').node().getBBox().height
            if(year.Tracks.length > 0) {
                //Elements généraux de la sous-vizu
                viz.appendColumnTitles(g, trendVizWidth, 'Titres')
                //Axes des dates
                let start_date_current = year.Year + start_date 
                let end_date_current = year.Year + end_date
                let timeScale = viz.appendAxisDates(g, preprocess_Helpers.parseDate(start_date_current), preprocess_Helpers.parseDate(end_date_current))
                viz.appendHeatMaps(g, year.Tracks, 'Track_Name', colorScales, trendVizWidth, tip.streams, tip.total, tip.track)
                viz.placeAxisDates(g, timeScale, 2)
                trendVizHeight = g.node().getBBox().height
            } else {
                let errorOffset = infogHeight+yearTitleHeight
                let errortext = helper.appendError(g,index.no_data_2020_error)
                errortext.attr('transform', 'translate(0, '+ errorOffset +')')
            }
                //Placement de la sous-vizu  
                g.attr('transform', 'translate('+ column*(trendVizWidth + betweenPaddingHorizontal) +','+ row*(trendVizHeight + betweenPaddingVertical) + ')')
        })

        //Ajout des lignes pour la séparation visuelle des différentes années
        let yVertical = infogHeight - yearTitleHeight
        d3.select('.graph-g').append('line')
                    .attr('x1', trendVizWidth + betweenPaddingHorizontal/2)
                    .attr('x2', trendVizWidth + betweenPaddingHorizontal/2)
                    .attr('y1', yVertical)
                    .attr('y2', yVertical + 2*trendVizHeight + betweenPaddingVertical)
                    .style('stroke-width', 2)
                    .style('stroke', 'white')
        d3.select('.graph-g').append('line')
                    .attr('x1', 0)
                    .attr('x2', index.vizWidth)
                    .attr('y1', yVertical + trendVizHeight + betweenPaddingVertical)
                    .attr('y2', yVertical + trendVizHeight + betweenPaddingVertical)
                    .style('stroke-width', 2)
                    .style('stroke', 'white')
        
        helper.updateSvg()
        helper.enabledInteraction()

    }, function(error)
    {
        spinner.stop()
        helper.enabledInteraction()
        console.log(error)
    })
}