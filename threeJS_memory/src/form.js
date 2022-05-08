import { io } from 'socket.io-client'
import './form.css'
import { TextureLoader } from 'three'
import { displayToaster } from './toaster.js'
import { updateTable, addTable } from './tableau.js'
import { start } from './tmp.js'
const axios = require('axios')
export const socket = io("https://julien-game-server.gery.me")

const loader = new TextureLoader();
const regex = /^\d+(?:\s*)$/g


class JoinRoomForm {

    constructor() {
        this.name = ''
        this.room = ''
        this.isDisplayed = false
    }

    submitForm() {
        this.name = document.getElementById('name').value
        this.room = this.roomInput.value

        if (this.name && this.room) {
            socket.emit('join-room', this.name, this.room, cb => {
            if(!cb){
                displayToaster('game already started')
            }else{
                addTable()
                updateTable(cb.players)
                this.removeForm()
                roomForm.displayForm()
            }
            })
        }
    }

    displayForm() {
        if(!this.isDisplayed){
            this.isDisplayed = true
            document.body.innerHTML += '<div class="form" id="form"><div class="title">three js memory</div><div class="input-container ic1"><input id="name" class="input" type="text" value="' + this.name + '" placeholder=" " /><div class="cut"></div><label for="name" class="placeholder">name</label></div><div class="input-container ic2"><input id="room" class="input" value="' + this.room + '" type="text" placeholder=" " /><div class="cut"></div><label for="room" class="placeholder">room</label></div><button type="text" class="submit" id="button">submit</button></div>'

            this.button = document.getElementById('button')
            this.button.onclick = this.submitForm.bind(this)

            this.form = document.getElementById('form')
            
            this.roomInput = document.getElementById('room')
            this.roomInput.addEventListener('keypress', event => {
                if (event.key == 'Enter') {
                    this.submitForm()
                }
            })
        }
    }

    removeForm() {
        document.body.removeChild(this.form)
    }

}

class RoomForm {
    constructor(){
        this.isDisplayed = false
    }

    submitCard(jsp = '') {
        const url = this.urlInput.value
        const number = url.match(regex)
        
        if (number) {
            this.urlInput.value = ''
            axios.get("https://picsum.photos/v2/list?page=" + Math.floor(Math.random() * 1000 / number) + "&limit=" + number).then((response) => {

                const data = response.data;
                data.forEach(element => this.sendCards(element.download_url))

            }).catch((err) => {
                console.log(err)
            })
            return
        }

        if (!url) {
            this.urlInput.style.backgroundColor = "red"
        } else {
            loader.loadAsync(url).then((rep) => {
                this.sendCards(url)
            }).catch((err) => {
                console.log(err)
                this.urlInput.style.backgroundColor = "red"
            })
        }
    }

    updateCard(number) {
        this.cardsCount.textContent = `cards count ${number}`
    }


    sendCards(url) {
        socket.emit('submit-card', url, cb => {
            if (cb) {
                this.updateCard(cb.length)
                this.urlInput.style.backgroundColor = 'green'
            } else {
                this.urlInput.style.backgroundColor = 'red'
            }
        })
    }

    setReady() {
        this.removeForm()
        document.body.innerHTML += '<canvas class="webgl"></canvas>'
        socket.emit('ready')
        start()
    }

    leaveRoom() {
        socket.emit('leave-room', cb => {
            this.removeForm()
            joinRoomForm.displayForm()
        })
    }

    displayForm() {
        if(!this.isDisplayed){
            this.isDisplayed = true
            document.body.innerHTML += '<div class="formImage" id="roomForm"><div class="title" id="cardsCount" style="text-align: center;">card count 0</div><div class="input-container ic1"><input type="text" class="input" placeholder=" " id="url"><div class="cut"></div><label class="placeholder">add image</label></div><button class="submit" id="submitButton">submit</button><button class="submit" id="setReady">set ready</button><button class="submit" id="leaveButton">leave</button></div>'

            this.form = document.getElementById('roomForm')

            this.cardsCount = document.getElementById('cardsCount')
            this.urlInput = document.getElementById('url')
            this.urlInput.addEventListener('keypress', e => {
                if(e.key == 'Enter'){
                    this.submitCard()
                }
            })
            this.submitButton = document.getElementById('submitButton')
            this.submitButton.onclick = this.submitCard.bind(this)

            this.setReadyButton = document.getElementById('setReady')
            this.setReadyButton.onclick = this.setReady.bind(this)
            this.leaveButton = document.getElementById('leaveButton')
            this.leaveButton.onclick = this.leaveRoom.bind(this)
        }
    }

    removeForm() {
        document.body.removeChild(this.form)
    }
}



const joinRoomForm = new JoinRoomForm();
const roomForm = new RoomForm();


socket.on('connect', () => {
    console.log('success')
    joinRoomForm.displayForm()
})

socket.on('update-room', dict => {
    updateTable(dict)
})
