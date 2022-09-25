const mongoose = require("mongoose")
const validator = require("validator")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")

const Reporter_schema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true ,
        validate(email){
            if(!validator.isEmail(email)){
                throw new Error("Email is invalid")
            }
        }
    },
    age:{
        type: Number,
        required: true,
        validate(age_value){
            if(age_value<0){
                throw new Error("Age is invalid")
            }
        }
    },
    password:{
        type: String,
        required: true,
        validate(pass){
            if(!pass.match(/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,})/)){
                throw new Error("You have to enter a strong password.")
            }
        }
    },
    phone:{
        type: String,
        required: true,
        validate(phone_number){
            if(!phone_number.match(/^01[0125][0-9]{8}$/)){
                throw new Error("Invalid phone number.")
            }
        }
    },
    image:{
        type:Buffer
    }
}, {timestamps: true})

Reporter_schema.pre("save", async function(next){ 
    if(this.isModified("password")){ 
        this.password = await bcryptjs.hash(this.password, 8)
    }
})

Reporter_schema.statics.find_by_credentials = async (email, password)=>{
    const reporter = await Reporter.findOne({email}) // shorthand
    console.log(reporter)
    if(!reporter){
        throw new Error ("No matching email")
    }
    const matching = await bcryptjs.compare(password, reporter.password)
    if(!matching){
        throw new Error("Incorrect password")
    }
    return reporter
}

// // creating token
Reporter_schema.methods.generate_Token = function(){ 
    console.log(this)
    const token = jwt.sign({_id:this._id.toString()}, "Secret key")
    return token
}

// // Virtual Relation between Reporter and News:
Reporter_schema.virtual("virtual_relation_1", {
    // common property between Reporter and News in the database
    localField:"_id",
    foreignField:"r",
    ref:"News"
})



const Reporter = mongoose.model("Reporter", Reporter_schema)
module.exports = {
    Reporter,
}