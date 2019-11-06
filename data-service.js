var fs = require("fs");

var employees = [];
var managers = [];
var departments = [];

module.exports.addEmployee = function(employeeData){
    return new Promise((resolve,reject)=>{

        if(employeeData.isManager != true){
            employeeData.isManager = false;
        }
        employeeData.employeeNum = employees.length + 1;
        employees.push(employeeData);
        resolve();
    })
    
}

module.exports.initialize = function() {

    return new Promise(function(resolve, reject) {
        // reads a file
        fs.readFile("./data/employees.json", function(err, data) {
            if (err)
            {
                console.log("reject init");
                reject("error in reading file employees.json");
            }
    
            else
            {
                employees = JSON.parse(data);
                console.log("good emp");
                fs.readFile("./data/departments.json", function(err,data2){

                    if(err){
                        console.log("reject dep init");
                        reject("error in reading file departments.json");
                    }
                    else
                    {
                        departments = JSON.parse(data2);
                        console.log("resolve init");
                        resolve();
                    }
                })
            }
        });
    });
    
}

module.exports.getManagers = function(){

    return new Promise((resolve, reject) => { 
            for(let i = 0; i < employees.length; i++){

                if(employees[i].isManager == true){
                    managers.push(employees[i]);
                }
        }
            if(managers.length <= 0){
                reject("No managers");
            }
            else{
                resolve(managers);
            }
        

    })

}

module.exports.getAllEmployees = function(){

    return new Promise((resolve, reject) => { 
    
            if(employees.length <= 0){
                reject("No employees");
            }
            else{
                resolve(employees);
            }
        

    })

}

module.exports.getDepartments = function(){

    return new Promise((resolve, reject) =>{

        
            //departments = JSON.parse(data);

            if(departments.length == 0){
                reject("No departments available");
            }
            else{
                resolve(departments);
            }
        
    })
}

module.exports.getEmployeesByStatus = function(status){

    var newEmployees=[];

    return new Promise((resolve,reject)=>{

        for(let i = 0; i < employees.length; i++){

            if(employees[i].status == status){
                newEmployees.push(employees[i]);
            }
        }
        if(newEmployees.length == 0){
            reject("No results found");
        }
        else{
            resolve(newEmployees);
        }
    })
}

module.exports.getEmployeesByDepartment = function(department){
    var newDepartments=[];

    return new Promise((resolve,reject)=>{

        for(let i = 0; i < employees.length; i++){

            if(employees[i].department == department){
                newDepartments.push(employees[i])
            }
        }
        if(newDepartments.length == 0){
            reject("No results found");
        }
        else{
            resolve(newDepartments);
        }
    })
}

module.exports.getEmployeesByManager = function(manager){
    var newManager = [];

    return new Promise((resolve,reject)=>{

        for(let i = 0; i < employees.length; i++){

            if(employees[i].employeeManagerNum == manager){
                newManager.push(employees[i]);
            }
        }
        if(newManager.length == 0){
            reject("No results found");
        }
        else{
            resolve(newManager);
        }
    })
}
               
module.exports.getEmployeeByNum = function(num){
    

    return new Promise((resolve,reject)=>{
        let empFound;
        for(let i = 0; i < employees.length; i++){

            if(employees[i].employeeNum == num){

                empFound = employees[i];
                break;
            }
        }
        if(!empFound){
            reject("No results found")
        }
        else{
            resolve(empFound);
        }
    })
}

module.exports.updateEmployee = (employeeData)=>{

    return new Promise((resolve, reject)=>{

        for(let i = 0; i < employees.length; i++){
            if(employees[i].employeeNum == employeeData.employeeNum){
                employees[i] = employeeData;
                resolve();
                break;
            }
        }
    })
}

