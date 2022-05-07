import './style.css'
import * as THREE from 'three'
export const scene = new THREE.Scene();
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import * as dat from 'dat.gui'
import { displayToaster } from './toaster.js'
import Stats from 'stats.js'
import { Explosion } from './explosion.js'
import { Game } from './Game.js'
import { socket } from './script';


const qFront = new THREE.Quaternion(0, 0, 0, 1);
const qBack = new THREE.Quaternion(0, 1, 0, 0);
let uv = new THREE.Vector2(0, 0);

export const start = () => {


    const canvas = document.querySelector('canvas.webgl')

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    // const gui = new dat.GUI();
    const stats = new Stats();
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
        return raycaster.intersectObjects(game.allCard.map(card => card.card), true);
    }

    function onMouseClick(event) {

        if (haveRotate.length == 2) {
            if (haveRotate[0] < haveRotate[1]) {
                haveRotate.reverse();
            }

            if (game.allCard[haveRotate[0]].name == game.allCard[haveRotate[1]].name) {
                for (let i = 0; i < haveRotate.length; i++) {
                    socket.emit('action', 'pair-found', haveRotate[i])
                    pairFound(haveRotate[i])
                    if (haveRotate[i] < cardUnder[0]) {
                        cardUnder[0]--;
                    }
                }
            } else {
                for (let i = 0; i < haveRotate.length; i++) {
                    socket.emit('action', 'turnback-card', haveRotate[i])
                    game.allCard[haveRotate[i]].rotate(qBack, qFront, Math.PI/10);
                }

                removeListener()

                if (cardUnder.length > 0) {
                    socket.emit('action', 'move-down', cardUnder[0])
                    onMoveDown()
                }
                socket.emit('next-player')
                haveRotate = [];
                return
            }
            haveRotate = [];
        }

        if (cardUnder.length >= 1) {
            const cardIndex = cardUnder[0]
            if (!haveRotate.includes(cardIndex, 0)) {
                socket.emit('action', 'turn-card', cardIndex)
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
        game.allCard[cardIndex].rotate(qFront, qBack, Math.PI/10, uv);
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
                    uv = intersects[0].uv.sub(new THREE.Vector2(0.5, 0.5));
                    if (!cardUnder.includes(i, 0) && !haveRotate.includes(i, 0)) {
                        if (cardUnder.length > 0) {
                            socket.emit('action', 'move-down', cardUnder[0])
                            onMoveDown()
                        }
                        socket.emit('action', 'move-up', i)
                        onMoveUp(i)
                    }

                    break
                }
            }
        } else if (cardUnder.length > 0) {
            socket.emit('action', 'move-down', cardUnder[0])
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
        displayToaster("it's your turn")
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

    socket.on('action', (action, cardIndex) => {
        switch (action) {
            case 'move-down':
                moveDown(cardIndex)
                break;
            case 'turn-card':
                game.allCard[cardIndex].rotate(qFront, qBack, Math.PI/10)
                break;
            case 'pair-found':
                pairFound(cardIndex)
                break;
            case 'move-up':
                moveUp(cardIndex)
                break;
            case 'turnback-card':
                game.allCard[cardIndex].rotate(qBack, qFront, Math.PI/10)
        }
    })

    socket.on('next-player', () => addListener())
    socket.on('start-game', () => gameStart())


    tick()
}