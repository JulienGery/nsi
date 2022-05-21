import './style.css'
import * as THREE from 'three'
import { Card } from './card.js'
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff)
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { endGameForm, } from './form.js';
import { displayToaster } from './toaster.js'
import Stats from 'stats.js'
import { Explosion } from './explosion.js'
import { socket } from './form.js';
import { playerNumbers } from './tableau.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// export let game;
const gltfLoader = new GLTFLoader();
const loader = new THREE.TextureLoader();
const texture2 = loader.load('https://raw.githubusercontent.com/JulienGery/nsi/main/threeJS_memory/static/carte_julien_2_Plan_de_travail_1.jpg') //front
let explosions = []
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const stats = new Stats();
stats.showPanel(0);
const centerCard = new THREE.Vector2(.5, .5)
const qFront = new THREE.Quaternion(0, 0, 0, 1);
const qBack = new THREE.Quaternion(0, 1, 0, 0);
let uv;
// const pointLight = new THREE.AmbientLight(0xffffff, 1);
const coefSizesToXYZ = 0.03166561114 * .7;
// scene.add(pointLight)

THREE.Vector3.prototype[Symbol.iterator] = function* () {
    yield this.x;
    yield this.y;
    yield this.z
}

/**
 * 
 * @param {*} element element in the array
 * @param {Array} array array
 * @returns {Number|NaN} return index or NaN
 */
const findIndex = (element, array) => {
    for (let i = 0; i < array.length; i++) {
        if (array[i].name == element) {
            return i
        }
    }
    return NaN
}

/**
 * @class
 */
export class Game {

    constructor(cards) {
        this.init()
        this.endExplosionBind = this.endExplosion.bind(this)
        this.tickBind = this.tick.bind(this)
        this.numberPlayer = playerNumbers;
        this.numberCard = cards.length;
        this.turnedCards = []
        this.cardUnder = NaN
        this.texture = []
        this.gameCards = []
        this.sqrtNumberCard = Math.floor(Math.sqrt(this.numberCard / 2) * 2);
        this.Ypos = Math.ceil(this.numberCard / this.sqrtNumberCard);
        this.offSet = new THREE.Vector3((this.sqrtNumberCard - 1) * 2.3 / 2, (this.Ypos - 1) * 3.7 / 2, 0)
        this.initTexture(cards);
        this.mouseClick = this.setReady.bind(this);
        this.mouseMove = this.updateMouse.bind(this)
        window.addEventListener('pointermove', this.mouseMove)
        // this.tick()

    }

    init(){
        this.sizes ={
            width: window.innerWidth,
            height: window.innerHeight
        }
        scene.clear()
        this.canvas = document.createElement('canvas')
        this.canvas.className = "webgl"
        document.body.appendChild(this.canvas)
        document.body.appendChild(stats.dom)
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        })
        
        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


        
        this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.1, 100)
        this.controls = new OrbitControls(this.camera, this.canvas)
        this.controls.enabled = false;
        this.controls.minPolarAngle = - Math.PI
        this.controls.maxPolarAngle = Math.PI
        this.controls.minAzimuthAngle = - Math.PI / 2
        this.controls.maxAzimuthAngle = Math.PI / 2
        window.addEventListener('resize', () => {
            // Update sizes
            this.sizes.width = window.innerWidth
            this.sizes.height = window.innerHeight
    
            // Update camera
            this.camera.aspect = this.sizes.width / this.sizes.height
            this.camera.updateProjectionMatrix()
    
            // Update renderer
            this.renderer.setSize(this.sizes.width, this.sizes.height)
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
        })
        scene.add(this.camera)
        
        this.camera.position.x = 0
        this.camera.position.y = 0
        this.camera.position.z = 20

        socket.on('action', (action, cardIndex) => {
            switch (action) {
                case 'move-down':
                    this.moveDown(cardIndex)
                    break;
                case 'turn-card':
                    this.gameCards[cardIndex].rotate(qFront, qBack, Math.PI / 10)
                    break;
                case 'pair-found':
                    this.pairFound(cardIndex)
                    break;
                case 'move-up':
                    this.moveUp(cardIndex)
                    break;
                case 'turnback-card':
                    this.gameCards[cardIndex].rotate(qBack, qFront, Math.PI / 10)
                    break;
            }
        })
    
        socket.on('next-player', () => this.addListener())
        socket.once('start-game', () => this.gameStart())

        const fEndForm = () => {
            this.tickBind = this.clearScene.bind(this)
            this.endExplosionBind = this.tickBind
            clearTimeout(this.endExplosionBind)
            document.body.removeChild(this.canvas)
            // game = null
            document.body.removeChild(stats.dom)
            endGameForm.removeForm()
        }
        endGameForm.setFunction(() => {
            fEndForm()
        }, () => fEndForm())
        
    }

    initTexture(cards) {
        displayToaster('téléchargement des images')
        for (let i = 0; i < this.numberCard / 2; i++) {
            this.downloadTexture(cards[findIndex(i, cards)].textureURL, i, cards)
        }
    }
    /**
     * 
     * @param {String} URL 
     * @param {Number} index 
     * @param {Object} cards dict-like
     */
    async downloadTexture(URL, index, cards) {
        loader.loadAsync(URL).then((rep) => {
            this.texture[index] = new THREE.MeshBasicMaterial({ color: "#ffffff", map: rep })
            if (!this.texture.includes(undefined) && this.texture.length == this.numberCard / 2) {
                this.CreateCard(cards)
            }
        }).catch((err) => {
            console.log(err);
            this.downloadTexture(URL, index, cards); //recall on error
        })
    }
    /**
     * 
     * @param {Object} cards 
     */
    CreateCard(cards) {
        displayToaster('creation des cartes')
        gltfLoader.load('https://raw.githubusercontent.com/JulienGery/nsi/main/threeJS_memory/static/carte.gltf', (gltf) => {
            gltf.scene.children[0].children[1].material = new THREE.MeshBasicMaterial({ color: "#ffffff", map: texture2 })
            for (let i = 0; i < this.numberCard; i++) {
                this.gameCards[i] = new Card(new THREE.Vector3(0, 0, 0), this.texture[cards[i].name], cards[i].name, gltf.scene, cards[i].textureURL)
            }
            this.placeCard();
        }, (progess) => {
        }, (error) => {
            this.CreateCard(cards)//recall on error
        })
    }

    placeCard() {
        for (let i = 0; i < this.gameCards.length; i++) {
            this.gameCards[i].show()
            for(let j = 0; j<this.gameCards[i].card.children[0].children.length; j++){
                this.gameCards[i].card.children[0].children[j].onAfterRender()
            }
        }
        this.tick()
        displayToaster('cliquer pour vous mettre prêt')
        window.addEventListener('click', this.mouseClick)
        this.updateIntersect()
    }
    /**
     * spread cards
     */
    spread() {
        for (let i = 0; i < this.sqrtNumberCard; i++) {
            for (let j = 0; j < this.Ypos && i * this.Ypos + j < this.numberCard; j++) {
                this.gameCards[i * this.Ypos + j].moveTo(this.gameCards[i * this.Ypos + j].pos, new THREE.Vector3(i * 2.3, j * 3.7, 0).sub(this.offSet), Math.random() * .2 + .1);
            }
        }
    }
    /**
     * update mouse vector
     * @param {Event} event 
     */

    updateMouse(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }
    /**
     * update mouse and call onMouseOver
     * @param {Event} event 
     */
    onMove(event) {
        this.updateMouse(event)
        this.onMouseOver()
    }
    /**
     * create explosion and remove card
     * @param {Number} cardIndex 
     */
    pairFound(cardIndex) {
        const card = this.gameCards.splice(cardIndex, 1)[0]
        if (this.cardUnder == cardIndex) {
            this.cardUnder = NaN
        }
        // card.remove();
        card.scale(card.card.scale.x, 0, .15)
        setTimeout(() => explosions.push(new Explosion(...card.pos)), 150 + 25)
        this.updateIntersect()
        if (this.gameCards.length == 0) {
            setTimeout(this.end.bind(this), 1000)
        }
    }
    /**
     * turn card, moveDown and push index into this.turnedCards
     * @param {Number} cardIndex 
     */
    turnCard(cardIndex) {
        const card = this.gameCards[cardIndex]
        card.rotate(card.card.quaternion, qBack, Math.PI / 10, uv)
        this.turnedCards.push(cardIndex)
        this.moveDown(cardIndex)
    }
    /**
     * move up card
     * @param {Number} cardIndex 
     */
    moveUp(cardIndex) {
        const card = this.gameCards[cardIndex]
        card.scale(card.vScale.x, 1.0992)
        const pos = card.pos
        // card.moveTo(pos, new THREE.Vector3(pos.x, pos.y, 1), .3)
    }
    /**
     * moveDown
     * @param {Number} cardIndex 
     */
    moveDown(cardIndex) {
        const card = this.gameCards[cardIndex]
        card.scale(card.vScale.x, 1)
        const pos = card.pos
        card.moveTo(pos, new THREE.Vector3(pos.x, pos.y, 0), .3)
    }
    /**
     * call moveDown and set this.cardUnder to NaN
     */
    onMoveDown() {
        this.moveDown(this.cardUnder)
        this.cardUnder = NaN
    }
    /**
     * call move up and set this.cardUnder to cardIndex
     * @param {Number} cardIndex 
     */
    onMoveUp(cardIndex) {
        this.moveUp(cardIndex)
        this.cardUnder = cardIndex
    }

    onMouseClick(event) {
        if (this.turnedCards.length == 2) {
            this.turnedCards.sort((a, b) => b - a)
            if (this.gameCards[this.turnedCards[0]].name == this.gameCards[this.turnedCards[1]].name) {
                this.turnedCards.forEach(card => {
                    socket.emit('action', 'pair-found', card)
                    this.pairFound(card)
                    if (card < this.cardUnder) {
                        this.cardUnder--
                    }
                })
                this.turnedCards = []
            } else {//TODO rework here
                this.turnedCards.forEach(card => {
                    if (this.numberPlayer > 1) {
                        socket.emit('action', 'turnback-card', card);
                        this.gameCards[card].rotate(qBack, qFront, Math.PI / 10)
                        return
                    }
                    if (card != this.cardUnder) {
                        this.gameCards[card].rotate(qBack, qFront, Math.PI / 10)
                    }

                })
                if (this.numberPlayer > 1) {
                    this.removeListener();
                    this.turnedCards = []
                    if (!isNaN(this.cardUnder)) {
                        socket.emit('action', 'move-down', this.cardUnder)
                        this.onMoveDown();
                    }
                    socket.emit('next-player')
                    return
                }

                if (!this.turnedCards.includes(this.cardUnder)) {
                    this.turnedCards = [];
                } else if (!isNaN(this.cardUnder)) {
                    this.turnedCards = [this.cardUnder]
                    return
                }
            }
        }

        if (!isNaN(this.cardUnder)) {
            const cardIndex = this.cardUnder
            if (!this.turnedCards.includes(cardIndex, 0)) {
                socket.emit('action', 'turn-card', cardIndex)
                this.turnCard(cardIndex)
                // console.log(this.gameCards[cardIndex])
            }
        }
    }

    updateIntersect() {
        this.intersects = this.gameCards.map(card => card.card)
    }

    pickCard() {
        raycaster.setFromCamera(mouse, this.camera);
        return raycaster.intersectObjects(this.intersects, true);
    }

    onMouseOver() {
        const intersects = this.pickCard();

        if (intersects.length == 1) {
            for (let i = 0; i < this.gameCards.length; i++) {
                if (this.gameCards[i].uuid == intersects[0].object.parent.parent.uuid) {
                    uv = intersects[0].uv.sub(centerCard);
                    if (this.cardUnder != i) {
                        if (!isNaN(this.cardUnder)) {
                            socket.emit('action', 'move-down', this.cardUnder)
                            this.onMoveDown()
                        }

                        socket.emit('action', 'move-up', i)
                        if (!this.turnedCards.includes(i)) {
                            this.onMoveUp(i)
                        } else {
                            this.cardUnder = i
                        }
                    }
                    return
                }
            }
        } 
        if (!isNaN(this.cardUnder)) {
            socket.emit('action', 'move-down', this.cardUnder)
            this.onMoveDown()
        }
    }

    setReady() {
        socket.emit('ready')
    }

    addListener() {
        displayToaster("à votre tour")
        this.mouseClick = this.onMouseClick.bind(this)
        window.addEventListener('click', this.mouseClick)
        this.mouseMove = this.onMove.bind(this)
        window.addEventListener('pointermove', this.mouseMove)
    }

    removeListener() {
        window.removeEventListener('click', this.mouseClick)
        window.removeEventListener('pointermove', this.mouseMove)
    }

    gameStart() {
        window.removeEventListener('pointermove', this.mouseMove)
        this.spread()
        window.removeEventListener('click', this.mouseClick)

        setTimeout(() => this.controls.enabled = true, 650)
    }

    updatePlayer(number) {
        this.numberPlayer = number
    }



    end() {
        this.endExplosion()
        socket.removeListener('next-player')
        socket.removeListener('action')
        this.removeListener()
        endGameForm.displayForm()
    }

    endExplosion() {
        const cameraPostion = this.camera.position.clone()
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection)
        cameraPostion.add(cameraDirection.multiplyScalar(35))
        const explosionPosition = new THREE.Vector3(coefSizesToXYZ * this.sizes.width * (Math.random() * 2 - 1), coefSizesToXYZ * this.sizes.height * (Math.random() * 2 - 1), 0)
        explosionPosition.applyQuaternion(this.camera.quaternion)
        explosionPosition.add(cameraPostion)
        explosions.push(new Explosion(...explosionPosition))
        setTimeout(this.endExplosionBind, Math.floor(Math.random() * 550 + 550))

    }

    clearScene() {
        explosions = []
    }

    tick() {
        stats.begin();
        for (let i = 0; i < explosions.length; i++) {
            const explosion = explosions[i]
            if (explosion.clock.getElapsedTime() > 3) {
                explosion.remove()
                explosions.splice(i, 1)
            } else if (explosion.clock.getElapsedTime() > .5) {
                explosion.scaleDown()
            } else { explosion.update() }
        }
        this.renderer.render(scene, this.camera);
        stats.end();
        window.requestAnimationFrame(this.tickBind)
    }

}


