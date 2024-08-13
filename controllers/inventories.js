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
    const creator = await User.findById(req.body.owner)
    creator.ownedInventories.push(inventory)
    await creator.save()
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
    // make a deep copy of inventory.managers in order to make a single array of all the users of inventory by pushing the inventory.owner to that deepcopy
    const inventoryUsers = JSON.parse(JSON.stringify(inventory.managers))
    inventoryUsers.push(inventory.owner)
    // retrieve and save all the users that are not in inventoryUsers array
    const otherUsers = await User.find({_id: {$nin: inventoryUsers}})
    const sortInventory = !!req.query['sort']
    res.render('inventories/show', {
      inventory,
      otherUsers,
      title: 'Inventory Details',
      sortInventory
    })
  } catch (error) {
    console.log(error)
    res.redirect('/inventories')
  }
}

async function deleteInventory(req, res) {
  try {
    // find inventory by id 
    const inventory = await Inventory.findById(req.params.inventoryId)
    if (inventory.owner.equals(req.session.user._id)) {
      const inventoryOwner = await User.findById(req.session.user._id)
      inventoryOwner.ownedInventories.remove(inventory)
      await inventoryOwner.save()
      await inventory.deleteOne()
      res.redirect(`/users/${req.session.user._id}`)
    } else {
      throw new Error('🚫 Not authorized 🚫')
    }
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
      title: `Add a ${inventory.name} Item`
    })
  } catch (error) {
    console.log(error)
    res.redirect('/inventories')
  }
}

async function addItem(req, res) {
  const inventory = await Inventory.findById(req.params.inventoryId)
  for (let key in req.body) {
    if(req.body[key] === "") delete req.body[key]
  }
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

async function editItem(req, res) {
  try {
    const inventory = await Inventory.findById(req.params.inventoryId)
    .populate('items')
    const item = inventory.items.id(req.params.itemId)
    console.log(item)
    if (inventory.managers.includes(req.session.user._id) || inventory.owner.equals(req.session.user._id)) {
      res.render('inventories/editItem', {
      inventory,
      item,
      title: `Edit ${inventory.name} Item` 
    })
    } else {
      throw new Error(`🚫 Not authorized 🚫`)
    }
  } catch (error) {
    console.log(error)
    res.redirect(`/inventories/${req.params.inventoryId}`)
  }
}

async function updateItem(req, res) {
  const inventory = await Inventory.findById(req.params.inventoryId)
  const item = inventory.items.id(req.params.itemId)
  for (let key in req.body) {
    if(req.body[key] === "") delete req.body[key]
  }
  try {
    if (inventory.managers.includes(req.session.user._id) || inventory.owner.equals(req.session.user._id)) {
      item.set(req.body) 
      await inventory.save()
      res.redirect(`/inventories/${inventory._id}`)
    } else {
      throw new Error(`🚫 Not authorized 🚫`)
    }
  } catch (error) {
    console.log(error)
    res.redirect(`/inventories/${req.params.inventoryId}`)
  }
}

async function deleteItem(req, res) {
  try {
    const inventory = await Inventory.findById(req.params.inventoryId)
    if (inventory.owner.equals(req.session.user._id)) {
      inventory.items.remove({_id: req.params.itemId})
      await inventory.save()
      res.redirect(`/inventories/${inventory._id}`)
    } else {
      throw new Error(`🚫 Not authorized 🚫`)
    }
  } catch (error) {
    console.log(error)
    res.redirect(`/inventories/${req.params.inventoryId}`)
  }
}

async function addManager(req, res) {
  // find inventory by id
  const inventory = await Inventory.findById(req.params.inventoryId)
  try {
    if (inventory.owner.equals(req.session.user._id)) {
      // find user by req.body.managerId
      const manager = await User.findById(req.body.managerId)
      // add manager to inventory.managers
      inventory.managers.push(manager) 
      await inventory.save()
      // add inventory to manager.managedInventories
      manager.managedInventories.push(inventory)
      await manager.save()
      res.redirect(`/inventories/${inventory._id}`)
    } else {
      throw new Error(`🚫 Not authorized 🚫`)
    }
  } catch (error) {
    console.log(error)
    res.redirect(`/inventories/${inventory._id}`)
  }
}

async function removeManager(req, res) {
  try {
    const inventory = await Inventory.findById(req.params.inventoryId)
    if (inventory.owner.equals(req.session.user._id)) {
      const inventoryManager = await User.findById(req.params.managerId)
      inventoryManager.managedInventories.remove(inventory)
      await inventoryManager.save()
      inventory.managers.remove(inventoryManager)
      await inventory.save()
      res.redirect(`/inventories/${inventory._id}`)
    } else {
      throw new Error('🚫 Not authorized 🚫')
    }
  } catch (error) {
    console.log(error)
    res.redirect('/inventories')
  }
}


export {
  index,
  create,
  show,
  deleteInventory as delete,
  newItem,
  addItem,
  editItem,
  updateItem,
  deleteItem,
  addManager,
  removeManager,
}