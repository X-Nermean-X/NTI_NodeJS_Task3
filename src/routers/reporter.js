const express = require('express');
const router = express.Router() 
//////////////////////////////////////////////////////////////////////////////////////
const Reporter = require("../models/reporter").Reporter
//////////////////////////////////////////////////////////////////////////////////////
const auth = require("../middleware/auth")
//////////////////////////////////////////////////////////////////////////////////////
const multer = require("multer")
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
const upload = multer({
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            cb(new Error("Please upload a valid image extension", null)) // error:"Please....",    data:null
        }
        else{
            cb(null, true) // error: null,  data:true
        }
    }
})

router.post("/create_profile_image", auth, upload.single("avatar"), async(req, res)=>{
    try{
        req.reporter.image = req.file.buffer
        await req.reporter.save()
        res.send("Image uploaded successfully!")            
    }
    catch(e){
        res.send(e.message)
    }
})
//////////////////////////////////////////////////////////////////////////////////////
// sign up
router.post("/signup", async(req, res)=>{
    try{
        const reporter = new Reporter(req.body)
        await reporter.save()
        const token = reporter.generate_Token()
        res.send({reporter, token})
    }
    catch(e){
        res.send(e.message)
    }
})
// log in
router.post("/login", async(req, res)=>{
    try{
        const reporter = await Reporter.find_by_credentials(req.body.email, req.body.password)
        const token = reporter.generate_Token()
        res.send({reporter, token})
    }
    catch(e){
        res.send(e.message)
    }
})
// see profile
router.get("/profile", auth, (req, res) =>{
    res.send(req.reporter)
})
// update profile
router.patch("/update", auth, async(req, res)=>{
    const updates = Object.keys(req.body)
    try{
        if(!req.reporter){
            console.log("Profile not found!")
        }
        else{
            updates.forEach( (el) => req.reporter[el]=req.body[el] )
            await req.reporter.save()
            res.send(req.reporter)
        }
    }
    catch(e){
        res.send(e.message)
    }
})
// delete profile
router.delete('/delete', auth, async(req, res)=>{
    try{
        if(!req.reporter){
            console.log("Profile not found!")
        }
        else{
            await req.reporter.remove()
            res.send("Profile is Deleted")
        }
    }
    catch(e){
        res.send(e.message)
    }
})

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
const News = require("../models/news").News
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
// post news with image
router.post("/create_news_img", auth, upload.any("image"), async (req, res)=>{
    try{
        // data
        const news = new News({...req.body,r:req.reporter._id,})
        await news.save()
        // image
        req.news.image = req.file.buffer
        await req.news.save()
        
        res.send("Data saved successfully!")
    }
    catch(e){
        res.send(e.message)
    }
})
// post news without image
router.post("/create_news", auth, async (req, res)=>{
    try{
        const news = new News({...req.body,r:req.reporter._id,})
        await news.save()  
        res.send("Data saved successfully!")
    }
    catch(e){
        res.send(e.message)
    }
})
// get all News by Reporter X
router.get("/read_news", auth, (req, res) => {
    News.find({}).then((data)=>{
        res.send(data)
    }).catch( (e) => {res.send(e)} )
})
// get all  News  by Reporter/r >> using virtual relation
router.get("/virtual_relation_1", auth, async(req, res)=>{
    try{
        console.log(req.reporter)
        console.log(req.reporter.name)
        await req.reporter.populate("virtual_relation_1")
        res.send(req.reporter.virtual_relation_1)
    }
    catch(e){
        res.send(e)
    }
})
// get one specific news (of reporter x) by id
router.get("/read_news/:id", auth, (req, res) => {
    const _id = req.params.id
    console.log(req.reporter)
    News.findOne({_id, r:req.reporter._id}).then((data)=>{
        if(!data){
            res.send("News not found")
        } 
        else{
            res.send(data)
        }
    }).catch( (e) => {res.send(e)} )
})
// update news by reporter x
router.patch("/update_news/:id", auth, async(req, res)=>{
    try{
        const _id = req.params.id
        const data = await News.findOneAndUpdate({_id, r:req.reporter._id}, req.body, {
            new: true,
            runValidators: true
        })
        if(!data){
            res.send("News not found")
        }
        else{
            res.send(data)
        }
    }
    catch(e){ res.send(e.message) }
})
// delete news by reporter x
router.delete("/delete_news/:id", auth, async(req, res)=>{
    try{
        const _id = req.params.id
        const data = await News.findOneAndDelete({_id, r:req.reporter._id})
        if(!data){
            res.send("News not found")
        }
        else{
            res.send(data)
        }
    }
    catch(e){ res.send(e.message) }
})
//////////////////////////////////////////////////////////////////////////////////////
// Getting the info of the Reporter/r who wrote this News (by news id):
router.get("/read_news_reporter/:_id", auth, async(req, res)=>{
    try{
        const _id = req.params._id
        const news = await News.findById(_id)
        if(!news){
            return res.send("News not found")
        }
        else{
            await news.populate("r")
            res.send(news.r)
        }
    }
    catch(e){
        res.send(e.message)
    }
})
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
module.exports = router