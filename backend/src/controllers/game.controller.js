import shortid from "shortid";
import {
    setRoom,
    getRoom,
    deleteRoom,
    updateRoom,
    getAllRooms,
} from "../store/allRooms.js";
import { io } from "../utils/socket.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

const layout = [
    {
        id: 1,
        isActive: false,
        guess: null,
        owner: null,
    },
    {
        id: 2,
        isActive: false,
        guess: null,
        owner: null,
    },
    {
        id: 3,
        isActive: false,
        guess: null,
        owner: null,
    },
    {
        id: 4,
        isActive: false,
        guess: null,
        owner: null,
    },
    {
        id: 5,
        isActive: false,
        guess: null,
        owner: null,
    },
    {
        id: 6,
        isActive: false,
        guess: null,
        owner: null,
    },
    {
        id: 7,
        isActive: false,
        guess: null,
        owner: null,
    },
    {
        id: 8,
        isActive: false,
        guess: null,
        owner: null,
    },
    {
        id: 9,
        isActive: false,
        guess: null,
        owner: null,
    },
];

let patterns = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
];

const hasWon = (playerMoves) =>
    patterns.some((combination) =>
        combination.every((cell) => playerMoves.includes(cell))
    );

const getSocket = (id) => {
    return io?.sockets?.sockets?.get(id);
};

const createRoom = async (req, res) => {
    try {
        let { id, room, userName } = req.body;
        let socket = getSocket(id);

        if (!id) {
            throw new apiError(
                res,
                404,
                "User ID not found. Please try again later."
            );
        }
        if (!userName) {
            throw new apiError(res, 404, "Username is required.");
        }
        if (!socket) {
            throw new apiError(
                res,
                400,
                "Socket ID not found. Please try again later."
            );
        }
        if (room && io?.sockets?.adapter?.rooms?.has(room)) {
            socket.leave(room);
            let roomData = getRoom(room);
            if (
                roomData?.playerTwo?.userId === undefined ||
                roomData?.roomId === id
            ) {
                deleteRoom(room);
            }
        }

        let roomCode = shortid?.generate();

        const randomNum = Math.floor(Math.random() * 2);

        setRoom(roomCode, {
            roomId: id,
            roomCode,
            isPlaying: randomNum,
            createdAt: new Date(),
            updatedAt: new Date(),
            gameHistory: [],
            playAgain: [],
            playerOne: {
                userId: id,
                userName,
                symbol: 0,
            },
            playerTwo: {},
            gameBoard: layout,
            privateRoom: true,
        });

        socket?.join(roomCode);

        let createdRoom = getRoom(roomCode);

        if (!createdRoom) {
            throw new apiError(
                res,
                500,
                "Failed to create room. Please try again later."
            );
        }

        res.status(201).json(
            new apiResponse(201, createdRoom, "Room created successfully.")
        );
    } catch (error) {
        return error;
    }
};

const joinRoom = async (req, res) => {
    try {
        let { roomCode, id, userName } = req.body;
        let socket = getSocket(id);

        if (!id) {
            throw new apiError(
                res,
                404,
                "User ID not found. Please try again later."
            );
        }
        if (!userName) {
            throw new apiError(res, 404, "Username is required.");
        }
        if (!roomCode) {
            throw new apiError(res, 404, "Room code not found.");
        }
        if (!socket) {
            throw new apiError(
                res,
                400,
                "Socket ID not found. Please try again later."
            );
        }

        let roomData = getRoom(roomCode);

        if (!roomData) {
            throw new apiError(
                res,
                400,
                "Room code is invalid. Please check and try again."
            );
        }

        if (io?.sockets?.adapter?.rooms?.has(roomCode) && roomData) {
            if (
                roomData?.roomCode === roomCode &&
                roomData?.playerOne?.userId !== id &&
                roomData?.playerTwo?.userId === undefined
            ) {
                socket?.join(roomCode);

                updateRoom(roomCode, (room) => ({
                    ...room,
                    playerTwo: {
                        userId: id,
                        userName,
                        symbol: 1,
                    },
                }));

                let joinedRoom = getRoom(roomCode);

                if (!joinedRoom) {
                    throw new apiError(
                        res,
                        500,
                        "Failed to join room. Please try again later."
                    );
                }

                socket?.broadcast?.to(roomCode)?.emit("in room", joinedRoom);

                res.status(200).json(
                    new apiResponse(
                        200,
                        joinedRoom,
                        "Room joined successfully."
                    )
                );
            } else {
                throw new apiError(
                    res,
                    400,
                    "This room is full. Please try joining a different game."
                );
            }
        } else {
            throw new apiError(
                res,
                400,
                "Room code is invalid or has expired. Please check and try again."
            );
        }
    } catch (error) {
        return error;
    }
};

const playAgain = (req, res) => {
    try {
        let { roomCode, userId } = req.body;
        let socket = getSocket(userId);

        if (!userId) {
            throw new apiError(
                res,
                404,
                "User ID not found. Please try again later."
            );
        }
        if (!roomCode) {
            throw new apiError(res, 404, "Room code not found.");
        }
        if (!socket) {
            throw new apiError(
                res,
                400,
                "Socket ID not found. Please try again later."
            );
        }

        let roomData = getRoom(roomCode);

        if (!roomData) {
            throw new apiError(
                res,
                400,
                "Room code is invalid. Please check and try again."
            );
        }

        if (
            (roomData && roomData?.playerOne?.userId === userId) ||
            roomData?.playerTwo?.userId === userId
        ) {
            if (!roomData?.playAgain?.find((data) => data.userId === userId)) {
                updateRoom(roomCode, (room) => ({
                    ...room,
                    playAgain: [...room.playAgain, { userId, again: true }],
                }));
            }

            roomData = getRoom(roomCode);

            if (roomData && roomData?.playAgain?.length === 1) {
                io.sockets.in(roomCode).emit(`waiting to play`, {
                    senderId:
                        roomData?.playerOne?.userId === userId
                            ? roomData?.playerOne?.userId
                            : roomData?.playerTwo?.userId,
                    receiverId:
                        roomData?.playerOne?.userId === userId
                            ? roomData?.playerTwo?.userId
                            : roomData?.playerOne?.userId,
                    senderMessage: "Waiting...",
                    receiverMessage: "Rematch requested.",
                });

                return res
                    .status(200)
                    .json(
                        new apiResponse(
                            200,
                            {},
                            "Rematch request sent successfully."
                        )
                    );
            }

            if (
                roomData &&
                roomData?.playAgain?.length >= 2 &&
                roomData.playAgain?.some((i) => i.again === true)
            ) {
                const randomNum = Math.floor(Math.random() * 2);

                updateRoom(roomCode, (room) => ({
                    ...room,
                    playAgain: [],
                    isPlaying: randomNum,
                    gameBoard: layout,
                    updatedAt: new Date(),
                }));

                let joinedRoom = getRoom(roomCode);

                if (!joinedRoom) {
                    throw new apiError(res, 500, "Unable to restart the game.");
                }

                socket?.broadcast?.to(roomCode)?.emit("new game", joinedRoom);

                return res
                    .status(200)
                    .json(
                        new apiResponse(
                            200,
                            joinedRoom,
                            "Game has been restarted successfully."
                        )
                    );
            }
        } else {
            throw new apiError(res, 400, "User ID not found in the game.");
        }
    } catch (error) {
        return error;
    }
};

const playerMoves = (req, res) => {
    try {
        let { roomCode, move, isPlaying, updatedAt, userId } = req.body;

        if (!userId) {
            throw new apiError(
                res,
                404,
                "User ID not found. Please try again later."
            );
        }
        if (!roomCode) {
            throw new apiError(res, 404, "Room code not found.");
        }
        if (!move) {
            throw new apiError(res, 400, "Move action is invalid or missing.");
        }

        if (!String(isPlaying)) {
            throw new apiError(res, 400, "Player info is invalid or missing.");
        }

        if (!updatedAt) {
            throw new apiError(
                res,
                400,
                "Player's last activity timestamp is required."
            );
        }

        let roomData = getRoom(roomCode);

        if (!roomData) {
            throw new apiError(
                res,
                400,
                "Room code is invalid. Please check and try again."
            );
        }
        if (
            (roomData && roomData?.playerOne?.userId === userId) ||
            roomData?.playerTwo?.userId === userId
        ) {
            updateRoom(roomCode, (room) => ({
                ...room,
                isPlaying,
                updatedAt: new Date(updatedAt),
                gameBoard: room?.gameBoard?.map((data) =>
                    move?.id === data?.id && data?.isActive === false
                        ? move
                        : data
                ),
            }));

            roomData = getRoom(roomCode);
            let first = [];
            let second = [];
            let won = null;

            roomData?.gameBoard?.map((data) =>
                data?.isActive
                    ? data?.owner === userId
                        ? !first?.includes(data?.id) && first.push(data?.id)
                        : !second?.includes(data?.id) && second.push(data?.id)
                    : null
            );

            if (hasWon(first)) {
                if (roomData?.playerOne?.userId === userId) {
                    won = "x";
                } else {
                    won = "o";
                }
            } else if (hasWon(second)) {
                if (roomData?.playerOne?.userId === userId) {
                    won = "o";
                } else {
                    won = "x";
                }
            } else {
                if (
                    roomData?.gameBoard?.filter((data) => data?.isActive)
                        ?.length >= 9
                ) {
                    won = "Draw";
                }
            }

            io.sockets
                .in(roomCode)
                .emit("moves", { move, isPlaying, updatedAt, won });

            return res
                .status(200)
                .json(new apiResponse(200, {}, "Player moved successfully."));
        } else {
            throw new apiError(res, 400, "User ID not found in the game.");
        }
    } catch (error) {
        return error;
    }
};

const leaveRoomAndDeleteAllRoomInfo = (req, res) => {
    try {
        let { roomCode, userId, start } = req.body;
        let socket = getSocket(userId);

        if (!socket) {
            throw new apiError(
                res,
                400,
                "Socket ID not found. Please try again later."
            );
        }

        if (!roomCode) {
            throw new apiError(res, 404, "Room code not found.");
        }

        if (!userId) {
            throw new apiError(
                res,
                404,
                "User ID not found. Please try again later."
            );
        }
        let roomData = getRoom(roomCode);

        if (!roomData) {
            throw new apiError(
                res,
                400,
                "Room code is invalid. Please check and try again."
            );
        }

        if (io?.sockets?.adapter?.rooms?.has(roomCode)) {
            socket?.broadcast?.to(roomCode)?.emit("opponentLeft", {
                success: true,
                start : start === true ? true : false,
                id:
                    roomData?.playerOne?.userId === userId
                        ? roomData?.playerTwo?.userId
                        : roomData?.playerOne?.userId,
                message: "You won!",
                symbol:
                    roomData?.playerOne?.userId === userId
                        ? roomData?.playerTwo?.symbol
                        : roomData?.playerOne?.symbol,
            });

            socket.leave(roomCode);
            deleteRoom(roomCode);

            return res.status(200).json(
                new apiResponse(
                    200,
                    {
                        playerLost: {
                            success: false,
                            id: userId,
                            message: "You lost!",
                            symbol:
                                roomData?.playerOne?.userId === userId
                                    ? roomData?.playerOne?.symbol
                                    : roomData?.playerTwo?.symbol,
                        }
                    },
                    "Game exited successfully."
                )
            );
        }
    } catch (error) {
        return error;
    }
};

const playerTimeOut = (req, res) => {
    try {
        let { roomCode, lostUserId } = req.body;

        let socket = getSocket(lostUserId);

        if (!socket) {
            throw new apiError(
                res,
                400,
                "Socket ID not found. Please try again later."
            );
        }

        if (!lostUserId) {
            throw new apiError(res, 404, "User ID not found.");
        }
        if (!roomCode) {
            throw new apiError(res, 404, "Room code not found.");
        }

        let roomData = getRoom(roomCode);

        if (!roomData) {
            throw new apiError(
                res,
                400,
                "Room code is invalid. Please check and try again."
            );
        }

        if (io.sockets.adapter.rooms?.has(roomCode)) {
            socket?.leave(roomCode);

            deleteRoom(roomCode);

            socket?.broadcast?.to(roomCode)?.emit("game timeout", {
                success: true,
                id:
                    roomData?.playerOne?.userId === lostUserId
                        ? roomData?.playerTwo?.userId
                        : roomData?.playerOne?.userId,
                message: "You won by timeout!",
                symbol:
                    roomData?.playerOne?.userId === lostUserId
                        ? roomData?.playerTwo?.symbol
                        : roomData?.playerOne?.symbol,
            });
            return res.status(200).json(
                new apiResponse(
                    200,
                    {
                        playerLost: {
                            success: false,
                            id: lostUserId,
                            message: "You lost by timeout!",
                            symbol:
                                roomData?.playerOne?.userId === lostUserId
                                    ? roomData?.playerOne?.symbol
                                    : roomData?.playerTwo?.symbol,
                        },
                    },
                    "Success"
                )
            );
        }
    } catch (error) {
        return error;
    }
};

const healthCheck = (req, res) => {
    try {
        res.status(200).json(new apiResponse(200, {}, "Working...."));
    } catch (error) {
        res.status(500).json(new apiError(500, "Not Working...."));
    }
};

export {
    createRoom,
    joinRoom,
    playAgain,
    playerMoves,
    leaveRoomAndDeleteAllRoomInfo,
    playerTimeOut,
    healthCheck,
};
