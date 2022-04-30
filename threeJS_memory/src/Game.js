import { Card } from './card.js'
import * as THREE from 'three'
import { scene } from './script.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const gltfLoader = new GLTFLoader();
const loader = new THREE.TextureLoader();

export class Game {

    constructor(cards) {
        this.numberCard = cards.length;
        this.texture = [].fill(0, 0,this.numberCard / 2)
        this.allCard = [].fill(0, 0, this.numberCard);
        this.sqrtNumberCard = Math.floor(Math.sqrt(this.numberCard / 2) * 2);
        this.Ypos = Math.ceil(this.numberCard / this.sqrtNumberCard);
        this.offSet = new THREE.Vector3((this.sqrtNumberCard - 1) * 2.3 / 2, (this.Ypos - 1) * 3.7 / 2, 0)
        this.initTexture(cards);

    }


    findIndex(element, array){
        for(let i = 0; i<array.length; i++){
            if(array[i].name == element){
                return i
            }
        }
        return -1
    }


    initTexture(cards) {
        for(let i = 0; i<this.numberCard/2; i++){
            this.downloadTexture(cards[this.findIndex(i, cards)].textureURL, i, cards)
        }
    }

    CreateCard(cards) {
        gltfLoader.load('https://raw.githubusercontent.com/JulienGery/nsi/main/threeJS_memory/static/carte.gltf', (gltf) => {
            for(let i = 0; i<this.numberCard; i++){
                console.log(i)
                this.allCard[i] = new Card(new THREE.Vector3(0, 0, 0), this.texture[cards[i].name], cards[i].name, gltf.scene, cards[i].textureURL)
            }
            this.placeCard();
        }, (progess) => {
        }, (error) => {
            this.CreateCard(cards)//recall on error
        })
    }

    async downloadTexture(URL, index, cards) {
        loader.loadAsync(URL).then((rep) => {
            this.texture[index] = rep
            if(!this.texture.includes(undefined)){
                console.log('creating cards')
                this.CreateCard(cards)
            }
        }).catch((err) => {
            console.log(err);
            this.downloadTexture(URL, index, cards); //recall on error
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
                this.allCard[i * this.Ypos + j].moveTo(this.allCard[i * this.Ypos + j].pos, new THREE.Vector3(i * 2.3, j * 3.7, 0).sub(this.offSet), .1);
            }
        }
    }

}