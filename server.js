/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: David Matevski Student ID: 117712182 Date: September 25, 2019
*
* Online (Heroku) Link: https://rocky-river-66381.herokuapp.com/
*
********************************************************************************/ 

var express = require("express");
var path = require("path");
const multer = require("multer");
var app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const exhbs = require("express-handlebars");

app.engine('.hbs', exhbs({ extname: '.hbs', defaultLayout: 'main', helpers: {

    equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
        return options.inverse(this);
        } else {
        return options.fn(this);
        }
       },
    
    navLink: function(url, options){
        return '<li' +
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
       }

} }));
app.set('view engine', '.hbs');



var dataService = require("./data-service");

const HTTP_PORT = process.env.PORT || 8080;



app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
   });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.post("/employees/add", (req,res)=>{
    dataService.addEmployee(req.body).then(()=>{
        res.redirect("/employees");
    }).catch((err)=>{
        console.log(err);
    })
        
});

const storage = multer.diskStorage({

    destination: __dirname + "/public/images/uploaded",

    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
        }
})
const upload = multer({ storage: storage });

app.get("/images", (req,res)=>{

    fs.readdir(path.join(__dirname , "public", "images", "uploaded"),(err,data)=>{
        if(err){
            console.log("error")
        }
        else{
        res.render("images", {images:data});
        }
    })
})

app.post("/images/add",upload.single("imageFile"),(req,res)=>{
    
        res.redirect("/images");
});

app.get("/images/add", (req,res)=>{
    res.render("addImage");
})

app.get('/', function(req,res){
    //res.send("Home");
    res.render("home");
});

app.get("/about", function(req,res){
    //res.send("About");
    res.render("about");
});

app.get("/managers", function(req,res){

    dataService.getManagers()
    .then(function(employees){
        res.json(employees);
    })
    .catch(function(ErrMsg){
        res.json(ErrMsg);
    });

})

app.get("/employees",(req,res)=>{
    if(req.query.status){
        dataService.getEmployeesByStatus(req.query.status)
        .then((data)=>{
            res.render("employees",{employees: data})
        })
        .catch((err)=>{
            res.render("employees", {message: err});
        })
    }
    else if(req.query.department){
        dataService.getEmployeesByDepartment(req.query.department)
        .then((data)=>{
            res.render("employees", {employees:data})
        })
        .catch((err)=>{
            res.render("employees", {message: err})
        })
    }
    else if(req.query.manager){
        dataService.getEmployeesByManager(req.query.manager)
        .then((data)=>{
            res.render("employees", {employees:data})
        })
        .catch((err)=>{
            res.render("employees", {message: err})
        })
    }
    else{
        dataService.getAllEmployees()
        .then((data)=>{
            res.render("employees", {employees:data})
    })
        .catch((msg)=>{
            res.render("employees", {message: msg})
        })
    }
    
})

app.get("/employee/:value",(req,res)=>{

    dataService.getEmployeeByNum(req.params.value)
    .then((data)=>{
        console.log(data);
        res.render("employee", { employee: data });
    })
    .catch((err)=>{
        res.render("employee",{message: err});
        console.log(err);
    })
})

app.get("/departments", (req,res)=>{
    dataService.getDepartments()
    .then((data)=>{
        res.render("departments", {departments: data});
    })
    .catch((msg)=>{
        res.json(msg);
    })
})

app.get("/employees/add", (req,res)=>{
    res.render("addEmployee");
})

app.post("/employee/update", (req, res) => {
    console.log(req.body);
    dataService.updateEmployee(req.body).then(()=>{res.redirect("/employees")})
    
   });


app.use((req, res) =>{
    res.status(404);
    res.send("WHOOPS!");
})

//msgService.setMessage("Hello from server.js");
dataService.initialize().then(()=>{

    app.listen(HTTP_PORT, function(){
    
        console.log("Server listening on " + HTTP_PORT);
    
    });
})
.catch((msg) =>{
    console.log(msg);
})




