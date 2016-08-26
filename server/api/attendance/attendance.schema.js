var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

var attendanceSchema = new Schema({
  sid: String,
  recordedat:{ type: Date },
  iBeaconNo: String,
  remarks: String
});

model = mongoose.model('Attendance', attendanceSchema);
Promise.promisifyAll(model);

module.exports = model
