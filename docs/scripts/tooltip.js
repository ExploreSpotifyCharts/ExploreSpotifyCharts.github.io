import * as helper from './helper.js'

/**
 * Définit le contenu du tooltip pour un élément de la heat map (non 'Total')
 * Se référer au CSS pour le style du tooltip
 *
 * @param {object} d La données associée à l'élément survolé
 * @returns {string} Le contenu du tooltip
 */
export function getContents_Streams (d) {
  let tooltip_string = '<span class="tooltip-value-streams">'
  tooltip_string += '<strong> Date : </strong> '+ helper.formatDate(d["Date"]) +'<br>'
  tooltip_string += '<strong> Streams : </strong> '+ helper.formatNumber(d["Streams"])
  tooltip_string += '</span>'
  return tooltip_string
}

/**
 * Définit le contenu du tooltip pour un élément de la heat map 'Total'
 * Se référer au CSS pour le style du tooltip
 *
 * @param {object} d La données associée à l'élément survolé
 * @returns {string} Le contenu du tooltip
 */
export function getContents_Total (d) {
  let tooltip_string = '<span class="tooltip-value-total">'
  tooltip_string += '<strong> Date : </strong> '+ helper.formatDate(d["Date"]) +'<br>'
  tooltip_string += '<strong> Streams : </strong> '+ helper.formatNumber(d["Streams"])
  tooltip_string += '</span>'
  return tooltip_string
}

/**
 * Définit le contenu du tooltip pour un élément Titre (pour afficher l'artiste et éventuellement le titre non tronqué)
 * Se référer au CSS pour le style du tooltip
 *
 * @param {object} d La données associée à l'élément survolé
 * @returns {string} Le contenu du tooltip
 */
 export function getContents_Track (d) {
  let tooltip_string = '<span class="tooltip-value-streams">'
  if (d.artist != undefined) tooltip_string += '<strong> Artiste : </strong> '+ d.artist +'<br>'
  if (d.title != undefined) tooltip_string += '<strong> Titre : </strong> '+ d.title +'<br>'
  tooltip_string += '</span>'
  return tooltip_string
}
