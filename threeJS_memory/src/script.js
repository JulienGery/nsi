import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'


const loader = new THREE.TextureLoader();
const texture2 = loader.load('/tmp.jpg')

const _VS = `
varying vec2 vUV;
varying vec3 v_Normal;

void main(){
    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
    vUV = uv;
    v_Normal = normal;
}
`

const _FS = `
varying vec3 v_Normal;
varying vec2 vUV;

void main(){
    gl_FragColor = vec4(v_Normal, 1.0);
}
`


// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xffffff)

// Objects

const shape = new THREE.Shape();

const X = .7
const Y = X*1.54237288136
const off = X*0.1
const soft = 1


shape.moveTo(off, 0)
for(let i = 0; i<soft*180+1; i++){
	shape.lineTo(X-off-Math.sin(Math.PI*i/(360*soft)+Math.PI)*off, off-Math.cos(Math.PI*i/(360*soft))*off)
}
for(let i = 0; i<soft*180+1; i++){
	shape.lineTo(X-off-Math.cos(Math.PI*i/(360*soft)+Math.PI)*off, Y-off-Math.sin(-Math.PI*i/(360*soft))*off)
}
for(let i = 0; i<soft*180+1; i++){
	shape.lineTo(off-Math.sin(Math.PI*i/(360*soft))*off, Y-off-Math.cos(Math.PI+Math.PI*i/(360*soft))*off)
}
for(let i = 0; i<soft*180+1; i++){
	shape.lineTo(off-Math.cos(Math.PI*i/(360*soft))*off, off+Math.sin(Math.PI+Math.PI*i/(360*soft))*off) 
}

const extrudeSettings = {
	steps: 10,
    depth: .001,
    // depth: 1,
	bevelEnabled: false,
};


const extrudedGeometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);



const edges = new THREE.EdgesGeometry(extrudedGeometry);
const line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000} ) );

// line.rotation.x = 181
// scene.add( line );

// const split = extrudedGeometry.groups[0].count

// extrudedGeometry.clearGroups()
// extrudedGeometry.addGroup(0, split/2, 0)
// extrudedGeometry.addGroup(split/2, split, 1)
// extrudedGeometry.addGroup(split, Infinity, 2)


// const material = [
// 	new THREE.MeshStandardMaterial({color: "black", side: THREE.DoubleSide}),
//     new THREE.MeshStandardMaterial({color: "black", side: THREE.DoubleSide}),
//     new THREE.MeshStandardMaterial({color: "black", side: THREE.DoubleSide}),
//     new THREE.MeshStandardMaterial({color: "black", side: THREE.DoubleSide}),
// 	new THREE.MeshStandardMaterial({color: "#ffffff", side: THREE.DoubleSide, map: texture}),
//     new THREE.MeshStandardMaterial({color: "#ffffff", side: THREE.DoubleSide, map: texture}),
// ]

class card{

    constructor(x, y, z, texture, px, py, pz, name){
        this.x = x;
        this.y = y;
        this.z = z
        this.texture = texture;
        this.px = px
        this.py = py
        this.pz = pz
        this.name = name
        this.geometry = new THREE.BoxBufferGeometry(this.x, this.y, this.z, 10, 10, 10);
        this.line = this.makeLine()
        this.card = this.makeCard()
        this.uuid = this.card.uuid
        this.group = this.makeGroup()
        this.place()
    }

    makeCard (){

        return new THREE.Mesh(this.geometry, [
            new THREE.MeshStandardMaterial({color: "#000000", side: THREE.DoubleSide}),
            new THREE.MeshStandardMaterial({color: "#000000", side: THREE.DoubleSide}),
            new THREE.MeshStandardMaterial({color: "#000000", side: THREE.DoubleSide}),
            new THREE.MeshStandardMaterial({color: "#000000", side: THREE.DoubleSide}),
            new THREE.MeshStandardMaterial({color: "#ffffff", side: THREE.DoubleSide, map: texture2}), //front
            new THREE.MeshStandardMaterial({color: "#ffffff", side: THREE.DoubleSide, map: loader.load(this.texture)}), //back
        ]) 
    }

    makeLine() {
        return new THREE.LineSegments( new THREE.EdgesGeometry(this.geometry), new THREE.LineBasicMaterial( { color: 0x000000} ) );
    }

    makeGroup(){
        const group = new THREE.Group();
        group.add(this.card);
        group.add(this.line);
        return group
    }

    place(){
        //pour les futures groups
        // scene.add(this.group)
        // this.group.position.set(this.px, this.py, this.pz)

        this.card.name = this.name
        this.setPlace(this.px, this.py, this.pz)
        scene.add(this.card)
    }

    setPlace(x,y,z){
        this.card.position.set(x, y, z)
    }

}

//!compariason des nom des cartes 
const allCard = []
allCard.push(new card(1, 1, .001, "https://avatars.githubusercontent.com/u/75223846?s=400&v=4", 0, 0, 0, 'github').group)
allCard.push(new card(1, 1, .001, "/snkellefaitpeur.png", 1.2, 0, 0, 'snk').group)
allCard.push(new card(1, 1, .001, "https://avatars.githubusercontent.com/u/75223846?s=400&v=4", 1.2, 1.2, 0, 'github').group)
allCard.push(new card(1, 1, .001, "/snkellefaitpeur.png", 0, 1.2, 0, 'snk').group)

console.log(scene.children)


const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();


const resetMaterial = () => {
    for(let i = 0; i<scene.children.length; i++){
        if( scene.children[i].material){
            scene.children[i].material[4].color = new THREE.Color(0xffffff)
        }
    }
}


const clock = new THREE.Clock()

const rotate = (intersects, coef, end, start = 0) => {

    const intersect = intersects
    const coef2 = coef
    let clock2 = new THREE.Clock()

    const jpp = () => {
        const elapsedTime = clock2.getElapsedTime()
        intersect.rotation.y = 10 * elapsedTime*coef2+start

        renderer.render(scene, camera)
        if(elapsedTime<0.31415926535){
            window.requestAnimationFrame(jpp)
        }
        else{
            intersect.rotation.y = end
        }
    }

    window.requestAnimationFrame(jpp)

}

let haveRotate = []

const compare = (intersect, array) => {
    if(array.length == 0){
        return true
    }
    for(let i = 0; i<array.length; i++){
        if(array[i].uuid == intersect.object.uuid){
            return false
        }
    }
    return true
}

function onMouseClick(event) {
    if(haveRotate.length == 2){
        if(haveRotate[0].name == haveRotate[1].name){
            for(let i = 0; i<haveRotate.length; i++){
                scene.remove(haveRotate[i])
            }
        }
        else for(let i = 0; i<haveRotate.length; i++){
            rotate(haveRotate[i], -1, 0, Math.PI)
        }
        haveRotate = []
    }

    const intersects = pickCard()

    if(intersects.length == 2){
        if(compare(intersects[0], haveRotate)){
            haveRotate.push(intersects[0].object);
            rotate(intersects[0].object, 1, Math.PI)
        }
    }
    
}


function onPointerMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

const pickCard = () => {    
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(scene.children);
    // return raycaster.intersectObjects(scene.children, false, jsp)
}

const mouseHover = () => {
    const intersects = pickCard()

    if (intersects.length == 2){
        for(let i = 0; i<intersects.length; i++){
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

window.addEventListener('resize', () =>
{
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
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
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

const tick = () =>
{

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
window.addEventListener( 'pointermove', onPointerMove );


tick()