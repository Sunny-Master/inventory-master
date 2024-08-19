import { User } from "../models/user.js"
import { Inventory } from "../models/inventory.js"

async function show(req, res) {
  try {
    const selectedUser = await User.findById(req.params.userId)
    .populate(['ownedInventories', 'managedInventories'])
    res.render('users/show', {
      selectedUser,
      title: "My Inventories"
    })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
}

async function showShoppingList(req, res) {
  try {
    const owner = await User.findById(req.params.userId)
    .populate('ownedInventories')
    const listInventories = owner.ownedInventories
    const sortItems = !!req.query['sort']
    if (owner.equals(req.session.user._id)) {
      let listItems = []
      listInventories.forEach(inventory => {
        inventory.items.forEach(item => {
          if (item.quantity <= item.threshold) listItems.push(item) 
        })
      })
      res.render('users/showShoppingList', {
        listInventories,
        listItems,
        sortItems,
        title: `${owner.username}'s Shopping List`
      })
    } else {
      throw new Error(`🚫 Not authorized 🚫`)
    }
  } catch (error) {
    console.log(error)
    res.redirect(`/users/${req.params.userId}`)
  }
}

async function showShoppingListItem(req, res) {
  try {
    const owner = await User.findById(req.params.userId)
    // to find an Inventory document that contains a specific item, identified by itemId
    const inventory = await Inventory.findOne({ "items._id": req.params.itemId })
    const item = inventory.items.id(req.params.itemId)
    if (owner.equals(req.session.user._id)) {
      res.render('inventories/editItem', {
      inventory,
      item,
      title: `Update Purchased ${inventory.name} Item`, 
      origin: 'shoppingList'
    })
    } else {
      throw new Error(`🚫 Not authorized 🚫`)
    }
  } catch (error) {
    console.log(error)
    res.redirect(`/users/${req.params.userId}`)
  }
}

export {
  show,
  showShoppingList,
  showShoppingListItem,
}