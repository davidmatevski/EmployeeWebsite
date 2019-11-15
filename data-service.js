const Sequelize = require('sequelize');

var sequelize = new Sequelize('dbctbmt91b9iq6', 'tsgtjcdgftogen', '9dc1ed1265a1a1ee39bc26cd9f91de65ca94b5fae82db7f7224ac0193da3c435', {
    host: 'ec2-54-243-44-102.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: true
    }
   });

   var Employee = sequelize.define('Employee', {

    employeeNum: 
    {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING

});

var Department = sequelize.define('Department', {

    departmentId: 
    {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    departmentName: Sequelize.STRING

});

Department.hasMany(Employee, {foreignKey: 'department'});


module.exports.addEmployee = function(employeeData){
    return new Promise((resolve, reject)=>{
        console.log(employeeData);
        employeeData.isManager = (employeeData.isManager) ? true : false;
        console.log(employeeData);
        console.log("1.......")
        for(prop in employeeData){
            console.log(employeeData.employeeManagerNum)
            if(employeeData[prop] == ""){
                employeeData[prop] = null;
            }
        }
        console.log(employeeData);
        console.log("2.......")
        Employee.create(employeeData)
        .then((employeeData)=>{
            console.log("employee successfully created" + employeeData);
            resolve();
        })
        .catch((employeeData)=>{
            console.log("Error created employee" + employeeData);
            reject();
        })
    });
    
}

module.exports.initialize = function() {

    return new Promise(function (resolve, reject) {
        
        sequelize.sync().then(()=>{
            resolve("Initialize Success!");
        }).catch(()=>{
            reject("Unable to Sync the Database");
        })
            
    });
    
}

module.exports.getManagers = function(){

    return new Promise(function (resolve, reject) {
        reject();
       });
}

module.exports.getAllEmployees = function(){

    return new Promise(function (resolve, reject) {

         

        Employee.findAll()
        .then((emp)=>{
            resolve(emp);
        })
        .catch(()=>{
            reject("FUNCTION: getAllEmployees() -> No Results Returned");
        })

    });

}

module.exports.getDepartments = function(){
let dep = [];
    return new Promise(function (resolve, reject) {
        Department.findAll()
        .then((dep)=>{
            resolve(dep);
        })
        .catch(()=>{
            reject("No departments found");
        })

       });
}

module.exports.getEmployeesByStatus = function(status){

    return new Promise(function (resolve, reject) {

        Employee.findAll({
            where: {
                status: status,
            }
        })
        .then((emp)=>{
            resolve(emp);
        })
        .catch(()=>{
            reject("No Employees Found with Status: " + status);
        })
    });
}

module.exports.getEmployeesByDepartment = function(department){
    

    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where: {
                department: department,
            }
        }).then((emp)=>{
            resolve(emp);
        })
        .catch(()=>{
            reject("No Employees Found with departmentId");
        })
       });
}

module.exports.getEmployeesByManager = function(manager){

    return new Promise(function (resolve, reject) {
        
        Employee.findAll({
            where:{
                employeeManagerNum : manager,
            }
        })
        .then((emp)=>{
            resolve(emp);
        })
        .catch(()=>{
            reject("No Managers Found with Manager Number: " + manager);
        })
    });
}
               
module.exports.getEmployeeByNum = function(num){
    


    return new Promise(function (resolve, reject) {
        Employee.findAll({
            where:{ employeeNum: num}
        }).then((emp)=>{
            resolve(emp[0]);
        })
        .catch((emp)=>{
            reject("No Employee found with employeeNum: " + emp);
        })
       });
}

module.exports.updateEmployee = (employeeData)=>{

    return new Promise(function (resolve, reject) {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        
        for(prop in employeeData){

            if(employeeData[prop] == ""){
                employeeData[prop] = null;
            }
        }
        console.log("1...............");
        Employee.update(employeeData,{
            where:{employeeNum : employeeData.employeeNum}
        }).then(()=>{
            console.log("employee update successful!");
            resolve();
        }).catch(()=>{
            console.log("error updating employee");
            reject();
        })
       });
}

module.exports.addDepartment = function(departmentData){

    return new Promise((resolve, reject)=>{

        for(prop in departmentData){

            if(departmentData.prop == ""){
                departmentData.prop = null;
            }
        }

        Department.create(departmentData)
        .then(()=>{
            console.log("department creation successful");
            resolve();
        }).catch(()=>{
            console.log("failed to create department");
            reject();
        });
    });
}

module.exports.updateDepartment = function(departmentData){

    return new Promise((resolve, reject)=>{

        for(prop in departmentData){

            if(departmentData.prop == ""){
                departmentData.prop = null;
            }
        }
        Department.update({departmentData, where:{departmentId : departmentData.departmentId}})
        .then(()=>{
            console.log("Sucessfully updated department");
            resolve();
        })
        .catch(()=>{
            console.log("Error in updating department");
            reject();
        })
    })
    
}

module.exports.getDepartmentById=function(id){
    return new Promise((resolve, reject)=>{
        Department.findAll({where:{departmentId : id}})
        .then((dep)=>{
            resolve(dep[0]);
        }).catch(()=>{
            reject();
        })
    })
}
module.exports.deleteDepartmentById= function(id){
    return new Promise((resolve, reject)=>{
        Department.destroy({where: {departmentId : id}})
        .then(()=>{
            console.log("department deleted");
            console.log("wooohoo");
            resolve();
        }).catch(()=>{
            reject();
        })
    })
}

module.exports.deleteEmployeeByNum = function(empNum){
    return new Promise((resolve, reject)=>{
        Employee.destroy({where:{employeeNum : empNum}})
        .then(()=>{
            resolve();
        }).catch(()=>{
            reject();
        })
    })
}

