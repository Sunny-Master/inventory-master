import { Router } from 'express'
import { isSignedIn } from '../middleware/is-signed-in.js'
import * as usersCtrl from '../controllers/users.js'

const router = Router()

// public routes


// protected routes
// router.get('/', isSignedIn, usersCtrl.index)
router.get('/:userId', isSignedIn, usersCtrl.show)

export { router }
