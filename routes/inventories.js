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
router.get('/:inventoryId/items/:itemId/edit', isSignedIn, inventoriesCtrl.editItem)
router.get('/:inventoryId/suggestions', isSignedIn, inventoriesCtrl.suggestionsIndex)
router.get('/:inventoryId/suggestions/new', isSignedIn, inventoriesCtrl.newSuggestion)
router.get('/:inventoryId/suggestions/:suggestionId', isSignedIn, inventoriesCtrl.showSuggestion)

//POST /inventories...
router.post('/', isSignedIn, inventoriesCtrl.create)
router.post('/:inventoryId/items', isSignedIn, inventoriesCtrl.addItem)
router.post('/:inventoryId/managers', isSignedIn, inventoriesCtrl.addManager)
router.post('/:inventoryId/suggestions', isSignedIn, inventoriesCtrl.addSuggestion)

//DELETE /inventories...
router.delete('/:inventoryId', isSignedIn, inventoriesCtrl.delete)
router.delete('/:inventoryId/managers/:managerId', isSignedIn, inventoriesCtrl.removeManager)
router.delete('/:inventoryId/items/:itemId', isSignedIn, inventoriesCtrl.deleteItem)

//PUT /inventories/:inventoryId/items/:itemId
router.put('/:inventoryId/items/:itemId', isSignedIn, inventoriesCtrl.updateItem)

//PATCH /inventories/:inventoryId
router.patch('/:inventoryId/toggle-view', isSignedIn, inventoriesCtrl.toggleView)

export { router }