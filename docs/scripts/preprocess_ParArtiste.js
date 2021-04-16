import * as preprocess_Helpers from './preprocess_Helpers.js'

//API -------------------------------------------------------------------------------------------------------
/**
 * Get data for Explorer par artiste for a period and a country
 *
 * @param {object[]} data The data for the country selected (can be 'global')
 * @param {string} artiste The artist name of interest
 * @param {Date} start The start date to considered data selected
 * @param {Date} end The end date to considered data selected
 * @returns {object[]} Table of objects containing the data of interest
 */
export function ExplorerParArtiste(data, artiste, start, end=null) 
{ 
  if (!end) { end = start }
  let data_processed = data
  
  //Filter on artist
  data_processed = data_processed.filter(line => line['Artist'] == artiste)

  //Filter on date
  data_processed = data_processed.filter(line => preprocess_Helpers.isValidDate(line['date']) && preprocess_Helpers.isDateToBeConsidered(line['date'], start, end))
  
  //Reduce by track name
  data_processed = preprocess_Helpers.reduceDataPerKey(data_processed, 'Track_Name', ['Artist'])

  //Sort on count_total_streams and get top k
  data_processed.sort((a,b) => b[1]['Count_total_streams']-a[1]['Count_total_streams'])

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

//--------------------------------------------------------------------------------------------------------

export function ExplorerParArtiste_Countries(data_countries, countries, start, end=null)
{ 
  if (!end) { end = start }

  let data_processed = []
  data_countries.forEach((data_country, index) =>
    {
      const country_name = countries[index]['country']

      let data_country_preprocessed = data_country

      //Filter on date
      data_country_preprocessed = data_country_preprocessed.filter(line => preprocess_Helpers.isValidDate(line['date']) && preprocess_Helpers.isDateToBeConsidered(line['date'], start, end))
      
      //Reduce
      data_country_preprocessed = preprocess_Helpers.reduceDataToOneElement(data_country_preprocessed, country_name)

      //Check if there is data for that country and push if so
      if (data_country_preprocessed[1]['Count_total_streams'] != 0)
      {
        data_processed.push(data_country_preprocessed)
      }
    })

    //Sort on count_total_streams and get top k
    data_processed.sort((a,b) => b[1]['Count_total_streams']-a[1]['Count_total_streams'])

    //Add one entry for total (per day and global) and Compute % for each track
    data_processed = preprocess_Helpers.addTotalEntry_computeProportion(data_processed)
  
    //Add zeros on missing dates
    data_processed = preprocess_Helpers.fillMissingDates(data_processed, start, end)
  
    //Sort on streams on date
    data_processed = preprocess_Helpers.sortStreamsOnDate(data_processed)
  
    //Formattage
    data_processed = preprocess_Helpers.formatData(data_processed, 'Region')
  
    return data_processed

}