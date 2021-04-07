/**
 * Defines the contents of the tooltip. See CSS for tooltip styling.
 *
 * @param {object} d The data associated to the hovered element
 * @returns {string} The tooltip contents
 */
export function getContents (d) {
  // Generate tooltip contents
  let tooltip_string = '<span class="tooltip-value">'
  tooltip_string += '<strong> Date : </strong> '+ d["Date"] +'<br>'
  tooltip_string += '<strong> Streams : </strong> '+d["Streams"]
  tooltip_string += '</span>'
  return tooltip_string
}
