/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: David Matevski Student ID: 117712182 Date: September 25, 2019
*
* Online (Heroku) Link: https://fathomless-journey-34215.herokuapp.com/
*
********************************************************************************/ 

var express = require("express");
var path = require("path");
const multer = require("multer");
var app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const exhbs = require("express-handlebars");
const dataServiceAuth = require("./data-service-auth");
const clientSessions = require("client-sessions")


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

app.use(clientSessions({
    cookieName: "session", 
    secret: "week10example_web322", 
    duration: 2 * 60 * 1000, 
    activeDuration: 1000 * 60 
  }));

  app.use(function(req, res, next){
      res.locals.session = req.session;next();
    });

function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
      next();
    }
}




const storage = multer.diskStorage({

    destination: __dirname + "/public/images/uploaded",

    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
        }
})
const upload = multer({ storage: storage });

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/register", (req,res)=>{
    res.render("register");
});

app.post("/register", (req,res)=>{
    dataServiceAuth.RegisterUser(req.body)
    .then(()=>{
        res.render({successMessage: "User created"})
    })
    .catch(()=>{
        res.render({errorMessage: err, userName: req.body.userName});
    });
});

app.post("/login", (req,res)=>{
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body)
    .catch((err)=>{
        res.render("login", {errorMessage: err, userName: req.body.userName});
    })
    .then((user) => {req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
    }
    res.redirect('/employees');})
});

app.get("/logout", (req,res)=>{
    req.session.reset();
    res.redirect("/");
});

app.get("/userHistory", ensureLogin ,(req,res)=>{
    res.render("userHistory");
});

app.post("/employees/add", ensureLogin ,(req,res)=>{
    dataService.addEmployee(req.body).then(()=>{
        res.redirect("/employees");
    }).catch((err)=>{
        res.status(500).send("unable to add employee");
    })
        
});

app.get("/images", ensureLogin ,(req,res)=>{

    fs.readdir(path.join(__dirname , "public", "images", "uploaded"),(err,data)=>{
        if(err){
            console.log("error")
        }
        else{
        res.render("images", {images:data});
        }
    })
})

app.post("/images/add",ensureLogin ,upload.single("imageFile"),(req,res)=>{
    
        res.redirect("/images");
});

app.get("/images/add", ensureLogin ,(req,res)=>{
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

app.get("/managers",ensureLogin , function(req,res){

    dataService.getManagers()
    .then(function(employees){
        res.json(employees);
    })
    .catch(function(ErrMsg){
        res.status(500).send(ErrMsg);
    });

})

app.get("/employees",ensureLogin ,(req,res)=>{
    if(req.query.status){
        dataService.getEmployeesByStatus(req.query.status)
        .then((data)=>{
            if(data.length > 0){
                res.render("employees",{employees: data});
            }
            else{
                res.render("employees",{ message: "no results" });
            }
        })
        .catch((err)=>{
            res.render("employees", {message: err});
        })
    }
    else if(req.query.department){
        dataService.getEmployeesByDepartment(req.query.department)
        .then((data)=>{
            if(data.length > 0){
                res.render("employees",{employees: data});
            }
            else{
                res.render("employees",{ message: "no results" });
            }
        })
        .catch((err)=>{
            res.render("employees", {message: err})
        })
    }
    else if(req.query.employeeManagerNum){
        dataService.getEmployeesByManager(req.query.employeeManagerNum)
        .then((data)=>{
            if(data.length > 0){
                res.render("employees",{employees: data});
            }
            else{
                res.render("employees",{ message: "no results" });
            }
        })
        .catch((err)=>{
            res.render("employees", {message: err})
        })
    }
    else{
        dataService.getAllEmployees()
        .then((data)=>{
            if(data.length > 0){
                res.render("employees",{employees: data});
            }
            else{
                res.render("employees",{ message: "no results" });
            }
    })
        .catch((msg)=>{
            res.render("employees", {message: msg})
        })
    }
    
})

app.get("/employee/:empNum", ensureLogin ,(req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    dataService.getEmployeeByNum(req.params.empNum).then((data) => {
    if (data) {
    viewData.employee = data; //store employee data in the "viewData" object as "employee"
    } else {
    viewData.employee = null; // set employee to null if none were returned
    }
    }).catch(() => {
    viewData.employee = null; // set employee to null if there was an error
    }).then(dataService.getDepartments)
    .then((data) => {
    viewData.departments = data; // store department data in the "viewData" object as "departments"
    // loop through viewData.departments and once we have found the departmentId that matches
    // the employee's "department" value, add a "selected" property to the matching
    // viewData.departments object
    for (let i = 0; i < viewData.departments.length; i++) {
    if (viewData.departments[i].departmentId == viewData.employee.department) {
    viewData.departments[i].selected = true;
    }
    }
    }).catch(() => {
    viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
    if (viewData.employee == null) { // if no employee - return an error
    res.status(404).send("Employee Not Found");
    } else {
    res.render("employee", { viewData: viewData }); // render the "employee" view
    }
    });
});

app.get("/departments", ensureLogin ,(req,res)=>{
    dataService.getDepartments()
    .then((data)=>{
        if(data.length > 0){
            res.render("departments", {departments: data});
        }
        else{
            res.render("departments", {message: "No departments found"});
        }
    })
    .catch((msg)=>{
        res.json(msg);
    })
})

app.get("/employees/add",ensureLogin , (req,res)=>{
    console.log("get employees")
    dataService.getDepartments()
    .then((data)=>{
        res.render("addEmployee", {departments: data});
    }).catch(()=>{
        res.render("addEmployee", {departments: []});
    })

});

app.post("/employee/update", ensureLogin ,(req, res) => {
    console.log(req.body);
    dataService.updateEmployee(req.body).then(()=>{res.redirect("/employees")})
    .catch(()=>{
        res.status(500).send("unable to update employee");
    })
    
});

app.get("/departments/add", ensureLogin ,(req,res)=>{
    res.render("addDepartment");
});

app.post("/departments/add", ensureLogin ,(req,res)=>{
    

    dataService.addDepartment(req.body)
    .then(()=>{
        res.redirect("/departments");
    }).catch((e)=>{
        console.log("error adding department: " + e);
    })
});

app.post("/department/update", ensureLogin ,(req,res)=>{
    dataService.updateDepartment(req.body)
    .then(()=>{
        res.redirect("/departments");
    }).catch(()=>{
        res.status(500).send("unable to update department :(");
    })
})

app.get("/department/:departmentId", ensureLogin ,(req,res)=>{
    dataService.getDepartmentById(req.params.departmentId)
    .then((data)=>{
        if(data){
            res.render("department",{department : data})
        }else{
            res.status(404).send("Department Not Found");
        }
    }).catch(()=>{
        res.status(404).send("Department Not Found");
    })
})

app.get("/departments/delete/:departmentId",ensureLogin , (req,res)=>{
    dataService.deleteDepartmentById(req.params.departmentId)
    .then(()=>{
        res.redirect("/departments");
    }).catch(()=>{
        res.status(500).send("Unable to Remove Department / Department not found");
    })
})

app.get("/employees/delete/:empNum", ensureLogin ,(req,res)=>{
    dataService.deleteEmployeeByNum(req.params.empNum)
    .then(()=>{
        res.redirect("/employees");
    }).catch(()=>{
        res.status(500).send("Unable to Remove Employee / Employee not found)");
    })
})


app.use((req, res) =>{
    res.status(404);
    res.send("WHOOPS!");
})

//msgService.setMessage("Hello from server.js");
/*dataService.initialize().then(()=>{

    app.listen(HTTP_PORT, function(){
    
        console.log("Server listening on " + HTTP_PORT);
    
    });
})
.catch((msg) =>{
    console.log(msg);
})*/

dataService.initialize().then(dataServiceAuth.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)});
    })
        .catch(function(err){
            console.log("unable to start server: " + err);
        });




