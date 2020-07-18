const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { static } = require("express");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/listMan", {useNewUrlParser:true, useUnifiedTopology: true, useCreateIndex: true});


const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    list: [String]
});

const User = mongoose.model("User", userSchema);


app.get("/", function(req, res){
    res.render("signIn");
});
// app.post("/signin", function(req, res){
//     console.log(req.body.email);
// });

app.get("/signup", function(req, res){
    res.render("signUp");
});

app.get("/home", function(req, res){
    User.findOne({name: req.query.valid}, function(err, foundUser){
        if(err){
            console.log(err);
        } else {
            res.render("home", {userName: foundUser.name, listItems: foundUser.list});
        }
    });
    // console.log(req.query.valid);
});

app.post("/signin", function(req, res){
    const useremail = req.body.email;
    User.findOne({email: useremail}, function(err, foundUser){
        if(err){
            console.log(err);
            res.redirect("/");
        } else if(foundUser.password === req.body.password) {
            res.redirect("/home?valid=" + foundUser.name);
        } else {
            res.redirect("/");
        }
    });
});


app.post("/signup", function(req, res){
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });
    User.insertMany(user, function(err){
        if(err){
            console.log(err);
            res.redirect("/signup");
        } else {
            res.redirect("/home?valid=" + req.body.name);
        }
    });
});

app.post("/submit", function(req, res){
    User.findOne({name: req.body.userName}, function(err, founduser){
        if(err){
            console.log(err);
            res.redirect("/home");
        } else {
            founduser.list.push(req.body.newItem);
            founduser.save();
            res.redirect("/home?valid=" + founduser.name);
        }
    });
});

app.post("/delete", function(req, res){
    const user = req.body.userName;
    // const id = req.body.checkbox;
    // User.findOne({name: user}, function(err, foundUser){
    //     if(err){
    //         console.log(err);
    //         res.redirect("/home?valid=" + user);
    //     } else {
    //         foundUser.deleteOne({$indexOfArray:[id]}, function(err){
    //             if(err){
    //                 console.log(err);
    //             }
    //         });
    //         console.log(foundUser.list[id]);
    //     }
    // });
    res.redirect("/home?valid=" + user);
});




app.listen("3000", function(){
    console.log("Server started at port 3000");
});