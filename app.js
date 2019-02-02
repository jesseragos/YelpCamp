var express             = require("express"),
    app                 = express(),
    bodyParser          = require("body-parser"),
    mongoose            = require("mongoose"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    LocalStrategy       = require("passport-local"),
    methodOverride      = require("method-override"),
    User                = require("./models/user"),
    seedDB              = require("./seeds");
    
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes         = require("./routes/index");

/*
    =====================
    MONGODB SETUP
    =====================
*/
// Empty and seed DB
// seedDB();

// Connect/Create yelp_camp db 
// mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true });
// mongoose.connect("mongodb://jkieluser1:jkielpword1@ds013014.mlab.com:13014/yelpcamp_jkiel9", { useNewUrlParser: true });
require('dotenv').config();
var dbUrl = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
mongoose.connect(dbUrl, { useNewUrlParser: true });
console.log("DB in use: " + dbUrl);
/*
    =====================
    EXPRESS SETUP
    =====================
*/
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + "/public"));

app.use(methodOverride("_method"));

// use Flash for Express
app.use(flash());

app.set("view engine", "ejs");

/*
    =====================
    EXPRESS SESSION CONFIG
    =====================
*/
app.use(require("express-session")({
    secret: "This is a secret",
    resave: false,
    saveUninitialized: false
}));

/*
    =====================
    PASSPORT SESSION CONFIG
    =====================
*/
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Add middleware function to all templates rendered
app.use(function(req, res, next){
    res.locals.currentUser = req.user;  //  Save user to local environment of template for access
    res.locals.error = req.flash("error");    //  Make flash message available at locals
    res.locals.success = req.flash("success");
    next();
});

/*
    =====================
    IMPORT ROUTES FILES
    =====================
*/
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

/*  
    =====================
        CALLBACK ROUTE
    =====================
*/ 
app.get("*", function(req, res) {
   res.send("ThiS pAgE has Error: " + res.statusCode);
});

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Server Started..."); 
});