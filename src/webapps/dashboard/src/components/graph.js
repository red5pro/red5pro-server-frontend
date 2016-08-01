import Chart from '../lib/Chart.min.js'

class Graph {
  constructor () {
    this.data = {
      dataset: [{
        borderColor: '#E31900'
      }]
    }
  }
}

export default class LineGraph extends Graph {
  constructor (title) {
    super()
    this.data = {
      type: 'line',
      data: {
        datasets: [{
          label: title,
          data: [{}]
        }]
      },
      options: {
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'bottom'
          }]
        }
      }
    }
  }
  makeGraph (ctx) {
    return new Chart(ctx, this.data)
  }
}
// class BarGraph{
// 	constructor () {
//     this.type = 'bar'
//   }
// }
// class DoughnutGraph{
// }
