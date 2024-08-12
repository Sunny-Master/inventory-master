import { Router } from 'express'
import { isSignedIn } from '../middleware/is-signed-in.js'
import * as inventoriesCtrl from '../controllers/inventories.js'

const router = Router()

// public routes
router.get('/', inventoriesCtrl.index)

// protected routes

export { router }