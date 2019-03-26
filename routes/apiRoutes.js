var db = require("../models");

module.exports = function (app) {


  //GET ROUTES

  // Get all Users
  app.get("/api/Users", function (req, res) {
    db.User.findAll({}).then(function (dbUsers) {
      res.json(dbUsers);
    });
  });

  // Get all Goals
  app.get("/api/Goals", function (req, res) {
    db.Goal.findAll({}).then(function (dbGoals) {
      res.json(dbGoals);
    });
  });


  //POST ROUTES

  // Create a new User
  app.post("/api/newUser", function (req, res) {
    db.User.create({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
      imageURL: req.body.imageURL,

    }).then(function (dbNewUser) {
      res.json(dbNewUser);
    });
  });

  // Create a new Goal
  app.post("/api/newGoal", function (req, res) {
    db.Goal.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      goalMet: req.body.goalMet
    }).then(function (dbNewGoal) {
      res.json(dbNewGoal);
    });
  });


  //DELETE ROUTES

  // Delete a Goal
  app.delete("/api/Goals/:Goal", function (req, res) {
    db.Goal.destroy({
      where: {
        id: req.params.id
      }
    }).then(function (dbDeleteGoal) {
      res.json(dbDeleteGoal);
    });
  });
};

// PUT ROUTES

//Update a goal with accomplishment boolean
app.put("/api/updateGoal", function (req, res) {
  db.Goal.update({
    goalMet: req.body.goalMet
  }, {
      where: {
        id: req.body.id
      }
    }).then(function (dbUpdateGoal) {
      res.json(dbUpdateGoal);
    })
    .catch(function (err) {
      res.json(err);
    });


    //Where should this be located?
    db.User.update({
      goalsSucceeded: goalsSucceeded + 1
    }).then(function (results) {
      // delete the goal?
    }); 
});



//Gus's copypasta Sequelize methods


// Sequelize function that are not specified yet. Just coding them out for reference.
// Looks for a user with the username entered.

db.User.findAll({
  where: {
    username: req.body.userName
  }
}).then(function (results) {
  // look for password match
});

// Adds a new user to the table/database.
db.User.create({
  name: req.body.name,
  username: req.body.userName,
  password: req.body.password,
  imageURL: req.body.imgageURL,
}).then(function (results) {
  res.json(results);
});

// Updating a goal to complete. ??(still deciding if it should ne deleted afterwards)??
db.Goal.update({
  goalMet: true
}).then(function (results) {
  res.json(results);
});

// User completing a goal to complete and then it is deleted
db.User.update({
  goalsSucceeded: goalsSucceeded + 1
}).then(function (results) {
  // delete the goal?
});

// Additional notes: 
// Maybe have it check for if a goal's boolean value is true-
// it runs a function that adds one to the user's goalsSucceeded value and then deletes the goal???