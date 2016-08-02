var moment = require('moment')
import Chart from '../lib/Chart.min.js'
// class Graph {
//   constructor (context) {
//     this.context = context
//   }
// }
console.log(moment())
export default class LineGraph {
  constructor (context) {
    this.context = context
    this.data = {
      type: 'line',
      data: {
        datasets: [{
          label: 'test',
          data: [{
            x: 0,
            y: 5
          },
          {
            x: 1,
            y: 5
          },
          {
            x: 2,
            y: 5
          },
          {
            x: 3,
            y: 5
          },
          {
            x: 4,
            y: 5
          }],
          borderColor: '#E31900',
          backgroundColor: '#E31900'
        }]
      },
      options: {
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              displayFormats: {
                hour: 'hh:mm:ss a'
              }
            }
          }],
          yAxes: [{
            type: 'linear',
            ticks: {
              min: 0,
              suggestedMax: 250
            }
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
