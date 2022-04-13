import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
const axios = require('axios')


const loader = new THREE.TextureLoader();
const texture2 = loader.load('https://raw.githubusercontent.com/JulienGery/nsi/main/threeJS_memory/static/tmp.jpg') //front
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const canvas = document.querySelector('canvas.webgl')
const dim = new THREE.Vector3(1, 1, .001)
const nb_card = parseInt(prompt("nombre de pair"))
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xffffff)

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
camera.position.x = 0
camera.position.y = 0
camera.position.z = 20
// camera.lookAt(new THREE.Vector3(Zpos / 2, racineNb / 2, 0))
scene.add(camera)






class Card {

    constructor(dim, pos, texture, name) {
        this.x = dim.x
        this.y = dim.y
        this.z = dim.z
        this.px = pos.x
        this.py = pos.y
        this.pz = pos.z
        // this.BoxBufferGeometry = new THREE.BoxBufferGeometry(this.x, this.y, this.z, 2, 2, 2);
        this.name = name;
        this.card = this.makeCard(texture);
        this.card.name = this.name
        this.uuid = this.card.uuid;
    }

    makeCard(texture) {

        return new THREE.Mesh(new THREE.BoxBufferGeometry(this.x, this.y, this.z, 2, 2, 2), [
            new THREE.MeshStandardMaterial({ color: "#000000", side: THREE.DoubleSide }),
            new THREE.MeshStandardMaterial({ color: "#000000", side: THREE.DoubleSide }),
            new THREE.MeshStandardMaterial({ color: "#000000", side: THREE.DoubleSide }),
            new THREE.MeshStandardMaterial({ color: "#000000", side: THREE.DoubleSide }),
            new THREE.MeshStandardMaterial({ color: "#ffffff", side: THREE.DoubleSide, map: texture2 }), //front
            new THREE.MeshStandardMaterial({ color: "#ffffff", side: THREE.DoubleSide, map: texture }), //back change that
        ])

    }

    show() {
        console.log("placing")
        scene.add(this.card)
    }


    setPlace(x, y, z) {
        this.px = x
        this.py = y
        this.pz = z
        this.card.position.set(x, y, z)
    }

}


class Game {

    constructor(numberCard) {
        this.numberCard = numberCard
        this.allCard = []
        this.sqrtNumberCard = Math.floor(Math.sqrt(nb_card) * 2)
        this.Xpos = Math.ceil(this.numberCard * 2 / this.sqrtNumberCard)
        this.CreateCard()
    }

    CreateCard() {
        axios.get("https://picsum.photos/v2/list?page=" + Math.floor(Math.random() * 10) + "&limit=" + nb_card).then((response) => {
            const data = response.data
            for(let i = 0; i<data.length; i++){
                this.downloadTexture(data[i].download_url)
            }
        })
    }

    async downloadTexture(URL){
        loader.loadAsync(URL).then((rep) => {
            for(let i = 0; i<2; i++){
                this.allCard.push(new Card(dim, new THREE.Vector3(0, 0, 0), rep, i))
            }
            if(this.allCard.length == this.numberCard*2){
                this.shuffleArray(this.allCard)
                this.placeCard()
            }
        }).catch((err) => {
            console.log(err)
            this.downloadTexture(URL)
        })
    }


    shuffleArray(){
        for (let i = this.allCard.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.allCard[i];
            this.allCard[i] = this.allCard[j];
            this.allCard[j] = temp;
        }
    }

    placeCard(){
        for (let i = 0; i < this.sqrtNumberCard; i++) {
            for (let j = 0; j < this.Xpos && i * this.Xpos + j < this.numberCard * 2; j++) {
                this.allCard[i * this.Xpos + j].setPlace(i * 1.2, j * 1.2, 0)
                this.allCard[i * this.Xpos + j].show()
            }
        }
    }

}

const game = new Game(nb_card)

const pointLight = new THREE.AmbientLight(0xffffff, 1)

scene.add(pointLight)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


const tick = () => {

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)

}

tick()