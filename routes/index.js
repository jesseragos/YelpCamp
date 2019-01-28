var express     = require("express");
var router      = express.Router();
var passport    = require("passport");
var User        = require("../models/user");

router.get("/", function(req, res) {
   res.render("landing");
});

/*  
    =====================
        AUTH ROUTES
    =====================
*/ 
// Show register form
router.get("/register", function(req, res) {
    res.render("register");
});

// Handle Sign up
router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    
    User.register(newUser, req.body.password, function(err, user){
        if(err) {
            req.flash("error", err.message);
            console.log(err);
            res.redirect("/register");
            // NOTE: req.flash(typename, message) works directly with redirects but not render
            // To accomodate renders, add {typename: message} as another param in render()
        }
        
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome " + user.username + ", thanks for joining YelpCamp");
           res.redirect("/campgrounds"); 
        });
    });
});

// Show login form
router.get("/login", function(req, res) {
    res.render("login");
});

// Handle login form
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true
    }), function(req, res) {
});

// Logout user
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Successfully logged out")
    res.redirect("/campgrounds");
});

/*  
    =====================================
        MIDDLEWARE/OTHER FUNCTIONS
    =====================================
*/ 

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    
    res.redirect("/login");
};

module.exports = router;