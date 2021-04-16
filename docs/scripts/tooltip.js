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
 export function getContents_Track (artist) {
  // Generate tooltip contents
  let tooltip_string = '<span class="tooltip-value-streams">'
  tooltip_string += '<strong> Artiste : </strong> '+ artist +'<br>'
  tooltip_string += '</span>'
  return tooltip_string
}
