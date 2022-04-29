import { Card } from './card.js'
import * as THREE from 'three'
import { scene } from './script.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const gltfLoader = new GLTFLoader();
const loader = new THREE.TextureLoader();

export class Game {

    constructor(cards) {
        this.numberCard = cards.length;
        this.allCard = [].fill(0, 0, this.numberCard);
        this.sqrtNumberCard = Math.floor(Math.sqrt(this.numberCard / 2) * 2);
        this.Ypos = Math.ceil(this.numberCard / this.sqrtNumberCard);
        this.offSet = new THREE.Vector3((this.sqrtNumberCard - 1) * 2.3 / 2, (this.Ypos - 1) * 3.7 / 2, 0)
        this.CreateCard(cards);

    }

    CreateCard(cards) {
        gltfLoader.load('https://raw.githubusercontent.com/JulienGery/nsi/main/threeJS_memory/static/carte.gltf', (gltf) => {
            for (let i = 0; i < cards.length; i++) {
                this.downloadTexture(cards[i].textureURL, cards[i].name, i, gltf.scene)//doawnload gltf of the card and passing it to constructor. it's kinda ugly but...
            }
        }, (progess) => {
        }, (error) => {
            this.CreateCard(cards)//recall on error
        })
    }

    async downloadTexture(URL, name, index, gltf) {
        loader.loadAsync(URL).then((rep) => {
            this.allCard[index] = new Card(new THREE.Vector3(0, 0, 0), rep, name, gltf, URL)//creating card
            if (!this.allCard.includes(undefined)) {
                //kinda ugly again but it work so...
                this.placeCard();
            }
        }).catch((err) => {
            console.log(err);
            //this.downloadTexture(URL, gltf); //recall on error
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