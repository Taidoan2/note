require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);


const User = require("./models/user.model.js");
const Note = require("./models/note.model.js")


const express = require("express");
const cors = require("cors");
const app = express();


const jwt = require("jsonwebtoken");
const {authenticateToken} = require("./untilities");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: "*"
    })

);




app.get("/", (req, res) => {
    res.json({data: "hello"});
});





// tao account
    app.post("/create-account", async (req, res) => {
        if (!req.body) {
            return res.status(400).json({ error: true, message: " rMissingequest body" });
        }
        const {fullName, email, password} = req.body;

        if (!fullName) {
            return res 
                .status(400)
                .json({error: true, message: "Họ và tên là bắt buộc"});
        }

        if (!email) {
            return res.status(400).json({error:true, message: "Email là bắt buộc"});

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
                message:"Người dùng đã tồn tại"
            });
        }

        const user = new User({
            fullName,
            email,
            password,
        });

        await user.save();

        const accessToken = jwt.sign({user}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "36000m"
        });

        return res.json ({
            error: false,
            user,
            accessToken,
            message: "Đăng ký thành công",
        });
    });

//login
app.post("/login", async (req, res) => {
     if (!req.body) {
            return res.status(400).json({message: " Email là bắt buộc" });
        }
    const {email, password} = req.body;

    if (!email) {
        return res.status(400).json({message: "Email là bắt buộc"});
    }
    if (!password) {
        return res.status(400).json({message: "Password là bắt buộc"});
    }

    const userInfo = await User.findOne({email: email});

    if (!userInfo) {
        return res.status(400).json({message: "User không tồn tại"})
    }

    if (userInfo.email == email && userInfo.password == password) {
        const user = { user: userInfo};
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn:"36000m"
        });

        return res.json({
            error: false,
            message:"Login Thành công",
            email,
            accessToken,
        });
    } else {
        return res.status(400).json({
            error:true,
            message: "Thông tin đăng nhập không hợp lệ"
        });
    }
})

//add note
app.post("/add-note", authenticateToken, async (req,res) => {
        const {title, content, tags} = req.body;
        const {user} = req.user;

        if(!title) {
            return res.status(400).json({error: true, message: "Title là bắt buộc"});
        }

        if (!content) {
            return res
                .status(400)
                .json({error: true, message: "Conntent là bắt buộc"});
        }

        try {
            const note = new Note({
                title,
                content,
                tags:tags || [],
                userId:user._id,
            });

            await note.save();

            return res.json({
                error: false,
                note,
                message:"Đã add note thành công",
            })

        } catch (error) {
            return res.status(500).json({
                error: true,
                message: "Internal Sever Error",
            })
        }
});

// edit note
app.put("/edit-note/:noteId", authenticateToken, async(req, res) => {
    const noteId = req.params.noteId;
    const {title, content, tags, isPinned} = req.body;
    const {user} = req.user;

    if (!title && !content && !tags) {
        return res
            .status(400)
            .json({error: true, message: "No changes provided"});
    }

    try {
        const note = await Note.findOne({_id: noteId, userId: user._id});

        if (!note) {
            return res.status(404).json({error:true, message: "Note không tồn tại"});
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (isPinned) nodemon.isPinned = isPinned;

        await note.save();

        return res.json({
            error: false,
            note,
            message: "Update Note thành công",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
})

//get all notes
app.get("/get-all-notes/", authenticateToken, async(req, res) => {
    const {user} = req.user;

    try {
        const notes = await Note.find({userId: user._id}).sort({isPinned: -1});
        return res.json({
            error: false,
            notes,
            message: "All notes retrieved successfully",
        });

    } catch (error) {
        return res.status(500).json({
            error:true,
            message: "Internal Server Error",
        })
    }
})

//Delete notes
app.delete("/delete-note/:noteId", authenticateToken, async(req, res) => {
    const noteId = req.params.noteId;
    const {user} = req.user;

    try {
        const note = await Note.findOne({_id: noteId, userId: user._id});

        if (!note) {
            return res.status(404).json({error:true, message: "Không tìm thấy note"});
        }

        await Note.deleteOne({_id: noteId,userId: user._id});

        return res.json ({
            error: false,
            message: "Xóa note thành công",
        });

    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
})
   

app.listen(8000);
module.exports = app;