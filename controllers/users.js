import { User } from "../models/user.js"

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
    .populate('shoppingList.inventories')
    const listInventories = owner.shoppingList.inventories
    if (owner.equals(req.session.user._id)) {
      let listItems = []
      listInventories.forEach(inventory => {
        inventory.items.forEach(item => {
          if (item.quantity <= item.threshold) listItems.push(item) 
        })
      })
      res.render('users/showShoppingList', {
        listItems,
        title: `${owner.username}'s Shopping List`
      })
    } else {
      throw new Error(`🚫 Not authorized 🚫`)
    }
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
}

export {
  show,
  showShoppingList,
}