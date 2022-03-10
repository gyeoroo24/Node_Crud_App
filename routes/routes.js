const express = require("express");
const router = express.Router();
const multer = require('multer');   //Used for image
const User = require('../models/users');
const fs = require('fs');
//Image Upload
var storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null,'./uploads');   //cb is a Callback expecting 2 arguments : error and location
    },
    filename : function(req,file,cb){
        cb(null, file.filename + "_" + Date.now() + "_" + file.originalname);
    }
})

//Middleware

var upload = multer({
    storage : storage
}).single("image"); //this image here should have same name as name=image in add_users.ejs

//Insert a User into Database

router.post("/add" , upload , (req,res)=>{
    const user = new User({
        name : req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image : req.file.filename   //this file is from add_users.ejs and filename as defined/declared above
    });

    user.save((err) => {
        if(err)
        {
            res.json({message : err.message ,type : 'danger'});
        }
        else{
            req.session.message = {
                type : 'success',
                message : 'User added successfully!'
            };
            res.redirect('/');
        }
    })
})

//Get all users at home page route

router.get('/', (req,res) => {
    User.find().exec((err,users) => {
        if(err){
            res.json({message : err.message});
        }
        else{
            res.render('index', 
            { 
                title : 'Home Page',
                users : users
            })
        }
    })
});

router.get('/add', (req,res) => {
    res.render('add_users', { title : 'Add Users'})
});

//Edit a user

router.get('/edit/:id' , (req,res) => {
    let id = req.params.id;
    User.findById(id , (err,user) => {
        if(err)
        {
            res.redirect('/');
        }
        else{
            if(user === null)
            {
                res.redirect('/');
            }
            else{
                res.render('edit_users' , {
                    title : 'Edit User',
                    user : user //pass to frontend as user
                })
            }
        }
    })
});

//Update User Route

router.post('/update/:id' , upload , (req,res) => {
    let id = req.params.id;
    let new_image = '';

    if(req.file)    //If there is an image
    {
        new_image = req.file.filename;

        try{
            fs.unlinkSync('./uploads/'+req.body.old_image); //receiving old_image from hidden input in edit_users.ejs file
        }
        catch(err){
            console.log(err);
        }
    }
    else{
        new_image = req.body.old_image;
    }

    User.findByIdAndUpdate(id , {
        name : req.body.name,
        email : req.body.email,
        phone : req.body.phone,
        image : new_image
    } , (err,result) => {
        if(err){
            res.json({message : err.message, type : 'danger'});
        }
        else{
            req.session.message = {
                type : 'success',
                message : 'User updated successfully!'
            };

            res.redirect('/');
        }
    })
});

//Delete User route

router.get('/delete/:id' , (req,res) => {
    let id = req.params.id;

    User.findByIdAndRemove(id , (err,result) => {
        if(result.image != '')
        {
            try{
                fs.unlinkSync('./uploads/'+result.image);
            }
            catch(err){
                console.log(err);
            }
        }

        if(err){
            res.json({message : err.message});
        }
        else{
            req.session.message = {
                type: 'info',
                message : 'User deleted successfully!'
            };
            res.redirect('/');
        }
    })
})

module.exports = router;