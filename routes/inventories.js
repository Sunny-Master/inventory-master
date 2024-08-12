import { Router } from 'express'
import { isSignedIn } from '../middleware/is-signed-in.js'
import * as inventoriesCtrl from '../controllers/inventories.js'

const router = Router()

// public routes
router.get('/', inventoriesCtrl.index)
router.get('/:inventoryId', inventoriesCtrl.show)

// protected routes
router.get('/:inventoryId/items/new', isSignedIn, inventoriesCtrl.newItem)

router.post('/', isSignedIn, inventoriesCtrl.create)


export { router }