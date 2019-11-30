const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userSchema = new Schema({
  "userName": {type: String, unique : true}, 
  "password": String,
  "email": String,
  "loginHistory": [{
    "dateTime" : Date,
    "userAgent" : String
  }],
});
let User;
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection("mongodb+srv://david_matevski:Lamborgini1!@cluster0-npmmy.mongodb.net/a6?retryWrites=true&w=majority");
    db.on('error', (err)=>{
    reject(err); // reject the promise with the provided error
    });
    db.once('open', ()=>{
    User = db.model("users", userSchema);
    resolve();
    });
    });
   };

   module.exports.registerUser = function (userData){
       return new Promise((resolve,reject)=>{

            if(userData.password != userData.password2)
            {
                reject("Passwords do not match!");
            }
            else
            {
                let newUser = new User(userData)
                newUser.save(()=>{
                    if(err)
                    {
                        if(err == 11000)
                        {
                            reject("User name already taken!");
                        }
                        else
                        {
                            reject("Unable to create user" + err);
                        }
                    }
                    else
                    {
                        resolve();
                    }
                });
            }
       })
    }

   module.exports.checkUser = function(userData){
       return new Promise((resolve, reject)=>{

        User.find({userName :userData.userName})
        .exec()
        .then((users)=>{
            if(users.size() < 1)
            {
                reject("Unable to find user: " + userData.userName);
            }
            else if(users[0].password != userData.password)
            {
                reject("Incorrect password for user: " + userData.userName);
            }
            else
            {
                users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                User.update({userName: users[0].userName},{$set : {loginHistory: users[0].loginHistory}})
                .exec()
                .then(()=>{
                    resolve(users[0]);
                })
                .catch(()=>{
                    reject("there was an error verifying the user: " + users[0]);
                });
            }
        })
        .catch(()=>{
            reject("unable to find user: " + userData);
        });
    })
}

