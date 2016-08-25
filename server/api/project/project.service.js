var Project = require("./project.schema");
var Promise = require('bluebird');

module.exports = {
  find: function() {
    return Project.find()
  },
  finds: function(query) {
    return User.find(query)
  },
  findOne: function(query) {
    return Project.findOne(query)
  },
  create: function(body) {
    return Project.create(body)
  },
  update: function(query,update){
    return Project.update(query,update)
  },
  remove: function(id){
    return Project.remove(id)
  },
  sort: function(){
    return Project.find({},{pid:1}).sort({pid:-1}).limit(1)
  }
}
