import { io } from 'socket.io-client'
import './form.css'
import { TextureLoader } from 'three'
import { displayToaster } from './toaster.js'
import { updateTable, addTable, removeTable } from './tableau.js'
import { start, game } from './Game.js'
const axios = require('axios')
export const socket = io("https://julien-game-server.gery.me")
// export const socket = io("http://localhost:3000")

const loader = new TextureLoader();
const regex = /^-?\d+(?:\s*)$/g

class Form{
    constructor(array){
        this.form = document.createElement('div')
        this.form.className = 'form'
        this.isDisplayed = false
        array.forEach(dict => this.createForm(dict))
    }


    createForm(dict){
        const name = dict.name
        this[name] = document.createElement(dict.type)
        this[name].className = dict.className
        this[name].innerHTML = dict.innerHTML
        if(dict.textContent){
            this[name].textContent = dict.textContent
        }
        if(dict.onclick){
            this[name].onclick = dict.onclick
        }
        if(dict.eventListener){
            const eventListener = dict.eventListener
            this[name].addEventListener(eventListener.type, eventListener.function)
        }
        if(dict.style){
            this[name].style = dict.style
        }
        this[dict.parent].appendChild(this[name])
        // console.log(this)
    }

    

    displayForm(){
        if(!this.isDisplayed){
            this.isDisplayed = true
            document.body.appendChild(this.form)
        }
    }

    removeForm(){
        this.isDisplayed = false
        document.body.removeChild(this.form)
    }
}

class TestForm extends Form{
    constructor(array){
        super(array)
        this.name = ''
        this.room = ''
    }

    submitForm(){
        this.name = this.inputName.children[0].value
        this.room = this.inputRoom.children[0].value
        if(this.room && this.name){
            this.updateNameAndRoom()
            socket.emit('join-room', this.name, this.room, cb => {
                if(!cb){
                    displayToaster('game already started')
                }else{
                    addTable()
                    updateTable(cb.players)
                    this.removeForm()
                    testRoomForm.displayForm()
                    testRoomForm.updateCard(cb.cards)
                }
            })
        }else{
            displayToaster('fill form')
        }
    }

    updateNameAndRoom(){
        this.inputName.children[0].value = this.name
        this.inputRoom.children[0].value = this.room
    }
}



class TestRoomForm extends Form{
    constructor(array){
        super(array)
        this.form.className = 'formImage'
        this.cards = []
    }

    submitForm(){
        const url = this.urlInput.children[0].value
        const number = url.match(regex)
        if (number) {
            this.urlInput.children[0].value = ''
            if(number<0){
                const array = []
                while (array.length != Math.abs(number) && array.length < this.cards.length) {
                    const randomNumber = Math.floor(Math.random() * this.cards.length)
                    if(!array.includes(randomNumber)){
                        array.push(randomNumber)
                    }
                } 

                // array.sort((a, b) => b-a)
                
                array.forEach(async(index) => this.removeCards(this.cards[index]))
                return
            }
            
            axios.get("https://picsum.photos/v2/list?page=" + Math.floor(Math.random() * 1000 / number) + "&limit=" + number).then((response) => {

                const data = response.data;
                data.forEach(element => this.sendCards(element.download_url))

            }).catch((err) => {
                console.log(err)
            })
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
                this.urlInput.children[0].style.backgroundColor = 'green'
            } else {
                this.urlInput.children[0].style.backgroundColor = 'red'
            }
        })
    }

    removeCards(url){
        socket.emit('submit-card', 'remove', url, cb => {
            if(cb){
                this.updateCard(cb)
            }
        })
    }

    setReady() {
        if(this.cards.length){
            this.removeForm()  
            start()
            socket.emit('ready')
            console.log('starting game')
        }else{
            displayToaster("can't start, no cards")
        }
    }
    
    leave(){
        socket.emit('leave-room', cb => {
            this.removeForm()
            removeTable()
            testForm.displayForm()
        })
    }

    updateCard(cards){
        this.cards = cards
        this.cardCount.textContent = `card count ${cards.length}`
    }

}

class TestEndGameForm extends Form{
    constructor(array){
        super(array)
        this.form.style.height = '240px'
        this.form.style.zIndex = 7
    }

    joinRoom(){
        this.joinRoomFunction()
        testRoomForm.updateCard([])
        testRoomForm.displayForm()
    }

    leave(){
        this.leaveFunction()
        socket.removeAllListeners()
        testForm.displayForm()
    }


    setFunction(joinRoom, leave){
        this.joinRoomFunction = joinRoom
        this.leaveFunction = leave
    }
}


const testForm = new TestForm([{
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
    "innerHTML": '<input id="name" class="input" type="text" value="" placeholder=" "><div class="cut"></div><label for="name" class="placeholder">name</label>',
    "parent": 'form'
},
{
    "name": "inputRoom",
    "type": "div",
    "className": "input-container ic2",
    "innerHTML": '<input id="room" class="input" value="" type="text" placeholder=" "><div class="cut"></div><label for="room" class="placeholder">room</label>',
    "eventListener": {
        "type": 'keypress',
        "function": (e) => {
            if(e.key == 'Enter'){
                testForm.submitForm()
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
    "onclick": () => testForm.submitForm(),
    "parent": "form"
}
])


const testRoomForm = new TestRoomForm([
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
        "innerHTML": '<input type="text" class="input" placeholder=" " id="url"><div class="cut"></div><label class="placeholder">add image</label>',
        "eventListener":{
            "type": "keypress",
            "function": (e) => {
                if(e.key == 'Enter'){
                    testRoomForm.submitForm()
                }
            }
        },
        "parent": "form"
    },
    {
        "name": "submitButton",
        "type": "button",
        "className": "submit",
        "onclick": () => testRoomForm.submitForm(),
        "textContent": "submit",
        "parent": "form"
    },
    {
        "name": "setReadyButton",
        "type": "button",
        "className": "submit",
        "onclick": () => testRoomForm.setReady(),
        "textContent": "set ready",
        "parent": "form"
    },
    {
        "name": "leaveButton",
        "type": "button",
        "className": "submit",
        "onclick": () => testRoomForm.leave(),
        "textContent": "leave",
        "parent": "form"
    }
])

export const testEndGameForm = new TestEndGameForm([
    {
        "name": "joinButton",
        "type": "button",
        "className": "submit",
        "textContent": "joinRoom",
        "onclick": () => testEndGameForm.joinRoom(),
        "parent": "form"
    },
    {
        "name": "leaveButton",
        "type": "button",
        "className": "submit",
        "textContent": "leave",
        "onclick": () => {testEndGameForm.leave(game)},
        "parent": "form"
    }
    
])


socket.on('connect', () => {
    console.log('success')
    testForm.displayForm()
})

socket.on('update-room', dict => {
    updateTable(dict)
    if(game){
        game.updatePlayer(dict.length)
    }
})

socket.on('update-cards', cards => {
    console.log(cards)
    testRoomForm.updateCard(cards)
})