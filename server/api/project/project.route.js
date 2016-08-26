var ProjectServ = require("./project.service");
var dateFormat = require('dateformat');
var Promise = require('bluebird');
var UserServ = require("../user/user.service");

app.get("/api/projects/queryAll", function(req, res) {
  ProjectServ
    .find()
    .then(function(result){
      if(result.length>0){
        res.send(result);
      }else{
        res.status(500).send('No Project Found');
      }
    })
    .catch(function(err){
      res.status(500).send(err);
    })
});

app.post("/api/projects/query", function(req, res) {
  var project = req.body;
  var query = querymaker(project);

  ProjectServ
    .finds(query)
    .then(function(result){
      if(result.length>0){
        console.log();
        res.send(result);
      }else{
        res.status(500).send('No Project Found');
      }
    })
    .catch(function(err){
      res.status(500).send(err);
    })
});


function querymaker(project){
  var query = {};
  if(project.chiname!=""&&project.chiname!=undefined){
    query.chiname = new RegExp(project.chiname,'i');
  }
  if(project.engname!=""&&project.engname!=undefined){
    query.engname = new RegExp(project.engname,'i');
  }
  if(project.pid!=""&&project.pid!=undefined){
    query.pid = project.pid;
  }
  if(project.address!=""&&project.address!=undefined){
    query.address = new RegExp(project.address,'i');
  }
  if(project.type!=""&&project.type!=undefined){
    query.type = project.type;
  }
  if(project.start_date!=""&&project.start_date!=undefined){
    var sdate = dateFormat(new Date(project.start_date),"isoDate");
    query.start_date = {$gte:sdate};
  }
  if(project.end_date!=""&&project.end_date!=undefined){
    var edate = dateFormat(new Date(project.end_date),"isoDate");
    query.end_date = {$lte:edate};
  }
  if(project.astart_date != '' || project.aend_date != ''){//assigned_date range
    query.assigned_date = {};
    var astart_date ;
    var aend_date ;
    if(project.astart_date == ''){
      astart_date = dateFormat(new Date("2010-01-01"), "isoDate");//start from 2010-01-01 date
      aend_date = dateFormat(new Date(project.aend_date),"isoDate");
    }else if(project.aend_date == ''){
      astart_date = dateFormat(new Date(project.astart_date),"isoDate");
      aend_date = dateFormat(new Date(), "isoDate");//get current date
    }else{
      astart_date = dateFormat(new Date(project.astart_date),"isoDate");//user entered two arguments
      aend_date = dateFormat(new Date(project.aend_date),"isoDate");
    }
    query.assigned_date = {$gte:astart_date,$lte:aend_date};
  }
  if(project.staff != '' && project.staff != undefined){
    query.staff = {$in:project.staff};
  }
  console.log(query);
  return query;
}


function getcountstring(result){//split the result string and get the maximum existing sid
  var result2 = JSON.stringify(result);
  var substring = result2.substring(result2.indexOf(':\"p')+3,result2.lastIndexOf('\"'));
  var number = parseInt(substring);
  number = getcount(number+1);
  return number;
}


function getcount(count){//make formatted sid
  if(count<10){
    var id = 'p'+'0000'+count;
  }else if(count<100){
    var id = 'p'+'000'+count;
  }else if(count<1000){
    var id = 'p'+'00'+count;
  }else if(count<10000){
    var id = 'p'+'0'+count;
  }else{
    var id = 'p'+count;
  }
  return id;
}


app.post("/api/projects/insert", function(req, res) {
  var project = req.body;
  var name_query = {$or:[{chiname:project.chiname},{engname:project.engname}]};
  ProjectServ
  .findOne(name_query)//find if the name existed
  .then(function(nresult){
    if(nresult==null){
      ProjectServ
      .sort()//find the maximum id
      .then(function(sresult){
          if(sresult.length>0){//if there is any result
            var id = getcountstring(sresult);
            console.log(sresult);
          }else{
            var id = 'p00001';
          }
          var staff = [];
          var start_date =  dateFormat(new Date(project.start_date),"isoDate");
          var end_date =  dateFormat(new Date(project.end_date),"isoDate");
          var create_query= {chiname: project.chiname,engname: project.engname,pid: id,description:project.description,
            address: project.address,type: project.type,start_date:start_date,end_date:end_date,staff:staff};

          console.log(create_query);
          ProjectServ
          .create(create_query)
          .then(function(result){
              console.log(result);
              res.status(201).send('Project added successfully');
          }).catch(function(err){
              res.status(500).send('Error'+err);
          })
        }).catch(function(err){//sort query
          res.status(500).send('Error'+err);
        })
      }else{
        console.log('Projec name ');
        res.status(500).send('Project chiname or engname is already existed');
      }
     }).catch(function(err){//name query
       console.log('findOne '+err);
       res.status(500).send('Error'+err);
     })
});


app.put("/api/projects/updatedetail", function(req, res) {
  var project = req.body;
  var name_query = {$or:[{chiname:project.chiname},{engname:project.engname}],pid:{$ne:project.pid}};
  var query = {pid:project.pid};

  ProjectServ
  .findOne(name_query)//find if the name exists
  .then(function(nresult){
    if(nresult==null){
      var start_date =  dateFormat(new Date(project.start_date),"isoDate");
      var end_date =  dateFormat(new Date(project.end_date),"isoDate");
      var assigned_date =  dateFormat(new Date(project.assigned_date),"isoDate");

      var update_query= {chiname: project.chiname,engname: project.engname,description:project.description,
        address: project.address,type: project.type,start_date:start_date,
        end_date:end_date,assigned_date:assigned_date};
        console.log(update_query);
        ProjectServ
        .update(query,update_query)//update the detail of porject
        .then(function(presult){
          res.send('Project has been updated');
        }).catch(function(err){
          res.status(500).send('Error'+err);
        })
    }else{
      res.status(500).send('Project chiname or engname is already existed');
    }
  }).catch(function(err){//chiname or engname query
    res.status(500).send('Error'+err);
  })
});


app.put("/api/projects/updatemanystaff", function(req, res) {
  var project = req.body;
  var project_query = {pid:project.pid};

  console.log(project.staff);
  staffvalidation(project.staff)
  .then(function(result){
    //console.log(result);
        ProjectServ
        .findOne(project_query)//get the data of that project
        .then(function(presult){
        //  console.log(presult);
          if(presult!=null){
            var unset_query1 = {projectno:{$in:[project.pid]}};
            var unset_query2 = {$pull:{projectno:project.pid}};
          //  console.log(JSON.stringify(unset_query1));
          //  console.log(unset_query2);
            UserServ
            .updates(unset_query1,unset_query2)//unset all related staff projectno with specified pid
            .then(function(uresult){
                var push_query1 = {sid:{$in:project.staff}};
                var push_query2 = {$push:{projectno:project.pid}};
              //  console.log(push_query2);
                UserServ
                .updates(push_query1,push_query2)//push projectno to all related staff record
                .then(function(aresult){
                  var replace_query = {$set:{staff:project.staff}};
                    ProjectServ
                    .update(project_query,replace_query)//renew the staff column in project record
                    .then(function(rresult){
                      res.send('Staff of Project has been Modified');
                    }).catch(function(err){//push array in project table
                      res.status(500).send('Error'+err);
                    })
                }).catch(function(err){//push array in user table
                  res.status(500).send('Error'+err);
                })
            }).catch(function(err){//unset all related staff of project in user table
              res.status(500).send('Error'+err);
            })
          }else{
            res.status(500).send('No Project found! ');
          }
        }).catch(function(err){//get data of project
          res.status(500).send('Error'+err);
        })
  })
  .catch(function(sid){//staffvalidation
    res.status(500).send('Rejected due to null user '+sid);
  });
})


function staffvalidation(staff){
  return new Promise(function(resolve, reject){
    Promise.each(staff,function(sid){
      return new Promise(function(resolve, reject){
        var query = {};
        var r = true;
        var length = Object.keys(staff).length;
        query.sid = sid;
        UserServ
        .findOne(query)//find out if there is any id which from entered query not exists in user table
        .then(function(rresult){
          if(rresult==null){
            return reject(sid);
          } else {
            return resolve();
          }
        })
        .catch(function(err){
          res.status(500).send('Error'+err);
        })
      })
    })
    .then(function(result){
      resolve(result);
    })
    .catch(function(sid){
      reject(sid);
    })
  })
};


app.patch("/api/projects/addstaff", function(req, res) {
  var project = req.body;
  var staff_query = {sid:project.sid,projectno:{$nin:[project.pid]}};
  UserServ
  .findOne(staff_query)//find out if there is any id which from entered query not exists in user table
  .then(function(rresult){
    if(rresult!=null){
      var project_query = {pid:project.pid};
      ProjectServ
      .findOne(project_query)//find out if the project exists
      .then(function(presult){
          if(presult!=null){
                staff_query = {sid:project.sid};
                var pushs_query = {$push:{projectno:project.pid}};
                UserServ
                .update(staff_query,pushs_query)//push projectno in user table
                .then(function(result){
                    var project_query = {pid:project.pid};
                    var pushp_query = {$push:{staff:project.sid}};
                        ProjectServ
                        .update(project_query,pushp_query)//push staff in project table
                        .then(function(result){
                            res.status(201).send('Staff Added in this project');
                        })
                        .catch(function(err){//push staff in project table
                            res.status(500).send('Error'+err);
                        })
                  })
                  .catch(function(err){//push projectno in user table
                    res.status(500).send('Error'+err);
                  })
              }else{
                res.status(500).send('No Project Found');
              }
          }).catch(function(err){//search pid
            res.status(500).send('Error'+err);
          })
        }else{
          res.status(500).send('No Staff Found or Selected Staff has been registered in this project');
        }
  }).catch(function(err){//search sid
    res.status(500).send('Error'+err);
  })
});


app.patch("/api/projects/removestaff", function(req, res) {
  var project = req.body;
  var staff_query = {sid:project.sid,projectno:project.pid};
  UserServ
  .findOne(staff_query)//find if the project registered with staff
  .then(function(rresult){
    if(rresult!=null){
      var project_query = {pid:project.pid,staff:project.sid};
      ProjectServ
      .findOne(project_query)//find if the staff is in the project
      .then(function(presult){
          if(presult!=null){
              var unset_query1 = {sid:project.sid};
              var unset_query2 = {$pull:{projectno:project.pid}};
              UserServ
              .update(unset_query1,unset_query2)//unset all related staff projectno with specified pid
              .then(function(uresult){
                console.log(uresult);
                    var project_query = {pid:project.pid};
                    var pullp_query = {$pull:{staff:project.sid}};
                      ProjectServ
                      .update(project_query,pullp_query)//unset all related staff projectno with specified pid
                      .then(function(upresult){
                        console.log(upresult);
                          res.send('Selected Staff has been removed from this project');
                      }).catch(function(err){
                        res.status(500).send('Error '+err);
                      })
              }).catch(function(err){//update in user table
                res.status(500).send('Error '+err);
              })
            }else{//no result for project table findOne
              res.status(500).send('Project '+project.pid+' not found or Staff has not been registered in this project');
            }
          }).catch(function(err){//find if the staff is in the project
            res.status(500).send('Error '+err);
          })
        }else{//no result for user table findOne
          res.status(500).send('Staff '+project.sid+' not work in this project or Staff not found');
        }
      }).catch(function(err){//find if the project registered with staff
        res.status(500).send('Error '+err);
      })
});


app.delete("/api/projects/delete", function(req, res) {
  var project = req.query;
  var project_query = {pid:project.pid};
  ProjectServ
    .findOne(project_query)//get sid
    .then(function(result){
      console.log(result);
        var sdel1 = {sid:{$in:result.staff}};
        var sdel2 = {$pull:{projectno:project.pid}};
        UserServ
          .updates(sdel1,sdel2)//remove the pid from user table
          .then(function(result){
              var del = {pid:req.query.pid};//delete by project id
              ProjectServ
                .remove(del)
                .then(function(result){
                  var obj=JSON.parse(result);
                    if(obj.n!=0){
                      res.send('Project has been removed');
                    }
                    else{
                      res.status(500).send('No Project found! ');
                    }
                }).catch(function(err){//remove project
                  res.status(500).send('Error : '+err);
                })
          }).catch(function(err){//remove the pid from user table
            res.status(500).send('Error : '+err);
          })
    }).catch(function(err){//get sid
      res.status(500).send('Error : '+err);
    })
});
