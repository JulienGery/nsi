import { io } from 'socket.io-client'
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'stats.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Explosion } from './explosion.js'
import { Card } from './card.js'
const axios = require('axios')

const name = prompt('name')
const room = prompt("room")
const socket = io("http://localhost:3000")
const gltfLoader = new GLTFLoader();
const loader = new THREE.TextureLoader();
const canvas = document.querySelector('canvas.webgl')
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
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

class Game {

  constructor(numberCard) {
    this.numberCard = numberCard;
    this.allCard = [];
    this.sqrtNumberCard = Math.floor(Math.sqrt(this.numberCard) * 2);
    this.Ypos = Math.ceil(this.numberCard * 2 / this.sqrtNumberCard);
    this.offSet = new THREE.Vector3((this.sqrtNumberCard - 1) * 2.3 / 2, (this.Ypos - 1) * 3.7 / 2, 0)
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
        this.allCard.push(new Card(new THREE.Vector3(0, 0, 0), rep, this.allCard.length - i, gltf, URL, scene))//creating card
      }
      if (this.allCard.length == this.numberCard * 2) {
        for (let i = 0; i < 22; i++) {
          this.shuffleArray(this.allCard);
        }
        this.sendCards();
        this.placeCard(); //kinda ugly again but it work so...
      }
    }).catch((err) => {
      console.log(err);
      this.downloadTexture(URL, gltf); //recall on error
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

  async sendCards() {
    let cards = []
    for (let i = 0; i < this.allCard.length; i++) {
      cards.push({
        "name": this.allCard[i].name,
        "textureURL": this.allCard[i].textureURL,
      })
    }
    socket.emit('send-cards', cards, room)
    cards = []
  }

  placeCard() {
    for (let i = 0; i < this.allCard.length; i++) {
      this.allCard[i].show()
    }
  }

  spread() {
    for (let i = 0; i < this.sqrtNumberCard; i++) {
      for (let j = 0; j < this.Ypos && i * this.Ypos + j < this.numberCard * 2; j++) {
        this.allCard[i * this.Ypos + j].moveTo(this.allCard[i * this.Ypos + j].pos, new THREE.Vector3(i * 2.3, j * 3.7, 0).sub(this.offSet));
      }
    }
  }

  //actual game
  //still nothing

}

const game = new Game(nb_card)

camera.position.x = 0
camera.position.y = 0
camera.position.z = 20

let haveRotate = []
let cardUnder = []
let explosions = []

function updateMouse(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

const onMove = (event) => {
  updateMouse(event)
  onMouseOver()
}

function pickCard() {

  raycaster.setFromCamera(mouse, camera);
  return raycaster.intersectObjects([...Array(game.allCard.length).keys()].map(i => scene.children[i + 2]), true);

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
        socket.emit('action', 'pair-found', haveRotate[i], room)
        pairFound(haveRotate[i])
        if (haveRotate[i] < cardUnder[0]) {
          cardUnder[0]--;
        }
      }
    } else {
      for (let i = 0; i < haveRotate.length; i++) {
        socket.emit('action', 'turnback-card', haveRotate[i], room)
        game.allCard[haveRotate[i]].rotate(Math.PI, 0, -1);
      }

      removeListener()

      if (cardUnder.length > 0) {
        socket.emit('action', 'move-down', cardUnder[0], room)
        onMoveDown()
      }
      socket.emit('next-player', room)
      haveRotate = [];
      return
    }
    haveRotate = [];
  }

  if (cardUnder.length >= 1) {
    const cardIndex = cardUnder[0]
    if (!haveRotate.includes(cardIndex, 0)) {
      socket.emit('action', 'turn-card', cardIndex, room)
      turnCard(cardIndex)
    }
  }

}

const pairFound = (cardIndex) => {
  const PopingCard = game.allCard.splice(cardIndex, 1)[0];
  explosions.push(new Explosion(PopingCard.pos.x, PopingCard.pos.y, scene))
  if (cardUnder.includes(cardIndex)) {
    cardUnder = []
  }
  PopingCard.remove();
}

const turnCard = (cardIndex) => {
  game.allCard[cardIndex].rotate(0, Math.PI, 1);
  haveRotate.push(cardIndex);
  moveDown(cardIndex)
}

const moveUp = (i) => {
  const pos = game.allCard[i].pos.clone()
  game.allCard[i].moveTo(pos, new THREE.Vector3(pos.x, pos.y, 1), .3)
}

const moveDown = (cardIndex) => {
  const pos = game.allCard[cardIndex].pos.clone()
  game.allCard[cardIndex].moveTo(pos, new THREE.Vector3(pos.x, pos.y, 0), .3)
}

const onMouseOver = () => {
  const intersects = pickCard();
  if (intersects.length == 1) {
    for (let i = 0; i < game.allCard.length; i++) {
      //getting index of the card under the mouse in allCard and moving it up and moving the older card down
      if (game.allCard[i].uuid == intersects[0].object.parent.parent.uuid) {
        if (!cardUnder.includes(i, 0) && !haveRotate.includes(i, 0)) {
          if (cardUnder.length > 0) {
            socket.emit('action', 'move-down', cardUnder[0], room)
            onMoveDown()
          }
          socket.emit('action', 'move-up', i, room)
          onMoveUp(i)
        }

        break
      }
    }
  } else if (cardUnder.length > 0) {
    socket.emit('action', 'move-down', cardUnder[0], room)
    onMoveDown()
  }
}

const onMoveDown = () => {
  const cardIndex = cardUnder.pop()
  moveDown(cardIndex)
}

const onMoveUp = (cardIndex) => {
  moveUp(cardIndex)
  cardUnder.push(cardIndex)
}


const beforeSpread = (event) => {
  socket.emit('ready', room, cb => {
    if (cb) {
      gameStart()
    }
  })
}


const addListener = () => {
  console.log('my turn')
  window.addEventListener('click', onMouseClick)
  window.addEventListener('pointermove', onMove)

}

const removeListener = () => {
  window.removeEventListener('click', onMouseClick)
  window.removeEventListener('pointermove', onMove)
}

const gameStart = () => {

  game.spread()

  window.removeEventListener('click', beforeSpread)
  window.removeEventListener('pointermove', updateMouse)

  setTimeout(() => {
    addListener();
    startControls();
  }, 1200);

}

const startControls = () => {
  const controls = new OrbitControls(camera, canvas)
  // controls.enableDamping = true
}


window.addEventListener('click', beforeSpread);
window.addEventListener('pointermove', updateMouse);

function tick() {

  stats.begin();

  for (let i = 0; i < explosions.length; i++) {
    const explosion = explosions[i]
    if(explosion.clock.getElapsedTime() > 3){
      explosion.remove()
      explosions.splice(0, 1)
      i--;
    }
    else if (explosion.clock.getElapsedTime() > .5) {
      explosion.scaleDown()
    } else { explosion.update() }

  }

  renderer.render(scene, camera);
  stats.end();

  window.requestAnimationFrame(tick);
}


socket.on('connect', () => {
  console.log('success')
  socket.emit('join-room', name, room, cb => {
    console.log(cb)
  })
})
socket.on('update-room', dict => {
  console.log(dict)
})

socket.on('move-down', (cardIndex) => moveDown(cardIndex))
socket.on('turn-card', (cardIndex) => game.allCard[cardIndex].rotate(0, Math.PI, -1))
socket.on('pair-found', cardIndex => pairFound(cardIndex))
socket.on('move-up', (cardIndex) => moveUp(cardIndex))
socket.on('next-player', () => addListener())
socket.on('start-game', () => gameStart())
socket.on('turnback-card', (cardIndex) => { game.allCard[cardIndex].rotate(Math.PI, 0, -1) })

tick()