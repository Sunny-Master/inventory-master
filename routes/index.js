import { Router } from 'express'

const router = Router()

// GET localhost:3000/
router.get('/', function(req, res) {
  res.render('index', {
    title: 'Inventory Master',
    status: "Welcome to Inventory Master! Sign up or Sign in to use this app or just explore as a guest! "
  })
})

export { router }
