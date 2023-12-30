const mongoose = require("mongoose");

const postSchema=mongoose.Schema({
image:String,
title:String,
description:String,
likes:[
  {
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  }
],
comments:[
  {
    text:{type:String},
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"user"
    }
  }
],
user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"user"
    }
  
})


module.exports=mongoose.model("post",postSchema);