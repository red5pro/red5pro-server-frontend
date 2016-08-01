import Chart from '../lib/Chart.min'

class Graph {
  constructor (id) {
    this.context = document.getElementById(id)
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
          data: [{}],
          borderColor: '#E31900'
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
  makeGraph () {
    return new Chart(this.context, this.data)
  }
}
// class BarGraph{
// 	constructor () {
//     this.type = 'bar'
//   }
// }
// class DoughnutGraph{
// }
