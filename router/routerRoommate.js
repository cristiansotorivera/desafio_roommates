import { Router } from 'express'
import { controllerRoommate } from '../controllers/controllerRoommate.js'

const router = Router()

router.get('/roommates', controllerRoommate.getRoommates)

router.post('/roommate', controllerRoommate.postRoommate)


export default router