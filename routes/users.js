import { Router } from 'express'
import { isSignedIn } from '../middleware/is-signed-in.js'
import * as usersCtrl from '../controllers/users.js'

const router = Router()

// public routes


// protected routes
router.get('/:userId', isSignedIn, usersCtrl.show)
router.get('/:userId/shoppingList', isSignedIn, usersCtrl.showShoppingList)
router.get('/:userId/shoppingList/items/:itemId', isSignedIn, usersCtrl.showShoppingListItem)

export { router }
