const allRooms = new Map()

export function getRoom(roomCode) {
    return allRooms.get(roomCode)
}

export function setRoom(roomCode, data) {
    return allRooms.set(roomCode, data)
}


export function updateRoom(roomCode, updateFn) {
    let roomData = getRoom(roomCode)

    if(roomData) {
        setRoom(roomCode, updateFn(roomData))
    }
}

export function deleteRoom(roomCode) {
    allRooms?.delete(roomCode)
}

export function getAllRooms() {
    return Array.from(allRooms.values())
}