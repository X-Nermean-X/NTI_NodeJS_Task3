const jwt  = require("jsonwebtoken")
const Reporter = require("../models/reporter").Reporter

const auth = async (req, res, next)=>{
    try{
        console.log("Middleware Authentication")
        const token =  req.header("Authorization").replace("Bearer ", "")
        const decode = jwt.verify(token, "Secret key")
        const reporter = await Reporter.findById({_id:decode._id})
        req.reporter = reporter
        next()
    }
    catch(e){
        res.send({error: "Authentication failed"})
    }
}

module.exports=auth
