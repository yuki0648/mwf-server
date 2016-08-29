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
        var ttemp = att.recorddate+'T'+att.recordtime+'Z';
        console.log(ttemp);
        var rdate = dateFormat(new Date(ttemp),"isoUtcDateTime");
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
  if(att.start_date!=''||att.end_date!='' || att.start_time!='' ||att.end_time!=''){
    query.recordedate = {};
    var start_date ;
    var end_date ;
    var sttemp;
    var ettemp;
    if(att.start_time!='' && att.end_time!=''){
      sttemp = 'T'+att.start_time+'Z';
      ettemp = 'T'+att.end_time+'Z';
    }else if(att.start_time!=''){
      sttemp = 'T'+att.start_time+'Z';
      ettemp = 'T23:59:59Z';
    }else if(att.end_time!=''){
      sttemp = 'T00:00:00Z';
      ettemp = 'T'+att.end_time+'Z';
    }else{
      sttemp = 'T00:00:00Z';
      ettemp = 'T23:59:59Z';
    }
    if(att.end_date == '' && att.start_date == ''){
      start_date = dateFormat(new Date("2010-01-01"+sttemp), "isoUtcDateTime");//start from 2010-01-01 date
      end_date = dateFormat(new Date(Date.now+ettemp), "isoUtcDateTime");//get current date
    }else if(att.end_date == ''){
      start_date = dateFormat(new Date(att.start_date+sttemp),"isoUtcDateTime");
      end_date = dateFormat(new Date(Date.now+ettemp), "isoUtcDateTime");//get current date
    }else if(att.start_date == ''){
      start_date = dateFormat(new Date("2010-01-01"+sttemp), "isoUtcDateTime");//start from 2010-01-01 date
      end_date = dateFormat(new Date(att.end_date+ettemp),"isoUtcDateTime");
    }else{
      start_date = dateFormat(new Date(att.start_date+sttemp),"isoUtcDateTime");//user entered two arguments
      end_date = dateFormat(new Date(att.end_date+ettemp),"isoUtcDateTime");
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
