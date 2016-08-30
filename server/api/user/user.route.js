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
            var role = getrole(result);
            res.send(role+'');
      }else{
        res.status(500).send('Invalid userID or password!');
      }
    })
    .catch(function(err){
      res.status(500).send('Error :' + err);
    })
});

function getrole(result){
  var role;
  if(result.role=='super_user'){
    role = 1;
  }else if(result.role=='company_admin'){
    role = 2;
  }else if(result.role=='department_head'){
    role = 3;
  }else if(result.role=='employee'){
    role = 4;
  }
  return role;
}
