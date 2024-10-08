import { Inventory } from "../models/inventory.js"
import { User } from "../models/user.js"

async function index(req, res) {
  try {
    const inventories = await Inventory.find({}).populate('owner')
    const inventoriesToShow = inventories.filter(inventory => !inventory.privateView)
    res.render('inventories/index', {
      inventoriesToShow,
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
    req.body.privateView = true
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
    inventoryUsers.push(JSON.parse(JSON.stringify(inventory.owner)))
    const isAuthorizedUser = inventoryUsers.some(user => user?._id === req.session.user?._id)
    const isOwner = inventory.owner._id.equals(req.session.user?._id)
    // retrieve and save all the user objects that are not in inventoryUsers array
    const otherUsers = await User.find({_id: {$nin: inventoryUsers}})
    const sortInventory = !!req.query['sort']
    const alterView = inventory.privateView ? 'Public' : 'Private'
    res.render('inventories/show', {
      inventory,
      isAuthorizedUser,
      isOwner,
      otherUsers,
      title: 'Inventory Details',
      sortInventory,
      alterView
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
    .populate('managers')
    if (inventory.owner.equals(req.session.user._id)) {
      // to remove the reference of the inventory being deleted from managers, 
      // Model.updateMany(filter, update, options(optional)) : filter specifies condition(s) to find documents that needs to be updated, update defines updates to be applied to matched documents
      await User.updateMany(
        {_id: { $in: inventory.managers }},
        { $pull: { managedInventories: inventory._id }}
      )
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

async function toggleView(req, res) {
  try {
    const inventory = await Inventory.findById(req.params.inventoryId)
    inventory.privateView = !inventory.privateView
    await inventory.save()
    res.redirect(`/inventories/${req.params.inventoryId}`)
  } catch (error) {
    console.log(error)
    res.redirect('/inventories')
  }
}

async function newItem(req, res) {
  try {
    const inventory = await Inventory.findById(req.params.inventoryId)
    .populate(['owner', 'items'])
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
    if (inventory.managers.includes(req.session.user._id) || inventory.owner.equals(req.session.user._id)) {
      res.render('inventories/editItem', {
      inventory,
      item,
      title: `Edit ${inventory.name} Item`,
      origin: 'inventory' 
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
      inventory.items.pull({_id: req.params.itemId})
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

async function suggestionsIndex(req, res) {
  try {
    const inventory = await Inventory.findById(req.params.inventoryId)
    .populate(['items', 'suggestions.author'])
    const isOwner = inventory.owner.equals(req.session.user._id)
    const isManager = inventory.managers.includes(req.session.user._id)
    const isAuthorizedUser = isManager || isOwner
    if (isAuthorizedUser) {
      res.render('inventories/suggestions', {
      inventory,
      isManager,
      isOwner,
      isAuthorizedUser,
      title: `${inventory.name} Item Suggestions` 
    })
    } else {
      throw new Error(`🚫 Not authorized 🚫`)
    }
  } catch (error) {
    console.log(error)
    res.redirect(`/inventories/${req.params.inventoryId}`)
  }
}

async function newSuggestion(req, res) {
  try {
    const inventory = await Inventory.findById(req.params.inventoryId)
    const isManager = inventory.managers.includes(req.session.user._id)
    if (isManager) {
      res.render('inventories/newSuggestion', {
        inventory,
        isManager,
        title: `Add Suggestion for the ${inventory.name} Item` 
      })
    }
  } catch (error) {
    console.log(error)
    res.redirect(`/inventories/${req.params.inventoryId}`)
  }
}

async function addSuggestion(req, res) {
  const inventory = await Inventory.findById(req.params.inventoryId).populate('items')
  const isManager = inventory.managers.includes(req.session.user._id)
  req.body.author = req.session.user._id
  for (let key in req.body) {
    if(req.body[key] === "") delete req.body[key]
  }
  try {
    if (isManager) {
      if (req.body.type === 'Remove') {
        req.body.item = inventory.items.id(req.body.itemId)
      } 
      inventory.suggestions.push(req.body)
      await inventory.save()
      res.redirect(`/inventories/${inventory._id}/suggestions`)
    } else {
      throw new Error(`🚫 Not authorized 🚫`)
    }
  } catch (error) {
    console.log(error)
    res.redirect(`/inventories/${inventory._id}`)
  }
}

async function showSuggestion(req, res) {
  try {
    const inventory = await Inventory.findById(req.params.inventoryId)
    .populate(['items', 'suggestions.author'])
    const suggestion = inventory.suggestions.id(req.params.suggestionId)
    const isStatusUpdated = suggestion.status !== 'Pending'
    const isOwner = inventory.owner.equals(req.session.user._id)
    const isManager = inventory.managers.includes(req.session.user._id)
    const isAuthor = suggestion.author.equals(req.session.user._id)
    const isSuggestionEditable = isAuthor && !isStatusUpdated && suggestion.type === 'Add'
    if (isManager || isOwner) {
      res.render('inventories/showSuggestion', {
      inventory,
      suggestion,
      isSuggestionEditable,
      isOwner,
      isStatusUpdated,
      title: `${inventory.name} Item Suggestion` 
    })
    } else {
      throw new Error(`🚫 Not authorized 🚫`)
    }
  } catch (error) {
    console.log(error)
    res.redirect(`/inventories/${req.params.inventoryId}`)
  }
}

async function updateSuggestion(req, res) {
  const inventory = await Inventory.findById(req.params.inventoryId)
  const suggestion = inventory.suggestions.id(req.params.suggestionId)
  const isAuthor = suggestion.author.equals(req.session.user._id)
  for (let key in req.body) {
    if(req.body[key] === "") delete req.body[key]
  }
  try {
    if (isAuthor) {
      suggestion.set(req.body)
      await inventory.save()
      res.redirect(`/inventories/${inventory._id}/suggestions`)
    } else {
      throw new Error(`🚫 Not authorized 🚫`)
    }
  } catch (error) {
    console.log(error)
    res.redirect(`/inventories/${req.params.inventoryId}`)
  }
}

async function updateSuggestionStatus(req, res) {
  const inventory = await Inventory.findById(req.params.inventoryId)
  const suggestion = inventory.suggestions.id(req.params.suggestionId)
  const isOwner = inventory.owner.equals(req.session.user._id)
  try {
    if (isOwner) {
      suggestion.status = req.body.status
      if (suggestion.status === 'Approved') {
        suggestion.type === 'Add' ? inventory.items.push(suggestion.item) : inventory.items.remove({_id: suggestion.item._id})
        }
      await inventory.save()
      res.redirect(`/inventories/${inventory._id}/suggestions`)
    } else {
      throw new Error(`🚫 Not authorized 🚫`)
    }
  } catch (error) {
    console.log(error)
    res.redirect(`/inventories/${req.params.inventoryId}`)
  }
}

async function deleteSuggestion(req, res) {
  try {
    const inventory = await Inventory.findById(req.params.inventoryId)
    const suggestion = inventory.suggestions.id(req.params.suggestionId)
    const isOwner = inventory.owner.equals(req.session.user._id)
    const isAuthor = suggestion.author.equals(req.session.user._id)
    if (isAuthor || isOwner) {
      inventory.suggestions.remove({_id: req.params.suggestionId})
      await inventory.save()
      res.redirect(`/inventories/${inventory._id}/suggestions`)
    } else {
      throw new Error(`🚫 Not authorized 🚫`)
    }
  } catch (error) {
    console.log(error)
    res.redirect(`/inventories/${req.params.inventoryId}`)
  }
}

export {
  index,
  create,
  show,
  deleteInventory as delete,
  toggleView,
  newItem,
  addItem,
  editItem,
  updateItem,
  deleteItem,
  addManager,
  removeManager,
  suggestionsIndex,
  newSuggestion,
  addSuggestion,
  showSuggestion,
  updateSuggestion,
  updateSuggestionStatus,
  deleteSuggestion
}