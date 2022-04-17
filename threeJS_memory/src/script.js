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
const gui = new dat.GUI();
const nb_card = parseInt(prompt("nombre de paires"));
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

scene.add(camera)






class Card {

    constructor(pos, texture, name, gltf) {
        this.pos = pos //vector 3
        this.gltf = gltf.clone(true); //clone the gltf which is the card
        this.gltf.children[0].children[0].material = new THREE.MeshBasicMaterial({ color: "#ffffff", map: texture }) //setting back texture 
        this.gltf.children[0].children[1].material = new THREE.MeshBasicMaterial({ color: "#ffffff", map: texture2 })//setting front texture 
        // this.gltf.children[0].children[2].material = new THREE.MeshBasicMaterial({ color: "#000000"}) //side
        this.name = name; //name which define pairs
        this.uuid = this.gltf.uuid //get the uuid of the shape for convenience
    }

    show() {
        scene.add(this.gltf)//add gltf to the scene
    }


    setPlace(x, y, z) {
        this.pos.x = x
        this.pos.y = y
        this.pos.z = z
        this.gltf.position.set(x, y, z)
    }

    rotate(start, end, coef) {
        const clock = new THREE.Clock();

        const actualRotate = () => {
            //TODO use quaternion (and see why does it break)
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

    moveTo(from, to, time = 1) {
        const clock = new THREE.Clock();

        const actualMouveTo = () => {
            const elapsedTime = clock.getElapsedTime();

            const lerpPos = from.lerp(to, elapsedTime / (10 * time))
            // this.gltf.position.set(lerpPos.x, lerpPos.y, lerpPos.z)
            this.setPlace(lerpPos.x, lerpPos.y, lerpPos.z)

            if (elapsedTime < time + .1) {
                window.requestAnimationFrame(actualMouveTo);
            } else {
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
        this.Ypos = Math.ceil(this.numberCard * 2 / this.sqrtNumberCard);
        this.place = new THREE.Vector2((this.sqrtNumberCard - 1) * 2.3 / 2, (this.Ypos - 1) * 3.7 / 2)
        this.CreateCard();
    }

    CreateCard() {
        gltfLoader.load('https://raw.githubusercontent.com/JulienGery/nsi/main/threeJS_memory/static/carte.gltf', (gltf) => {
            this.getImage(gltf)//doawnload gltf of the card and passing it to constructor. it's kinda ugly but...
        }, (progess) => {

        }, (error) => {
            this.CreateCard()//recall on error
        })
    }

    async getImage(gltf) {
        await axios.get("https://picsum.photos/v2/list?page=" + Math.floor(Math.random() * 1000 / this.numberCard) + "&limit=" + nb_card).then((response) => {
            const data = response.data;//getting image urls
            for (let i = 0; i < data.length; i++) {
                this.downloadTexture(data[i].download_url, gltf.scene)//TODO allow user to enter url(s)
            }
        }).catch((err) => {
            this.getImage(gltf)
        })
        

    }

    async downloadTexture(URL, gltf) {
        loader.loadAsync(URL).then((rep) => {
            for (let i = 0; i < 2; i++) {
                this.allCard.push(new Card(new THREE.Vector3(0, 0, 0), rep, this.allCard.length - i, gltf))//creating card
            }
            if (this.allCard.length == this.numberCard * 2) {
                this.shuffleArray(this.allCard);//kinda ugly again but it work so...
                this.placeCard();
            }
        }).catch((err) => {
            console.log(err);
            this.downloadTexture(URL, gltf);//recall on error
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

        for (let i = 0; i < this.allCard.length; i++) {
            this.allCard[i].setPlace(this.place.x, this.place.y, 0)
            this.allCard[i].show()
        }
    }

    spread() {


        for (let i = 0; i < this.sqrtNumberCard; i++) {
            for (let j = 0; j < this.Ypos && i * this.Ypos + j < this.numberCard * 2; j++) {
                this.allCard[i * this.Ypos + j].moveTo(this.allCard[i * this.Ypos + j].pos, new THREE.Vector3(i * 2.3, j * 3.7, 0));
            }
        }
    }

    //actual game
    //still nothing

}


const game = new Game(nb_card)

camera.position.x = game.place.x
camera.position.y = game.place.y
camera.position.z = 20
camera.lookAt(new THREE.Vector3(game.place.x, game.place.y, 0))
let haveRotate = []

function onPointerMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

const ponterMoveAspread = (event) => {
    onPointerMove(event)
    onMouseOver()
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
                if (haveMove.includes(haveRotate[i])) {
                    haveMove = []
                }
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
        for (let i = 0; i < game.allCard.length; i++) {
            if (game.allCard[i].uuid == intersects[0].object.parent.parent.uuid) {
                if (!haveRotate.includes(i, 0)) {
                    game.allCard[i].rotate(0, Math.PI, 1);
                    haveRotate.push(i);
                    moveDown()
                    break
                }
            }
        }
    }
}

let haveMove = []

const moveUp = (i) => {
    const pos = game.allCard[i].pos.clone()
    game.allCard[i].moveTo(pos, new THREE.Vector3(pos.x, pos.y, 1.5), .5)
}

const moveDown = (i = 0) => {
    const pos = game.allCard[haveMove[i]].pos.clone()
    game.allCard[haveMove[i]].moveTo(pos, new THREE.Vector3(pos.x, pos.y, 0), .5)
}

const onMouseOver = () => {
    const intersects = pickCard();
    if (intersects.length == 1) {
        for (let i = 0; i < game.allCard.length; i++) {
            //getting index of the card under the mouse in allCard and moving it up and moving the older card down
            if (game.allCard[i].uuid == intersects[0].object.parent.parent.uuid) {
                if (!haveMove.includes(i, 0)) {
                    if (haveMove.length > 0) {
                        moveDown()
                        haveMove = []
                    }
                    haveMove.push(i)
                    moveUp(i)
                }
            }
        }
    } else if (haveMove.length > 0) {
        //moving the older card down
        moveDown()
        haveMove = []
    }
}


const beforeSpread = (event) => {
    game.spread()
    window.removeEventListener('click', beforeSpread)
    window.removeEventListener('pointermove', onPointerMove)

    const addListner = () => {
        const controls = new OrbitControls(camera, canvas)
        // controls.enableDamping = true    
        window.addEventListener('click', onMouseClick)
        window.addEventListener('pointermove', ponterMoveAspread)
    }
    setTimeout(addListner, 1200);
}

window.addEventListener('click', beforeSpread);
window.addEventListener('pointermove', onPointerMove);

function tick() {
    stats.begin();

    renderer.render(scene, camera);
    stats.end();

    window.requestAnimationFrame(tick);
}

tick()