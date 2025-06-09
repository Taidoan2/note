require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);

const User = require("./models/user.model");


const express = require('express');
const cors = require('cors');
const app = express();

const jwt = require("jsonwebtoken");
const {authenticateToken} = require("./utilities")

app.use (
    cors(
        {
            origin: "*"
        }
    ),
    
);

app.get('/', (req, res) => {
    res.json({data:'Hello World!'})
});

// tao account
app.post("/create-account", async (req, res) => {

    const { fullName, email,password } = req.body;

    if (!fullName) {
        return res
        .status(400)
        .json({error: true, message: "Bắt buộc phải là tên đầy đủ"});
    }

    if(!email) {
        return res.status(400).json({error: true, message: "Email là bắt buộc"});
    }

    if (!password) {
        return res
        .status(400)
        .json({error: true, message: "Password là bắt buộc"});
    }

    const isUser = await User.findOne({email: email});

    if (isUser) {
        return res.json({
            error: true,
            message: "Người dùng đã tồn tại",
        });
    }

    const user = new User ({
        fullName,
        email,
        password,
    });

    await user.save();


    const accessToken = jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "36000m"
    });

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Đăng ký thành công"
    })
})

app.listen(8000);

module.exports = app