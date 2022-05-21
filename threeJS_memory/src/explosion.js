import * as THREE from 'three'
import { scene } from './Game.js';

const nombreParticules = 2000;
const particuleSize = .15;
const g = -7.216100404249

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
 * @returns {THREE.Vector3} X, Y, Z
 */
THREE.BufferAttribute.prototype.getXYZ = function(index){
    return new THREE.Vector3(this.getX(index), this.getY(index), this.getZ(index))
}

export class Explosion {
    constructor(x, y, z = 0) {
        this.clock = new THREE.Clock()
        this.x = x
        this.y = y
        this.z = z
        this.vector = new THREE.Vector3(this.x, this.y, this.z)
        this.speeds = []
        this.vectors = []
        this.createGeometry()
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
            vertices.push(...vec.clone().add(this.vector))
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
        const elapsedTime = this.clock.getElapsedTime()
        for (let i = 0; i < nombreParticules; i++) {
            const speed = this.speeds[i]
            const V = 5*Math.exp(-0.2*elapsedTime+2)*(-0.03846153846*Math.cos(elapsedTime - 1.28318530718)+0.1923076923*Math.sin(elapsedTime- 1.28318530718))-g
            const vec = this.vectors[i].clone().multiplyScalar(V * 110 * speed).add(this.vector)
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