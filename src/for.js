import * as d3 from 'd3'
// import fs from 'fs'

const minMaxValueToUse = 4
const count = 555976 * 3
// const loadedBuffer = fs.readFileSync('data.dat')
// const newFloat32Array = new Float32Array(loadedBuffer.buffer)
onmessage = function (fileToLoad) {
  // console.log(fileToLoad.data)
  d3.buffer(fileToLoad.data).then(function (data) {
    // console.log(new Float32Array(data).length)
    postMessage(new Float32Array(data))
  })
  // d3.csv(fileToLoad.data).then(function (data) {
  //   // console.log(new Float32Array(data.map(d => d.sst)))
  //   postMessage(new Float32Array(data.map(d => d.sst)))
  // })
}
// d3.csv('./data/outputfile.csv').then(function (data) {
// functions
// function normalizedAnomalyCalc (data) {
//   // console.log(data);

//   const out = d3.map(data, (d) => {
//     if (d.sst === 'NA') {
//       // console.log(d);
//       d.sst = 0
//     }
//     const anom =
//       (d.sst - -minMaxValueToUse) / (minMaxValueToUse - -minMaxValueToUse)
//     return anom > 1 ? 1 : anom < 0 ? 0 : anom
//   })
//   return out
// }

// function makeColors (dataset) {
//   const scaleAnomaly = d3
//     .scaleDiverging((t) => d3.interpolateRdBu(1 - t))
//     .domain([0, 0.5, 1])
//   const count = dataset.length
//   const colors = new Float32Array(count * 3)

//   for (let i = 0; i < count; i++) {
//     const i3 = i * 3

//     const d3Colors = d3.color(scaleAnomaly(dataset[i]))

//     colors[i3 + 0] = d3Colors.r / 255
//     colors[i3 + 1] = d3Colors.g / 255
//     colors[i3 + 2] = d3Colors.b / 255
//     // mutable debug = positionOnGlobe;
//   }
//   return colors
// }
//   const day = new Float32Array(dayofData.map(d => d.val))
//   for (let i = 0; i < data.length; i += count) {
//     const dayofData = data.slice(i, i + count)

//     const day = new Float32Array(dayofData.map(d => d.val)) // makeColors(normalizedAnomalyCalc(dayofData))
//     // console.log(day.length)
//     postMessage(day)
//   }
// })
// setTimeout(() => {
//   postMessage('Hello World!')
// }, 5000)
