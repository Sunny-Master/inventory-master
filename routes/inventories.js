import { Router } from 'express'
import { isSignedIn } from '../middleware/is-signed-in.js'
import * as inventoriesCtrl from '../controllers/inventories.js'

const router = Router()

// public routes

// GET /inventories... 
router.get('/', inventoriesCtrl.index)
router.get('/:inventoryId', inventoriesCtrl.show)

// protected routes

//GET /inventories...
router.get('/:inventoryId/items/new', isSignedIn, inventoriesCtrl.newItem)

//POST /inventories...
router.post('/', isSignedIn, inventoriesCtrl.create)
router.post('/:inventoryId/items', isSignedIn, inventoriesCtrl.addItem)
router.post('/:inventoryId/managers', isSignedIn, inventoriesCtrl.addManager)

//DELETE /inventories...
router.delete('/:inventoryId', isSignedIn, inventoriesCtrl.delete)


export { router }