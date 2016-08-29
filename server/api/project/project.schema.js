var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');
var dateFormat = require('dateformat');

var projectSchema = new Schema({
  chiname: String,
  engname: String,
  pid: String,
  description:String,
  address: String,
  type: String,
  assigned_date:{ type: Date, default: dateFormat(Date.now(),'isoDate')},
  start_date:Date,
  end_date:Date,
  staff:[String]
});

model = mongoose.model('Project', projectSchema);
Promise.promisifyAll(model);

module.exports = model
