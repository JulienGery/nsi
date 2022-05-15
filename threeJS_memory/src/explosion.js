import * as THREE from 'three'
import { scene } from './Game.js';

const nombreParticules = 2000;
const particuleSize = .15

/**
 * return a random unit vector in a sphere and store into this
 * @returns {THREE.Vector3}
 */
THREE.Vector3.prototype.randomUnitVector = function(){
    this.x = Math.random() * 2 - 1;
    this.y = Math.random() * 2 - 1;
    this.z = Math.random() * 2 - 1;
    this.normalize();
    return this;
}

/**
 * 
 * @param {Number} index 
 * @returns {Array} [X, Y, Z]
 */
THREE.BufferAttribute.prototype.getXYZ = function(index){
    return new THREE.Vector3(this.getX(index), this.getY(index), this.getZ(index))
}
/**
 * needs to be same length
 * @param {Array<Number>} array1 
 * @param {Array<Number>} array2 
 * @returns 
 */
function somme(array1, array2){
    return array1.map((e, idx) => e+array2[idx])
}
/**
 * 
 * @param  {...Array<Number>} args all arrays of n size
 * @returns {Array} sum of arrays
 */
function ArraySum(...args){

    switch (args.length){
        case 1:
            return args[0]
        case 2:
            return somme(...args)
        default:
            return somme(ArraySum(...args.slice(0, Math.ceil(args.length/2))), ArraySum(...args.slice(Math.ceil(args.length/2), Infinity)))

    }
}


const multiply = (coef) => (array) => array.map(e => coef*e)

export class Explosion {
    constructor(x, y, z = 0) {
        this.clock = new THREE.Clock()
        this.x = x
        this.y = y
        this.z = z
        this.speeds = []
        this.vectors = []
        this.createGeometry()
    }

    *[Symbol.iterator]() {
        yield this.x;
        yield this.y;
        yield this.z;
    }

    async createGeometry() {
        this.geometry = new THREE.BufferGeometry();
        const vertices = []
        const color = new THREE.Color()
        const colors = []
        for (let i = 0; i < nombreParticules; i++) {
            color.setHSL(Math.random() * .9 + .1, Math.random() * .9 + .1, Math.random() * .9 + .1);
            colors.push(color.r, color.g, color.b);
            const vec = new THREE.Vector3().randomUnitVector().multiplyScalar(.1)
            this.vectors.push(vec)
            vertices.push(...vec.clone().add(new THREE.Vector3(...this)))
            this.speeds.push(Math.random() * 2)
        }
        this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
        this.PointsMaterial = new THREE.PointsMaterial({ vertexColors: true, size: particuleSize })
        this.points = new THREE.Points(this.geometry, this.PointsMaterial)
        scene.add(this.points)
        this.position = this.geometry.attributes.position
    }

    async update() {
        console.log(this.position.count)
        const elapsedTime = this.clock.getElapsedTime()
        for (let i = 0; i < nombreParticules; i++) {
            const speed = this.speeds[i]

            // const V = Math.exp(-elapsedTime - .5) * Math.sin(elapsedTime - .5) - a + (-Math.cos(elapsedTime - .5) * Math.exp(-elapsedTime - .5) - b)
            const V = Math.exp(-elapsedTime * .2 + 2) * Math.cos(elapsedTime - 1.28318530718)
            const startVector = this.vectors[i]
            const vec = this.vectors[i].clone().multiplyScalar(V)
            vec.multiplyScalar(speed).add(startVector).add(this.position.getXYZ(i))
            this.position.setXYZ(i, ...vec)
            }
        this.position.needsUpdate = true;
    }
    remove() {
        scene.remove(this.points)
    }

    async scaleDown() {
        const time = this.clock.getElapsedTime()
        const size = Math.cos((time - .5) * 0.62831853071)
        this.PointsMaterial.size = size * particuleSize
        this.update()
    }
}