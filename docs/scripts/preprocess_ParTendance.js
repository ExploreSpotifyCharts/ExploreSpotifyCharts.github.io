import * as preprocess_Helpers from './preprocess_Helpers.js'

//API -------------------------------------------------------------------------------------------------------
/**
 * Get data for Explorer par tendance for a period of the year and a country
 *
 * @param {object[]} data The data for the country selected (can be 'global')
 * @param {int} start_day The start day to considered data selected
 * @param {int} start_month The start month to considered data selected
 * @param {int} end_day The end day to considered data selected
 * @param {int} end_month The end day to considered data selected
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
  
    const key = line['Track_Name']+','+line['Artist']
    if (typeof acc[line['Year']]['Tracks'][key] == 'undefined')
    {
      acc[line['Year']]['Tracks'][key] = {}
      acc[line['Year']]['Tracks'][key]['Track_Name'] = line['Track_Name']
      acc[line['Year']]['Tracks'][key]['Artist'] = line['Artist']
      acc[line['Year']]['Tracks'][key]['Streams'] = {}
      acc[line['Year']]['Tracks'][key]['Count_total_streams'] = 0
    }
  
    const date = line['date']
    const dateISO = date.toISOString().split('T')[0]

    acc[line['Year']]['Tracks'][key]['Streams'][dateISO] = line['Streams']
    acc[line['Year']]['Tracks'][key]['Count_total_streams'] += line['Streams']
    return acc
  }, {})
  data_processed = Object.entries(data_processed)

  //sort tracks on number of streams and get top 5
  data_processed.forEach(line =>
    {
      var tracks = line[1]['Tracks']

      let sortable = [];
      for (var track in tracks) {
          sortable.push({
          'Track_Name': tracks[track]['Track Name'],
          'Artist': tracks[track]['Artist'],
          'Count_total_streams' :tracks[track]['Count_total_streams'],
          'Streams': tracks[track]['Streams']
        })
      }
      sortable.sort(function(a, b) {
          return b['Count_total_streams'] - a['Count_total_streams']
      })

      line[1]['Tracks'] = sortable.slice(0,5)
    })

  //for each year, add a total entry
  data_processed.forEach(line =>
  {
    let newEntry = {}
    newEntry['Track_Name'] = 'Total'
    newEntry['Count_total_streams'] = 0
    newEntry['Streams'] = {}

    line[1]['Tracks'].forEach(track =>
      {
        for (const [date, count] of Object.entries(track['Streams']))
          {
            if (typeof newEntry['Streams'][date] == 'undefined')
            {
              newEntry['Streams'][date] = 0
            }
            newEntry['Streams'][date] += count
            newEntry['Count_total_streams'] += count
          }
      }
      )
      line[1]['Tracks'].unshift(newEntry)
  })

  //for each year, compute proportion
  data_processed.forEach(line =>
  {
    const total = line[1]['Tracks'][0]['Count_total_streams']

    line[1]['Tracks'].forEach(function(track)
      {
        const total_entry = track['Count_total_streams']
        track['Proportion_total_streams'] = total_entry / total
      }
    )
  })


  //fill missing dates
  data_processed.forEach(line =>
  {
    const year = line[0]
    const start = dates[year]['start']
    const end = dates[year]['end']

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateISO = d.toISOString().split('T')[0]
      line[1]['Tracks'].forEach(track =>
        {
          if (typeof track['Streams'][dateISO] == 'undefined')
          {
            track['Streams'][dateISO] = 0
          }
        }
      )
    }
  })

  //sort streams on date
  data_processed.forEach(line =>
  {
    line[1]['Tracks'].forEach(track =>
    {
      let sorted = Object.keys(track['Streams'])
        .sort()
        .reduce(function (acc, key) { 
        acc[key] = track['Streams'][key];
        return acc;
        }, {});
      track['Streams'] = sorted
    })
  })

  //format
  data_processed = data_processed.map(line => {
    let entry = {}
    entry['Year'] = line[0]
    entry['Tracks'] = line[1]['Tracks']

    entry['Tracks'].forEach(track =>
    {
      let streams_dates = track['Streams']
      let streams_array = []
      for (var date in streams_dates)
      {
        streams_array.push({'Date':date, 'Streams':streams_dates[date]})
      }
      track['Streams'] = streams_array
    })
    return entry
  })

  //Add missing year entries and sort
  const years_in_data = data_processed.map(entry => entry['Year'])
  for (const year in dates)
  {
    if (!(years_in_data.includes(year)))
    {
      let new_entry = {}
      new_entry['Year'] = year
      new_entry['Tracks'] = []
      data_processed.push(new_entry)
    }
  }
  data_processed.sort(function(a, b) {
    return a['Year'] - b['Year']
  })

  return data_processed
}