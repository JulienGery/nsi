import * as THREE from 'three'
import { scene } from './Game.js';

//TODO rename && comment
/**
 * 
 * @param {Array<THREE.Quaternion>} array 
 * @param {Number} t between 0 and 1
 * @returns {THREE.Quaternion} result of bezier curve
 */
const computeBezierCurveQuaternion = (array, t) => {
    for (let i = 0; i < array.length - 1; i++) {
        array[i].slerp(array[i + 1], t)
    }
    array.pop()
    return array.length == 1? array[0] : computeBezierCurveQuaternion(array, t)
}
/**
 * 
 * @param {Array<THREE.Vector3>} array 
 * @param {Number} t 
 * @returns {THREE.Vector3} result of bezier curve
 */
const computeBezierCurveVector = (array, t) => {
    for (let i = 0; i < array.length - 1; i++) {
        array[i].lerp(array[i + 1], t)
    }
    array.pop()
    
    return array.length == 1? array[0] : computeBezierCurveVector(array, t)
}

/**
 * 
 * @param {Array<THREE.Quaternion|THREE.Vector3>} array 
 * @param {Number} t 
 * @returns {THREE.Quaternion|THREE.Vector3}
 */

const computeBezierCurve = (array, t) => {
    switch (array[0].isQuaternion){
        case true:
            return computeBezierCurveQuaternion(array, t)
        default:
            return computeBezierCurveVector(array, t)
    }
}


export class Card {
    /**
     * 
     * @param {THREE.Vector3} pos 
     * @param {THREE.MeshBasicMaterial} texture 
     * @param {Number} name 
     * @param {THREE.Group} card scene of glft
     * @param {String} textureURL optional
     */
    constructor(pos, texture, name, card, textureURL) {
        this.pos = pos //vector 3
        this.textureURL = textureURL //textureURL
        this.card = card.clone(true); //clone the gltf which is the card
        this.card.children[0].children[0].material = texture //setting back texture 
        // this.card.children[0].children[2].material = new THREE.MeshBasicMaterial({ color: "#000000"}) //side
        this.name = name; //name which define pairs
        this.uuid = this.card.uuid //get the uuid of the shape for convenience
        this.vScale = this.card.scale
    }

    show() {
        scene.add(this.card)//add card to the scene
    }
    /**
     * set place of the card
     * @param {THREE.Vector3} vector 
     */
    setPlace(vector) {
        this.pos = vector
        this.card.position.set(...vector)
    }
    /**
     * rotate card
     * @param {THREE.Quaternion} start 
     * @param {THREE.Quaternion} end 
     * @param {Number} time 
     * @param {THREE.Vector2} vec 
     */
    rotate(start, end, time, vec) {
        const clock = new THREE.Clock();
        const quaternions = [start]
        for (let i = 0; i < 1; i++) {
            quaternions.push(vec ? new THREE.Quaternion(vec.y * -1, vec.x, 0, 0) : new THREE.Quaternion(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize())
        }

        quaternions.push(end)
        /**
         * actual rotation function
         */
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
    /**
     * 
     * @param {THREE.Vector3} start 
     * @param {THREE.Vector3} end 
     * @param {Number} time 
     */
    async moveTo(start, end, time = 1) {
        const array = [start, end]
        const clock = new THREE.Clock();
        const actualMouveTo = () => {
            const elapsedTime = clock.getElapsedTime();
            if (elapsedTime <= time) {

                const arrayClone = array.map(e => e.clone())
                const lerpPos = computeBezierCurve(arrayClone, elapsedTime / time)
                // this.card.position.set(...lerpPos)
                this.setPlace(lerpPos)
                window.requestAnimationFrame(actualMouveTo);
            } else {
                this.setPlace(end)
            }
        }
        window.requestAnimationFrame(actualMouveTo)

    }
    /**
     * 
     * @param {Number} start 
     * @param {Number} end 
     * @param {Number} time 
     */
    scale(start, end, time = .2){
        const clock = new THREE.Clock();
        const dt = end-start
        const test = () => {
            const elapsedTime = clock.getElapsedTime()
            const coef = start + dt * elapsedTime / time
            this.card.scale.set(coef, coef, 1)
            if(elapsedTime<time){
                window.requestAnimationFrame(test)
            }else{
                this.card.scale.set(end, end, 1)
            }
            
        }
        test()
    }

    remove() {
        scene.remove(this.card);
    }

}
