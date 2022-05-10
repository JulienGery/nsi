import './style.css'
import * as THREE from 'three'
import { Card } from './card.js'
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff)
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import * as dat from 'dat.gui'
import { displayToaster } from './toaster.js'
import Stats from 'stats.js'
import { Explosion } from './explosion.js'
import { socket } from './form.js';
import { playerNumbers } from './tableau.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export let game;
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
const pointLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(pointLight)



export const start = () => {
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    const canvas = document.querySelector('canvas.webgl')
    document.body.appendChild(stats.dom)
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
const controls = new OrbitControls(camera, canvas)
controls.enabled = false;

scene.add(camera)

camera.position.x = 0
camera.position.y = 0
camera.position.z = 20


class Game {

    constructor(cards) {
        this.numberPlayer = playerNumbers;
        this.numberCard = cards.length;
        this.turnedCards = []
        this.cardUnder = NaN
        this.texture = []
        this.allCard = []
        this.sqrtNumberCard = Math.floor(Math.sqrt(this.numberCard / 2) * 2);
        this.Ypos = Math.ceil(this.numberCard / this.sqrtNumberCard);
        this.offSet = new THREE.Vector3((this.sqrtNumberCard - 1) * 2.3 / 2, (this.Ypos - 1) * 3.7 / 2, 0)
        this.initTexture(cards);
        this.mouseClick = this.setReady.bind(this);
        
        this.mouseMove = this.updateMouse.bind(this)
        window.addEventListener('pointermove', this.mouseMove)
        this.tick()

    }

    findIndex(element, array) {
        for (let i = 0; i < array.length; i++) {
            if (array[i].name == element) {
                return i
            }
        }
        return -1
    }


    initTexture(cards) {
        displayToaster('downloading texture')
        for (let i = 0; i < this.numberCard / 2; i++) {
            this.downloadTexture(cards[this.findIndex(i, cards)].textureURL, i, cards)
        }
    }

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

    CreateCard(cards) {
        displayToaster('creating card')
        gltfLoader.load('https://raw.githubusercontent.com/JulienGery/nsi/main/threeJS_memory/static/carte.gltf', (gltf) => {
            gltf.scene.children[0].children[1].material = new THREE.MeshBasicMaterial({ color: "#ffffff", map: texture2 })
            for (let i = 0; i < this.numberCard; i++) {
                this.allCard[i] = new Card(new THREE.Vector3(0, 0, 0), this.texture[cards[i].name], cards[i].name, gltf.scene, cards[i].textureURL)
            }
            this.placeCard();
        }, (progess) => {
        }, (error) => {
            this.CreateCard(cards)//recall on error
        })
    }

    placeCard() {
        for (let i = 0; i < this.allCard.length; i++) {
            this.allCard[i].show()
        }
        // window.addEventListener('click', this.mouseClick)
        this.setReady()
    }

    spread() {
        for (let i = 0; i < this.sqrtNumberCard; i++) {
            for (let j = 0; j < this.Ypos && i * this.Ypos + j < this.numberCard; j++) {
                this.allCard[i * this.Ypos + j].moveTo(this.allCard[i * this.Ypos + j].pos, new THREE.Vector3(i * 2.3, j * 3.7, 0).sub(this.offSet), Math.random() * .2 + .1);
            }
        }
    }

    updateMouse(event){
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    }

    onMove(event){
        this.updateMouse(event)
        this.onMouseOver()        
    }

    pairFound(cardIndex){
        const card = this.allCard.splice(cardIndex, 1)[0]
        explosions.push(new Explosion(card.pos.x, card.pos.y))
        if(this.cardUnder == cardIndex){
            this.cardUnder = NaN
        }
        card.remove();
        if(this.allCard.length == 0){
            this.end()
        }
    }

    turnCard(cardIndex){
        const card = this.allCard[cardIndex]
        card.rotate(card.card.quaternion, qBack, Math.PI / 10, uv)
        this.turnedCards.push(cardIndex)
        this.moveDown(cardIndex)
    }

    moveUp(cardIndex){
        const card = this.allCard[cardIndex]
        const pos = card.pos
        card.moveTo(pos, new THREE.Vector3(pos.x, pos.y, 1), .3)

    }

    moveDown(cardIndex){
        const card = this.allCard[cardIndex]
        const pos = card.pos
        card.moveTo(pos, new THREE.Vector3(pos.x, pos.y, 0), .3)
    }

    onMoveDown(){
        this.moveDown(this.cardUnder)
        this.cardUnder = NaN
    }

    onMoveUp(cardIndex){
        this.moveUp(cardIndex)
        this.cardUnder = cardIndex
    }

    onMouseClick(event){
       if(this.turnedCards.length == 2){
           this.turnedCards.sort((a, b) => b-a)
           if(this.allCard[this.turnedCards[0]].name == this.allCard[this.turnedCards[1]].name){
               this.turnedCards.forEach(card => {
                   socket.emit('action', 'pair-found', card)
                   this.pairFound(card)
                   if(card<this.cardUnder){
                       this.cardUnder--
                   }
               })
               this.turnedCards = []
           } else {//TODO rework here
               this.turnedCards.forEach(card => {
                   if(this.numberPlayer > 1){
                       socket.emit('action', 'turnback-card', card);
                       this.allCard[card].rotate(qBack, qFront, Math.PI / 10)
                       return
                    }
                    if(card != this.cardUnder){
                        this.allCard[card].rotate(qBack, qFront, Math.PI / 10)
                    }

               })
               if(this.numberPlayer > 1){
                   this.removeListener();
                   this.turnedCards = []
                   if(!isNaN(this.cardUnder)){
                        socket.emit('action', 'move-down', this.cardUnder)
                        this.onMoveDown();
                    }
                    socket.emit('next-player')
                    return
               }
            
                if(!this.turnedCards.includes(this.cardUnder)){
                    this.turnedCards = [];
                } else if(!isNaN(this.cardUnder)) {
                    this.turnedCards = [this.cardUnder]
                    return
                }
            }
        }

        if(!isNaN(this.cardUnder)){
            const cardIndex = this.cardUnder
            if(!this.turnedCards.includes(cardIndex, 0)){
                socket.emit('action', 'turn-card', cardIndex)
                this.turnCard(cardIndex)
            }
        }
    }

    pickCard(){
        raycaster.setFromCamera(mouse, camera);
        return raycaster.intersectObjects(this.allCard.map(card => card.card), true);
    }

    onMouseOver(){
        const intersects = this.pickCard();
        
        if(intersects.length == 1){
            for(let i = 0; i<this.allCard.length; i++){
                if(this.allCard[i].uuid == intersects[0].object.parent.parent.uuid){
                    uv = intersects[0].uv.sub(centerCard);
                    if(this.cardUnder != i ){
                        if(!isNaN(this.cardUnder)){
                            socket.emit('action', 'move-down', this.cardUnder)
                            this.onMoveDown()
                        }
                        
                        socket.emit('action', 'move-up', i)
                        if(!this.turnedCards.includes(i)){
                            this.onMoveUp(i)
                        }else{
                            this.cardUnder = i
                        }
                    }
                    break
                }
            }
        } else if(!isNaN(this.cardUnder)){
            socket.emit('action', 'move-down', this.cardUnder)
            this.onMoveDown()
        }
    }

    setReady(){
        socket.emit('ready')
    }

    addListener(){
        displayToaster("it's your turn")
        this.mouseClick = this.onMouseClick.bind(this)
        window.addEventListener('click', this.mouseClick)
        this.mouseMove = this.onMove.bind(this)
        window.addEventListener('pointermove', this.mouseMove)
    }
    
    removeListener(){
        window.removeEventListener('click', this.mouseClick)
        window.removeEventListener('pointermove', this.mouseMove)
    }

    gameStart(){
        window.removeEventListener('pointermove', this.mouseMove)
        this.spread()
        window.removeEventListener('click', this.mouseClick)

        setTimeout(() => controls.enabled = true)
    }

    updatePlayer(number){
        this.numberPlayer = number
    }

    end(){
        explosions.push(new Explosion(Math.random() * this.sqrtNumberCard * 2.3 - this.offSet.x, Math.random() * this.Ypos * 3.7 - this.offSet.y))
        setTimeout(this.end.bind(this), Math.floor(Math.random() * 800 + 300))
    }

    tick(){
        stats.begin();
        for(let i = 0; i<explosions.length; i++){
            const explosion = explosions[i]
            if(explosion.clock.getElapsedTime() > 3){
                explosion.remove()
                explosions.splice(i, 1)
            } else if(explosion.clock.getElapsedTime() > .5){
                explosion.scaleDown()
            } else { explosion.update() }
        }        
        renderer.render(scene, camera);
        stats.end();
        window.requestAnimationFrame(this.tick.bind(this))
    }

}

socket.on('receive-cards', (cards) => {
    game = new Game(cards);
})

socket.on('action', (action, cardIndex) => {
    switch (action){
        case 'move-down':
            game.moveDown(cardIndex)
            break;
        case 'turn-card':
            game.allCard[cardIndex].rotate(qFront, qBack, Math.PI / 10)
            break;
        case 'pair-found': 
            game.pairFound(cardIndex)
            break;
        case 'move-up':
            game.moveUp(cardIndex)
            break;
        case 'turnback-card':
            game.allCard[cardIndex].rotate(qBack, qFront, Math.PI / 10)
            break;
    }
})

socket.on('next-player', () => game.addListener())
socket.on('start-game', () => game.gameStart())
}