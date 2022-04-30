import { io } from 'socket.io-client'
import './style.css'
import * as THREE from 'three'
export const scene = new THREE.Scene();
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import { Explosion } from './explosion.js'
import { Game } from './Game.js'

// const name = prompt('name')
// const room = prompt('room')
const name = 'juju'
const room = 'xavier'
const canvas = document.querySelector('canvas.webgl')

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const gui = new dat.GUI();
const stats = new Stats();
scene.background = new THREE.Color(0xffffff);
const socket = io("http://192.168.1.25:3000")

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
const controls = new OrbitControls(camera, canvas)
controls.enabled = false

scene.add(camera)

camera.position.x = 0
camera.position.y = 0
camera.position.z = 20

let game = 0
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
  explosions.push(new Explosion(PopingCard.pos.x, PopingCard.pos.y))
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


const beforeSpread = event => socket.emit('ready')



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

  setTimeout(() => { controls.enabled = true }, 150);

}

function tick() {

  stats.begin();

  for (let i = 0; i < explosions.length; i++) {
    const explosion = explosions[i]
    if (explosion.clock.getElapsedTime() > 3) {
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


socket.on('receive-cards', (cards) => {
  console.log(cards)
  game = new Game(cards);
  window.addEventListener('click', beforeSpread);
  window.addEventListener('pointermove', updateMouse);
})

socket.on('connect', () => {
  console.log('success')
  socket.emit('join-room', name, room, cb => {
    console.log(cb)
  })
})

socket.on('update-room', dict => {
  console.log(dict)
})

socket.on('update-cards', cards => {
  console.log(cards)
})


socket.on('action', (action, cardIndex) => {
  switch (action) {
    case 'move-down':
      moveDown(cardIndex)
      break;
    case 'turn-card':
      game.allCard[cardIndex].rotate(0, Math.PI, -1)
      break;
    case 'pair-found':
      pairFound(cardIndex)
      break;
    case 'move-up':
      moveUp(cardIndex)
      break;
    case 'turnback-card':
      game.allCard[cardIndex].rotate(Math.PI, 0, -1)
  }
})

socket.on('next-player', () => addListener())
socket.on('start-game', () => gameStart())

tick()

let ready = false
const regex = /(https?:\/\/.*\.(?:png|jpg))/g

const submitCard = async () => {
  const url = textInput.value

  if (!url) {
    textInput.style.backgroundColor = "red"
  } else {
    fetch(url).then((rep) => {
      socket.emit('submit-card', url, cb => {
        console.log(cb)
        if (cb) {
          textInput.style.backgroundColor = "green"
          textInput.value = ""
        } else { textInput.style.backgroundColor = "red" }
      })
    }).catch((err) => {
      console.log(err)
      textInput.style.backgroundColor = "red"
    })
  }
}



const form = document.createElement('form')
form.style.position = "absolute"

const textInput = document.createElement("input")
textInput.type = "text"
textInput.placeholder = "enter url here"
textInput.id = "url"

const btn = document.createElement("button")
btn.innerHTML = "submit"

btn.onclick = submitCard


const br = document.createElement('br')

const abtn = document.createElement('button')

abtn.innerHTML = "set ready"

abtn.onclick = function () {
  ready = true
  socket.emit('ready')
  document.body.removeChild(form)
}

form.appendChild(textInput)
form.appendChild(btn)
form.appendChild(abtn)


form.addEventListener("submit", e => {
  e.preventDefault()
})
document.body.appendChild(form)