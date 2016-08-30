var UserServ = require("./user.service");
var SuperUserServ = require("../super_user/super_user.service");

app.post("/api/users/login", function(req, res) {
  var user = req.body;
//  console.log(user);
  var query = {email: user.email,password:user.password};
  UserServ
    .findOne(query)
    .then(function(result){
    //  console.log(result);
      if(result!=null){
            var resdata = getdata(result);
            console.log(resdata);
            res.send(resdata);
      }else{
        res.status(500).send('Invalid userID or password!');
      }
    })
    .catch(function(err){
      res.status(500).send('Error :' + err);
    })
});

function getdata(result){
  var permission;
  var  res = {};
  if(result.role=='super_user'){
    permission = 1;
  }else if(result.role=='company_admin'){
    permission = 2;
  }else if(result.role=='department_head'){
    permission = 3;
  }else if(result.role=='employee'){
    permission = 4;
  }
  res.email = result.email;
  res.chiname = result.chiname;
  res.engname = result.engname;
  res.role = result.role;
  res.gender = result.gender;
  res.permission = permission;
  return res;
}
