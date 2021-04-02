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

  //Filter on date
  let data_processed = data.filter(line => isValidDate(new Date(line['date'])) && isDateToBeConsidered(new Date(line['date']), start, end))
  
  //Reduce by track name
  data_processed = reduceDataPerTrackName(data_processed)

  //Sort on count_total_streams and get top k
  const k = 200
  data_processed = data_processed.sort((a,b) => b[1]['Count_total_streams']-a[1]['Count_total_streams']).slice(0,k)

  //Add one entry for total (per day and global) and Compute % for each track
  data_processed = addTotalEntry_computeProportion(data_processed)

  //Add zeros on missing dates
  data_processed = fillMissingDates(data_processed, start, end)

  //Sort on streams on date
  data_processed = sortStreamsOnDate(data_processed)

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

  //Filter on date
  let data_processed = data.filter(line => isValidDate(new Date(line['date'])) && isDateToBeConsidered(new Date(line['date']), start, end))
  
  //Reduce by track name
  data_processed = reduceDataPerArtist(data_processed, start, end)

  //Sort on count_total_streams and get top k
  const k = 200
  data_processed = data_processed.sort((a,b) => b[1]['Count_total_streams']-a[1]['Count_total_streams']).slice(0,k)

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

function reduceDataPerTrackName(data)
{
  let data_processed = data.reduce(function (acc, line) {
    const date = new Date(line['date'])
    const dateISO = date.toISOString().split('T')[0]
    if (typeof acc[line['Track Name']] == 'undefined')
    {
      acc[line['Track Name']] = {}
      acc[line['Track Name']]['Artist'] = line['Artist']
      acc[line['Track Name']]['Streams'] = {}
      acc[line['Track Name']]['Count_total_streams'] = 0
    }
    acc[line['Track Name']]['Streams'][dateISO] = line['Streams']
    acc[line['Track Name']]['Count_total_streams'] += line['Streams']
    return acc
  }, {})
  return Object.entries(data_processed)
}

function reduceDataPerArtist(data)
{
  let data_processed = data.reduce(function (acc, line) {
    const date = new Date(line['date'])
    const dateISO = date.toISOString().split('T')[0]
    if (typeof acc[line['Artist']] == 'undefined')
    {
      acc[line['Artist']] = {}
      acc[line['Artist']]['Streams'] = {}
      acc[line['Artist']]['Count_total_streams'] = 0
    }
    if (typeof acc[line['Artist']]['Streams'][dateISO] == 'undefined')
    {
      acc[line['Artist']]['Streams'][dateISO] = 0
    }
    acc[line['Artist']]['Streams'][dateISO] += line['Streams']
    acc[line['Artist']]['Count_total_streams'] += line['Streams']
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