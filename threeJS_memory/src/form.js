import { io } from 'socket.io-client'
import './form.css'
import { TextureLoader } from 'three'
import { displayToaster } from './toaster.js'
import { updateTable, addTable } from './tableau.js'
import { start } from './tmp.js'
const axios = require('axios')
export const socket = io("https://julien-game-server.gery.me")

const loader = new TextureLoader();
const regex = /^\d+$/g
let name;
let room;

const submitCard = async () => {

    const url = textInput.value
    const number = url.match(regex)

    if (number) {
        console.log(`geting ${number} cards`)

        axios.get("https://picsum.photos/v2/list?page=" + Math.floor(Math.random() * 1000 / number) + "&limit=" + number).then((response) => {

            const data = response.data;
            data.forEach(element => sendCards(element.download_url))

        }).catch((err) => {
            console.log(err)
        })
        return
    }

    if (!url) {
        textInput.style.backgroundColor = "red"
    } else {
        loader.loadAsync(url).then((rep) => {
            sendCards(url)
        }).catch((err) => {
            console.log(err)
            textInput.style.backgroundColor = "red"
        })
    }
}

const sendCards = (url) => {
    socket.emit('submit-card', url, cb => {
        // console.log(cb)
        if (cb) {
            text.textContent = `card count ${cb.length}`
            textInput.style.backgroundColor = "green"
            textInput.value = ""
        } else { textInput.style.backgroundColor = "red" }
    })
}

const submitForm = () => {
    name = document.getElementById('name').value
    room = document.getElementById('room').value
    if (name && room) {
        socket.emit('join-room', name, room, cb => {
            if (!cb) {
                displayToaster('game already started', 'red', 'white', '#08d')
            }
            else {
                addTable()
                text.textContent = `card count ${cb.cards.length}`
                updateTable(cb.players)
                document.body.removeChild(document.getElementById('form'))
                document.body.appendChild(form)
            }
        })
    } else {
        displayToaster("fill form")
    }
}


const displayForm = (name = '', room = '') => {
    document.body.innerHTML = '<div class="form" id="form"><div class="title">three js memory</div><div class="input-container ic1"><input id="name" class="input" type="text" value="' + name + '" placeholder=" " /><div class="cut"></div><label for="name" class="placeholder">name</label></div><div class="input-container ic2"><input id="room" class="input" value="' + room + '" type="text" placeholder=" " /><div class="cut"></div><label for="room" class="placeholder">room</label></div><button type="text" class="submit" id="button">submit</button></div>'
    const roomInput = document.getElementById('room')
    roomInput.addEventListener('keypress', (event) => {
        if (event.key == 'Enter') {
            submitForm()
        }
    })
    const button = document.getElementById('button')
    button.onclick = submitForm
}

socket.on('connect', () => {
    console.log('success')
    displayForm()
})

socket.on('update-room', dict => {
    updateTable(dict)
})


const form = document.createElement('form')
// form.style.position = "absolute"
form.className = 'formImage'

const inputContainer = document.createElement('div')
inputContainer.className = 'input-container ic1'

const textInput = document.createElement("input")
textInput.type = "text"
textInput.className = 'input'
textInput.placeholder = " "
textInput.id = "url"

const cut = document.createElement('div')
cut.className = 'cut'

const placeholder = document.createElement('label')
placeholder.className = "placeholder"
placeholder.textContent = 'add image'

inputContainer.appendChild(textInput)
inputContainer.appendChild(cut)
inputContainer.appendChild(placeholder)

const btn = document.createElement("button")
btn.innerText = "submit"
btn.className = 'submit'

btn.onclick = submitCard

const abtn = document.createElement('button')
abtn.className = 'submit'
abtn.textContent = "set ready"

abtn.onclick = function () {
    document.body.innerHTML = '<canvas class="webgl"></canvas>'
    addTable()
    socket.emit('ready')
    start()
}
const text = document.createElement('div')
text.className = 'title'
text.style.textAlign = 'center'

form.appendChild(text)
form.appendChild(inputContainer)
form.appendChild(btn)
form.appendChild(abtn)

const button = document.createElement('button')
button.className = 'submit'
button.innerText = "leave"
button.onclick = function () {
    socket.emit('leave-room', cb => {
        displayForm(name, room)
    })
}
form.appendChild(button)

socket.on('update-cards', cards => {
    text.textContent = `card count ${cards.length}`
})

form.addEventListener("submit", e => {
    e.preventDefault()
})
