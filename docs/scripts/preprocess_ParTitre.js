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
      const country_code = data_country[0]['region']
      //Filter on track name
      let data_country_preprocessed = data_country.filter(line => line['Track Name'] == titre)

      //Filter on date
      data_country_preprocessed = data_country_preprocessed.filter(line => isValidDate(new Date(line['date'])) && isDateToBeConsidered(new Date(line['date']), start, end))
      
      //Reduce
      data_country_preprocessed = reduceData(data_country_preprocessed, country_code) //there we only get one element
      data_processed.push(data_country_preprocessed)
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

function reduceData(data, country_code)
{
  let output = []
  output.push(country_code)
  output.push({})

  output[1]['Streams'] = {}
  output[1]['Count_total_streams'] = 0

  data.forEach(line =>
    {
      const date = new Date(line['date'])
      const dateISO = date.toISOString().split('T')[0]
      output[1]['Streams'][dateISO] = line['Streams']
      output[1]['Count_total_streams'] += line['Streams']
    }
  )

  return output
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