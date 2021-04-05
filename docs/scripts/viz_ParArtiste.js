/**
 * Affichage des titres des colonnes
 */
 export function appendColumnTitles (width) {
    //Récupère taille du groupe titre/échelle au dessus pour le décalage
    let infoSize = d3.select('.info-g').node().getBBox()
    let verticalOffset = infoSize.height + 20

    //Définit un groupe qui contiendra les titres avec le bon décalage
    let g = d3.select('.graph-g')
      .append('g')
      .attr('class', 'column-titles-g')
      .attr('transform','translate(0 ,' + verticalOffset + ')')

    //Affichage Titre
    g.append('text').text('Titres').attr('fill', 'white')

    //Affichage Nombre de Streams
    let nbStreams = g.append('text').text('Nombre de Streams').attr('fill', 'white')
    let HorizontalOffset = width - nbStreams.node().getComputedTextLength()
    nbStreams.attr('transform','translate('+ HorizontalOffset + ',0)')

}


