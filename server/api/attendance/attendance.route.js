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
        var rdate = dateFormat(new Date(att.recorddate),"isoDate");
        console.log(rdate);
        var create = {sid:att.sid,status:att.status,recorddate:rdate,recordtime:att.recordtime,iBeaconNo:att.iBeaconNo,remarks:att.remarks};
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
  console.log(att);
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
      query.recorddate = {};
      var start_date ;
      var end_date ;
      if(att.start_date == ''){
        start_date = dateFormat(new Date("2010-01-01"), "isoDate");//start from 2010-01-01 date
        end_date = dateFormat(new Date(att.end_date),"isoDate");
      }else if(att.end_date == ''){
        start_date = dateFormat(new Date(att.start_date),"isoDate");
        end_date = dateFormat(new Date(), "isoDate");//get current date
      }else{
        start_date = dateFormat(new Date(att.start_date),"isoDate");//user entered two arguments
        end_date = dateFormat(new Date(att.end_date),"isoDate");
      }
      query.recorddate = {$gte:start_date,$lte:end_date};
    }
  if(att.start_time!=''||att.end_time!=''){
    var start_time ;
    var end_time ;
    if(att.start_time == ''){
      start_time = '00:00:00';//start from 00:00:00 date
      end_time = att.end_time;
    }else if(att.end_time == ''){
      start_time = att.start_time;
      end_time = '23:59:59';//get current date
    }else{
      start_time = att.start_time;//user entered two arguments
      end_time = att.end_time;
    }
    console.log(start_time+'  '+end_time);
    console.log(start_time>end_time);
    if(start_time>end_time){
      var st = '00:00:00';
      var et = '23:59:59';
      //query.recordtime = {$gte:start_time,$lte:end_time};
      query.$or = [{recordtime:{$gte:start_time,$lte:et}},{recordtime:{$gte:st,$lte:end_time}}];
    }else{
      query.recordtime = {$gte:start_time,$lte:end_time};
    }
  }
  console.log(JSON.stringify(query));
  return query;
}


app.patch("/api/attendance/update", function(req, res) {
  var att = req.body;
  var query = {_id:att._id};
  var update = {recorddate:att.recorddate,recordtime:att.recordtime,status:att.status,remarks:att.remarks,iBeaconNo:att.iBeaconNo};
  AttendServ
  .update(query,update)
  .then(function(result){
    res.send('Attendance has been updated');
  }).catch(function(err){
    res.status(500).send('Error : '+err);
  })
});


app.patch("/api/attendance/updates", function(req, res) {
  var att = req.body;
  var query = {_id:{$in:att._id}};
  var t = 'in';
  var updates = {status:t};
  AttendServ
  .updates(query,updates)
  .then(function(result){
    res.send('Attendances have been updated');
  }).catch(function(err){
    res.status(500).send('Error'+err);
  })
});


app.delete("/api/attendance/delete", function(req, res) {
  var att = req.query;
  var del = {_id:att._id};//delete by attendance _id

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
