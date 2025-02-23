const express = require("express");
const bycrpt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../models/user.model");
require("dotenv").config()

const userRouter = express.Router();

// Registration of User

userRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    bycrpt.hash(password, 10, async (err, hash) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else {
        // Create a new user
        const user = new UserModel({ name, email, password: hash });

        // Save the user to database
        await user.save();

        res
          .status(201)
          .json({ message: "Registration Successfull!!", user: req.body });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User login

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await UserModel.findOne({ email });

    if(user){
        bycrpt.compare(password, user.password, (err, result)=>{
            if(result){
                let token = jwt.sign({userID: user._id}, process.env.secretkey)
                res.status(200).json({ message: "Login Successfull!!", token });
            }else{
                res.status(400).json({ message: 'Invalid Credentials!!' })
            }
        })
    }else{
        return res.status(400).json({ message: "User does not exists!!" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
    userRouter
}