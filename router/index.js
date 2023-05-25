const router = require('express').Router();
const users = require('../model/allUser');
const customers = require('../model/allUser');
const historyModel = require('../model/histoyModel');
const bcrypt = require('bcrypt');


router.get('/', (req,res)=> {
    res.render('home')
});

router.get('/login', (req,res)=> {
    res.render('login', { title: 'Log in', msg: '' });
  });


// Login
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await users.findOne({ email }).exec();
  
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.render('login', { title: 'Log in', msg: 'Invalid email or password' });
      }
  
      // Set user information in session or generate token for authentication
      // Example: req.session.user = user;
  
      res.render('home', { title: 'Home', user });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });

// Logout
router.get('/logout', (req, res) => {
    // Clear session or token to log out the user
    // Example: req.session.user = null;
  
    res.render('logout', { title: 'Log in', msg: 'Logged out successfully' });
  });


//  ADD USER
router.get('/adduser', (req, res) => {
    res.render('addUser', {title: "Add User", msg:''})
});

router.post('/adduser',(req, res) =>{
    
    const {userName, userEmail, userPassword, userNumber, userAmount} = req.body;
    const User = new customers({
        name: userName,
        email: userEmail,
        password: userPassword,
        contact: userNumber,
        amount: userAmount,
    });
    User.save().then(()=>{
        res.render('addUser', {title: "Add User", msg:'User Added Successfully'})
    }).catch((err)=>{
        console.log(err)
    })
})


// View All User
router.get('/data', async (req, res) => {
  try {
    const allData = await customers.find({}).exec();
    res.render('viewUser', { title: 'View Users', data: allData });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  }
});

// Delete User
router.get('/delete/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await customers.findByIdAndDelete({ "_id": id }).exec();
      res.redirect('/data');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  
  // View User
  router.get("/view/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const senderData = await customers.find({ "_id": id }).exec();
      const allUsers = await customers.find({}).exec();
      res.render('view', { title: 'view', data: senderData, records: allUsers });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  
  // Transfer
  router.post('/transfer', async (req, res) => {
    try {
      const { SenderID, SenderName, SenderEmail, reciverName, reciverEmail, transferAmount } = req.body;
      console.log(transferAmount);
  
      if (reciverName === 'Select Reciver Name' || reciverEmail === 'Select Reciver Email') {
        return res.render('sucess', { title: "sucess", value: "", msg: "", errmsg: "All fields are required!" });
      }
  
      const senderData = await customers.find({ "_id": SenderID }).exec();
      const reciverData = await customers.find({ "name": reciverName, "email": reciverEmail }).exec();
  
      if (!senderData || !reciverData || senderData[0].amount < transferAmount) {
        return res.render('sucess', { title: "sucess", value: "", msg: "", errmsg: "Process Not Complete due to incorrect receiver details!" });
      }
  
      const updateAmountSender = parseInt(senderData[0].amount) - parseInt(transferAmount);
      await customers.findOneAndUpdate({ "name": SenderName }, { "$set": { "amount": updateAmountSender } }).exec();
  
      const updateAmountReciver = parseInt(reciverData[0].amount) + parseInt(transferAmount);
      await customers.findOneAndUpdate({ "name": reciverName }, { "$set": { "amount": updateAmountReciver } }).exec();
  
      const history = new historyModel({
        sName: SenderName,
        sEmail: SenderEmail,
        rName: reciverName,
        rEmail: reciverEmail,
        amount: transferAmount
      });
  
      await history.save();
  
      res.render('sucess', { title: "sucess", value: "True", msg: "Transfer Successful" });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  
  // History
  router.get('/history', async (req, res) => {
    try {
      const historyData = await historyModel.find({}).exec();
      res.render('history', { title: 'History', data: historyData });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  
  // Remove Transaction
  router.get('/remove/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await historyModel.findByIdAndDelete({ "_id": id }).exec();
      res.redirect('/history');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });
  

module.exports = router;