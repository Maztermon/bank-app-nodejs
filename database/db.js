const mongoose = require('mongoose');

const conn = ()=>{
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.DB_URL).then(()=> {
        console.log("DATABASE CONNECTED");
    }).catch((err) =>{
        console.log(err)
    })
}

module.exports =conn;
