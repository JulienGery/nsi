import * as THREE from 'three'
import { scene } from './Game.js';



const computeBezierCurve = (array, t) => {
    for (let i = 0; i < array.length - 1; i++) {
        array[i].slerp(array[i + 1], t)
    }
    array.pop()
    if (array.length == 1) {
        return array[0]
    }
    return computeBezierCurve(array, t)
}

const computeBezierCurveLine = (array, t) => {
    for (let i = 0; i < array.length - 1; i++) {
        array[i].lerp(array[i + 1], t)
    }
    array.pop()
    if (array.length == 1) {
        return array[0]
    }
    return computeBezierCurveLine(array, t)
}

export class Card {

    constructor(pos, texture, name, card, textureURL) {
        this.pos = pos //vector 3
        this.textureURL = textureURL //textureURL
        this.card = card.clone(true); //clone the gltf which is the card
        this.card.children[0].children[0].material = texture //setting back texture 
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

    rotate(start, end, time, vec) {
        const clock = new THREE.Clock();
        const quaternions = [start]
        for (let i = 0; i < 1; i++) {
            quaternions.push(vec ? new THREE.Quaternion(vec.y * -1, vec.x, 0, 0) : new THREE.Quaternion(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize())
        }

        quaternions.push(end)

        const actualRotate = () => {
            const elapsedTime = clock.getElapsedTime();
            const quaternionsClone = quaternions.map(q => q.clone())

            const newQ = computeBezierCurve(quaternionsClone, elapsedTime / time)

            this.card.setRotationFromQuaternion(newQ)

            if (elapsedTime < time) {
                window.requestAnimationFrame(actualRotate)
            }
            else {
                this.card.setRotationFromQuaternion(end)
            }
        }

        window.requestAnimationFrame(actualRotate);

    }

    async moveTo(start, end, time = 1) {
        const array = [start, end]
        const clock = new THREE.Clock();

        const actualMouveTo = async () => {
            const elapsedTime = clock.getElapsedTime();
            if (elapsedTime <= time) {
                const arrayClone = array.map(e => e.clone())

                // const lerpPos = start.clone()

                // lerpPos.lerp(end, elapsedTime / time)
                const lerpPos = computeBezierCurveLine(arrayClone, elapsedTime / time)
                this.setPlace(lerpPos)
                window.requestAnimationFrame(actualMouveTo);
            } else {
                this.setPlace(end)
            }
        }
        window.requestAnimationFrame(actualMouveTo)

    }

    remove() {
        scene.remove(this.card);
    }

}
