import * as preprocess_Helpers from './preprocess_Helpers.js'

//API -------------------------------------------------------------------------------------------------------
/**
 * Get data for Explorer par tendance for a period of the year and a country
 *
 * @param {object[]} data The data for the country selected (can be 'global')
 * @param {int} start_day The start day to considered data selected
 * @param {int} start_month The start month to considered data selected
 * @param {Date} end_day The end day to considered data selected
 * @param {Date} end_month The end day to considered data selected
 * @returns {object[]} Table of objects containing the data of interest
 */
export function ExplorerParTendance(data, start_day, start_month, end_day=null, end_month=null) 
{
  if (!end_day || !end_month)
  { 
    end_day = start_day
    end_month = start_month
  }

  let dates = {}
  for (let year = 2017; year <= 2020; year++) {
    dates[year] = {}
    dates[year]['start'] = new Date(year, start_month-1, start_day) //month is 0-indexed
    dates[year]['end'] = new Date(year, end_month-1, end_day) //month is 0-indexed
  }

  let data_processed = data

  //Filter on date
  data_processed = data_processed.filter(line => 
    {
      const current_date = line['date']
      if (!(preprocess_Helpers.isValidDate(current_date))) //get valid date
      {
        return false
      }
      const year = current_date.getFullYear()
      return preprocess_Helpers.isDateToBeConsidered(current_date, dates[year]['start'], dates[year]['end'])
    })

  //Add year as key
  data_processed.forEach(line =>
    {
      line['Year'] = line['date'].getFullYear()
    }
  )

  //Reduce per year
  data_processed = data_processed.reduce(function (acc, line) {
    if (typeof acc[line['Year']] == 'undefined')
    {
      acc[line['Year']] = {}
      acc[line['Year']]['Tracks'] = {}
    }
    const track_name = line['Track Name']
    if (typeof acc[line['Year']]['Tracks'][track_name] == 'undefined')
    {
      acc[line['Year']]['Tracks'][track_name] = {}
      acc[line['Year']]['Tracks'][track_name]['Streams'] = 0
      acc[line['Year']]['Tracks'][track_name]['Artist'] = line['Artist']
    }
    acc[line['Year']]['Tracks'][track_name]['Streams'] += line['Streams']
    return acc
  }, {})
  data_processed = Object.entries(data_processed)

  //sort tracks on number of streams and get top 10
  data_processed.forEach(line =>
    {
      var tracks = line[1]['Tracks']

      let sortable = [];
      for (var track in tracks) {
          sortable.push({'Track Name':track, 'Artist':tracks[track]['Artist'], 'Streams':tracks[track]['Streams']})
      }
      sortable.sort(function(a, b) {
          return b['Streams'] - a['Streams']
      })

      line[1]['Tracks'] = sortable.slice(0,10)
    })

  //format
  data_processed = data_processed.map(line => {
    let entry = {}
    entry['Year'] = line[0]
    for (const [ key, value ] of Object.entries(line[1])) {
      entry[key] = value
    }
    return entry
  })

  return data_processed
}