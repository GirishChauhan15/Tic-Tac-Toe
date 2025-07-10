import { Router } from "express";
import { createRoom, healthCheck, joinRoom, leaveRoomAndDeleteAllRoomInfo, playAgain, playerMoves, playerTimeOut } from "../controllers/game.controller.js";

let router = Router()

router.route('/createRoom').post(createRoom)

router.route('/playAgain').patch(playAgain)
router.route('/joinRoom').patch(joinRoom)
router.route('/playerMoves').patch(playerMoves)

router.route('/leaveRoom').delete(leaveRoomAndDeleteAllRoomInfo)
router.route('/playerTimeout').delete(playerTimeOut)

router.route('/health').get(healthCheck)

export default router