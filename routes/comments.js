var express = require("express");
var router = express.Router({mergeParams: true});   // merge params from campgrounds route and comments route 
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//  Shows info page about a clicked campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    //   find the campgound with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
      if(err || !foundCampground) {
          req.flash("error", "Issue occurred while creating comment");
          res.redirect("back");
      }  else {
            //   show template with that comment
           res.render("comments/new", {campground: foundCampground});
      }
    });
   
});

//  Create comment of campground
router.post("/", middleware.isLoggedIn, function(req, res) {
    //   find the campgound with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
      if(err || !foundCampground) {
          req.flash("error", "Issue occurred while saving created comment");
          res.redirect("back");
      }  else {
          console.log(req.body.comment);
            //   Create a comment
            Comment.create(req.body.comment, function(err, comment) {
                if(err || !comment) {
                      res.redirect("back");
                }  else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save commit
                    comment.save();
                    
                    // Add comment to campground then save
                    foundCampground.comments.push(comment);
                    foundCampground.save();
                    
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + foundCampground._id);
                }
            })
      }
    });
   
});

// Show Edit comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err || !foundComment) {
            req.flash("error", "Issue occurred while editing of comment");
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    })
});

// Update comment
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    // find and update the correct comment
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err || !updatedComment) {
            req.flash("error", "Issue occurred while saving edit of comment");
            res.redirect("back");
        } else {
            // redirect to show page
            req.flash("success", "Successfully edited comment");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// Delete comment
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    // find and delete the correct comment
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err) {
           req.flash("error", "Issue occurred while deleting comment");
           res.redirect("back");
       } else {
           req.flash("success", "Successfully deleted comment");
           res.redirect("/campgrounds/" + req.params.id);
       }
   });
});

module.exports = router;