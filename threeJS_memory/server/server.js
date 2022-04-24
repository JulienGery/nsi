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
                "playerTurn": 1,
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
                socket.to(room).emit('move-down');
                break;

            case 'pair-found':
                //TODO add point
                console.log('pair found\t'+cardIndex)
                socket.to(room).emit('pair-found', cardIndex);
                break;
            case 'turnback-card':
                console.log('turnback card\t'+cardIndex)
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

