const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const authModelSchema = require("../models/authModel");
const jwt = require("jsonwebtoken");
const verifyToken = require("../verifyToken");
const secretKey = "manarat600";
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const { parse, stringify, toJSON, fromJSON } = require("flatted");

//user register

router.post("/register", async (req, res) => {
  const registerUserData = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    gender: req.body.gender,
    dob: req.body.dob,
  };

  const salt = await bcrypt.genSalt(10);
  await bcrypt.hash(req.body.password, salt).then((hashedPassword) => {
    if (hashedPassword) {
      console.log("Hashed password is ", hashedPassword);
      registerUserData.password = hashedPassword;
    }
  });

  await authModelSchema
    .create(registerUserData)
    .then((userStoredData) => {
      if (userStoredData && userStoredData._id) {
        console.log("user stored data", userStoredData);
        res.json({ status: "ok", data: userStoredData });
      }
    })
    .catch((err) => {
      if (err) {
        res.json({ status: "error", data: err });
      }
    });
});

//user login
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  await authModelSchema
    .findOne({ email: email })
    .then((existsUser) => {
      console.log("exit user", existsUser._id);
      if (existsUser && existsUser._id) {
        bcrypt.compare(password, existsUser.password, function (err, response) {
          if (!err) {
            if (response) {
              const authToken = jwt.sign(
                { _id: existsUser._id, email: existsUser.email },
                secretKey,
                {
                  expiresIn: "1h",
                }
              );
              res.json({
                status: "ok",
                data: { authToken, response, existsUser },
              });
            } else if (!response) {
              res.json({ status: "ok", data: { response, existsUser } });
            }
          }
        });
      }
    })
    .catch((err) => {
      res.json({ status: err, data: "Something went wrong" });
    });
});

//user dashboard
router.get("/dashboard", verifyToken, async (req, res) => {
  if (req && req.decodeToken) {
    res.json({ status: "ok", data: "ok" });
  }
});

//get All User
router.get("/allUser", async (req, res) => {
  const allUser = await authModelSchema.find({}).exec((err, data) => {
    if (err) {
      res.status(500).json({
        error: "There was a server side error!",
      });
    } else {
      res.status(200).json({
        result: data,
        message: "Success",
      });
    }
  });
});

// Update User
router.put("/:id", (req, res) => {
  const { username, gender, dob } = req.body;
  const result = authModelSchema
    .findByIdAndUpdate(
      { _id: req.params.id },
      {
        username,
        gender,
        dob,
      },
      {
        new: true,
        // useFindAndModify: false,
      },
      (err) => {
        if (err) {
          res.status(500).json({
            error: "There was a server side error!",
          });
        } else {
          res.status(200).json({
            data: stringify(result),
            message: "User was updated successfully!",
          });
        }
      }
    )
    .lean();
  console.log(result);
});

// DELETE User
router.delete("/:id", (req, res) => {
  authModelSchema.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).json({
        error: "There was a server side error!",
      });
    } else {
      res.status(200).json({
        message: "Todo was deleted successfully!",
      });
    }
  });
});

// router.get("/forgot-password", (req, res, next) => {});

// router.post("/forgot-password", async (req, res, next) => {
//   const email = req.body.email;
//   await authModelSchema.findOne({ email: email }).then((exitUser) => {
//     res.send(exitUser.email);
//   });
// });

// router.get("/reset-password", (req, res, next) => {});

// router.post("/reset-password", (req, res, next) => {});
module.exports = router;
