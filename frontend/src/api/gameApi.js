import axiosInstance from './axios'

class GameApis {
        async postCreateRoom ({id, userName, room}) {
            try {
                if(id && userName) {
                    return await axiosInstance.post('/api/v1/game/createRoom',{
                        id,
                        userName,
                        room
                    })

                } else {
                    throw new Error("Invalid data.")
                }
            } catch (error) {
                throw error
            }
        }
        async patchJoinRoom ({roomCode, id, userName}) {
            try {
                if(id && roomCode && userName) {
                    return await axiosInstance.patch('/api/v1/game/joinRoom',{
                        roomCode,
                        id, 
                        userName
                    })
                } else {
                    throw new Error("Invalid data.")
                }
            } catch (error) {
                throw error
            }
        }

        async patchPlayerMoves(data) {
            try {
                if(data) {
                    return await axiosInstance.patch('/api/v1/game/playerMoves',{...data})
                } else {
                    throw new Error("Invalid data.")
                }
            } catch (error) {
                throw error
            }
        }
        
        async patchPlayAgain(data) {
            try {
                if (data) {
                    return await axiosInstance.patch('/api/v1/game/playAgain', {...data})
                } else {
                    throw new Error("Invalid data.")
                }
            } catch (error) {
                throw error
            }
        }
        
        async deletePlayerTimeOut(data) {
            try {
                if (data) {
                    return await axiosInstance.delete('/api/v1/game/playerTimeout', {data})
                } else {
                    throw new Error("Invalid data.")
                }
            } catch (error) {
                throw error
            }
        }

        async deleteLeaveRoom(data) {
            try {
                if (data) {
                    return await axiosInstance.delete('/api/v1/game/leaveRoom', {data})
                } else {
                    throw new Error("Invalid Data.")
                }
            } catch (error) {
                throw error
            }
        }

}

const gameApis = new GameApis()

export default gameApis