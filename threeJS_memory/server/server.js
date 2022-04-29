// import axios from 'axios';

const users = {}
const rooms = {}

const io = require("socket.io")(3000, {
    cors: {
        origin: '*'
    }
})

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

const initCards = (room) => {
    const roomCards = rooms[room].cards
    const cards = []
    for (let i = 0; i < roomCards.length; i++) {
        for (let j = 0; j < 2; j++) {
            cards.push({
                "name": cards.length - j,
                "textureURL": roomCards[i]
            })
        }
    }
    shuffleArray(cards)
    return cards
}

// const getCards = (room) => {
//     return rooms[room].cards
// }

const setPlayersNotReady = (room) => {
    const players = rooms[room].players
    players.forEach(id => {
        users[id].ready = false
    });
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
                "started": false,
                "playerTurn": 0,
                "players": [],
                "cards": ["https://raw.githubusercontent.com/JulienGery/nsi/main/threeJS_memory/static/snkellefaitpeur.png"]
            }
        }

        rooms[room].players.push(socket.id)
        // cardsURL.map((url) => rooms[room].cards.push(url))
        const roomStatus = getRoomStatus(room)
        socket.to(room).emit('update-room', roomStatus)
        // console.log(io.sockets.adapter.rooms.get(room))
        cb(roomStatus)
    })


    socket.on('action', (action, cardIndex) => {
        const room = users[socket.id].room
        switch (action) {
            case 'turn-card':
                console.log('turn card\t' + cardIndex)
                socket.to(room).emit('action', action, cardIndex);
                break;

            case 'move-up':
                console.log('moving-up\t' + cardIndex)
                socket.to(room).emit('action', action, cardIndex);
                break;

            case 'move-down':
                console.log('moving down\t' + cardIndex)
                socket.to(room).emit('action', action, cardIndex);
                break;

            case 'pair-found':
                //TODO add point
                console.log('pair found\t' + cardIndex)
                socket.to(room).emit('action', action, cardIndex);
                break;
            case 'turnback-card':
                console.log('turnback card\t' + cardIndex)
                socket.to(room).emit('action', action, cardIndex)
                break;

        }
    })

    socket.on('submit-cards', cards => {
        const room = users[socket.id].room
        rooms[room].cards.push(cards)
        socket.to(room).emit('update-cards', rooms[room].cards)
        cb(rooms[room].cards)
    })

    // socket.on('send-cards', () => {
    //     const room = users[socket.id].room
    //     const cards = initCards(users[socket.id].room)
    //     socket.to(room).emit('receive-cards', cards)
    // })

    socket.on('next-player', () => {

        const room = users[socket.id].room
        console.log('next-player')

        rooms[room].playerTurn = (rooms[room].playerTurn + 1) % rooms[room].players.length
        const playerTurn = rooms[room].playerTurn

        // console.log(rooms[room].players[playerTurn].name)
        // console.log(playerTurn)
        socket.to(rooms[room].players[playerTurn]).emit('next-player')

    })

    socket.on('ready', () => {

        console.log(`${users[socket.id].name} is ready !!!`)
        users[socket.id].ready = true
        const room = users[socket.id].room
        io.to(room).emit('update-room', getRoomStatus(room))

        if (arePlayerReady(room)) {
            if (rooms[room].started) {
                console.log('start game')
                io.to(room).emit('start-game')
                setTimeout(() => {
                    io.to(rooms[room].players[Math.floor(rooms[room].players.length * Math.random())]).emit('next-player')
                }, 1200);
            } else {
                console.log('send cards')

                rooms[room].started = true
                setPlayersNotReady(room)
                io.to(room).emit('update-room', getRoomStatus(room))

                const cards = initCards(room)
                io.to(room).emit('receive-cards', cards)
            }
        }
        
    })

    socket.on('disconnect', () => {
        const user = users[socket.id]
        const room = user.room
        console.log(`${user.name} has left`)
        rooms[room].players.splice(rooms[room].players.indexOf(socket.id), 1)
        socket.to(room).emit('update-room', getRoomStatus(room))
        socket.leave(room)
        delete users[user]
    })
})

