////////////////////////////////////////////////////////////
// server.js -- starts the server to allow for local devlopment 
//              and editting
//                   
// Denys Dziubii,	26/06/20
//    - File Created and configured
// Ryan Stolys, 14/09/20
//    - File organized, added references to modularization
//
////////////////////////////////////////////////////////////

global.users = false;

var express = require('express')
const app = express();
const bodyParser = require('body-parser');
var http = require('http');
var passport = require('passport');
const cookieParser = require('cookie-parser');
const LocalStrategy = require('passport-local').Strategy; // strategy for authenticating with a username and password
const session = require('express-session');
const bcrypt = require('bcryptjs');

////////////////////////////////////////////////////////////////////////
// GLOABL CONSTANTS AND VARIABLES
////////////////////////////////////////////////////////////////////////
const NOERROR = 0; 
const DATABASE_ACCESS_ERROR = 1; 
////////////////////////////////////////////////////////////////////////
// END OF GLOABL CONSTANTS AND VARIABLES
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
// REQUIRED BACKEND FUCNTIONS
////////////////////////////////////////////////////////////////////////
const database = require('./backend/databaseSetup');

const volunteer = require('./backend/volunteer');
const oppourtunity = require('./backend/oppourtunity');
const team = require('./backend/team');
const general = require('./backend/general');
const auth = require('./backend/authentification');
////////////////////////////////////////////////////////////////////////
// END OF REQUIRED BACKEND FUCNTIONS
////////////////////////////////////////////////////////////////////////

//
//Log start of server session
//
var server = app.listen(process.env.PORT || 5000, () => console.log(`Listening on 5000`));

////////////////////////////////////////////////////////////////////////
// EXPRESS AND PASSPORT SETUP
////////////////////////////////////////////////////////////////////////
app.set('view engine', 'ejs') // added by Denys

app.use(express.static(__dirname + '/public'));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(require('cookie-parser')())
app.use(cookieParser('secretString'));

app.use(session({
    secret: 'bulky keyboard',
    resave: true,
    cookie: { maxAge: 120000 },
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

////////////////////////////////////////////////////////////////////////
// END OF EXPRESS AND PASSPORT SETUP
////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////
// GET REQUESTS
////////////////////////////////////////////////////////////////////////
app.get('*', async function (req, res, next) { // universal access variable, keep working
    
    //Log status of user
    console.log("THE USER IS currently " + req.isAuthenticated());

    res.locals.user = req.user || null;
    var pwd = await bcrypt.hash("jayden", 5);
    console.log(pwd);
    if (res.locals.user != null) 
        {
        console.log("the user is");
        console.log(res.locals.user);
        }
        
    next();
})


app.get('/', function(request, response){
	if(request.isAuthenticated())
		response.redirect('home');
  else
  	response.redirect('signIn');
});

app.get('/home', auth.authcheck, function(request, response){
  response.render('pages/home', { home: true, opps: false, volunt: false, teams: false});
});

app.get('/volunteers', auth.authcheck, function(request, response){
  response.render('pages/volunteers', { home: false, opps: false, volunt: true, teams: false});
});

app.get('/oppourtunities', auth.authcheck, function(request, response){
  response.render('pages/oppourtunities', { home: false, opps: true, volunt: false, teams: false});
});

app.get('/teams', auth.authcheck, function(request, response){
  response.render('pages/teams', { home: false, opps: false, volunt: false, teams: true});
});

app.get('/signIn', function(request, response){
  console.log('Logout Request Recieved');
  response.render('pages/signIn', { 'message': ''});
});

app.get('/logout', auth.authcheck, function (req, res) {
    req.logout();             //Logout user using passport
    console.log("Upon logout user status is " + req.isAuthenticated());     //log new status of user
    res.redirect('/');        //Redirect to signIn page
});
////////////////////////////////////////////////////////////////////////
// END OF GET REQUESTS
////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////
// POST REQUESTS
////////////////////////////////////////////////////////////////////////

/////////GENERAL REQUESTS///////////////////////////////////////////////
app.post('/getInstitutionStats', auth.authcheck, async (request, response) =>
    {
    //get the users authentification info including volunteerID
    response.send(await general.getInstitutionStats(request.user[0].volunteer_id));
    });


/////////OPPOURTUNITY REQUESTS//////////////////////////////////////////
app.post('/getOpportunityData', auth.authcheck, async (request, response) =>
    {
    //get the users authentification info including volunteerID
    response.send(await oppourtunity.getOpportunityData(request.user[0].volunteer_id, request.oppourtunityID));
    });


app.post('/getOpportunityInfo', auth.authcheck, async (request, response) =>
    {
    //get the users authentification info including volunteerID
    response.send(await oppourtunity.getOpportunityInfo(request.user[0].volunteer_id, request.oppourtunityID));
    });


app.post('/addOppourtunity', auth.authcheck, async (request, response) =>
    {
    //get the users authentification info including volunteerID
    response.send(await oppourtunity.addOppourtunity(request.user[0].volunteer_id, request.oppData));
    });


app.post('/editOppourtunity', auth.authcheck, async (request, response) =>
    {
    //get the users authentification info including volunteerID
    response.send(await oppourtunity.editOppourtunity(request.user[0].volunteer_id, request.oppData));
    });


app.post('/getOppourtunityTypes', auth.authcheck, async (request, response) =>
    {
    //get the users authentification info including volunteerID
    response.send(await oppourtunity.getOppourtunityTypes(request.user[0].volunteer_id));
    });


app.post('/addOppourtunityType', auth.authcheck, async (request, response) =>
    {
    //get the users authentification info including volunteerID
    response.send(await oppourtunity.addOppourtunityType(request.user[0].volunteer_id, request.oppourtunityType));
    });


app.post('/getTeamsForViewable', auth.authcheck, async (request, response) =>
    {
    //get the users authentification info including volunteerID
    response.send(await oppourtunity.getTeamsForViewable(request.user[0].volunteer_id));
    });



/////////VOLUNTEER REQUESTS/////////////////////////////////////////////
app.post('/getVolunteerData', auth.authcheck, async (request, response) =>
    {
    //get the users authentification info including volunteerID
    response.send(await volunteer.getVolunteerData(request.user[0].volunteer_id, request.volunteerID));
    });


app.post('/getVolunteerInfo', auth.authcheck, async (request, response) =>
    {
    //get the users authentification info including volunteerID
    response.send(await volunteer.getVolunteerInfo(request.user[0].volunteer_id, request.volunteerID));
    });




/////////TEAM REQUESTS//////////////////////////////////////////////////
app.post('/getTeamData', auth.authcheck, async (request, response) =>
    {
    //get the users authentification info including volunteerID
    response.send(await team.getTeamData(request.user[0].volunteer_id, request.teamID));
    });


app.post('/getTeamInfo', auth.authcheck, async (request, response) =>
    {
    //get the users authentification info including volunteerID
    response.send(await team.getTeamInfo(request.user[0].volunteer_id, request.teamID));
    });



/////////AUTHENTICATION REQUESTS////////////////////////////////////////
app.post('/signIn', passport.authenticate('local'), async function (request, response) {
  // post method was specified in signIn.ejs form
  console.log("The user is being authenticated: " + request.isAuthenticated());
  console.log("The user is currently written below");
  console.log(request.session.passport.user);

  if (request.body.remember) {
      request.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
  }
  else {
      request.session.cookie.expires = false; // Cookie expires at end of session
  }


  //If user is logged in, send them to homepage
  if(request.isAuthenticated()) {
    //Send user to homepage
    response.redirect('home');
  }
});
////////////////////////////////////////////////////////////////////////
// END OF POST REQUESTS
////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////
// PASSPORT AUTHENTIFICATION FUNCTIONS
////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////
//
// Authenticate users using passport
//
// idea for using session based login came from a medium article https://medium.com/@timtamimi/getting-started-with-authentication-in-node-js-with-passport-and-postgresql-2219664b568c
//
////////////////////////////////////////////////////////////////////////
passport.use('local', new LocalStrategy({ passReqToCallback: true }, (req, username, password, done) => {

  loginAttempt();
  async function loginAttempt() {

      try {
		console.log("CURRENT USERNAME IS " + username);
		database.queryDB('SELECT firstname, lastname, volunteer_id, email, password FROM volunteer WHERE firstname=\'' + username + '\';', function (err, result) {
  
			if (err) {
			  console.log('Error Occured: ');
			  return done(err)
			}

			if (result.rows[0] == null) {
			  console.log("Oops. Incorrect login details.");
			  return done(null, false, { message: 'No user found' });
			}
			else {

                bcrypt.compare(password, result.rows[0].password, function (err, isMatch) {
                	if (err) throw err;
					else if (isMatch) {
					  console.log("Passwords matched!");
					  return done(null, [{ firstname: result.rows[0].firstname, volunteer_id: result.rows[0].volunteer_id, email: result.rows[0].email }]);
					}
					else {
					  console.log("Oops. Incorrect login details.");
					  return done(null, false);
                  	}
              	});
          	};
        })
       }
      catch (e) { throw (e); }
  };
}
))


////////////////////////////////////////////////////////////////////////
//
// Used by passport
//
////////////////////////////////////////////////////////////////////////
passport.serializeUser(function (user, done) {
  //console.log(user);
  done(null, user);
});

////////////////////////////////////////////////////////////////////////
//
// Used by passport
//
////////////////////////////////////////////////////////////////////////
passport.deserializeUser(function (user, done) {
  //console.log("deserial" + user);
  done(null, user);
});

////////////////////////////////////////////////////////////////////////
// END OF PASSPORT AUTHENTIFICATION FUNCTIONS
////////////////////////////////////////////////////////////////////////