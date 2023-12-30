var express = require('express');
var router = express.Router();
const userModel=require("./users");
const postModel=require("./posts");
const passport = require('passport');
const localStrategy=require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
const upload=require("./multer");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/profile', isLoggedIn ,async function(req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user}).populate("posts");
  res.render('profile',{user});
});

router.get('/likes:id', isLoggedIn ,async function(req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user});
  const post = await postModel.findOne({_id:req.params.id});
  if(post.likes.indexOf(user._id)=== -1){
    post.likes.push(user._id);
  }
  else{
    post.likes.splice(post.likes.indexOf(user._id),1);
  }
  await post.save();
  res.redirect("/feed");
});

router.post('/comments/:id', isLoggedIn ,async function(req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user});
  const post = await postModel.findOne({_id:req.params.id}).populate('comments.user');
  post.comments.push({
    text:req.body.cmnt,
    user:user._id
  })
  await post.save();
  res.redirect("/feed");
});

router.post('/profileupload', isLoggedIn ,upload.single("profile"),async function(req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user});
  user.profileimage=req.file.filename;
  await user.save();
  res.redirect('/profile');
});

router.post('/coverupload', isLoggedIn ,upload.single("cover"),async function(req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user});
  user.coverphoto=req.file.filename;
  await user.save();
  res.redirect('/profile');
});


router.get('/register', function(req, res, next) {
  res.render('register');
});

router.get('/add', function(req, res, next) {
  res.render('add');
});

router.get('/feed',isLoggedIn, async function(req, res, next) {
  const user=await userModel.findOne({username:req.session.passport.user});
  const post=await postModel.find().populate("user");
  res.render('feed',{user,post});
});


router.post('/register',function(req,res){
  const userData = new userModel({
    firstname:req.body.firstname,
    lastname:req.body.lastname,
    username:req.body.username,
    gender:req.body.gender
  });
  userModel.register(userData,req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect('/feed');
    })
  })
})

router.post('/login',passport.authenticate("local",{
  successRedirect:"/feed",
  failureRedirect:"/login"
}),function(req,res){
})

router.get('/logout',function(req,res,next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

router.post('/createpost',isLoggedIn,upload.single("image") ,async function(req,res,next){
  const user=await userModel.findOne({username:req.session.passport.user});
  const post = await postModel.create({
    image:req.file.filename,
    title:req.body.title,
    description:req.body.desc,
    user:user._id
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile")
})


module.exports = router;
