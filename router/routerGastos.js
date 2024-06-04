import { Router } from 'express'
import { controllerGastos } from '../controllers/controllerGastos.js'

const router = Router()

router.get('/gastos', controllerGastos.getGastos)

router.post('/gasto', controllerGastos.postGastos)

router.delete('/gasto', controllerGastos.removeGastos)

router.put('/gasto', controllerGastos.putGastos)


export default router