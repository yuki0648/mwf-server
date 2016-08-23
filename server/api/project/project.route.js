var ProjectServ = require("./project.service");


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

  ProjectServ
  .sort()//find the maximum id
  .then(function(sresult){
      if(sresult.length>0){//if there is any result
        var id = getcountstring(sresult);
        console.log(sresult);
      }else{
        var id = 'p00001';
      }
      var projectno;
      var start_date =  dateFormat(new Date(project.start_date),"isoDate");
      var end_date =  dateFormat(new Date(project.end_date),"isoDate");
      var create_query= {name: project.name,projectNo: projectno,description:projec.description,
      address: project.address,type: project.type,start_date:start_date,end_date:end_date,staff:[""]};

      ProjectServ
      .create(req.body)
      .then(function(result){
        res.send(result);
      }).catch(function(err){
        res.status(500).send(err);
      })
    }).catch(function(err){//sort query
      res.status(500).send(err);
    })
});

app.put("/api/projects/:id", function(req, res) {
  res.send("Update");
});

app.delete("/api/projects/:id", function(req, res) {
  res.send("Delete");
});
