import { io } from 'socket.io-client'
import './form.css'
import { TextureLoader } from 'three'
import { displayToaster } from './toaster.js'
import { updateTable, addTable, removeTable } from './tableau.js'
import { Game } from './Game.js'
const axios = require('axios')
export const socket = io("https://julien-game-server.gery.me")
// export const socket = io("http://localhost:3000")


const loader = new TextureLoader();
const regex = /^(?:\s*)-?\d+(?:\s*)$/g
let game;

class Form {
    constructor(array) {
        this.form = document.createElement('div')
        this.form.className = 'form'
        this.isDisplayed = false
        array.forEach(dict => this.createForm(dict))
    }


    createForm(dict) {
        const name = dict.name
        this[name] = document.createElement(dict.type)
        this[name].className = dict.className
        this[name].innerHTML = dict.innerHTML
        if (dict.textContent) {
            this[name].textContent = dict.textContent
        }
        if (dict.onclick) {
            this[name].onclick = dict.onclick
        }
        if (dict.eventListener) {
            const eventListener = dict.eventListener
            this[name].addEventListener(eventListener.type, eventListener.function)
        }
        if (dict.style) {
            this[name].style = dict.style
        }
        this[dict.parent].appendChild(this[name])
        // console.log(this)
    }



    displayForm() {
        if (!this.isDisplayed) {
            this.isDisplayed = true
            document.body.appendChild(this.form)
        }
    }

    removeForm() {
        this.isDisplayed = false
        document.body.removeChild(this.form)
    }
}

class JoinRoomForm extends Form {
    constructor(array) {
        super(array)
        this.name = ''
        this.room = ''
    }

    submitForm() {
        this.name = this.inputName.children[0].value
        this.room = this.inputRoom.children[0].value
        if (this.room && this.name) {
            this.updateNameAndRoom()
            socket.emit('join-room', this.name, this.room, cb => {
                if (!cb) {
                    displayToaster('le jeu a déjà commencé')
                } else {
                    addTable()
                    updateTable(cb.players)
                    this.removeForm()
                    roomForm.displayForm()
                    roomForm.updateCard(cb.cards)
                }
            })
        } else {
            displayToaster('remplir le formulaire')
        }
    }

    updateNameAndRoom() {
        this.inputName.children[0].value = this.name
        this.inputRoom.children[0].value = this.room
    }
}



class RoomForm extends Form {
    constructor(array) {
        super(array)
        this.form.className = 'formImage'
        this.cards = []
    }

    submitForm() {
        const url = this.urlInput.children[0].value
        const number = url.match(regex)
        if (number) {
            this.urlInput.children[0].value = ''
            if (number < 0) {
                const array = []
                while (array.length != Math.abs(number) && array.length < this.cards.length) {
                    const randomNumber = Math.floor(Math.random() * this.cards.length)
                    if (!array.includes(randomNumber)) {
                        array.push(randomNumber)
                    }
                }

                // array.sort((a, b) => b-a)

                array.forEach(async (index) => this.removeCards(this.cards[index]))
                return
            }
            if(number != 0){
                axios.get("https://picsum.photos/v2/list?page=" + Math.floor(Math.random() * 1000 / number) + "&limit=" + number).then((response) => {

                    const data = response.data;
                    data.forEach(element => this.sendCards(element.download_url))

                }).catch((err) => {
                    console.log(err)
                })
            }
            return
        }

        if (!url) {
            this.urlInput.children[0].style.backgroundColor = "red"
        } else {
            loader.loadAsync(url).then((rep) => {
                this.sendCards(url)
            }).catch((err) => {
                console.log(err)
                this.urlInput.children[0].style.backgroundColor = "red"
            })
        }
    }

    sendCards(url) {
        socket.emit('submit-card', 'add', url, cb => {
            if (cb) {
                this.updateCard(cb)
                this.urlInput.children[0].value = ''
                this.urlInput.children[0].style.backgroundColor = 'green'
            } else {
                this.urlInput.children[0].style.backgroundColor = 'red'
            }
        })
    }

    removeCards(url) {
        socket.emit('submit-card', 'remove', url, cb => {
            if (cb) {
                this.updateCard(cb)
            }
        })
    }

    setReady() {
        if (this.cards.length) {
            this.removeForm()
            socket.emit('ready')
        } else {
            displayToaster("ajouter une carte pour lancer la partie")
        }
    }

    leave() {
        socket.emit('leave-room', cb => {
            this.removeForm()
            removeTable()
            joinRoomForm.displayForm()
        })
    }

    updateCard(cards) {
        this.cards = cards
        this.cardCount.textContent = `card count ${cards.length}`
    }

}

class EndGameForm extends Form {
    constructor(array) {
        super(array)
        this.form.style.height = '240px'
        this.form.style.zIndex = 7
    }

    joinRoom() {
        this.joinRoomFunction()
        roomForm.updateCard([])
        roomForm.displayForm()
    }

    leave() {
        this.leaveFunction()
        socket.emit('leave-room', cb => {
            joinRoomForm.displayForm()
            removeTable()
        })
    }

    //TODO find a better solution
    setFunction(joinRoom, leave) {
        this.joinRoomFunction = joinRoom
        this.leaveFunction = leave
    }
}


const joinRoomForm = new JoinRoomForm([{
    "name": "title",
    "type": "div",
    "className": "title",
    "innerHTML": "",
    "textContent": "three js memory",
    "parent": "form",
},
{
    "name": "inputName",
    "type": "div",
    "className": "input-container ic1",
    "innerHTML": '<input id="name" class="input" type="text" value="" placeholder=" "><div class="cut"></div><label for="name" class="placeholder">nom</label>',
    "parent": 'form'
},
{
    "name": "inputRoom",
    "type": "div",
    "className": "input-container ic2",
    "innerHTML": '<input id="room" class="input" value="" type="text" placeholder=" "><div class="cut"></div><label for="room" class="placeholder">salle</label>',
    "eventListener": {
        "type": 'keypress',
        "function": (e) => {
            if (e.key == 'Enter') {
                joinRoomForm.submitForm()
            }
        }
    },
    "parent": "form"
},
{
    "name": "submitButton",
    "type": "button",
    "className": "submit",
    "textContent": "submit",
    "onclick": () => joinRoomForm.submitForm(),
    "parent": "form"
}
])


const roomForm = new RoomForm([
    {
        "name": "cardCount",
        "type": "div",
        "className": "title",
        "textContent": "card count",
        "parent": "form",
        "style": "text-align: center;"
    },
    {
        "name": "urlInput",
        "type": "div",
        "className": "input-container ic1",
        "innerHTML": '<input type="text" class="input" placeholder=" " id="url"><div class="cut" style="width: 120px"></div><label class="placeholder">ajouter une image</label>',
        "eventListener": {
            "type": "keypress",
            "function": (e) => {
                if (e.key == 'Enter') {
                    roomForm.submitForm()
                }
            }
        },
        "parent": "form"
    },
    {
        "name": "submitButton",
        "type": "button",
        "className": "submit",
        "onclick": () => roomForm.submitForm(),
        "textContent": "soumettre",
        "parent": "form"
    },
    {
        "name": "setReadyButton",
        "type": "button",
        "className": "submit",
        "onclick": () => roomForm.setReady(),
        "textContent": "prêt",
        "parent": "form"
    },
    {
        "name": "leaveButton",
        "type": "button",
        "className": "submit",
        "onclick": () => roomForm.leave(),
        "textContent": "partir",
        "parent": "form"
    }
])

export const endGameForm = new EndGameForm([
    {
        "name": "joinButton",
        "type": "button",
        "className": "submit",
        "textContent": "rejoindre",
        "onclick": () => endGameForm.joinRoom(),
        "parent": "form"
    },
    {
        "name": "leaveButton",
        "type": "button",
        "className": "submit",
        "textContent": "partir",
        "onclick": () => endGameForm.leave(),
        "parent": "form"
    }

])


socket.on('connect', () => {
    joinRoomForm.displayForm()
})

socket.on('update-room', dict => {
    updateTable(dict)
    if (game) {
        game.updatePlayer(dict.length)
    }
})

socket.on('update-cards', cards => {
    roomForm.updateCard(cards)
})

socket.on('receive-cards', (cards) => {
    game = new Game(cards);
})