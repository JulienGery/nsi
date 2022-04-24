const name = 'julien'
const room = "xavier"
import { io } from 'socket.io-client'

const socket = io("http://localhost:3000")


import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import Stats from 'stats.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const nombreParticules = 2000;
const gltfLoader = new GLTFLoader();
const loader = new THREE.TextureLoader();
const texture2 = loader.load('https://raw.githubusercontent.com/JulienGery/nsi/main/threeJS_memory/static/tmp.jpg') //front
const canvas = document.querySelector('canvas.webgl')
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const gui = new dat.GUI();
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

class Card {

  constructor(pos, texture, name, card, textureURL) {
    this.pos = pos //vector 3
    this.textureURL = textureURL //textureURL
    this.card = card.clone(true); //clone the card which is the card
    this.card.children[0].children[0].material = new THREE.MeshBasicMaterial({ color: "#ffffff", map: texture }) //setting back texture 
    this.card.children[0].children[1].material = new THREE.MeshBasicMaterial({ color: "#ffffff", map: texture2 })//setting front texture 
    // this.card.children[0].children[2].material = new THREE.MeshBasicMaterial({ color: "#000000"}) //side
    this.name = name; //name which define pairs
    this.uuid = this.card.uuid //get the uuid of the shape for convenience
  }

  show() {
    scene.add(this.card)//add card to the scene
  }


  setPlace(vector) {
    this.pos = vector
    this.card.position.set(vector.x, vector.y, vector.z)
  }

  rotate(start, end, coef) {
    const clock = new THREE.Clock();

    const actualRotate = () => {
      //TODO use quaternion (and see why does it break)
      const elapsedTime = clock.getElapsedTime();
      this.card.rotation.y = 10 * elapsedTime * coef + start;

      // const q = start.slerp(end, elapsedTime*.01)
      // this.card.setRotationFromQuaternion(q)

      if (elapsedTime < 0.31415926535) {
        window.requestAnimationFrame(actualRotate)
      }
      else {
        // this.card.setRotationFromQuaternion(end)
        this.card.rotation.y = end;
      }
    }

    window.requestAnimationFrame(actualRotate);

  }

  async moveTo(from, to, time = 1) {

    const clock = new THREE.Clock();

    const actualMouveTo = async () => {
      const elapsedTime = clock.getElapsedTime();

      const lerpPos = from.lerp(to, elapsedTime / (10 * time))
      // this.card.position.set(lerpPos.x, lerpPos.y, lerpPos.z)
      this.setPlace(lerpPos)
      if (elapsedTime <= time + .02) {
        window.requestAnimationFrame(actualMouveTo);
      } else {
        this.setPlace(to)
      }
    }
    window.requestAnimationFrame(actualMouveTo)

  }


  remove() {
    scene.remove(this.card);

  }

}




class Game {

  constructor(cards) {

    this.numberCard = cards.length;
    this.allCard = [].fill(0, 0, this.numberCard);
    this.sqrtNumberCard = Math.floor(Math.sqrt(this.numberCard / 2) * 2);
    this.Ypos = Math.ceil(this.numberCard / this.sqrtNumberCard);
    this.offSet = new THREE.Vector3((this.sqrtNumberCard - 1) * 2.3 / 2, (this.Ypos - 1) * 3.7 / 2, 0)
    this.CreateCard(cards);

  }

  CreateCard(cards) {
    gltfLoader.load('https://raw.githubusercontent.com/JulienGery/nsi/main/threeJS_memory/static/carte.gltf', (gltf) => {
      for (let i = 0; i < cards.length; i++) {
        this.downloadTexture(cards[i].textureURL, cards[i].name, i, gltf.scene)//doawnload gltf of the card and passing it to constructor. it's kinda ugly but...
      }
    }, (progess) => {
    }, (error) => {
      this.CreateCard()//recall on error
    })
  }

  async downloadTexture(URL, name, index, gltf) {
    loader.loadAsync(URL).then((rep) => {

      this.allCard[index] = new Card(new THREE.Vector3(0, 0, 0), rep, name, gltf, URL)//creating card

      if (this.allCard.length == this.numberCard && !this.allCard.includes(0, 0)) {
        console.log(this.allCard)
        //kinda ugly again but it work so...
        this.placeCard();
      }
    }).catch((err) => {
      console.log(err);
      this.downloadTexture(URL, gltf); //recall on error
    })
  }

  placeCard() {
    for (let i = 0; i < this.allCard.length; i++) {
      this.allCard[i].show()
    }
  }

  spread() {
    for (let i = 0; i < this.sqrtNumberCard; i++) {
      for (let j = 0; j < this.Ypos && i * this.Ypos + j < this.numberCard; j++) {
        this.allCard[i * this.Ypos + j].moveTo(this.allCard[i * this.Ypos + j].pos, new THREE.Vector3(i * 2.3, j * 3.7, 0).sub(this.offSet));
      }
    }
  }

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


function tick() {
  stats.begin();

  // for (let i = 0; i < explosion.length; i++) {
  //   explosion[i].update()
  // }

  renderer.render(scene, camera);
  stats.end();

  window.requestAnimationFrame(tick);
}

tick()

socket.on('receive-cards', cards => {

  //   console.log(cards)
  const game = new Game(cards)


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
          explosion.push(new Explosion(PopingCard.pos.x, PopingCard.pos.y))
          if (cardUnder.includes(haveRotate[i])) {
            cardUnder = []
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

    if (cardUnder.length >= 1) {
      const cardIndex = cardUnder[0]
      if (!haveRotate.includes(cardIndex, 0)) {
        game.allCard[cardIndex].rotate(0, Math.PI, 1);
        haveRotate.push(cardIndex);
        moveDown()
      }
    }



    // const intersects = pickCard()

    // if (intersects.length == 1) {
    //     for (let i = 0; i < game.allCard.length; i++) {
    //         if (game.allCard[i].uuid == intersects[0].object.parent.parent.uuid) {
    //             if (!haveRotate.includes(i, 0)) {
    //                 game.allCard[i].rotate(0, Math.PI, 1);
    //                 haveRotate.push(i);
    //                 moveDown()
    //                 break
    //             }
    //         }
    //     }
    // }


  }

  let cardUnder = []
  let explosion = []

  const moveUp = (i) => {
    const pos = game.allCard[i].pos.clone()
    game.allCard[i].moveTo(pos, new THREE.Vector3(pos.x, pos.y, 1), .3)
  }

  const moveDown = (i = 0) => {
    const pos = game.allCard[cardUnder[i]].pos.clone()
    game.allCard[cardUnder[i]].moveTo(pos, new THREE.Vector3(pos.x, pos.y, 0), .3)
  }

  const onMouseOver = () => {
    const intersects = pickCard();
    if (intersects.length == 1) {
      for (let i = 0; i < game.allCard.length; i++) {
        //getting index of the card under the mouse in allCard and moving it up and moving the older card down
        if (game.allCard[i].uuid == intersects[0].object.parent.parent.uuid) {
          if (!cardUnder.includes(i, 0) && !haveRotate.includes(i, 0)) {
            if (cardUnder.length > 0) {
              moveDown()
              cardUnder = []
            }
            socket.emit('move-up', i, room)
            cardUnder.push(i)
            moveUp(i)
          }
        }
      }
    } else if (cardUnder.length > 0) {
      //moving the older card down
      moveDown()
      cardUnder = []
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
})
