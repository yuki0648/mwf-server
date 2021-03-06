var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');
var dateFormat = require('dateformat');

var companySchema = new Schema({
  id:String,
  chiname: String,
  engname: String,
  code: String,
  status:String,
  assigned_date:{ type: Date, default: dateFormat(Date.now(),'isoDate')},
  department:[{_id:String,name:String}],
  description: String
});

model = mongoose.model('Company', companySchema);
Promise.promisifyAll(model);

module.exports = model
