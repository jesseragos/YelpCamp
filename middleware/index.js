var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    // Is user logged in
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground) {
           if(err || !foundCampground){
               req.flash("error", "Campground not found");
               res.redirect("/campgrounds");
           } else {
                // does user own the campground 
                // cannot use === as they are of different types
               if(foundCampground.author.id.equals(req.user._id)){
                    next();
               } else {
                    res.redirect("back");  //  this will send user back to recent page
               }
           }
        });
    } else {
         res.redirect("back");  //  this will send user back to recent page
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    // Is user logged in
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment) {
           if(err || !foundComment){
               req.flash("error", "Campground not found");
               res.redirect("/campgrounds");
           } else {
                // does user own the comment 
                // cannot use === as they are of different types
               if(foundComment.author.id.equals(req.user._id)){
                    next();
               } else {
                   req.flash("error", "You don't have permission to do that");
                   res.redirect("back");  //  this will send user back to recent page
               }
           }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");  //  this will send user back to recent page
    }
}

middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    
    // First param is a secret code value then the message
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;