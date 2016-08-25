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


app.patch("/api/projects/updatedetail", function(req, res) {
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
        end_date:end_date,assigned_date:project.assigned_date};
    }else{
      res.status(500).send('Project Name is already existed');
    }
  }).catch(function(err){//name query
    res.status(500).send('Error'+err);
  })
});


app.put("/api/projects/updateManystaff", function(req, res) {
  var project = req.body;
  var project_query = {pid:project.pid};
  ProjectServ
  .findOne(project_query)//get the data of that project
  .then(function(presult){
    if(presult!=null){
      var unset_query1 = {projectno:{$in:[project.pid]}};
      var unset_query2 = {$pull:{projectno:projectno};

    }else{
      res.status(500).send('No Project found! ');
    }
  }).catch(function(err){
    res.status(500).send('Error'+err);
  })
});


app.patch("/api/projects/addstaff", function(req, res) {
  res.send("Update");
});


app.patch("/api/projects/removestaff", function(req, res) {
  res.send("Update");
});


app.delete("/api/projects/delete", function(req, res) {
  var del = {sid:req.query.id};//delete by user id

  UserServ
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
