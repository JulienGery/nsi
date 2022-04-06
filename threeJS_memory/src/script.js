import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
const axios = require('axios')

const loader = new THREE.TextureLoader();
const texture2 = loader.load('https://raw.githubusercontent.com/JulienGery/nsi/main/threeJS_memory/static/tmp.jpg') //front
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const dim = new THREE.Vector3(1, 1, .001)
const nb_card = parseInt(prompt("nombre de pair"))
const racineNb = Math.floor(Math.sqrt(nb_card) * 2)
const Zpos = Math.ceil(nb_card * 2 / racineNb)
const allCard = []
const textureURL = []

axios.get("https://picsum.photos/v2/list?limit=" + nb_card).then((response) => {
    for (let i = 0; i < nb_card; i++) {
        for (let j = 0; j < 2; j++) {
            allCard.push(new card(dim, new THREE.Vector3(0, 0, 0), response.data[i].download_url, i))
        }
    }
    
    const shuffleArray = array => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
    
    
    shuffleArray(allCard)
    
    for (let i = 0; i < racineNb; i++) {
        for (let j = 0; j < Zpos && i * Zpos + j < nb_card * 2; j++) {
            allCard[i * Zpos + j].setPlace(i * 1.2, j * 1.2, 0)
        }
    }
})

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xffffff)

class card {

    constructor(dim, pos, texture, name) {
        this.x = dim.x
        this.y = dim.y
        this.z = dim.z
        this.px = pos.x
        this.py = pos.y
        this.pz = pos.z
        this.texture = texture;
        this.name = name;
        this.geometry = new THREE.BoxBufferGeometry(this.x, this.y, this.z, 2, 2, 2);
        // this.line = this.makeLine();
        this.card = this.makeCard();
        this.uuid = this.card.uuid;
        // this.group = this.makeGroup();
        this.place();
    }

    makeCard() {

        return new THREE.Mesh(this.geometry, [
            new THREE.MeshStandardMaterial({ color: "#000000", side: THREE.DoubleSide }),
            new THREE.MeshStandardMaterial({ color: "#000000", side: THREE.DoubleSide }),
            new THREE.MeshStandardMaterial({ color: "#000000", side: THREE.DoubleSide }),
            new THREE.MeshStandardMaterial({ color: "#000000", side: THREE.DoubleSide }),
            new THREE.MeshStandardMaterial({ color: "#ffffff", side: THREE.DoubleSide, map: texture2 }), //front
            new THREE.MeshStandardMaterial({ color: "#ffffff", side: THREE.DoubleSide, map: loader.load(this.texture) }), //back
        ])

    }

    makeLine() {
        return new THREE.LineSegments(new THREE.EdgesGeometry(this.geometry), new THREE.LineBasicMaterial({ color: 0x000000 }));
    }

    makeGroup() {
        const group = new THREE.Group();
        group.add(this.card);
        group.add(this.line);
        return group
    }

    place() {
        //pour les futures groups
        // scene.add(this.group)
        // this.group.position.set(this.px, this.py, this.pz)

        this.card.name = this.name

        this.setPlace(this.px, this.py, this.pz)
        scene.add(this.card)
    }

    setPlace(x, y, z) {
        this.card.position.set(x, y, z)
    }

}

//compariason des nom des cartes 







const resetMaterial = () => {
    for (let i = 0; i < scene.children.length; i++) {
        if (scene.children[i].material) {
            scene.children[i].material[4].color = new THREE.Color(0xffffff)
        }
    }
}

const rotate = (intersects, coef, end, start = 0) => {

    const intersect = intersects
    const coef2 = coef
    let clock2 = new THREE.Clock()

    const jpp = () => {
        const elapsedTime = clock2.getElapsedTime()
        intersect.rotation.y = 10 * elapsedTime * coef2 + start

        renderer.render(scene, camera)
        if (elapsedTime < 0.31415926535) {
            window.requestAnimationFrame(jpp)
        }
        else {
            intersect.rotation.y = end
        }
    }

    window.requestAnimationFrame(jpp)

}

let haveRotate = []

const compare = (intersect, array) => {
    if (array.length == 0) {
        return true
    }
    for (let i = 0; i < array.length; i++) {
        if (array[i].uuid == intersect.object.uuid) {
            return false
        }
    }
    return true
}

function onMouseClick(event) {
    if (haveRotate.length == 2) {
        if (haveRotate[0].name == haveRotate[1].name) {
            for (let i = 0; i < allCard.length; i++) {
                if (allCard[i].name === haveRotate[0].name) {
                    allCard.pop(i)
                    allCard.pop(i)
                    break
                }
            }

            for (let i = 0; i < haveRotate.length; i++) {
                scene.remove(haveRotate[i])
            }
        }

        else for (let i = 0; i < haveRotate.length; i++) {
            rotate(haveRotate[i], -1, 0, Math.PI)
        }

        haveRotate = []
    }

    const intersects = pickCard()

    if (intersects.length == 2) {
        if (compare(intersects[0], haveRotate)) {
            haveRotate.push(intersects[0].object);
            rotate(intersects[0].object, 1, Math.PI)
        }
    }

}


function onPointerMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

const pickCard = () => {
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(scene.children);
    // return raycaster.intersectObjects(scene.children, false, jsp)
}

const mouseHover = () => {
    const intersects = pickCard()

    if (intersects.length == 2) {
        for (let i = 0; i < intersects.length; i++) {
            intersects[i].object.material[4].color = new THREE.Color(0x000000)
        }
    }
}

// carte.rotation.x = 181
// gui.add(carte.rotation, "x")
// gui.add(carte.rotation, "y")
// gui.add(carte.rotation, "z")

// Lights

const pointLight = new THREE.AmbientLight(0xffffff, 1)

scene.add(pointLight)

/**
 * Sizes
 */
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




/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = Zpos/2
camera.position.y = racineNb/2
camera.position.z = 20
camera.lookAt(new THREE.Vector3(Zpos/2, racineNb/2, 0))
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



/**
 * Animate
 */


scene.updateMatrixWorld();

const tick = () => {

    // Update Orbital Controls
    // controls.update()

    // Render

    // resetMaterial()
    // mouseHover()
    renderer.render(scene, camera)

    // Call tick again on the next frame

    window.requestAnimationFrame(tick)
}

window.addEventListener('click', onMouseClick);
window.addEventListener('pointermove', onPointerMove);


tick()