import REST from './components/restAPI.js'

let restAPI = new REST('xyz123')
console.log(restAPI.makeAPICall('getServerStatistics'))
