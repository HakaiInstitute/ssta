import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as d3 from 'd3'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Textures
const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)

const earthTexture = textureLoader.load('./textures/8k_earth_daymap.jpg')
// console.log(earthTexture)
// earthTexture.needsUpdate = true

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.SphereGeometry(1, 64, 32)
const material = new THREE.MeshBasicMaterial({ map: earthTexture })
const sphere = new THREE.Mesh(geometry, material)

scene.add(sphere)

// temperature Mesh
const minMaxValueToUse = 4

const scaleAnomaly = d3
  .scaleDiverging((t) => d3.interpolateRdBu(1 - t))
  .domain([0, 0.5, 1])

// functions
function normalizedAnomalyCalc (data) {
  // console.log(data);

  const out = d3.map(data, (d) => {
    if (d.sst === 'NA') {
      // console.log(d);
      d.sst = 0
    }
    const anom =
        (d.sst - -minMaxValueToUse) / (minMaxValueToUse - -minMaxValueToUse)
    return anom > 1 ? 1 : anom < 0 ? 0 : anom
  })
  return out
}

function makeColors (dataset) {
  const count = dataset.length
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    const d3Colors = d3.color(scaleAnomaly(dataset[i]))

    colors[i3 + 0] = d3Colors.r / 255
    colors[i3 + 1] = d3Colors.g / 255
    colors[i3 + 2] = d3Colors.b / 255
    // mutable debug = positionOnGlobe;
  }
  return colors
}

// convert the positions from a lat, lon to a position on a sphere.
function latLongToVector3 (lat, lon, radius, heigth) {
  var phi = (lat * Math.PI) / 180
  var theta = ((lon - 180) * Math.PI) / 180

  var x = -(radius + heigth) * Math.cos(phi) * Math.cos(theta)
  var y = (radius + heigth) * Math.sin(phi)
  var z = (radius + heigth) * Math.cos(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

// load initial file
d3.csv('./20150106.csv').then(function (positionData) {
  //   const PositionData = await d3.csv("./data/20150106.csv");

  // d3.csv('./data/20150101.csv').then(function (data) {
  //   console.log(data)
  // })
  //   console.log(PositionData)

  const normalizedData = normalizedAnomalyCalc(positionData)
  const firstColors = makeColors(normalizedData)
  // console.log(data.length)

  // calc positions
  const count = positionData.length

  const positions = new Float32Array(count * 3)
  for (let i = 0; i < positionData.length; i++) {
    const i3 = i * 3

    // Convert from lat long to position on earth
    const positionOnGlobe = latLongToVector3(
      positionData[i].y,
      positionData[i].x,
      1,
      0.001
    )

    positions[i3 + 0] = positionOnGlobe.x
    positions[i3 + 1] = positionOnGlobe.y
    positions[i3 + 2] = positionOnGlobe.z
  }
  //   console.log(positions)
  const particlesGeometry = new THREE.BufferGeometry()

  particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  )

  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(firstColors, 3))

  // Material
  const particlesMaterial = new THREE.PointsMaterial()
  particlesMaterial.size = 0.008

  particlesMaterial.vertexColors = true
  const particles = new THREE.Points(particlesGeometry, particlesMaterial)
  //   console.log(particles)
  scene.add(particles)
  //   scene.add(sphere)

  scene.position.y = 0.5

  // Sizes
  const sizes = {
    width: 900,
    height: 900
  }
  window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })
  // Camera
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
  camera.position.z = 3
  scene.add(camera)

  // Controls
  const controls = new OrbitControls(camera, canvas)
  controls.minDistance = 1.5
  controls.maxDistance = 8
  controls.enableDamping = true

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas
  })

  renderer.setSize(sizes.width, sizes.height)
  renderer.render(scene, camera)

  /**
 * Animate
 */
  //   const clock = new THREE.Clock()

  const tick = () => {
    // const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
  }

  tick()

//   function animate() {
//     // console.log(scene)
//     scene.rotation.y += 0.04;
//     requestAnimationFrame(animate);
//     renderer.render(scene, camera);
//     // labelRenderer.render(scene, camera);
//   }
//   function animate() {
//     // resize();
//     scene.rotation.y += 0.005;
//     renderer.render(scene, camera);
//     requestAnimationFrame(animate);
//   }
//   animate()
  // all the rest of the data

  function animateFiles (colorsIn) {
    const count = colorsIn.length
    const colors = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Update colors. Currently not the same point as original
      particles.geometry.attributes.color.array[i3 + 0] = colorsIn[i3 + 0] // Math.random();
      particles.geometry.attributes.color.array[i3 + 1] = colorsIn[i3 + 1]
      particles.geometry.attributes.color.array[i3 + 2] = colorsIn[i3 + 2]
    }

    particles.geometry.attributes.color.needsUpdate = true // important!
    // requestAnimationFrame(animate);
  }

  function delay(milisec) {
    return new Promise(resolve => {
        setTimeout(() => { resolve('') }, milisec);
    })
}



// concatinate returned arrays
function Float32Concat(first, second)
{
    var firstLength = first.length,
        result = new Float32Array(firstLength + second.length);

    result.set(first);
    result.set(second, firstLength);

    return result;z
}

function createWorker(data) {
    return new Promise(function(resolve, reject) {
        var v = new Worker(new URL('./for.js', import.meta.url));
        v.postMessage(data);
        v.onmessage = function(event){
        
            resolve(event.data);
        };
 
        v.onerror = reject; // Rejects the promise if an error is raised by the web worker, passing along the ErrorEvent
      
    });
}

// let files = ['./data/DailyData201501.dat','./data/DailyData201502.dat','./data/DailyData201503.dat']
const dates = Array.from({length: 30}, (_, i) => {
  const date = new Date(2015, 2, 1);
  date.setDate(i + 1);
  return date;
})


let promises = [];
for(let i = 0; i < dates.length; i++) {
    promises.push(createWorker('./data/'+ dates[i].toISOString().slice(0, 10).replaceAll('-','')+ '.dat'));
}

// runs the animation
async function printy(colorData) {
      // Rotation
 
  
    // console.log('tick')
    const count = 555976 * 3 //size of each grid
    for (let i = 0; i < colorData.length; i += count) {
        let dayofData = colorData.slice(i, i + count)
        // await delay(1000);
        // console.log('tick')
        animateFiles(dayofData)
        
    }


}
Promise.all(promises)
    .then(function(data) {
      let colorData = null
        // console.log(data)
        async function load () { 
        for(let i = 0; i < data.length; i++){
          // colorData =  i === 0 ? data[i] : Float32Concat(colorData,data[i])
          await delay(100);
          
          printy(data[i])
        }
      }
      load()
        // let c = new Float32Array(data.length * 555976 * 3);

        // let colorData = Float32Concat(data[0],data[1])
        //  colorData = Float32Concat(colorData,data[2])
        //  colorData = Float32Concat(colorData,data[3])
        // console.log(colorData.length)
        // 
        // for(j = 0; j < data.length; j++){
            // printy(data[0])
        // }

        // animate();

// printy(colorData)
// test additional web workers


    })
    .catch(function(error) {
        // something went wrong
    });



})
