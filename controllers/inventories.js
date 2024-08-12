import { Inventory } from "../models/inventory.js"

async function index(req, res) {
  try {
    const inventories = await Inventory.find({}).populate('owner')
    res.render('inventories/index', {
      inventories,
      title: 'Inventories'
    })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
}

async function create(req, res) {
  try {
    req.body.owner = req.session.user._id
    await Inventory.create(req.body)
    res.redirect('/inventories')
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
}

export {
  index,
  create,
}