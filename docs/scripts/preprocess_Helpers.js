//HELPERS FUNCTIONS ---------------------------------------------------------------------------------------------
export function SpotifyDataParser(d)
{
 return {
   Position: +d.Position, //convert to number
   'Track Name': parseTrackName_Artist(d['Track Name']),
   Artist: parseTrackName_Artist(d.Artist),
   Streams: +d.Streams, //convert to number
   date: parseDate(d.date),
   region: d.region,
   spotify_id: d.spotify_id
   }
}
 
export function parseDate(input) // parse a date in yyyy-mm-dd format
{
  let parts = input.split('-')
  return new Date(parts[0], parts[1]-1, parts[2]) // Month is 0-indexed
}

export function parseTrackName_Artist(input)
{
  while (input.includes('#'))
  {
    input = input.replace('#', '')
  }
  while (input.includes(','))
  {
    input = input.replace(',', '')
  }
  while (input.includes('&'))
  {
    input = input.replace('&', 'and')
  }
  return input
}

export function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

export function isDateToBeConsidered(d, start, end)
{
  return (d.getTime() >= start.getTime()) && (d.getTime() <= end.getTime())
}

export function reduceDataPerKey(data, key, keys_to_keep=[])
{
  let data_processed = data.reduce(function (acc, line) {
    const date = line['date']
    const dateISO = date.toISOString().split('T')[0]
    if (typeof acc[line[key]] == 'undefined')
    {
      acc[line[key]] = {}
      keys_to_keep.forEach(key_to_keep => acc[line[key]][key_to_keep] = line[key_to_keep])
      acc[line[key]]['Streams'] = {}
      acc[line[key]]['Count_total_streams'] = 0
    }
    acc[line[key]]['Streams'][dateISO] = line['Streams']
    acc[line[key]]['Count_total_streams'] += line['Streams']
    return acc
  }, {})
  return Object.entries(data_processed)
}

export function reduceDataToOneElement(data, key_to_use)
{
  let output = []
  output.push(key_to_use)
  output.push({})

  output[1]['Streams'] = {}
  output[1]['Count_total_streams'] = 0

  data.forEach(line =>
    {
      const date = line['date']
      const dateISO = date.toISOString().split('T')[0]
      output[1]['Streams'][dateISO] = line['Streams']
      output[1]['Count_total_streams'] += line['Streams']
    }
  )

  return output
}

export function addTotalEntry_computeProportion(data)
{
  //Add one entry for total (per day and global)
  let newEntry = []
  newEntry[0] = 'Total'
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
      const total_entry = line[1]['Count_total_streams']
      line[1]['Proportion_total_streams'] = total_entry / total
    }
  )

  return data
}

export function fillMissingDates(data, start, end)
{
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
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

export function sortStreamsOnDate(data)
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

export function formatData(data, key_name)
{
  let data_formatted = data.map(line => {
    let entry = {}
    entry[key_name] = line[0]
    for (const [ key, value ] of Object.entries(line[1])) {
      entry[key] = value
    }

    let streams_dates = line[1]['Streams']
    let streams_array = [];
      for (var date in streams_dates) {
        streams_array.push({'Date':date, 'Streams':streams_dates[date]})
      }
    entry['Streams'] = streams_array
    return entry
  })
  return data_formatted
}