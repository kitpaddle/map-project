/* This script exists to fetch and update the data for the layers used in the project 
    All the data is public and available at LFV 
    This is note used during runtime.
*/
import fs from 'node:fs/promises'

const layers = [
    {
        file: 'fir.json',
        url: 'https://daim.lfv.se/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=mais:FIR&outputFormat=application/json&srsname=EPSG:4326'
    },
    {
        file: 'seaborder.json',
        url: 'https://daim.lfv.se/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=DAIM_TOPO:Terrvattengrans&outputFormat=application/json&srsname=EPSG:4326'
    },
    {
        file: 'airports.json',
        url: 'https://daim.lfv.se/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=mais:ARP&outputFormat=application/json&srsname=EPSG:4326'
    }
]

console.log("YO")
await fs.mkdir('public/geo', { recursive: true })

for (const { file, url } of layers) {
    console.log(`Fetching ${url} …`)
    const json = await fetch(url).then(r => r.json())
    await fs.writeFile(`public/geo/${file}`, JSON.stringify(json))
    console.log(`Saved public/geo/${file}`)
}

console.log('✔  All layers saved locally')
