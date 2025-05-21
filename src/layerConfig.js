export default {
    layerFIR: {
        label: 'FIR',
        url: 'https://daim.lfv.se/geoserver/wfs?service=WFS&&version=1.1.0&request=GetFeature&typename=mais:FIR&outputFormat=application/json&srsname=EPSG:4326',
        style: {
            color: 'red',
            weight: 1,
            opacity: 0.5,
            fill: false
        }
    },
    seaborder: {
        label: 'Sjö-Gräns',
        url: 'https://daim.lfv.se/geoserver/wfs?service=WFS&&version=1.1.0&request=GetFeature&typename=DAIM_TOPO:Terrvattengrans&outputFormat=application/json&srsname=EPSG:4326',
        style: {
            color: 'blue',
            weight: 1,
            fill: false,
            opacity: 0.6
        }
    }
}
