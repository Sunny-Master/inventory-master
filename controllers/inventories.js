import { Inventory } from "../models/inventory.js"

async function index(req, res) {
  try {
    const inventories = await Inventory.find({})
    res.render('inventories/index', {
      inventories,
      title: 'Inventories'
    })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
}

export {
  index,
}