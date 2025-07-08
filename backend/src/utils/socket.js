import { Server } from "socket.io";
import app from "../app.js";
import http from "http";

import { getRoom, deleteRoom, getAllRooms } from "../store/allRooms.js";

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
    },
});

function clearExpiredRooms() {
  let removeOldSingleUserData = setInterval(() => {
    let allRooms = getAllRooms()
    allRooms = allRooms?.filter(data=> new Date() - new Date(data?.createdAt) >  3 * 60 * 1000 && data?.playerTwo?.userId === undefined )?.map(data=> data?.roomCode)
    for (let i = 0; i < allRooms.length; i++) {
         let existed = getRoom(allRooms[i])
        if(existed) {
            deleteRoom(allRooms[i])
        }
    }
  }, 60 * 1000);

  let removeUserWhoPlayedInWhile = setInterval(() => {
    let allRooms = getAllRooms()
    allRooms = allRooms?.filter(data=> new Date() - new Date(data?.updatedAt) > 50 * 1000 && data?.createdAt !== data?.updatedAt || data?.createdAt === data?.updatedAt)?.map(data=> data?.roomCode)
    for (let i = 0; i < allRooms.length; i++) {
        let existed = getRoom(allRooms[i])
        if(existed) {
            deleteRoom(allRooms[i])
        }
    }
  }, 60 * 1000);


  return () => {
    clearInterval(removeOldSingleUserData)
    clearInterval(removeUserWhoPlayedInWhile)
  }
}

clearExpiredRooms()

io.on("connection", (socket) => {
    console.log(`Socket connected ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`User Disconnected ${socket?.id}`);
    });
});

export { io, server };
