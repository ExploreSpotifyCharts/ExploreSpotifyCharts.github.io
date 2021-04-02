import * as preprocess_Helpers from './preprocess_Helpers.js'

//API -------------------------------------------------------------------------------------------------------
/**
 * Get data for Explorer par pays for a period and organized by track
 *
 * @param {object[]} data The data for the country selected (can be 'global')
 * @param {Date} start The start date to considered data selected
 * @param {Date} end The end date to considered data selected
 * @returns {object[]} Table of objects containing the data of interest
 */
export function ExplorerParPays_Track(data, start, end=null) 
{ 
  if (!end) { end = start }
  let data_processed = data

  //Filter on date
  data_processed = data_processed.filter(line => preprocess_Helpers.isValidDate(new Date(line['date'])) && preprocess_Helpers.isDateToBeConsidered(new Date(line['date']), start, end))
  
  //Reduce by track name
  data_processed = preprocess_Helpers.reduceDataPerKey(data_processed, 'Track Name', ['Artist'])

  //Sort on count_total_streams and get top k
  const k = 200
  data_processed = data_processed.sort((a,b) => b[1]['Count_total_streams']-a[1]['Count_total_streams']).slice(0,k)

  //Add one entry for total (per day and global) and Compute % for each track
  data_processed = preprocess_Helpers.addTotalEntry_computeProportion(data_processed)

  //Add zeros on missing dates
  data_processed = preprocess_Helpers.fillMissingDates(data_processed, start, end)

  //Sort on streams on date
  data_processed = preprocess_Helpers.sortStreamsOnDate(data_processed)

  //Formattage
  data_processed = preprocess_Helpers.formatData(data_processed, 'Track_Name')

  return data_processed
}

/**
 * Get data for Explorer par pays for a period and organized by artist
 *
 * @param {object[]} data The data for the country selected (can be 'global')
 * @param {Date} start The start date to considered data selected
 * @param {Date} end The end date to considered data selected
 * @returns {object[]} Table of objects containing the data of interest
 */
export function ExplorerParPays_Artist(data, start, end=null) 
{ 
  if (!end) { end = start }
  let data_processed = data

  //Filter on date
  data_processed = data_processed.filter(line => preprocess_Helpers.isValidDate(new Date(line['date'])) && preprocess_Helpers.isDateToBeConsidered(new Date(line['date']), start, end))
  
  //Reduce by Artist
  data_processed = preprocess_Helpers.reduceDataPerKey(data_processed, 'Artist')

  //Sort on count_total_streams and get top k
  const k = 200
  data_processed = data_processed.sort((a,b) => b[1]['Count_total_streams']-a[1]['Count_total_streams']).slice(0,k)

  //Add one entry for total (per day and global) and Compute % for each track
  data_processed = preprocess_Helpers.addTotalEntry_computeProportion(data_processed)

  //Add zeros on missing dates
  data_processed = preprocess_Helpers.fillMissingDates(data_processed, start, end)

  //Sort on streams on date
  data_processed = preprocess_Helpers.sortStreamsOnDate(data_processed)

  //Formattage
  data_processed = preprocess_Helpers.formatData(data_processed, 'Artist')

  return data_processed
}