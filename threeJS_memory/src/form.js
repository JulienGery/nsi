import { io } from 'socket.io-client'
import { updateTable } from './tableau.js'
import { TextureLoader } from 'three'
const axios = require('axios')
const socket = io("http://192.168.1.25:3000")
const loader = new TextureLoader();

socket.on('connect', () => {
    console.log('success')
    socket.emit('join-room', name, room, cb => {
        console.log(cb)
        updateTable(cb.players)
    })
})

socket.on('update-room', dict => {
    console.log(dict)
    updateTable(dict)
})

const sendCards = (url) => {
    socket.emit('submit-card', url, cb => {
        console.log(cb)
        if (cb) {
            textInput.style.backgroundColor = "green"
            textInput.value = ""
        } else { textInput.style.backgroundColor = "red" }
    })
}


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


const form = document.createElement('form')
form.style.position = "absolute"

const textInput = document.createElement("input")
textInput.type = "text"
textInput.placeholder = "enter url here"
textInput.id = "url"

const btn = document.createElement("button")
btn.innerHTML = "submit"

btn.onclick = submitCard


// let br = document.createElement('br')

const abtn = document.createElement('button')

abtn.innerHTML = "set ready"

abtn.onclick = function () {
    ready = true
    socket.emit('ready')
    document.body.removeChild(form)
}

form.appendChild(textInput)
form.appendChild(btn)
form.appendChild(abtn)


form.addEventListener("submit", e => {
    e.preventDefault()
})



document.body.appendChild(form)