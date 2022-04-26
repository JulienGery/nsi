import * as THREE from 'three'

const nombreParticules = 2000;
const particuleSize = .15

function randomUnitVector() {
    const vec = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
    return vec;
}

export class Explosion {
    constructor(x, y, scene) {
        this.clock = new THREE.Clock()
        this.scene = scene
        this.x = x
        this.y = y
        this.speeds = []
        this.createGeometry()
        this.PointsMaterial = new THREE.PointsMaterial({ vertexColors: true, size: particuleSize })
        this.points = new THREE.Points(this.geometry, this.PointsMaterial)
        this.scene.add(this.points)
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
            vertices.push(vec.x + this.x, vec.y + this.y, vec.z)
            this.speeds.push(Math.random())
        }
        this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3))
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    }

    async update() {
        const elapsedTime = this.clock.getElapsedTime()
        for (let i = 0; i < nombreParticules; i++) {
            const speed = this.speeds[i]
            const x = this.position.getX(i)
            const y = this.position.getY(i)
            const z = this.position.getZ(i)
            this.position.setXYZ(i, (x - this.x) * speed * elapsedTime + x, (y - this.y) * speed * elapsedTime + y, z * speed * elapsedTime + z)
        }
        this.position.needsUpdate = true;
    }
    remove() {
        this.scene.remove(this.points)
    }

    scaleDown() {
        const time = this.clock.getElapsedTime()
        const size = Math.cos((time - .5) * 0.62831853071)
        this.PointsMaterial.size = size * particuleSize
        this.update()
    }
}