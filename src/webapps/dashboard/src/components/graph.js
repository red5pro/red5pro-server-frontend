/* global Datamap */
/* global jQuery */
let moment = require('moment')
import Chart from 'chart.js'

Chart.defaults.global.responsive = true

// Class to easily configure maps made from http://datamaps.github.io/
export class MAP {
  constructor (context, width) {
    this.context = context
    this.width = width
    this.map
    this.bubbles = {}
    this.arcs = {}
  }
  // Make the Datamap using the contructor values.
  makeMap () {
    this.map = new Datamap({
      element: this.context,
      fills: {
        defaultFill: '#a8a8a8',
        publisher: '#E31900',
        subscriber: '#E31900'
      },
      height: null,
      width: this.width,
      responsive: true,
      bubblesConfig: {
        borderColor: '#E31900'
      }
    })
  }
  // Add a publisher as a bubble. See Datamap documention on bubbles for format.
  addPublisher (location, name, id) {
    // create the bubble.
    let newPublisher = {
      name: name,
      radius: 5,
      latitude: location[0],
      longitude: location[1],
      fillKey: 'publisher'
    }
    // Add the bubble to the class constructor dict.
    this.bubbles[id] = newPublisher

    // Add the bubbles from the class into an array so datamaps can accept them.
    let tempBubbles = []
    Object.keys(this.bubbles).forEach((bubbleId) => {
      tempBubbles.push(this.bubbles[bubbleId])
    })
    // Add the bubbles to the map, and define a function for hover.
    this.map.bubbles(tempBubbles, {
      popupTemplate: function (geography, data) {
        return ['<div class="hoverinfo"><strong>' + data.name + '</strong>' + '</div>'].join('')
      }
    })
  }

  removePublisher (id) {
    // Remove the bubble from the class dict.
    delete this.bubbles[id]

    // Add the bubbles from the class into an array so datamaps can accept them.
    let tempBubbles = []
    Object.keys(this.bubbles).forEach((bubbleId) => {
      tempBubbles.push(this.bubbles[bubbleId])
    })

    // Add the bubbles to the map, and define a function for hover.
    this.map.bubbles(tempBubbles, {
      popupTemplate: function (geography, data) {
        return ['<div class="hoverinfo"><strong>' + data.name + '</strong>' + '</div>'].join('')
      }
    })
  }
  // Add a Subscriber as a bubble and arc to a publisher bubble. See Datamap documention on bubble and arc for format.
  addSubscriber (origin, destination, name, id) {
    // Make the subscriber bubble.
    let newSubscriber = {
      name: name,
      radius: 1,
      latitude: origin[0],
      longitude: origin[1],
      fillKey: 'subscriber'
    }
    // Make the arc.
    let newArc = {
      origin: {
        latitude: origin[0],
        longitude: origin[1]
      },
      destination: {
        latitude: destination[0],
        longitude: destination[1]
      }
    }
    // Same logic as addPublisher.
    this.bubbles[id] = newSubscriber
    this.arcs[id] = newArc
    let tempBubbles = []
    Object.keys(this.bubbles).forEach((bubbleId) => {
      tempBubbles.push(this.bubbles[bubbleId])
    })
    let tempArcs = []
    Object.keys(this.arcs).forEach((arcId) => {
      tempArcs.push(this.arcs[arcId])
    })
    this.map.bubbles(tempBubbles, {
      popupTemplate: function (geography, data) {
        return ['<div class="hoverinfo"><strong>' + data.name + '</strong>' + '</div>'].join('')
      }
    })
    this.map.arc(tempArcs, {
      strokeWidth: 2,
      arcSharpness: 1,
      strokeColor: '#E31900'
    })
  }
  removeSubscriber (id) {
    // Same logic as remove publisher.
    this.bubbles.splice(id, 1)
    this.arcs.splice(id, 1)

    let tempBubbles = []
    Object.keys(this.bubbles).forEach((bubbleId) => {
      tempBubbles.push(this.bubbles[bubbleId])
    })
    let tempArcs = []
    Object.keys(this.arcs).forEach((arcId) => {
      tempArcs.push(this.arcs[arcId])
    })
    this.map.bubbles(tempBubbles, {
      popupTemplate: function (geography, data) {
        return ['<div class="hoverinfo"><strong>' + data.name + '</strong>' + '</div>'].join('')
      }
    })
    this.map.arc(tempArcs, {
      strokeWidth: 2,
      arcSharpness: 1,
      strokeColor: '#E31900'
    })
  }
}
// Parent class to easily configure graphs from http://www.chartjs.org/docs.
class Graph {
  constructor () {
    this.titlePreferences = {
      display: true,
      fontSize: 20,
      fontColor: '#a8a8a8',
      fontStyle: 400,
      fontFamily: 'Lato'
    }
    this.red = '#E31900'
    this.grey = '#a8a8a8'
  }
}

export class LineGraph extends Graph {
  // Alot of settings to make the graph line graph look a specific way.  See the chartjs documentation for explanation.
  constructor (context, label = 'label', title = 'title') {
    super()
    this.titlePreferences.text = title

    this.context = context
    this.label = label
    this.length = 11
    this.data = {
      type: 'line',
      data: {
        datasets: [{
          label: this.label,
          data: [],
          borderColor: this.red,
          backgroundColor: this.red,
          radius: 1,
          tension: 0
        },
        {
          label: 'Max Connections',
          data: [],
          borderColor: this.grey,
          backgroundColor: this.grey,
          radius: 1,
          tension: 0
        }]
      },
      options: {
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              displayFormats: {
                hour: 'hh:mm'
              }
            },
            ticks: {
              maxRotation: 30,
              minRotation: 30
            }
          }],
          yAxes: [{
            type: 'linear',
            ticks: {
              min: 0,
              suggestedMax: 10
            }
          }]
        },
        title: this.titlePreferences,
        legend: {
          display: false
        }
      }
    }
    this.currentChart
    // Initialize Data
  }
  makeGraph () {
    // Get the current data.
    let currentData = this.data.data.datasets[0].data

    // Get the current time
    let now = moment()
    // Set the time for previous steps by subtracting from current time. It MUST be done this way because WS interval times
    // are not exact and thus cause seconds to skip occasionally.
    for (let ii = 0; ii < 11; ii++) {
      currentData.unshift({
        x: now.subtract(1, 'seconds').format(),
        y: 0
      })
    }
    // Update class data
    for (let jj = 0; jj < this.data.data.datasets.length; jj++) {
      this.data.data.datasets[jj].data = currentData
    }
    // Make the chart and update the data.
    this.currentChart = new Chart(this.context, this.data)
    this.currentChart.update()
  }

  updateGraph (newData, moreData = []) {
    let timeCeiling = 3599 // Stop increasing x-axis length after 1 hour.
    let currentData = this.data.data.datasets[0].data
    let now = moment()

    // If we haven't reached the ceiling.
    if (currentData.length < timeCeiling) {
      // Add a new datapoint.
      currentData.push({
        x: now.format(),
        y: newData
      })
      // Update previous times based on the new time.It MUST be done this way because WS interval times
      // are not exact and thus cause seconds to skip occasionally.
      for (let ii = 0; ii < currentData.length - 1; ii++) {
        currentData[currentData.length - 2 - ii].x = now.subtract(1, 'seconds').format()
      }
      // Update the class data.
      this.data.data.datasets[0].data = currentData
      // If we want to graph another line on the same chart.
      // Copy the current data and simply change the y values.
      if (moreData) {
        for (let jj = 0; jj < moreData.length; jj++) {
          let copiedObject = jQuery.extend(true, [], currentData)

          for (let kk = 0; kk < copiedObject.length - 1; kk++) {
            copiedObject[kk].y = this.data.data.datasets[jj + 1].data[kk].y
          }

          copiedObject[copiedObject.length - 1].y = moreData[jj]
          this.data.data.datasets[jj + 1].data = copiedObject
        }
      }
    } else { // If we are past one hour, stop making x axis longer and simply shift.
      currentData[currentData.length - 1].x = now.format()

      // Shift x and y data.
      for (let ii = 0; ii < currentData.length - 1; ii++) {
        currentData[ii].y = currentData[ii + 1].y
        currentData[currentData.length - 2 - ii].x = now.subtract(1, 'seconds').format()
      }
      currentData[currentData.length - 1].y = newData
      this.data.data.datasets[0].data = currentData

      // If we want to graph another line on the same chart.
      // Copy the current data and simply change the y values.
      if (moreData) {
        for (let jj = 0; jj < moreData.length; jj++) {
          let copiedObject = jQuery.extend(true, [], currentData)
          for (let kk = 0; kk < currentData.length - 1; kk++) {
            copiedObject[kk].y = this.data.data.datasets[jj + 1].data[kk + 1].y
          }

          copiedObject[copiedObject.length - 1].y = moreData[jj]
          this.data.data.datasets[jj + 1].data = copiedObject
        }
      }
    }
    this.currentChart.update()
  }
  // Reset the graphs data to time 0 length 11.
  reset (title) {
    let resetData = []
    let now = moment()
    if (title) {
      this.data.options.title.text = title
    }
    for (let ii = 0; ii < 11; ii++) {
      resetData.unshift({
        x: now.subtract(1, 'seconds').format(),
        y: 0
      })
    }

    for (let jj = 0; jj < this.data.data.datasets.length; jj++) {
      this.data.data.datasets[jj].data = resetData
    }
    this.currentChart.update()
  }
}

export class DoughnutGraph extends Graph {
  constructor (context, label = ['label'], title = 'title') {
    super()
    this.context = context
    this.titlePreferences.text = title
    this.type = 'doughnut'
    this.label = label
    this.data = {
      type: this.type,
      data: {
        labels: this.label,
        datasets: [{
          data: [1, 1],
          backgroundColor: [
            this.grey,
            this.red
          ]
        }]
      },
      options: {
        title: this.titlePreferences,
        legend: {
          position: 'bottom'
        }
      }
    }
    this.currentChart
  }
  // Make the graph
  makeGraph () {
    this.currentChart = new Chart(this.context, this.data)
  }
  // Update the graph base on give data.
  updateGraph (newData) {
    this.data.data.datasets[0].data = newData
    this.currentChart.update()
  }
}

// Unused graph, but keep just incase.
export class BarGraph extends Graph {
  constructor (context, label = ['label'], title = 'title') {
    super()
    this.context = context
    this.titlePreferences.text = title
    this.label = label
    this.data = {
      type: 'horizontalBar',
      data: {
        labels: this.label,
        datasets: [{
          backgroundColor: [
            this.red
          ],
          data: [0]
        }]
      },
      options: {
        scales: {
          xAxes: [{
            type: 'linear',
            ticks: {
              suggestedMax: 5,
              beginAtZero: true
            }
          }],
          yAxes: [{
            display: false
          }]
        },
        title: this.titlePreferences,
        legend: {
          display: false
        }
      }
    }

    this.currentChart
  }
  // Make the graph.
  makeGraph () {
    this.currentChart = new Chart(this.context, this.data)
  }
  // Update the graph base on input data.
  updateGraph (newData) {
    this.data.data.datasets[0].data = [newData]
    this.currentChart.update()
  }

  // Reset to 0.
  reset (title) {
    this.data.data.datasets[0].datasets = [0]
    if (title) {
      this.data.options.title.text = title
    }
    this.currentChart.update()
  }
}
