// import axios from 'axios';

const users = {}
const rooms = {}

const io = require("socket.io")(3000, {
    cors: {
        origin: '*'
    }
})

const initCards = (room) => {
    const Rcards = rooms[room].cards
    const cards = []
    for (let i = 0; i < Rcards.length; i++) {
        for (let j = 0; j < 2; j++) {
            cards.push({
                "name": cards.length - i,
                "textureURL": Rcards.cards[i]
            })
        }
    }
    return cards
}


const getRoomStatus = (room) => {
    const players = []
    for (let i = 0; i < rooms[room].players.length; i++) {
        const player = users[rooms[room].players[i]]
        players.push({
            "name": player.name,
            "points": player.points,
            "ready": player.ready
        })
    }
    return players
}
const arePlayerReady = (room) => {
    const players = rooms[room].players
    for (let i = 0; i < players.length; i++) {
        if (!users[players[i]].ready) {
            return false
        }
    }
    return true
}

io.on('connect', socket => {
    socket.on('join-room', (name, room, /*cardsURL,*/ cb) => {
        socket.join(room)

        users[socket.id] = {
            "name": name,
            "points": 0,
            "ready": false,
            "room": room
        }

        users[socket.id]
        if (!rooms[room]) {
            rooms[room] = {
                "playerTurn": 0,
                "players": [],
                "cards": []
            }
        }

        rooms[room].players.push(socket.id)
        cardsURL.map((url) => rooms[room].cards.push(url))
        const roomStatus = getRoomStatus(room)
        socket.to(room).emit('update-room', roomStatus)
        // console.log(io.sockets.adapter.rooms.get(room))
        cb(roomStatus)
    })


    socket.on('action', (action, cardIndex, room) => {
        switch (action) {
            case 'turn-card':
                console.log('turn card\t' + cardIndex)
                socket.to(room).emit('turn-card', cardIndex);
                break;

            case 'move-up':
                console.log('moving-up\t' + cardIndex)
                socket.to(room).emit('move-up', cardIndex);
                break;

            case 'move-down':
                console.log('moving down')
                socket.to(room).emit('move-down', cardIndex);
                break;

            case 'pair-found':
                //TODO add point
                console.log('pair found\t' + cardIndex)
                socket.to(room).emit('pair-found', cardIndex);
                break;
            case 'turnback-card':
                console.log('turnback card\t' + cardIndex)
                socket.to(room).emit('turnback-card', cardIndex)
                break;

        }
    })

    socket.on('send-cards', (cards, room) => {
        socket.to(room).emit('receive-cards', cards)
    })

    socket.on('next-player', (room) => {

        console.log('next-player')

        rooms[room].playerTurn = (rooms[room].playerTurn + 1) % rooms[room].players.length
        const playerTurn = rooms[room].playerTurn

        // console.log(rooms[room].players[playerTurn].name)
        // console.log(playerTurn)
        socket.to(rooms[room].players[playerTurn].socketID).emit('next-player')

    })

    socket.on('ready', (cb) => {

        console.log('ready')
        users[socket.id].ready = true
        const room = users[socket.id].room
        socket.to(room).emit('update-room', getRoomStatus(room))

        if (arePlayerReady(room)) {
            socket.to(room).emit('start-game')
            cb(true)
        }
        cb(false)
    })
})

