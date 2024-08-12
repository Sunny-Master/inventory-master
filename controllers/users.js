import { User } from "../models/user.js"

async function index(req, res) {
  try {
    const users = await User.find({})
    res.render('users/index', {
      users,
      title: 'All Users',
    })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
}

async function show(req, res) {
  try {
    const selectedUser = await User.findById(req.params.userId)
    .populate(['ownedInventories', 'managedInventories'])
    console.log(selectedUser.ownedInventories)
    res.render('users/show', {
      selectedUser,
      title: "My Inventories"
    })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
}

export {
  index,
  show
}