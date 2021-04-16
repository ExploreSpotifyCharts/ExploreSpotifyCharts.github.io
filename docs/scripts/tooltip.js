import * as helper from './helper.js'

/**
 * Defines the contents of the tooltip for streams heat maps. See CSS for tooltip styling.
 *
 * @param {object} d The data associated to the hovered element
 * @returns {string} The tooltip contents
 */
export function getContents_Streams (d) {
  // Generate tooltip contents
  let tooltip_string = '<span class="tooltip-value-streams">'
  tooltip_string += '<strong> Date : </strong> '+ helper.formatDate(d["Date"]) +'<br>'
  tooltip_string += '<strong> Streams : </strong> '+ helper.formatNumber(d["Streams"])
  tooltip_string += '</span>'
  return tooltip_string
}

/**
 * Defines the contents of the tooltip for total heat map. See CSS for tooltip styling.
 *
 * @param {object} d The data associated to the hovered element
 * @returns {string} The tooltip contents
 */
export function getContents_Total (d) {
  // Generate tooltip contents
  let tooltip_string = '<span class="tooltip-value-total">'
  tooltip_string += '<strong> Date : </strong> '+ helper.formatDate(d["Date"]) +'<br>'
  tooltip_string += '<strong> Streams : </strong> '+ helper.formatNumber(d["Streams"])
  tooltip_string += '</span>'
  return tooltip_string
}

/**
 * Defines the contents of the tooltip for total heat map. See CSS for tooltip styling.
 *
 * @param {object} d The data associated to the hovered element
 * @returns {string} The tooltip contents
 */
 export function getContents_Track (d) {
  // Generate tooltip contents
  let tooltip_string = '<span class="tooltip-value-streams">'
  if (d.artist != undefined) tooltip_string += '<strong> Artiste : </strong> '+ d.artist +'<br>'
  if (d.title != undefined) tooltip_string += '<strong> Titre : </strong> '+ d.title +'<br>'
  tooltip_string += '</span>'
  return tooltip_string
}
