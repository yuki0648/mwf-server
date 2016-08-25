var ProjectServ = require("./project.service");
var dateFormat = require('dateformat');
var Promise = require('bluebird');
var UserServ = require("../user/user.service");

app.get("/api/projects/queryAll", function(req, res) {
  ProjectServ
    .find()
    .then(function(result){
      res.send(result);
    })
    .catch(function(err){
      res.status(500).send(err);
    })
});

app.post("/api/projects/query", function(req, res) {
  var query = { _id: req.params.id };
  ProjectServ
    .findOne(query)
    .then(function(result){
      res.send(result);
    })
    .catch(function(err){
      res.status(500).send(err);
    })
});


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
  var name_query = {name:project.name};
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
          var staff = [""];
          var start_date =  dateFormat(new Date(project.start_date),"isoDate");
          var end_date =  dateFormat(new Date(project.end_date),"isoDate");
          var create_query= {name: project.name,pid: id,description:project.description,
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
        res.status(500).send('Project Name is already existed');
      }
     }).catch(function(err){//name query
       res.status(500).send('Error'+err);
     })
});


app.put("/api/projects/updatedetail", function(req, res) {
  var project = req.body;
  var name_query = {name:project.name,pid:{$ne:project.pid}};
  var query = {pid:project.pid};

  ProjectServ
  .findOne(name_query)//find if the name exists
  .then(function(nresult){
    if(nresult==null){
      var start_date =  dateFormat(new Date(project.start_date),"isoDate");
      var end_date =  dateFormat(new Date(project.end_date),"isoDate");
      var assigned_date =  dateFormat(new Date(project.assigned_date),"isoDate");

      var update_query= {name: project.name,description:project.description,
        address: project.address,type: project.type,start_date:start_date,
        end_date:end_date,assigned_date:assigned_date};
        console.log(update_query);
        ProjectServ
        .update(query,update_query)//get the data of that project
        .then(function(presult){
          res.send('Project has been updated');
        }).catch(function(err){
          res.status(500).send('Error'+err);
        })
    }else{
      res.status(500).send('Project Name is already existed');
    }
  }).catch(function(err){//name query
    res.status(500).send('Error'+err);
  })
});


app.put("/api/projects/updatemanystaff", function(req, res) {
  var project = req.body;
  var project_query = {pid:project.pid};

  console.log(project.staff);
  staffvalidation(project.staff)
  .then(function(result){
    console.log(result);
        ProjectServ
        .findOne(project_query)//get the data of that project
        .then(function(presult){
      //    console.log(presult);
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
                UserServ
                .updates(push_query1,push_query2)//push projectno to all related staff record
                .then(function(aresult){
                  var replace_query = {$set:{staff:project.staff}};
                    ProjectServ
                    .update(project_query,replace_query)//renew the staff column in project record
                    .then(function(rresult){
                      res.send('Modified');
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
    res.status(500).send('rejected due to null user'+sid);
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
      staff_query = {sid:project.sid};
      var pushs_query = {$push:{projectno:project.pid}};
      UserServ
      .update(staff_query,pushs_query)//push projectno in user table
      .then(function(result){

          ProjectServ
          .update(staff_query,pushs_query)//push staff in project table
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
    } else {
      res.status(500).send('No Staff Found or Selected Staff has been registered in this project');
    }
  })
  .catch(function(err){//search sid
    res.status(500).send('Error'+err);
  })
});


app.patch("/api/projects/removestaff", function(req, res) {
  var project = req.body;
  var unset_query1 = {projectno:{$in:[project.pid]},sid:project.sid};
  var unset_query2 = {$pull:{projectno:project.pid}};
  UserServ
  .updates(unset_query1,unset_query2)//unset all related staff projectno with specified pid
  .then(function(uresult){
    var project_query = {pid:project.pid};
    var pullp_query = {$pull:{staff:project.sid}};
      ProjectServ
      .updates(project_query,pullp_query)//unset all related staff projectno with specified pid
      .then(function(uresult){
        res.send('Selected Staff has been removed from this project');
      }).catch(function(err){
        res.status(500).send('Error '+err);
      })
  }).catch(function(err){
    res.status(500).send('Error '+err);
  })
});


app.delete("/api/projects/delete", function(req, res) {
  var del = {sid:req.query.id};//delete by user id

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
    }).catch(function(err){
      res.status(500).send('Error : '+err);
    })
});
