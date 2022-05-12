// import axios from 'axios';

const users = {}
const rooms = {}

const io = require("socket.io")(3000, {
    cors: {
        origin: '*'
    }
})

const whenPlayersAreReady = (roomName) => {
    const room = rooms[roomName]
    if (room.started) {
        console.log(`start game in room ${roomName}`)
        io.to(room).emit('start-game')
        setTimeout(() => {
            const players = room.players
            room.playerTurn = Math.floor(players.length * Math.random())
            io.to(players[room.playerTurn]).emit('next-player')
        }, 550);
    } else {
        console.log(`send cards to room ${roomName}`)
        room.started = true
        setPlayersNotReady(roomName)
        io.to(room).emit('update-room', getPlayers(roomName))
        const cards = initCards(roomName)
        io.to(roomName).emit('receive-cards', cards)
    }
}

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

const initCards = (roomName) => {
    const room = rooms[roomName]
    const roomCards = room.cards
    const cards = []
    for (let i = 0; i < roomCards.length; i++) {
        for (let j = 0; j < 2; j++) {
            cards.push({
                "name": cards.length - j - i,
                "textureURL": roomCards[i]
            })
        }
    }
    shuffleArray(cards)
    return cards
}

const setPlayersNotReady = (roomName) => {
    const room = rooms[roomName]
    const players = room.players
    players.forEach(id => {
        users[id].ready = false
    });
}

const getPlayers = (roomName) => {
    const room = rooms[roomName]
    const players = []
    room.players.forEach(id => {
        const player = users[id]
        players.push({
            "name": player.name,
            "points": player.points,
            "ready": player.ready
        })
    })
    return players
}


const arePlayerReady = (roomName) => {
    const room = rooms[roomName]
    const players = room.players
    for (let i = 0; i < players.length; i++) {
        if (!users[players[i]].ready) {
            return false
        }
    }
    return true
}

const onLeave = (socket) => {
    const user = users[socket.id]
    const roomName = user.room
    const room = rooms[roomName]
    console.log(`${user.name} has left`)
    room.players.splice(room.players.indexOf(socket.id), 1)
    socket.to(roomName).emit('update-room', getPlayers(roomName))
    socket.leave(roomName)
    delete users[user]
    if (room.players.length == 0) {
        console.log(`delete room ${roomName}`)
        delete room
    } else if (arePlayerReady(roomName)) {
        whenPlayersAreReady(roomName)
    }

}

io.on('connect', socket => {
    socket.on('join-room', (name, room, /*cardsURL,*/ cb) => {
        if (!rooms[room]) {
            rooms[room] = {
                "started": false,
                "playerTurn": 0,
                "players": [],
                "cards": [
                    // "https://raw.githubusercontent.com/JulienGery/nsi/main/threeJS_memory/static/snkellefaitpeur.png",
                ]
            }
        } else if (rooms[room].started) {
            cb(false)
            return
        }

        users[socket.id] = {
            "name": name,
            "points": 0,
            "ready": false,
            "room": room
        }

        socket.join(room)
        console.log(`${name} joined ${room}`)
        rooms[room].players.push(socket.id)
        const players = getPlayers(room)
        socket.to(room).emit('update-room', players)
        cb({
            "players": players,
            "cards": rooms[room].cards
        })
    })

    socket.on('leave-room', cb => {
        if (users[socket.id]) {
            onLeave(socket)
            cb(true)
        }
    })


    socket.on('action', (action, cardIndex) => {
        const roomName = users[socket.id].room
        const room = rooms[roomName]
        switch (action) {
            case 'turn-card':
                console.log('turn card\t' + cardIndex)
                socket.to(roomName).emit('action', action, cardIndex);
                break;

            case 'move-up':
                console.log('moving-up\t' + cardIndex)
                socket.to(roomName).emit('action', action, cardIndex);
                break;

            case 'move-down':
                console.log('moving down\t' + cardIndex)
                socket.to(roomName).emit('action', action, cardIndex);
                break;

            case 'pair-found':
                //TODO add point
                console.log('pair found\t' + cardIndex);
                socket.to(roomName).emit('action', action, cardIndex);
                users[socket.id].points += .5;
                let players = getPlayers(room);
                if (Number.isInteger(users[socket.id].points)) {
                    room.cards.pop()
                    if (room.cards.length == 0) {
                        room.started = false
                        setPlayersNotReady(roomName)
                        players = getPlayers(roomName)
                    }
                    players.sort((a, b) => b.points - a.points);
                }

                io.to(room).emit('update-room', players);
                break;

            case 'turnback-card':
                console.log('turnback card\t' + cardIndex)
                socket.to(roomName).emit('action', action, cardIndex)
                break;

        }


    })

    socket.on('submit-card', (action, url, cb) => {
        console.log(url)
        const roomName = users[socket.id].room
        const room = rooms[roomName]
        const cards = room.cards
        switch (action) {
            case 'add':
                if (!cards.includes(url)) {
                    cards.push(url)
                    socket.to(roomName).emit('update-cards', cards)
                    cb(cards)
                }
                cb(false)
                break
            case 'remove':
                if (cards.includes(url)) {
                    cards.splice(cards.indexOf(url), 1)
                    socket.to(roomName).emit('update-cards', cards)
                    cb(cards)
                }
                cb(false)
                break
        }
    })

    socket.on('next-player', cb => {

        const roomName = users[socket.id].room
        const room = rooms[roomName]

        room.playerTurn = (room.playerTurn + 1) % room.players.length
        const playerTurn = room.playerTurn

        console.log(`next-player is ${users[room.players[playerTurn]].name}`)
        socket.to(room.players[playerTurn]).emit('next-player')

    })

    socket.on('ready', () => {

        console.log(`${users[socket.id].name} is ready !!!`)
        users[socket.id].ready = true
        const roomName = users[socket.id].room
        // const room = rooms[roomName]
        io.to(roomName).emit('update-room', getPlayers(roomName))

        if (arePlayerReady(roomName)) {
            whenPlayersAreReady(roomName)
        }

    })

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            const roomName = users[socket.id].room
            const room = rooms[roomName]
            if (room.started && room.players[room.playerTurn] == socket.id) {
                room.playerTurn = (room.playerTurn + 1) % room.players.length
                const playerTurn = room.playerTurn
                io.to(room.players[playerTurn]).emit('next-player')
            }
            onLeave(socket)
        }
    })
})

