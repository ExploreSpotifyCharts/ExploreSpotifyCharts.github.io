import * as helper from './helper.js'
import * as legend from './legend.js'
import * as index from '../index.js'
import * as tooltip from './tooltip.js'
import * as interactivity from './interactivity.js'

//Constantes pour l'échelle
const scaleDimensions = {
  width: 300,
  height: 18,
  textMargin: 3,
  marginTop: 30,
}

const legendWidth = 400

//Constantes pour la heatmap
export let heatmap = {
  width: 700,
  height: 20,
  padding: 5,
  text: 150,
  stat: 150
}


let pageID //Variable contenant l'objet principal de la page : le pays, artiste ou titre étudié

/**
 * Affiche les échelles de couleurs
 *
 * @param {object} dataTotal Data Total pour la construction de l'échelle Total
 * @param {object} dataStreams Data Streams pour la construction de l'échelle par élément
 * @param {int} vizWidth Largeur de la viz pour le placement des éléments
 * @returns {object} Les colorscale à utiliser pour les heatmap
 */
 export function appendColorScales(dataTotal, dataStreams, vizWidth, label) {
  //Valeurs extrêmes pour les bornes de l'échelle
  var minMaxStreams = helper.getMinMaxStreams(dataStreams)
  var minMaxTotal = helper.getMinMaxStreams(dataTotal)

  //Création des échelles de couleur
  const colorScaleStreams = legend.createColorScale(0, minMaxStreams.max, '#000000', '#1DB954')
  const colorScaleTotal = legend.createColorScale(0, minMaxTotal.max,'#000000', '#FF7C00')
  var colorScales = {streams: colorScaleStreams, total: colorScaleTotal}

  //Variables pour le placement des éléments
  const placingVariables = {
    titleHeight: d3.select('.titre-viz').node().getBBox().height,
    xLegend: vizWidth - legendWidth, 
    xScale: vizWidth - scaleDimensions.width,
  }
  placingVariables.legendTitleHeight = legend.writeLegendTitle(placingVariables.xLegend, placingVariables.titleHeight, legendWidth), //Affichage du titre
  placingVariables.yText = placingVariables.titleHeight + placingVariables.legendTitleHeight + scaleDimensions.height/2

  //Id suivant les échelles
  const idTotal = {gradient: 'gradientTotal', scale: 'scaleTotal'}
  const idStreams = {gradient: 'gradientStreams', scale: 'scaleStreams'}

  //Affichage des échelles
  legend.appendScale('Total : ', placingVariables, colorScaleTotal, idTotal, scaleDimensions, minMaxTotal, 0)
  legend.appendScale(label, placingVariables, colorScaleStreams, idStreams, scaleDimensions, minMaxStreams, scaleDimensions.height+2)

  return colorScales
      
}

/**
 * Génère l'axe des dates
 * @param graphg le g dans lequel on ajoute les éléments
 * @param startDate la date de début de l'axe
 * @param endDate la date de fin de l'axe
 *
 */
 export function appendAxisDates(graphg, startDate, endDate, year) {

  //Définit un groupe qui contiendra les dates avec le bon décalage vertical
  let dateClass = (year != undefined) ? 'dates-g-'+ year : 'dates-g'
  let g = graphg
    .append('g')
    .attr('class', dateClass)
  
  let scale = d3.scaleTime()
                .domain([startDate, endDate])
                .range([0, heatmap.width])
  
  let axisDate = d3.axisTop().scale(scale)
  
  g.call(axisDate) //Création de l'axe pour obtenir la hauteur pour le placement des heatmap
  return scale
}

 /**
 * Place l'axe des dates
 * @param graphg le groupe dans lequel on ajoute les éléments
 * @param scale l'échelle de temps pour la création de l'axe
 * @param tick le nombre de ticks désirés sur l'axe
 */
  export function placeAxisDates(graphg, scale, tick, year) {
    //Variable pour le placement
    let infoSize = d3.select('.info-g').node().getBBox()
    let titleSize = d3.select('.column-titles-g').node().getBBox()
    let verticalOffset = infoSize.height + titleSize.height + 35
    let horizontalOffset = heatmap.text
    let dateClass = (year != undefined) ? '.dates-g-'+ year : '.dates-g'
    graphg.select(dateClass).remove() //Enlève les anciens éléments, utiles juste pour obtenir la hauteur

    let g = graphg //nouveau groupe avec placement en fonction des données maj
    .append('g')
    .attr('class', 'dates-g')
    .attr('transform','translate(' + horizontalOffset + ' ,' + verticalOffset + ')')

    scale.range([0, heatmap.width]) //Maj de la scale
    
    //Création de la list de valeurs pour les ticks
    let values = scale.ticks(tick).slice(0,tick+1)
    if (values[values.length-1].getTime()!=scale.domain()[1].getTime())values.push(scale.domain()[1]) //Ajout de la dernière borne si différente
    if (values[0].getTime()!=scale.domain()[0].getTime()) values.push(scale.domain()[0]) //Ajout de la première borne si différente

    //Nouvel axe
    let axisDate = d3.axisTop().scale(scale)
                     .tickValues(values)
                     .tickFormat(d3.timeFormat("%d/%m/%Y")) 

    g.call(axisDate)

    //Modification de l'apparence des ticks si on a une période avec des valeurs sur les bornes
    if (scale.domain()[0].getTime() == scale.domain()[1].getTime()) { 
      styleTick(g, axisDate, scale,true)
    } else if (values.length > 2) {
      styleTick(g, axisDate, scale,false)
    }
  }

/**
 * Stylisation des ticks (si jour simple, valeurs extrêmes)
 * @param g groupe dans lequel on modifie les éléments
 * @param axisDate axe duquel on modifie les éléments
 * @param scale la scale utilisée dans l'axe
 * @param isOneDay booléen pour le choix du style
 */
  export function styleTick(g, axisDate, scale, isOneDay) {
    if (isOneDay){ //Si un jour, pas de bornes
      axisDate.tickSizeOuter(0)
    } else { //Si plus de deux valeurs, hauteur augmentée des bornes pour éviter la superpisition des labels
      axisDate.tickSizeOuter(15)
      let extremeTicks = g.selectAll(".tick")
                          .filter(function(d, i) {
                            return d.getTime() == scale.domain()[0].getTime() || d.getTime() == scale.domain()[1].getTime() 
                          })
      extremeTicks.selectAll('text').attr('transform','translate(0,-10)')
    }

    g.call(axisDate) //Mis à jour de l'axe

  }
  

/**
 * Génère le titre de la chanson pour une ligne
 *
 * @param {object} g La sélection dans laquelle on ajoute le titre
 * @param {string} title Texte de la ligne
 * @param {int} key L'index de la ligne pour la classe personnalisée
 * @param {boolean} isTotal S'il s'agit de la ligne de total ou non pour le style
 * @param {string} titleType Pour la redirection avec le clic vers la page associée
 * @param {string} artist S'il s'agit d'un titre, l'artiste associé
 * @param {object} tip Dans le cas approprié, le tooltip associé à l'item écrit
 */
 export function createLine (g, title, key, isTotal, titleType, artist, tip) {
    const complete_title = title
    let textSvg = g.append('text')
     .text(title)
     .attr('class', 'trackname-viz track'+String(key))
     .attr('fill', 'white')

    while (textSvg.node().getComputedTextLength() > heatmap.text) { //Si le titre est trop long, on le tronque
      title = title.slice(0, -10)
      title = title + '...'
      textSvg.text(title)
    }

    if(isTotal){
      textSvg
      .style('font-weight', 'bold')
      .style('cursor','auto')
      .style('fill','white')
    } else {
        setClickHandler(titleType,textSvg,complete_title,artist,tip)
        //Construction des données à passer au tooltip d'un item titre
        if(tip != undefined) {
          let tooltipContent
          if(getPageID() == artist) tooltipContent = title == complete_title ? {} : {title: complete_title} //Pour la page Artiste
          else tooltipContent = title == complete_title ? {artist: artist} : {artist:artist, title: complete_title} //Pour la page Pays et Tendances
          if (!helper.isEmptyObject(tooltipContent)){ //Affiche le tooltip seulement s'il y a du contenu
            setHoverHandlerTrack(textSvg, tooltipContent, tip)
          }
        }
    }
    
 }

 /**
 * Génère les statistiques pour une chanson
 *
 * @param {object} g La sélection dans laquelle on ajoute les nombress
 * @param {int} streams Le nombre de streams sur la période donnée
 * @param {int} proportion Le pourcentage que représente le nombre de streams sur le nombre de streams total de l'artiste
 * @param {int} vizWidth La largeur de la viz pour le placement du text
 */
  export function createStreamStats (g, streams, proportion, vizWidth) {
    let statText = '(' + (Math.round(proportion*100)/100).toFixed(2) + '%)'
    let percentage = g.append('text')
     .text(statText)
     .attr('class', 'percentage-streams')
     .attr('fill', 'white')

    let nbstreams = g.append('text')
     .text(helper.formatNumber(streams))
     .attr('class', 'nbstreams-values')
     .attr('fill', 'white')

    let percentageOffset = vizWidth - percentage.node().getComputedTextLength()
    percentage.attr('transform', 'translate('+ percentageOffset + ',0)')

    
    let streamOffset = vizWidth -  (d3.select('#nb-streams').node().getComputedTextLength()/2) - nbstreams.node().getComputedTextLength()
    nbstreams.attr('transform', 'translate('+ streamOffset + ',0)')

    //Mise à jour de la longueur du texte de statistique. Ne s'applique qu'à la première ligne
    let textWidth = d3.select('#nb-streams').node().getComputedTextLength()/2 + nbstreams.node().getComputedTextLength()
    if(proportion == 100){
      heatmap.stat = textWidth
      heatmap.text = textWidth
      heatmap.width = vizWidth - 2*textWidth - 20
    }
 }

/**
 * Génère une ligne de heatmap
 *
 * @param {object} g La sélection dans laquelle on ajoute la heatmap
 * @param {object} data_line L'objet contenant les données pour la ligne
 * @param {int} key L'index pour le marquage de la données
 * @param {object} color L'échelle de couleur utilisée
 * @param {int} xOffset Le décalaga initial de la heatmap
 * @param {int} y Positionnement de la heatmap en vertical
 */
export function createHeatMap (g, data_line, key, color, xOffset, y) {
    const width_size = heatmap.width/data_line.length
      g.selectAll("rect.marker"+String(key))
      .data(data_line)
      .enter()
      .append("rect")
      .attr("class", "marker"+String(key))
      .attr("x", (d, i) => String(xOffset + width_size*i)+"px")
      .attr("y", -y) //Décalage du au fait que le rect se positionne automatiquement sous le texte dans le g
      .attr('height', heatmap.height + "px")
      .attr('width', Math.ceil(width_size) + "px") //Appel à ceil pour résoudre le problème des stries entre les rect
      .attr('fill',d => color(d.Streams))
  }

/**
 * Map du hover (tooltip) pour l'interaction avec les rectangles des heatmaps
 *
 * @param {object} g La sélection dans laquelle on récupère les objets à map avec le tooltip
 * @param {*} tip Le tooltip
 */
export function setHoverHandler (g, tip) {
  g.selectAll("rect")
  .on('mouseover', function(d) {
    tip.show(d, this)
  })
  .on('mouseout',  function(d) {
    tip.hide(d, this)
  })
  
}

/**
 * Map du hover (tooltip) pour l'interaction avec les items de type titre
 *
 * @param {object} g Le text svg concerné par le hover
 * @param {object} content L'objet contenant le contenu du tooltip
 * @param {*} tip Le tooltip 
 */
 export function setHoverHandlerTrack (g, content, tip) {
  g.on('mouseover', function() {
    tip.show(content, this)
    tip.attr('class', 'd3-tip') //on attribut la classe maintenant pour ne pas avoir la flèche
  })
  .on('mouseout',  function() {
    tip.hide(content, this)
  })
  
}

/**
 * Génère les lignes
 *
 * @param {*} graphg La sélection dans laquelle créer la heatmap
 * @param {object} data La data à afficher
 * @param {string} key La clé à utiliser
 * @param {object} colorScale L'échelle de couleur utilisée pour la heatmap
 * @param {object} vizWidth Largeur de la viz pour le placement des éléments
 * @param {object} tip_streams Tooltip à associer aux streams
 * @param {object} tip_total Tooltip à associer au total
 * @param {object} tip_track Tooltip à associer à un item titre
 */
 export function appendHeatMaps(graphg, data, key, colorScales, vizWidth, tip_streams, tip_total, tip_track, year) {
    //Calcul du placement par rapport aux éléments précédents
    let infoSize = d3.select('.info-g').node().getBBox()
    let titleSize = d3.select('.column-titles-g').node().getBBox()
    let dateClass = (year != undefined) ? '.dates-g-'+year : '.dates-g'
    let datesSize = d3.select(dateClass).node().getBBox()
    const initialOffset = infoSize.height + titleSize.height + datesSize.height + 40

    //Affichage de la ligne de total
    appendLine(graphg, initialOffset, 0, data.slice(0,1)[0], colorScales.total, tip_total, vizWidth, true, key)

    //Affichage de chaque ligne
    data.slice(1).forEach(function (track, index)
      {
        appendLine(graphg, initialOffset+45, index, track, colorScales.streams, tip_streams, vizWidth, false, key, tip_track)
      }
    )
 }

 /**
 * Initialise la visualisation
 *
 * @param {string} id L'ID de la page 
 * @returns {object} les différents tooltip apparaissant sur la page
 */
 export function initializeViz(id) {
  //Création des groupes principaux
  setPageID(id)
  const g = helper.generateG(index.margin, index.svgWidth, index.windowHeight)
  //Création du tootlip sur la heatmap
  const tip_streams = d3.tip().attr('class', 'd3-tip').html(function (d) { return tooltip.getContents_Streams(d) })
  const tip_total = d3.tip().attr('class', 'd3-tip').html(function (d) { return tooltip.getContents_Total(d) })
  g.call(tip_streams)
  g.call(tip_total)
  //Création du tooltip sur les items titres
  const tip_track = d3.tip().html(function (d) { return tooltip.getContents_Track(d) })
  g.call(tip_track)
  return {streams: tip_streams,total: tip_total, track: tip_track}
 }

 /**
 * Affichage des titres des colonnes
 */
export function appendColumnTitles (graphg, vizWidth, leftTitle) {
  //Récupère taille du groupe titre/échelle au dessus pour le décalage
  let infoSize = d3.select('.info-g').node().getBBox()
  let verticalOffset = infoSize.height + 20

  //Définit un groupe qui contiendra les titres avec le bon décalage
  let g = graphg
    .append('g')
    .attr('class', 'column-titles-g')
    .attr('transform','translate(0 ,' + verticalOffset + ')')

  //Affichage Titre de gauche
  g.append('text').text(leftTitle).attr('fill', 'white')

  //Affichage Nombre de Streams
  let nbStreams = g.append('text').text('Nombre de Streams').attr('fill', 'white').attr('id', 'nb-streams')
  let HorizontalOffset = vizWidth - nbStreams.node().getComputedTextLength()
  nbStreams.attr('transform','translate('+ HorizontalOffset + ',0)')

}


/**
 * Génère une ligne
 *
 * @param {object} data La data à afficher
 * @param {object} colorScale L'échelle de couleur utilisée pour la heatmap
 * @param {object} vizWidth Largeur de la viz pour le placement des éléments
 */
export function appendLine(graphg, initialOffset, index, track, colorScale, tip, vizWidth, isTotal, key, tip_track) {
  //Création du groupe contenant les informations de la ligne
  const verticalOffset = (initialOffset + index*(heatmap.height+heatmap.padding))
  let g = graphg
            .append('g')
            .attr('class', "line"+String(index))
            .attr('transform', 'translate(0, '+ verticalOffset +')')

  //Affichage du titre
  if(key == 'Track_Name') createLine(g, track[key], index, isTotal, key, track['Artist'], tip_track)
  else createLine(g, track[key], index, isTotal, key)

  //Affichage du nombre de streams et des statistiques
  createStreamStats(g, track.Count_total_streams, track.Proportion_total_streams*100, vizWidth)

  //Affichage de la heatmap
  let trackHeight = d3.select('.track'+String(index)).node().getBBox().height
  createHeatMap(g, track.Streams, index, colorScale, heatmap.text, trackHeight)
  setHoverHandler(g, tip)

  
}

/**
 * Mise en place de l'interaction (clic sur les titres des heatmaps pour se déplacer vers l'onglet adéquat)
 * @param {string} key 
 */
function setClickHandler(key,g,title,artist,tip) {
  switch(key) {
    case 'Track_Name':
      g.on('click', function() {
        const tabElement = d3.select('#menuList li:nth-child(3)').node()
        interactivity.navigate(tabElement, title, artist)
        if (tip) {tip.hide(null, this)}
      })
      break
    case 'Region':
      g.on('click', function() {
        const tabElement = d3.select('#menuList li:nth-child(1)').node()
        interactivity.navigate(tabElement, title)
      })
      break
    case 'Artist':
    g.on('click', function() {
      const tabElement = d3.select('#menuList li:nth-child(2)').node()
      interactivity.navigate(tabElement, title)
    })
    break
    default:
      console.log('Not implemented yet')
      break
  }
}

/**
 * Fixe l'ID de la page
 * @param {string} id
 */
 function setPageID(id) {
    pageID = id
}

/**
 * Renvoie l'id de la page
 * @returns {string} l'id de la page
 */
 function getPageID() {
  return pageID
}



