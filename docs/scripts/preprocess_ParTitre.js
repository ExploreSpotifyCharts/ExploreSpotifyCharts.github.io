//API -------------------------------------------------------------------------------------------------------
/**
 * Get data for Explorer par titre for a period
 *
 * @param {object[]} data_countries The data for the countries
 * @param {string} titre The track name of interest
 * @param {Date} start The start date to considered data selected
 * @param {Date} end The end date to considered data selected
 * @returns {object[]} Table of objects containing the data of interest
 */
export function ExplorerParTitre(data_countries, titre, start, end=null) 
{
  console.log(data_countries)

  if (!end) { end = start }

  let data_processed = []
  data_countries.forEach(data_country =>
    {
      let data_country_preprocessed = reduceDataPerTrackName(data_country, titre, start, end)
      console.log(data_country_preprocessed)
      data_processed.push(data_country_preprocessed[0])
    })

  //Sort on count_total_streams and get top k
  data_processed.sort((a,b) => b[1]['Count_total_streams']-a[1]['Count_total_streams'])

  //Add one entry for total (per day and global) and Compute % for each track
  data_processed = addTotalEntry_computeProportion(data_processed)

  //Add zeros on missing dates
  data_processed = fillMissingDates(data_processed, start, end)

  //Sort on streams on date
  data_processed = sortStreamsOnDate(data_processed)

  return data_processed

}


//PRIVATE FUNCTIONS ---------------------------------------------------------------------------------------------
function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

function isDateToBeConsidered(d, start, end)
{
  return (d.getTime() >= start.getTime()) && (d.getTime() <= end.getTime())
}

function reduceDataPerTrackName(data, titre, start, end)
{
  let data_processed = data.reduce(function (acc, line) {
    if (line['Track Name'] == titre)
    {
      const date = new Date(line['date'])
      if (isValidDate(date) && isDateToBeConsidered(date, start, end))
      {
        const dateISO = date.toISOString().split('T')[0]
        if (typeof acc[line['region']] == 'undefined')
        {
          acc[line['region']] = {}
          acc[line['region']]['Streams'] = {}
          acc[line['region']]['Count_total_streams'] = 0
        }
        acc[line['region']]['Streams'][dateISO] = line['Streams']
        acc[line['region']]['Count_total_streams'] += line['Streams']
      }
    }
    return acc
  }, {})
  return Object.entries(data_processed)
}

function addTotalEntry_computeProportion(data)
{
  //Add one entry for total (per day and global)
  let newEntry = []
  newEntry[0] = 'TOTAL STREAMS COUNT'
  newEntry[1] = {}
  newEntry[1]['Streams'] = {}
  newEntry[1]['Count_total_streams'] = 0

  data.forEach(line =>
    {
      for (const [date, count] of Object.entries(line[1]['Streams']))
      {
        if (typeof newEntry[1]['Streams'][date] == 'undefined')
        {
          newEntry[1]['Streams'][date] = 0
        }
        newEntry[1]['Streams'][date] += count
        newEntry[1]['Count_total_streams'] += count
      }
    }
  )

  data.unshift(newEntry)

  //Compute % for each track
  const total = newEntry[1]['Count_total_streams']

  data.forEach(function(line, index)
    {
      if (index != 0)
      {
        const total_entry = line[1]['Count_total_streams']
        line[1]['Proportion_total_streams'] = total_entry / total
      }
    }
  )
  return data
}

function fillMissingDates(data, start, end)
{
  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    const dateISO = d.toISOString().split('T')[0]
    data.forEach(line =>
      {
        if (typeof line[1]['Streams'][dateISO] == 'undefined')
        {
          line[1]['Streams'][dateISO] = 0
        }
      }
    )
  }
  return data
}

function sortStreamsOnDate(data)
{
  data.forEach(line =>
    {
      let sorted = Object.keys(line[1]['Streams'])
        .sort()
        .reduce(function (acc, key) { 
        acc[key] = line[1]['Streams'][key];
        return acc;
        }, {});
      line[1]['Streams'] = sorted
    })
  return data
}