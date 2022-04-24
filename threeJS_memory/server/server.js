const rooms = {}

const io = require("socket.io")(3000, {
    cors: {
        origin: '*'
    }
})


const arePlayerReady = (room) => {
    const players = rooms[room].players
    for (let i = 0; i < players.length; i++) {
        if (!players[i].ready) {
            return false
        }
    }
    return true
}

io.on('connect', socket => {
    socket.on('join-room', (name, room, cb) => {
        socket.join(room)
        if (!rooms[room]) {
            rooms[room] = {
                "playerTurn": 0,
                "players": []
            }
        }

        rooms[room].players.push({
            "name": name,
            "points": 0,
            "ready": false,
            "socketID": socket.id
        })

        socket.to(room).emit('update-room', rooms[room])
        // console.log(socket.rooms)
        // console.log(io.sockets.adapter.rooms.get(room))
        cb(rooms[room])
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
                console.log(action)
                socket.to(room).emit('move-down');
                break;
            case 'pair-found':
                //TODO add point
                socket.to(room).emit('pair-found', cardIndex);
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

        // console.log(rooms[room])
        // console.log(rooms[room].players[playerTurn].socketID)

        socket.to(rooms[room].players[playerTurn].socketID).emit('next-player')
        // console.log(io.socket.adapter.rooms.get(room))
        // socket.to(io.socket.adapter.rooms.get(room))
    })

    socket.on('ready', (room, cb) => {
        const players = rooms[room].players
        for (let i = 0; i < players.length; i++) {
            if (players[i].socketID == socket.id) {
                players[i].ready = true
                socket.to(room).emit('update-room', rooms[room])
                break
            }
        }
        if (arePlayerReady(room)) {
            socket.to(room).emit('start-game')
            cb(true)
        }
        cb(false)
    })
})

