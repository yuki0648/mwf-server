var Attendance = require("./attendance.schema");
var Promise = require('bluebird');

module.exports = {
  find: function() {
    return Attendance.find()
  },
  finds: function(query) {
    return Attendance.find(query)
  },
  findOne: function(query) {
    return Attendance.findOne(query)
  },
  create: function(body) {
    return Attendance.create(body)
  },
  update: function(query,update){
    return Attendance.update(query,update)
  },
  updates: function(query,update){
    return Attendance.update(query,update,{multi:true})
  },
  remove: function(id){
    return Attendance.remove(id)
  },
  sort: function(){
    return Attendance.find({},{aid:1}).sort({aid:-1}).limit(1)
  }
}
