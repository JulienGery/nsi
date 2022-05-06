import { io } from 'socket.io-client'
import './form.css'
import { TextureLoader } from 'three'
import { updateTable, addTable } from './tableau.js'
import { start } from './tmp.js'
const axios = require('axios')
export const socket = io("https://julien-game-server.gery.me")

const loader = new TextureLoader();
const regex = /(?<=axios:\s*)\d+/g


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
        console.log(cb)
        if (cb) {
            textInput.style.backgroundColor = "green"
            textInput.value = ""
        } else { textInput.style.backgroundColor = "red" }
    })
}

const submitForm = () => {
    const name = document.getElementById('name').value
    const room = document.getElementById('room').value
    if (name && room) {
        socket.emit('join-room', name, room, cb => {
            console.log(cb)
            if (!cb) {
                console.log('game started')
            }
            else {
                addTable()
                updateTable(cb.players)
                document.body.removeChild(document.getElementById('form'))
                document.body.appendChild(form)
            }
        })
    }
}


const displayForm = () => {
    document.body.innerHTML = '<div class="form" id="form"><div class="title">salut</div><div class="input-container ic1"><input id="name" class="input" type="text" placeholder=" " /><div class="cut"></div><label for="name" class="placeholder">name</label></div><div class="input-container ic2"><input id="room" class="input" type="text" placeholder=" " /><div class="cut"></div><label for="room" class="placeholder">room</label></div><button type="text" class="submit" id="button">submit</button></div>'
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
form.style.position = "absolute"

const textInput = document.createElement("input")
textInput.type = "text"
textInput.className = 'input'
textInput.placeholder = "add image"
textInput.id = "url"

const btn = document.createElement("button")
btn.innerText = "submit"
btn.className = 'submit'

btn.onclick = submitCard


// let br = document.createElement('br')

const abtn = document.createElement('button')
abtn.className = 'submit'

abtn.innerHTML = "set ready"

abtn.onclick = function () {
    document.body.innerHTML = '<canvas class="webgl"></canvas>'
    addTable()
    socket.emit('ready')
    start()
}

form.appendChild(textInput)
form.appendChild(btn)
form.appendChild(abtn)

const button = document.createElement('button')
button.className = 'submit'
button.innerText = "leave"
button.onclick = function () {
    socket.emit('leave-room', cb => {
        displayForm()
    })
}
form.appendChild(button)


socket.on('update-cards', cards => {
  console.log(cards)
})

form.addEventListener("submit", e => {
    e.preventDefault()
})
