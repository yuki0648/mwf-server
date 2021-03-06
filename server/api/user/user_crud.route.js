var dateFormat = require('dateformat');
var Promise = require('bluebird');
var UserServ = require("./user.service");
var CompanyServ = require("../super_user/super_user.service");
var ProjectServ = require("../project/project.service");
var AttendServ = require("../attendance/attendance.service");

function getcountstring(result){//split the result string and get the maximum existing sid
  var result2 = JSON.stringify(result);
  var substring = result2.substring(result2.indexOf(':\"s')+3,result2.lastIndexOf('\"'));
  var number = parseInt(substring);
  number = getcount(number+1);
  return number;
}


function getcount(count){//make formatted sid
  if(count<10){
    var sid = 's'+'0000'+count;
  }else if(count<100){
    var sid = 's'+'000'+count;
  }else if(count<1000){
    var sid = 's'+'00'+count;
  }else if(count<10000){
    var sid = 's'+'0'+count;
  }else{
    var sid = 's'+count;
  }
  return sid;
}



app.post("/api/users/insert", function(req, res) {
  var user = req.body;
  if(user.role=='company_admin'){
    var email_query = {$or:[{email:user.email},{cid:user.cid,role:user.role}]};
  }else{
    var email_query = {email:user.email};
  }
  var company_query = {id:user.cid,department:{$elemMatch:{_id:{$in:[user.department]}}}};
  console.log(user);
  console.log('email query '+JSON.stringify(email_query));
  UserServ
  .findOne(email_query)//check if the email available
  .then(function(emailresult){
    console.log('email result '+emailresult);
    if(!emailresult){
            CompanyServ
            .findOne(company_query)//check if the cid and department existed
            .then(function(cidresult){
                console.log(cidresult);
              if(cidresult!=null){

                    UserServ
                    .sort()//find the maximum sid
                    .then(function(sresult){

                      if(sresult.length>0){//if there is any result
                        var sid = getcountstring(sresult);
                        console.log(sresult);
                      }else{
                        var sid = 's00001';
                      }
                        var ubirthday = dateFormat(new Date(user.birthday),"isoDate");
                        var edate = dateFormat(new Date(user.employment_date),"isoDate");
                        var iBeaconNo = 'i123';
                        var projectno = [];
                        var create = {cid:user.cid,sid:sid,email:user.email,password:user.password,
                        chiname:user.chiname,engname:user.engname,role:user.role,iBeaconNo:iBeaconNo,department:user.department,
                        worktype:user.worktype,gender:user.gender,contactno:user.contactno,birthday:ubirthday,employment_date:edate,projectno:projectno};
                        UserServ
                        .create(create)
                        .then(function(result){
                            res.status(201).send("New user added");
                        }).catch(function(err){//create_query
                            res.status(500).send('Error :'+err);
                        })
                    }).catch(function(err){//sort_query
                        res.status(500).send('Error :'+err);
                    })
              }else{
                res.status(500).send('Company or department does not existed');
              }
            }).catch(function(err){//company_query
                res.status(500).send('Error :'+err);
            })
    }
    else{
      res.send('Email Address Existed or Company already has an admin');
    }
  }).catch(function(err){//email_query
    res.status(500).send('Error: '+err);
  })
});


app.post("/api/users/query", function(req, res) {
  var user = req.body;
  var query = querymaker(user);
  UserServ
    .finds(query)
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
      res.status(500).send('Error :' + err);
    })
});

function querymaker(user){
  var query = {};
  var arr = ["cid","sid","role","iBeaconNo","gender","contactno","chiname","engname","email","worktype","department"];
  //date projectno department
  for(var i=0;i<arr.length;i++){
    if(user[arr[i]]!="" ){
      if(i<6){
        query[arr[i]] = user[arr[i]];
      }else{//after contactno
        query[arr[i]] = new RegExp(user[arr[i]],'i');
      }
    }
  }
  if(user.bstart_date != '' || user.bend_date != ''){//birthday range
    query.birthday = {};
    var bstart_date ;
    var bend_date ;
    if(user.bstart_date == ''){
      bstart_date = dateFormat(new Date("1900-01-01"), "isoDate");//start from 1900-01-01 date
      bend_date = dateFormat(new Date(user.bend_date),"isoDate");
    }else if(user.bend_date == ''){
      bstart_date = dateFormat(new Date(user.bstart_date),"isoDate");
      bend_date = dateFormat(new Date(), "isoDate");//get current date
    }else{
      bstart_date = dateFormat(new Date(user.bstart_date),"isoDate");//user entered two arguments
      bend_date = dateFormat(new Date(user.bend_date),"isoDate");
    }
    query.birthday = {$gte:bstart_date,$lte:bend_date};
  }
  if(user.estart_date != '' || user.eend_date != ''){//employment_date range
    query.employment_date = {};
    var estart_date ;
    var eend_date ;
    if(user.estart_date == ''){
      estart_date = dateFormat(new Date("1900-01-01"), "isoDate");//start from 1900-01-01 date
      eend_date = dateFormat(new Date(user.eend_date),"isoDate");
    }else if(user.eend_date == ''){
      estart_date = dateFormat(new Date(user.estart_date),"isoDate");
      eend_date = dateFormat(new Date(), "isoDate");//get current date
    }else{
      estart_date = dateFormat(new Date(user.estart_date),"isoDate");//user entered two arguments
      eend_date = dateFormat(new Date(user.eend_date),"isoDate");
    }
    query.employment_date = {$gte:estart_date,$lte:eend_date};
  }
  if(user.projectno[0] != ""){
    query.projectno = {$in:user.projectno};
  }
  console.log(query);
  return query;
}


app.get("/api/users/queryOne", function(req, res) {
  var user = req.query;
  var user_query = {sid:user.sid};
  UserServ
    .findOne(user_query)
    .then(function(result){
      if(result!=null){
        res.send(result);
      }else{
        res.status(500).send('No User Found');
      }
    })
    .catch(function(err){
      res.status(500).send('Error :' + err);
    })
});


app.get("/api/users/queryAll", function(req, res) {
  UserServ
    .find()
    .then(function(result){
        res.send(result);
    })
    .catch(function(err){
      res.status(500).send('Error :' + err);
    })
});


app.patch("/api/users/updates_department",function(req,res){
  var user = req.body;
  var user_query = {sid:{$in:user.sid}};
  var department_query = {department:user.department};
  console.log(user);
  UserServ
  .updates(user_query,department_query)//department update
  .then(function(uresult){
    res.send('Department of staff have been updated');
  }).catch(function(err){//department update
    res.status(500).send('Error : '+err);
  })
});



app.patch("/api/users/update_owner",function(req, res){
  var user = req.body;
  var user_query = {sid:user.sid};
  console.log(user);
  UserServ
  .findOne(user_query)//check if the sid exists
  .then(function(uresult){
    if(uresult!=null){
      var email_query = {email:user.email};
      UserServ
      .findOne(email_query)//check if the email exists
      .then(function(eresult){
        if(eresult==null){
          var update_query = {email:user.email,password:user.password};
          UserServ
          .update(user_query,update_query)//check if the email exists
          .then(function(eresult){
            res.send('User updated!');
          }).catch(function(err){//email findOne
            res.status(500).send('Error : '+err);
          })
        }else{
          res.status(500).send('Email Address is used!');
        }
      }).catch(function(err){//email findOne
        res.status(500).send('Error : '+err);
      })
    }else{
      res.status(500).send('Staff id does not exist!');
    }
  }).catch(function(err){//sid findOne
    res.status(500).send('Error : '+err);
  })
});


function updatemaker(user){
  var query = {};
  if(user.chiname!='' && user.chiname!=undefined){
      query.chiname = user.chiname;
  }
  if(user.engname!='' && user.engname!=undefined){
      query.engname = user.engname;
  }
  if(user.email!='' && user.email!=undefined){
      query.email = user.email;
  }
  if( user.password!=undefined){
      query.password = user.password;
  }
  if(user.role!='' && user.role!=undefined){
      query.role = user.role;
  }
  if(user.iBeaconNo!='' && user.iBeaconNo!=undefined){
      query.iBeaconNo = user.iBeaconNo;
  }
  if(user.gender!='' && user.gender!=undefined){
      query.gender = user.gender;
  }
  if(user.contactno!='' && user.contactno!=undefined){
      query.contactno = user.contactno;
  }
  if(user.worktype!='' && user.worktype!=undefined){
      query.worktype = user.worktype;
  }
  if(user.department!='' && user.department!=undefined){
      query.department = user.department;
  }
  if(user.birthday!='' && user.birthday!=undefined){
      var bday = dateFormat(new Date(user.birthday),"isoDate");
      query.birthday = bday;
  }
  if(user.employment_date!='' && user.employment_date!=undefined){
     var edate = dateFormat(new Date(user.employment_date),"isoDate");
     query.employment_date = edate;
  }
  return query;
}


app.patch("/api/users/update", function(req, res) {
  var user = req.body;
  var user_query = {sid:user.sid};
  console.log(user_query);
  UserServ
  .findOne(user_query)//find if the sid existed
  .then(function(uresult){
    if(uresult!=null){
      var company_query = {id:user.cid,department:{$elemMatch:{_id:{$in:[user.department]}}}};
      console.log(JSON.stringify(company_query));
      CompanyServ
      .findOne(company_query)//check if the department existed
      .then(function(cidresult){
        if(cidresult!=null){
            var emila_query = {email:user.email,sid:{$ne:user.sid}};
              UserServ
              .findOne(emila_query)//find if the email existed
              .then(function(eresult){

                var update_query = updatemaker(user);
                console.log(update_query);
                if(eresult==null){
                  if(user.role=='company_admin'){
                    var role_query = {cid:user.cid,role:user.role,sid:{$ne:user.sid}};
                    UserServ
                    .findOne(role_query)//find if the compnay_admin of that company existed
                    .then(function(rresult){
                      if(rresult==null){
                        UserServ
                        .update(user_query,update_query)//update
                        .then(function(uresult){
                          res.send('User updated!');
                        }).catch(function(err){//update
                          res.status(500).send('Error : '+err);
                        })
                      }else{
                        res.status(500).send('Each Company has only one admin!');
                      }
                    }).catch(function(err){//compnay_admin of that company findOne
                      res.status(500).send('Error : '+err);
                    })
                  }else{
                    UserServ
                    .update(user_query,update_query)//update
                    .then(function(uresult){
                      res.send('User updated!');
                    }).catch(function(err){//update
                      res.status(500).send('Error : '+err);
                    })
                  }
                }else{
                  res.status(500).send('Email Address is used!');
                }
              }).catch(function(err){//email findOne
                res.status(500).send('Error : '+err);
              })
          }else{
            res.status(500).send('Department does not exist');
          }
      }).catch(function(err){//company_query findOne
        res.status(500).send('Error : '+err);
      })
    }else{
      res.status(500).send('Staff does not exist!');
    }
  }).catch(function(err){//sid and cid findOne
    res.status(500).send('Error : '+err);
  })
});


app.post("/api/users/delete", function(req, res) {
  var user_query = {sid:req.body.sid};
  UserServ
    .findOne(user_query)//get user data
    .then(function(result){
        var project_query1 = {pid:{$in:result.projectno}};//find
        var project_query2 = {$pull:{staff:req.query.sid}};
        console.log(project_query1);
        console.log(project_query2);
        ProjectServ
        .updates(project_query1,project_query2)//delete all related project connection
        .then(function(uresult){
          AttendServ
            .remove(user_query)//delete by user id in attendance table
            .then(function(result){
                    UserServ
                      .remove(user_query)//delete by user id
                      .then(function(result){
                        var obj=JSON.parse(result);
                          if(obj.n!=0){
                            res.send('User has been removed');
                          }
                          else{
                            res.status(500).send('No User found! ');
                          }
                      }).catch(function(err){
                        res.status(500).send('Error : '+err);
                      })
                }).catch(function(err){//delete all related attendances
                  res.status(500).send('Error : '+err);
                })
          }).catch(function(err){
            res.status(500).send('Error : '+err);
          })
  }).catch(function(err){
    res.status(500).send('Error : '+err);
  })
});
