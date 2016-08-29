var AttendServ = require("./attendance.service");
var dateFormat = require('dateformat');
var Promise = require('bluebird');
var UserServ = require("../user/user.service");

app.post("/api/attendance/insert", function(req, res) {
  var att = req.body;
  var user_query = {sid:att.sid};
  UserServ
  .findOne(user_query)
  .then(function(uresult){
    if(uresult!=null){
        var rdate = dateFormat(new Date(att.recordedate),"isoUtcDateTime");
        var create = {sid:att.sid,status:att.status,recordedate:rdate,iBeaconNo:att.iBeaconNo,remarks:att.remarks};
        console.log(create);
        AttendServ
        .create(create)
        .then(function(result){
          res.status(201).send('Attendance has been inserted');
        }).catch(function(err){
          res.status(500).send('Error'+err);
        })
    }else{
      res.status(500).send('User not Found');
    }
  }).catch(function(err){
    res.status(500).send('Error'+err);
  })
});


app.get("/api/attendance/queryAll", function(req, res) {
  AttendServ
  .find()
  .then(function(result){
    if(result.length>0){
      res.send(result);
    }else{
      res.status(500).send('No Attendance Found');
    }
  }).catch(function(err){
    res.status(500).send('Error'+err);
  })
});



app.post("/api/attendance/query", function(req, res) {
  var att = req.body;
  var query = querymaker(att);
  AttendServ
  .finds(query)
  .then(function(result){
    if(result.length>0){
      res.send(result);
    }else{
      res.status(500).send('No Attendance Found');
    }
  }).catch(function(err){
    res.status(500).send('Error'+err);
  })
});


function querymaker(att){
  var query = {};
  if(att.sid!=''){
    query.sid = att.sid;
  }
  if(att.status!=''){
    query.status = att.status;
  }
  if(att.iBeaconNo!=''){
    query.iBeaconNo = att.iBeaconNo;
  }
  if(att.start_date!=''||att.end_date!=''){
    query.recordedate = {};
    var start_date ;
    var end_date ;
    if(att.start_date == ''){
      start_date = dateFormat(new Date("2010-01-01"), "isoUtcDateTime");//start from 2010-01-01 date
      end_date = dateFormat(new Date(att.end_date),"isoUtcDateTime");
    }else if(att.end_date == ''){
      start_date = dateFormat(new Date(att.start_date),"isoUtcDateTime");
      end_date = dateFormat(new Date(), "isoUtcDateTime");//get current date
    }else{
      start_date = dateFormat(new Date(att.start_date),"isoUtcDateTime");//user entered two arguments
      end_date = dateFormat(new Date(att.end_date),"isoUtcDateTime");
    }
    query.recordedate = {$gte:start_date,$lte:end_date};
  }
  console.log(query);
  return query;
}


app.patch("/api/attendance/update", function(req, res) {
  var att = req.body;

});

app.delete("/api/attendance/delete", function(req, res) {
  var att = req.query;
  var rdate = dateFormat(new Date(att.recordedate),"isoUtcDateTime");
  var del = {sid:att.sid,recordedate:rdate};//delete by company id

  AttendServ
    .remove(del)
    .then(function(result){
      var obj=JSON.parse(result);
        if(obj.n!=0){
          res.send('Attendance has been removed');
        }
        else{
          res.status(500).send('No Attendance found! ');
        }
    }).catch(function(err){
      res.status(500).send('Error : '+err);
    })
});
