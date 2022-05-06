import * as THREE from 'three'
import { scene } from './tmp.js';



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

    rotate(start, end, time) {
        const clock = new THREE.Clock();
        const quaternions = [start]
        
        for (let i = 0; i < 2; i++) {
            quaternions.push(new THREE.Quaternion(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize())
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

    async moveTo(from, to, time = 1) {

        const clock = new THREE.Clock();

        const actualMouveTo = async () => {
            const elapsedTime = clock.getElapsedTime();

            const lerpPos = from.clone()

            lerpPos.lerp(to, elapsedTime / time)
            this.setPlace(lerpPos)

            if (elapsedTime < time) {
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
