/**
 * Defines the contents of the tooltip. See CSS for tooltip styling.
 *
 * @param {object} d The data associated to the hovered element
 * @returns {string} The tooltip contents
 */
export function getContents_Streams (d) {
  // Generate tooltip contents
  let tooltip_string = '<span class="tooltip-value-streams">'
  tooltip_string += '<strong> Date : </strong> '+ d["Date"] +'<br>'
  tooltip_string += '<strong> Streams : </strong> '+d["Streams"]
  tooltip_string += '</span>'
  return tooltip_string
}

/**
 * Defines the contents of the tooltip. See CSS for tooltip styling.
 *
 * @param {object} d The data associated to the hovered element
 * @returns {string} The tooltip contents
 */
export function getContents_Total (d) {
  // Generate tooltip contents
  let tooltip_string = '<span class="tooltip-value-total">'
  tooltip_string += '<strong> Date : </strong> '+ d["Date"] +'<br>'
  tooltip_string += '<strong> Streams : </strong> '+d["Streams"]
  tooltip_string += '</span>'
  return tooltip_string
}
