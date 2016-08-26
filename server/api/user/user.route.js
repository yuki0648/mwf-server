var UserServ = require("./user.service");
var SuperUserServ = require("../super_user/super_user.service");

app.post("/api/users/login", function(req, res) {
//  console.log('123')
  var user = req.body;
//  console.log(user);
  var query = {email: user.email,password:user.password};
  UserServ
    .findOne(query)
    .then(function(result){
    //  console.log(result);
      if(result!=null){
            res.send('Successfully Login!');
      }else{
        res.status(500).send('Invalid userID or password!');
      }
    })
    .catch(function(err){
      res.status(500).send('Error :' + err);

    })
});
