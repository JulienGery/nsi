import * as THREE from 'three'
import { scene } from './script.js';

const nombreParticules = 2000;
const particuleSize = .15

function randomUnitVector() {
    const vec = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
    return vec;
}

export class Explosion {
    constructor(x, y) {
        this.clock = new THREE.Clock()
        this.x = x
        this.y = y
        this.speeds = []
        this.vectors = []
        this.createGeometry()
        this.PointsMaterial = new THREE.PointsMaterial({ vertexColors: true, size: particuleSize })
        this.points = new THREE.Points(this.geometry, this.PointsMaterial)
        scene.add(this.points)
        this.position = this.geometry.attributes.position
    }

    createGeometry() {
        this.geometry = new THREE.BufferGeometry();
        const vertices = []
        const color = new THREE.Color()
        const colors = []
        for (let i = 0; i < nombreParticules; i++) {
            color.setHSL(1, Math.random(), Math.random() * 2);
            colors.push(color.r, color.g, color.b);
            const vec = randomUnitVector()
            vec.multiplyScalar(.1)
            this.vectors.push(vec)
            vertices.push(vec.x + this.x, vec.y + this.y, vec.z)
            this.speeds.push(Math.random() * 2)
        }
        this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    }

    async update() {
        const elapsedTime = this.clock.getElapsedTime()
        for (let i = 0; i < nombreParticules; i++) {
            const speed = this.speeds[i]

            // const V = Math.exp(-elapsedTime - .5) * Math.sin(elapsedTime - .5) - a + (-Math.cos(elapsedTime - .5) * Math.exp(-elapsedTime - .5) - b)
            const V = Math.exp(-elapsedTime*.2+2)*Math.cos(elapsedTime+5)
            const jsp = this.vectors[i]
            const vec = this.vectors[i].clone().multiplyScalar(V)
            // console.log(vec)
            const X = this.position.getX(i)
            const Y = this.position.getY(i)
            const Z = this.position.getZ(i)
            this.position.setXYZ(i, vec.x * speed + jsp.x + X, vec.y * speed + jsp.y + Y, vec.z * speed + jsp.z + Z)
        }
        this.position.needsUpdate = true;
    }
    remove() {
        scene.remove(this.points)
    }

    scaleDown() {
        const time = this.clock.getElapsedTime()
        const size = Math.cos((time - .5) * 0.62831853071)
        this.PointsMaterial.size = size * particuleSize
        this.update()
    }
}