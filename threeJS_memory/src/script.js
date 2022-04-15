import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
const axios = require('axios')

const gltfLoader = new GLTFLoader();
const loader = new THREE.TextureLoader();
const texture2 = loader.load('https://raw.githubusercontent.com/JulienGery/nsi/main/threeJS_memory/static/tmp.jpg') //front
const canvas = document.querySelector('canvas.webgl')
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const dim = new THREE.Vector3(1, 1, .001);
const nb_card = parseInt(prompt("nombre de pair"));
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
camera.position.x = 0
camera.position.y = 0
camera.position.z = 20
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true






class Card {

    constructor(pos, texture, name, gltf) {
        this.pos = pos
        this.px = pos.x;
        this.py = pos.y;
        this.pz = pos.z;
        this.gltf = gltf.clone(true);
        this.gltf.children[0].children[0].material = new THREE.MeshBasicMaterial({ color: "#ffffff", map: texture })
        this.gltf.children[0].children[1].material = new THREE.MeshBasicMaterial({ color: "#ffffff", map: texture2 })
        // this.gltf.children[0].children[2].material = new THREE.MeshBasicMaterial({ color: "#000000"}) //side
        this.name = name;
        for (let i = 0; i < this.gltf.children[0].children.length; i++) {
            this.gltf.children[0].children[i].name = name
        }
        this.uuid = this.gltf.uuid
    }

    show() {
        scene.add(this.gltf)
    }


    setPlace(x, y, z) {
        this.px = x;
        this.py = y;
        this.pz = z;
        this.pos.x = x
        this.pos.y = y
        this.pos.z = z
        this.gltf.position.set(x, y, z)
    }

    rotate(start, end, coef) {
        const clock = new THREE.Clock();

        const actualRotate = () => {

            const elapsedTime = clock.getElapsedTime();
            this.gltf.rotation.y = 10 * elapsedTime * coef + start;

            // const q = start.slerp(end, elapsedTime*.01)
            // this.card.setRotationFromQuaternion(q)

            if (elapsedTime < 0.31415926535) {
                window.requestAnimationFrame(actualRotate)
            }
            else {

                // console.log(elapsedTime)
                // this.card.setRotationFromQuaternion(end)

                this.gltf.rotation.y = end;
            }
            renderer.render(scene, camera);
        }

        window.requestAnimationFrame(actualRotate);

    }

    moveTo(from, to) {
        if (from.equals(to)) {
            return
        }
        const clock = new THREE.Clock();

        const actualMouveTo = () => {
            const elapsedTime = clock.getElapsedTime();

            const lerpPos = from.lerp(to, elapsedTime / 10)
            // this.gltf.position.set(lerpPos.x, lerpPos.y, lerpPos.z)
            this.setPlace(lerpPos.x, lerpPos.y, lerpPos.z)

            if (elapsedTime < 1.01) {
                window.requestAnimationFrame(actualMouveTo);
            } else {
                // this.gltf.position.set(to.x, to.y, to.z);
                this.setPlace(to.x, to.y, to.z)
            }
            renderer.render(scene, camera);
        }
        window.requestAnimationFrame(actualMouveTo)

    }


    remove() {
        scene.remove(this.gltf);
    }

}


class Game {

    constructor(numberCard) {
        this.numberCard = numberCard;
        this.allCard = [];
        this.sqrtNumberCard = Math.floor(Math.sqrt(nb_card) * 2);
        this.Xpos = Math.ceil(this.numberCard * 2 / this.sqrtNumberCard);
        this.CreateCard();
    }

    CreateCard() {
        gltfLoader.load('https://raw.githubusercontent.com/JulienGery/nsi/main/threeJS_memory/static/carte.gltf', (gltf) => {
            this.getImage(gltf)
        }, (progess) => {

        }, (error) => {
            this.CreateCard()
        })
    }

    getImage(gltf) {
        axios.get("https://picsum.photos/v2/list?page=" + Math.floor(Math.random() * 1000 / this.numberCard) + "&limit=" + nb_card).then((response) => {
            const data = response.data;
            for (let i = 0; i < data.length; i++) {
                this.downloadTexture(data[i].download_url, gltf.scene)
            }
        }).catch((err) => {
            this.getImage(gltf)
        })
    }

    async downloadTexture(URL, gltf) {
        loader.loadAsync(URL).then((rep) => {
            for (let i = 0; i < 2; i++) {
                this.allCard.push(new Card(new THREE.Vector3(0, 0, 0), rep, this.allCard.length - i, gltf))
            }
            if (this.allCard.length == this.numberCard * 2) {
                this.shuffleArray(this.allCard);
                this.placeCard();
            }
        }).catch((err) => {
            console.log(err);
            this.downloadTexture(URL, gltf);
        })
    }


    shuffleArray() {
        for (let i = this.allCard.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.allCard[i];
            this.allCard[i] = this.allCard[j];
            this.allCard[j] = temp;
        }
    }

    placeCard() {
        const place = new THREE.Vector2(this.sqrtNumberCard * 2.3, this.Xpos)

        for (let i = 0; i < this.allCard.length; i++) {
            this.allCard[i].setPlace(place.x, place.y, 0)
            this.allCard[i].show()
        }

        for (let i = 0; i < this.sqrtNumberCard; i++) {
            for (let j = 0; j < this.Xpos && i * this.Xpos + j < this.numberCard * 2; j++) {
                this.allCard[i * this.Xpos + j].moveTo(new THREE.Vector3(place.x, place.y, 0), new THREE.Vector3(i * 2.3, j * 3.7, 0));
            }
        }
    }

    //actual game

}


const game = new Game(nb_card)

let haveRotate = []

function onPointerMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    onMouseOver()
}

function compare(intersect, array) {
    if (array.length == 0) {
        return true
    }
    for (let i = 0; i < array.length; i++) {
        if (game.allCard[array[i]].uuid == intersect.object.uuid) {
            return false
        }
    }
    return true
}

function pickCard() {

    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(scene.children, true);

}

function onMouseClick(event) {

    // const qFront = new THREE.Quaternion(0, 0, 0, 1);
    // const qBack = new THREE.Quaternion(0, 1, 0, 0);

    if (haveRotate.length == 2) {
        if (haveRotate[0] < haveRotate[1]) {
            haveRotate.reverse();
        }
        if (game.allCard[haveRotate[0]].name == game.allCard[haveRotate[1]].name) {
            for (let i = 0; i < haveRotate.length; i++) {
                const PopingCard = game.allCard.splice(haveRotate[i], 1)[0];
                PopingCard.remove();
            }
        }
        else {
            for (let i = 0; i < haveRotate.length; i++) {
                game.allCard[haveRotate[i]].rotate(Math.PI, 0, -1);
            }
        }
        haveRotate = [];
    }

    const intersects = pickCard()

    if (intersects.length == 1) {
        if (compare(intersects[0], haveRotate)) {
            for (let i = 0; i < game.allCard.length; i++) {
                if (game.allCard[i].uuid == intersects[0].object.parent.parent.uuid) {
                    game.allCard[i].rotate(0, Math.PI, 1);
                    haveRotate.push(i);
                    break
                }
            }
        }
    }
}

let haveMouve = []

const onMouseOver = () => {
    const intersects = pickCard();
    console.log(haveMouve)
    if (intersects.length == 1) {
        for (let i = 0; i < game.allCard.length; i++) {
            if (game.allCard[i].uuid == intersects[0].object.parent.parent.uuid) {
                if (haveMouve.length != 1) {
                    const pos = game.allCard[i].pos.clone()
                    game.allCard[i].moveTo(pos, new THREE.Vector3(pos.x, pos.y, 2))
                    haveMouve.push(i)
                } else if (haveMouve[0] != i) {
                    const pos = game.allCard[haveMouve[0]].pos.clone()
                    game.allCard[haveMouve[0]].moveTo(pos, new THREE.Vector3(pos.x, pos.y, 0))
                    haveMouve = []
                    haveMouve.push(i)
                }
            }
        }
    } else if (intersects.length == 0) {
        if (haveMouve.length == 1) {
            const pos = game.allCard[haveMouve[0]].pos.clone()
            game.allCard[haveMouve[0]].moveTo(pos, new THREE.Vector3(pos.x, pos.y, 0))
        }
        haveMouve = []
    }
}

function tick() {
    stats.begin();

    renderer.render(scene, camera);
    stats.end();

    window.requestAnimationFrame(tick);
}


window.addEventListener('click', onMouseClick);
window.addEventListener('pointermove', onPointerMove);
// window.addEventListener('click', test);

tick()