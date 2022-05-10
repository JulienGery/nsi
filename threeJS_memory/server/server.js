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
                "name": cards.length - j -i,
                "textureURL": roomCards[i]
            })
        }
    }
    shuffleArray(cards)
    return cards
}

const setPlayersNotReady = (room) => {
    const players = rooms[room].players
    players.forEach(id => {
        users[id].ready = false
    });
}

const getPlayers = (room) => {
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


const onLeave = (socket) => {
    if (users[socket.id]) {
        const user = users[socket.id]
        const room = user.room
        console.log(`${user.name} has left`)
        rooms[room].players.splice(rooms[room].players.indexOf(socket.id), 1)
        socket.to(room).emit('update-room', getPlayers(room))
        socket.leave(room)
        delete users[user]
        if (rooms[room].players.length == 0) {
            console.log(`delete room ${room}`)
            delete rooms[room]
        }
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
        onLeave(socket)
        cb(true)
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
                users[socket.id].points++;
                const players = getPlayers(room)
                if(users[socket.id].points % 2 == 0){
                    players.sort((a, b) => b.points-a.points)
                    // users[socket.id].points--
                }
                io.to(room).emit('update-room', players)
                break;

            case 'turnback-card':
                console.log('turnback card\t' + cardIndex)
                socket.to(room).emit('action', action, cardIndex)
                break;

        }

        
    })

    socket.on('submit-card', (action, url, cb) => {
        console.log(url)
        const room = users[socket.id].room
        const cards = rooms[room].cards
        switch (action){
            case 'add':
                if (!cards.includes(url)) {
                    cards.push(url)
                    socket.to(room).emit('update-cards', cards)
                    cb(cards)
                }
                cb(false)
                break
            case 'remove':
                if(cards.includes(url)){
                    cards.splice(cards.indexOf(url), 1)
                    socket.to(room).emit('update-cards', cards)
                    cb(cards)               
                }
                cb(false)
                break
        }
    })

    socket.on('next-player', cb => {

        const room = users[socket.id].room

        rooms[room].playerTurn = (rooms[room].playerTurn + 1) % rooms[room].players.length
        const playerTurn = rooms[room].playerTurn

        console.log(`next-player is ${users[rooms[room].players[playerTurn]].name}`)
        socket.to(rooms[room].players[playerTurn]).emit('next-player')    
        
    })

    socket.on('ready', () => {

        console.log(`${users[socket.id].name} is ready !!!`)
        users[socket.id].ready = true
        const room = users[socket.id].room
        io.to(room).emit('update-room', getPlayers(room))

        if (arePlayerReady(room)) {
            if (rooms[room].started) {
                console.log(`start game in room ${room}`)
                io.to(room).emit('start-game')
                setTimeout(() => {
                    const players = rooms[room].players
                    rooms[room].playerTurn = Math.floor(players.length * Math.random())
                    io.to(players[rooms[room].playerTurn]).emit('next-player')
                }, 350);
            } else {
                console.log(`send cards to room ${room}`)

                rooms[room].started = true
                setPlayersNotReady(room)
                io.to(room).emit('update-room', getPlayers(room))

                const cards = initCards(room)
                io.to(room).emit('receive-cards', cards)
            }
        }

    })

    socket.on('disconnect', () => {
        const room = users[socket.id].room
        if(rooms[room].started && rooms[room].players[rooms[room].playerTurn] == socket.id){
            rooms[room].playerTurn = (rooms[room].playerTurn + 1) % rooms[room].players.length
        const playerTurn = rooms[room].playerTurn
        io.to(rooms[room].players[playerTurn]).emit('next-player')
        }
        onLeave(socket)
    })
})

