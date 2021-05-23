////////////////////////////////////////////////////////////////////////
// databaseSetup.js -- backend functions for setting up the database
//                  
// Ryan Stolys, 14/09/20
//    - File Created
//
////////////////////////////////////////////////////////////////////////

const util = require('./utils');
const { Pool, Client } = require('pg');

//We need to create an environment variable with this string in our heroku environment
const pool = new Pool(
  {
  connectionString: process.env.DB_URL,
  ssl: { rejectUnauthorized: false }
  });


////////////////////////////////////////////////////////////////////////
// 
// This will handle all database queries indirectly                
//
////////////////////////////////////////////////////////////////////////
exports.queryDB = async (queryString, values, callbackFunction) => {
  
    var queryError = false; 

    var client = await pool.connect();      //Gain access to the database

    if(process.env.RECORD_TIME == true)
        console.time("db Start");

    try {
        result = await client.query(queryString, values).then(result =>
            {
            callbackFunction(result, false);
            })
        .catch(e => 
            {
            util.logERROR("queryDB(): " + e.message, e.code);
            util.logINFO("queryDB(): Notified caller of error");
        
            callbackFunction(null, e);
            queryError = true;
            }); 

        client.release();          //Remove connection to database
        
        if(process.env.RECORD_TIME == true)
            console.timeEnd("db Start");
        }
    catch (err) 
        {
        util.logERROR("queryDB(): An unknown error occured " + e.message, e.code);
        util.logINFO("queryDB(): Notified caller of error");

        callbackFunction(null, err);
        }
    }







