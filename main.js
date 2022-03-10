//imports

require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 4000;

//Database Connection

mongoose.connect(process.env.DB_URI , {useNewURLParser : true,useUnifiedTopology : true});
const db = mongoose.connection;

db.on('error' , (err) => console.log(err));
db.once('open' , () => console.log('Database Connected!'));


//Middlewares

app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(
    session({
        secret : "my secret key",
        saveUninitialized : true,
        resave : false
    })
);

app.use((req,res,next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

//Make uploads folder as static

app.use(express.static("uploads"));

//Set Template Engine

app.set("view engine","ejs");

//Route Prefix
app.use("",require("./routes/routes"));

// app.get('/',(req,res) => {
//     res.send('Hello World!');
// });

app.listen(PORT,() =>{
    console.log(`Server started at http://localhost:${PORT}`);
})