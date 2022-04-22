import './style.css'
import * as THREE from 'three'
import Stats from 'stats.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvas = document.querySelector('canvas.webgl')
const stats = new Stats();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const pointLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(pointLight);

stats.showPanel(0);
document.body.appendChild(stats.dom);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
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

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 20)
const controls = new OrbitControls(camera, canvas)
scene.add(camera)

const nbObject = 5000

function randomUnitVector() {
    const vec = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
    return vec;
}

class explosion {
    constructor(x, y) {
        this.x = x
        this.y = y 
        this.speeds = []
        this.createGeometry()
        this.points = new THREE.Points(this.geometry, new THREE.PointsMaterial({ color: 'red', size: .15 }))
        scene.add(this.points)
        this.position = this.geometry.attributes.position
    }

    createGeometry() {
        this.geometry = new THREE.BufferGeometry();
        let vertices = []
        for (let i = 0; i < nbObject; i++) {
            const vec = randomUnitVector()
            vec.multiplyScalar(.1)
            vertices.push(vec.x + this.x, vec.y + this.y, vec.z)
            this.speeds.push(Math.random())
        }
        this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
    }

    update() {
        for (let i = 0; i < nbObject; i++) {
            const speed = this.speeds[i]
            const x = this.position.getX(i) 
            const y = this.position.getY(i) 
            const z = this.position.getZ(i)
            this.position.setXYZ(i, (x-this.x) * speed + x , (y-this.y) * speed + y , z * speed + z)
        }
        this.position.needsUpdate = true;
    }
    remove(){
        scene.remove(this.points)
    }
}

let tmp = []
tmp.push(new explosion(0, 0))

const caca = () => {

    const vec = randomUnitVector()
    tmp.push(new explosion(vec.x * Math.random() * 10, vec.y * 10 * Math.random()))
}

console.log(tmp[0])

window.addEventListener('click', caca)

function tick() {
    stats.begin();
    for (let i = 0; i < tmp.length; i++) {
        tmp[i].update()
    }

    renderer.render(scene, camera);

    stats.end();

    window.requestAnimationFrame(tick);
}

tick()