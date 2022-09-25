const mongoose = require("mongoose")
const validator = require("validator")

const Reporter = require("./reporter").Reporter

const News = mongoose.model("News", {
    title:{
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    description:{
        type: String,
        required: true,
        trim: true,
        minlength: 12
    },
    image:{
        type:Buffer,
        // required: true,
    },
    r:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:Reporter
    },
})

module.exports = {
    News,
}