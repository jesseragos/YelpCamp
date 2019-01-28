var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
// No need to specify index.js as its the default file to import
var middleware = require("../middleware");

// Shows page of posted campggrounds
router.get("/", function(req, res) {
    // Get all data from DB and send to campgrounds page
    Campground.find({}, function(err, allCampgrounds){
       if(err || !allCampgrounds) {
           req.flash("error", "Issue occurred while showing all campgrounds");
           res.redirect("back");
       } else {
           res.render("campgrounds/index", {campgrounds: allCampgrounds});
       }
    });
   
});

// Processes body request as a post to be saved in DB then redirect to GET campgrounds page
router.post("/", middleware.isLoggedIn, function(req, res) {
   // get data from form and add it to cg array
   var name = req.body.name;
   var image = req.body.image;
   var price = req.body.price;
   var description = req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   };
   var newCampground = {name: name, price: price, image: image, description: description, author: author};
   
    //  Create a new campground and save to DB
   Campground.create(newCampground,
        // call back function
        function(err, campground) {
            if(err || !campground) {
                req.flash("error", "Issue occurred while creating campground");
                res.redirect("back");
            } else {
                // redirect to campgrounds   
                req.flash("success", "Successfully added campground");
                res.redirect("campgrounds");
            }
        }
    );
   
});

//  Shows page for creating campground post
router.get("/new", middleware.isLoggedIn, function(req, res) {
   res.render("campgrounds/new");
});

//  Shows info page about a clicked campground
router.get("/:id", function(req, res) {
    //   find the campgound with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
       if(err || !foundCampground) {
           req.flash("error", "Issue occurred while showing campground");
           res.redirect("/campgrounds");
       }  else {
            //   show template with that campground
           res.render("campgrounds/show", {campground: foundCampground});
       }
    });
   
});

// Show Edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err || !foundCampground) {
            req.flash("error", "Issue occurred while editing campground");
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

// Update campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err || !updatedCampground) {
            req.flash("error", "Issue occurred while saving edit of campground");
            res.redirect("/campgrounds");
        } else {
            // redirect to show page
            req.flash("success", "Successfully edited campground");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// Destroy Campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
   Campground.findByIdAndRemove(req.params.id, function(err){
       if(err) {
           req.flash("error", "Issue occurred while deleting campground");
           res.redirect("/campgrounds");
       } else {
           req.flash("success", "Successfully deleted campground");
           res.redirect("/campgrounds");
       }
   });
});

module.exports = router;