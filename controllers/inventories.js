import { Inventory } from "../models/inventory.js"
import { User } from "../models/user.js"

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
    const inventory = await Inventory.create(req.body)
    await User.findByIdAndUpdate(req.body.owner, { 'ownedInventories': inventory }, {new: true})
    res.redirect(`/inventories/${inventory._id}/items/new`)
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
}

async function show(req, res) {
  try {
    const inventory = await Inventory.findById(req.params.inventoryId)
    .populate(['owner', 'managers', 'items'])
    const sortInventory = !!req.query['sort']
    res.render('inventories/show', {
      inventory,
      title: 'Inventory Details',
      sortInventory
    })
  } catch (error) {
    console.log(error)
    res.redirect('/inventories')
  }
}

async function newItem(req, res) {
  try {
    // find inventory by id
    const inventory = await Inventory.findById(req.params.inventoryId)
    .populate(['owner', 'items'])
    // pass the inventory as 'locals' object to 'inventories/newItem.ejs'
    res.render('inventories/newItem', {
      inventory,
      title: 'Add Item'
    })
  } catch (error) {
    console.log(error)
    res.redirect('/inventories')
  }
}

async function addItem(req, res) {
  const inventory = await Inventory.findById(req.params.inventoryId)
  try {
    if (inventory.owner.equals(req.session.user._id)) {
      inventory.items.push(req.body) 
      await inventory.save()
      res.redirect(`/inventories/${inventory._id}`)
    } else {
      throw new Error(`🚫 Not authorized 🚫`)
    }
  } catch (error) {
    console.log(error)
    res.redirect(`/inventories/${inventory._id}`)
  }
}

export {
  index,
  create,
  show,
  newItem,
  addItem,
}