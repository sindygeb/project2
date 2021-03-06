var db = require("../models");

module.exports = function (app) {

  // FUNCTIONS 

  // FUNCTIONS FOR INCREMENTING USER GOAL-COUNTING VALUES

  // Increment goalsMade by one for user
  function addGoal(userId) {
    db.User.update({ goalsMade: db.sequelize.literal('goalsMade + 1') }, { where: { id: userId } });
  }

  // Increments goalsSucceeded by one for the user
  function goalMet(userId) {
    db.User.update({ goalsSucceeded: db.sequelize.literal('goalsSucceeded + 1') }, { where: { id: userId } });
  }

  // Increment goalsDeleted by one for user
  function goalDeleted(userId) {
    db.User.update({ goalsDeleted: db.sequelize.literal('goalsDeleted + 1') }, { where: { id: userId } });
  }

  // ALL GET ROUTES

  // GET ALL USERS
  app.get("/api/Users", function (req, res) {
    db.User.findAll({ include: [db.Goal, db.Message] }).then(function (dbUsers) {
      res.json(dbUsers);
    });
  });

  // GET ALL GOALS
  app.get("/api/Goals", function (req, res) {
    db.Goal.findAll({ include: [db.User] }).then(function (dbGoals) {
      res.json(dbGoals);
    });
  });

  // GET ALL MESSAGES
  app.get("/api/Messages", function (req, res) {
    db.Message.findAll({ include: [db.User] }).then(function (dbMessages) {
      res.json(dbMessages);
    });
  });

  /*
  // GET ALL GOALS FOR SINGLE USER
  app.get("/api/userGoals", function (req, res) {
    db.Goal.findAll({
      where: {
        UserId: req.body.userID
      }
    }).then(function (userGoals) {

      console.log(userGoals);
      res.json(userGoals);

    });
  });
*/

  // GET ALL GOALS FOR THE CURRENT USER LOGGED IN TO DISPLAY ON THEIR PAGE
  app.get("/api/goals/:UserId", function (req, res) {
    db.Goal.findAll({
      where: {
        UserId: req.params.UserId,
        goalMet: false
      }
    }).then(function (dbGoals) {
      var dbGoalsArray = [];
      for (var i = 0; i < dbGoals.length; i++) {
        dbGoalsArray.push({
          id: dbGoals[i].id,
          title: dbGoals[i].title,
          description: dbGoals[i].description,
          category: dbGoals[i].category
        });
      };
      res.json(dbGoalsArray)
    });
  });

  // GET ROUTE FOR WALL OF FAME
  app.get("/api/fame", function (req, res) {
    db.User.findAll({ include: [db.Goal] }).then(function (dbUser) {

      var wallFame = [];

      for (var i = 0; i < dbUser.length; i++) {
        if (dbUser[i].goalsSucceeded !== 0) {
          var famescore = (dbUser[i].goalsSucceeded / dbUser[i].goalsMade).toFixed(1);

          // famescore was being returned as a string so I parseFloated it
          famescore = parseFloat(famescore);

          // Checking if the user has completed 80% or more of the goals they have set
          if (famescore >= 0.8) {

            wallFame.push({
              id: dbUser[i].id,
              userName: dbUser[i].username,
              imageUrl: dbUser[i].imageURL,
              score: famescore
            });
          }

        }
      }
      wallFame.sort(function (a, b) {
        return parseFloat(b.score - a.score);
      });

      // for loop to send top five only
      var newWallFame = [];
      for (i = 0; i < wallFame.length; i++) {
        if (newWallFame.length < 5) {
          newWallFame.push(wallFame[i]);
        }
      }
      res.json(newWallFame);
    });
  });

  // GET ROUTE FOR WALL OF SHAME
  app.get("/api/shame", function (req, res) {
    db.User.findAll({ include: [db.Goal] }).then(function (dbUser) {

      var wallShame = [];

      for (var i = 0; i < dbUser.length; i++) {
        if (dbUser[i].goalsSucceeded !== 0 && dbUser[i].goalsDeleted !== 0) {

          var shamescore = (dbUser[i].goalsDeleted / dbUser[i].goalsMade).toFixed(1);

          // shamescore was being returned as a string so I parseFloated it
          shamescore = parseFloat(shamescore);

          // Checking if the user has failed 40% or more of the goals they have set
          if (shamescore >= 0.4) {
            wallShame.push({
              id: dbUser[i].id,
              userName: dbUser[i].username,
              imageUrl: dbUser[i].imageURL,
              score: shamescore
            });
          }

        }
      }
      wallShame.sort(function (a, b) {
        return parseFloat(a.score - b.score);
      });

      // for loop to send top five only
      var newWallShame = [];
      for (i = 0; i < wallShame.length; i++) {
        newWallShame.push(wallShame[i]);
      };
      res.json(newWallShame);
    });
  });

  // GET ROUTES FOR MESSAGES 

  // GET ALL MESSAGES
  app.get("/api/messages", function (req, res) {
    db.Message.findAll({ include: [db.User] }).then(function (messageData) {

      console.log(messageData);

      res.json(messageData);

    });
  });

  // GET ALL MESSAGES FOR A SINGLE USER
  app.get("/api/messages/:userId", function (req, res) {
    db.Message.findAll({
      where: {
        id: req.params.userId
      }
    }).then(function (messagesData) {

      console.log(messagesData);
      res.json(messagesData);

    });
  });

  // ALL POST ROUTES

  // ROUTE FOR USER LOGIN
  app.post("/login", function (req, res) {
    db.User.findAll({
      where: { //SELECT * FROM db.User WHERE username = req.body.username AND password = req.body.password
        username: req.body.usernameData,
        password: req.body.passwordData
      },
      raw: true,
    }).then(function (userInfo) {
      if (userInfo.length === 0) {
        console.log("User info is undefined");
        res.json({ userName: undefined });
      }
      else {
        // console.log(userInfo[0]);
        // Create an object of properties to return to client 
        var loggedUser = {
          "userID": userInfo[0].id,
          "userName": userInfo[0].username,
          "userImage": userInfo[0].imageURL
        };
        // console log on server side
        console.log("\nUser logged in with ID of: " + userInfo[0].id);

        // Send array back to browser for use
        res.json(loggedUser);
      }

    });
  });

  // CREATE A NEW USER
  app.post("/api/newUser", function (req, res) {
    // Finds or creates a user with the username being posted
    db.User.findOrCreate({
      // defaults are the values being assigned to the new user if they are being created. (username does not need to be included in defaults)
      defaults: {
        password: req.body.passwordData,
        imageURL: req.body.userImageData
      },
      where: {
        username: req.body.usernameData
      }
    }).then(function ([user, created]) {
      // user is the object created or the the object that was found
      // Created is a boolean. True = it created a new user because one didn't exist with the name. False = user already existed.

      // console logging the data in a layout that only shows the relevant data
      console.log(user.get({
        plain: true
      }));

      // Will console log true if a new user object is created, or false if one already exists with that username
      console.log(created);

      // If a new user was created, return an object holding the data we need for local storage.
      // A new value called created will tell the front end if the user was created or not.
      if (created) {
        var createdUser = {
          "userID": user.id,
          "userName": user.username,
          "userImage": user.imageURL,
          "created": true
        }
        res.json(createdUser);
      }
      // If a new user was not created, return an object holding only a created value of false.
      // Don't need to pass any additional information since it wouldn't matter.
      else {
        var existingUser = {
          "created": false
        }
        res.json(existingUser);
      }

    });
  });

  // POST ROUTES FOR GOALS AND USER.HTML PAGE

  // CREATE NEW GOAL ROUTE
  app.post("/api/newGoal", function (req, res) {

    db.Goal.create({
      title: req.body.goalTitle,
      description: req.body.goalDescription,
      UserId: req.body.userID
    }).then(function (data) {

      // Calling function to increment user's goalsMade value
      addGoal(req.body.userID);

      res.json(data);
    });
  });

  // CREATE MESSAGE POST ROUTE
  app.post("/api/newMessage", function (req, res) {
    db.Message.create({
      name: req.body.messageName,
      body: req.body.messageBody,
      UserId: req.body.userID
    }).then(function (messageData) {

      console.log(messageData);

      res.json(messageData);
    });
  });

  // ALL PUT ROUTES

  // GOAL COMPLETED ROUTE
  app.put("/api/completeGoal/:goalId", function (req, res) {

    db.Goal.update({
      goalMet: true
    },
      {
        where: {
          id: req.params.goalId
        }
      }).then(function (data) {
        console.log(data);

        // Calling function to increment the user's goalsSucceeded value
        goalMet(req.body.userID);

        res.json(data);
      });
  });

  // ALL DELETE ROUTES

  // GOAL DELETED ROUTE
  app.delete("/api/deleteGoal/:goalId", function (req, res) {
    db.Goal.destroy({
      where: {
        id: req.params.goalId
      }
    }).then(function (data) {

      // Calling function to increment user's goalsDeleted value
      goalDeleted(req.body.userID);

      res.json(data);
    });
  });

} // module export close