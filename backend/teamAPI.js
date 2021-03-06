////////////////////////////////////////////////////////////////////////
// team.js -- backend functions for team related requests
//                  
// Ryan Stolys, 14/09/20
//    - File Created
// Jayden Cole, 18/01/21
//    - Update to current design documentation
//
////////////////////////////////////////////////////////////////////////

const database = require('./databaseSetup');
const util = require('./utils');
const error = require('./errorCodes');
const enumType = require('./enumTypes');


////////////////////////////////////////////////////////////
// Will get the team info
//
// @param[in]  user                 user information
// @param[in]  teamID               ID of team the client is looking for detail on
//                                  value of -1 means all values are of interest
//
// @param[out] volunteerInfo        Array of data JSONs for client  
//
////////////////////////////////////////////////////////////
exports.getTeamInfo = async (user, teamID) => 
    {
    var response = {success: false, errorcode: -1, teamInfo: []};
    var query = "";
    var values = [];
    var goodQuery = true;

    try 
        {
        util.logINFO("getTeamInfo(): called by: " + user.volunteer_id + " for teamID " + teamID);
        
        //Set the query
        query =  "SELECT T.team_id AS id, T.name AS name, T.sex as sex, numhours, numvolunteers"
        query += " FROM team AS T"
        query += " LEFT JOIN (SELECT team_id, COUNT(*) as numvolunteers, SUM(num_hours) AS numhours FROM volunteer_stats GROUP BY team_id) vstat"
        query += " ON vstat.team_id = T.team_id"
        query += " WHERE T.institution_id = $1 AND T.team_id != 0";        //Want to remove the admin team from the list

        values.push(user.institution_id);

        if(teamID == -1 && (user.volunteer_type == enumType.VT_DEV || user.volunteer_type == enumType.VT_ADMIN))
            {
            query += "ORDER BY T.name DESC;";
            }
        else if(teamID > 0)
            {
            query += " AND T.team_id = $2;";

            values.push(teamID);
            }
        else 
            {
            response.teamInfo = null;
            response.errorcode = error.PERMISSION_ERROR;
            response.success = false;
            goodQuery = false;
            util.logWARN("getTeamInfo(): Set errorcode to: " + error.PERMISSION_ERROR, error.PERMISSION_ERROR);
            }

        //Run query if query is valid
        if(goodQuery)
            {
            await database.queryDB(query, values, (res, e) => 
                { 
                if(e) 
                    {
                    response.teamInfo = null;
                    response.errorcode = error.DATABASE_ACCESS_ERROR;
                    response.success = false;
                    util.logWARN("getTeamInfo(): Set errorcode to: " + error.DATABASE_ACCESS_ERROR, error.DATABASE_ACCESS_ERROR);
                    }
                else 
                    {
                    //Send the list of available teams to the user
                    response.teamInfo = res.rows;
                    response.errorcode = error.NOERROR;
                    response.success = true;
                    }
                });
            }
        }
    catch (err)
        {
        response.errorcode = error.SERVER_ERROR;
        response.teamInfo = null;
        response.success = false;

        util.logWARN("getTeamInfo(): Set errorcode to: " + error.SERVER_ERROR, error.SERVER_ERROR);
        util.logERROR("getTeamInfo(): " + err.message, err.code);
        }

    //Log completion of function
    util.logINFO("getTeamInfo(): Result is: " + response.success);

    return response;
    }


////////////////////////////////////////////////////////////
// Will get all the team info
//
// @param[in]  institution_id       institution_id to get teams for
//
// @param[out] teamInfo             Array of data JSONs for client  
//
////////////////////////////////////////////////////////////
exports.getAllTeamInfo = async (institution_id) => 
    {
    var response = {success: false, errorcode: -1, teamInfo: []};
    var query = "";
    var values = [];

    try 
        {
        util.logINFO("getAllTeamInfo(): called");

        query = "SELECT team_id AS id, name, sex FROM team WHERE institution_id = $1 AND team_id != 0;";

        values.push(institution_id);

        await database.queryDB(query, values, (res, e) => 
            { 
            if(e) 
                {
                response.teamInfo = [{id: null, name: "No Team's Availible", sex: "" }];
                response.errorcode = error.DATABASE_ACCESS_ERROR;
                response.success = false;
                util.logWARN("getAllTeamInfo(): Set errorcode to: " + error.DATABASE_ACCESS_ERROR, error.DATABASE_ACCESS_ERROR);
                util.logINFO("getAllTeamInfo(): Provided default value in return");
                }
            else 
                {
                response.teamInfo = res.rows;
                response.errorcode = error.NOERROR;
                response.success = true;
                }
            });
        }
    catch (err)
        {
        response.errorcode = error.SERVER_ERROR;
        response.teamInfo = [{id: null, name: "No Team's Availible", sex: "" }];
        response.success = false;

        util.logWARN("getAllTeamInfo(): Set errorcode to: " + error.SERVER_ERROR, error.SERVER_ERROR);
        util.logERROR("getAllTeamInfo(): " + err.message, err.code);
        util.logINFO("getAllTeamInfo(): Provided default value in return");
        }

    //Log completion of function
    util.logINFO("getAllTeamInfo(): Result is: " + response.success);

    return response;
    }


////////////////////////////////////////////////////////////
// Will get the team data
//
// @param[in]  user             user information
// @param[in]  teamID           ID of team client is looking for detail on
//                                  value of -1 means all values are of interest
//
// @param[out] volunteerData    Array of data JSONs for client  
//
////////////////////////////////////////////////////////////
exports.getTeamData = async (user, teamID) => 
    {
    var response = {success: false, errorcode: -1, teamData: null};
    var query = "";
    var values = [];
    var query2 = "";
    var values2 = [];

    try 
        {
        util.logINFO("getTeamData(): called by: " + user.volunteer_id + " for teamID: " + teamID);

        //Set the query
        query =  "SELECT T.team_id AS id, T.name AS name, T.sex as sex, vstat.numhours, vstat.numvolunteers, T.leaderboard"
        query += " FROM team AS T";
        query += " LEFT JOIN (SELECT team_id, COUNT(*) as numvolunteers, SUM(num_hours) AS numhours FROM volunteer_stats GROUP BY team_id) vstat"
        query += " ON vstat.team_id = T.team_id"
        query += " WHERE T.team_id = $1;"

        values.push(teamID);

        await database.queryDB(query, values, (res, e) => 
            { 
            if(e) 
                {
                response.errorcode = error.DATABASE_ACCESS_ERROR;
                response.success = false;
                util.logWARN("getTeamData(): Set errorcode to: " + error.DATABASE_ACCESS_ERROR, error.DATABASE_ACCESS_ERROR);
                }
            else 
                {
                response.teamData = res.rows[0];
                response.errorcode = error.NOERROR;
                response.success = true;
                }
            });

        //If the above query was successful - get the volunteer information
        if(response.success)
            {
            query2 =  "SELECT V.volunteer_id AS id, CONCAT(V.firstname, ' ', V.lastname) AS name, V.email, V.username,";
            query2 += " CONCAT(T.sex, ' - ', T.name) AS teamname, V.team_id, V.leaderboards, VS.num_hours AS numhours";
            query2 += " FROM volunteer AS V";
            query2 += " LEFT JOIN team AS T ON T.team_id = V.team_id";
            query2 += " LEFT JOIN volunteer_stats AS VS ON VS.volunteer_id = V.volunteer_id";
            query2 += " WHERE V.volunteer_type != $1 AND V.institution_id = $2";
            query2 += " AND V.team_id = $3;";

            values2.push(enumType.VT_DEV);
            values2.push(user.institution_id);
            values2.push(teamID);

            await database.queryDB(query2, values2, (res, e) => 
                { 
                if(e) 
                    {
                    response.errorcode = error.DATABASE_ACCESS_ERROR;
                    response.success = false;
                    util.logWARN("getTeamData(): Set errorcode to: " + error.DATABASE_ACCESS_ERROR, error.DATABASE_ACCESS_ERROR);
                    }
                else 
                    {
                    response.teamData['volunteers'] = res.rows;
                    response.errorcode = error.NOERROR;
                    response.success = true;
                    }
                });
            }
        }
    catch (err)
        {
        response.errorcode = error.SERVER_ERROR;
        response.teamData = null;
        response.success = false;

        util.logWARN("getTeamData(): Set errorcode to: " + error.SERVER_ERROR, error.SERVER_ERROR);
        util.logERROR("getTeamData(): " + err.message, err.code);
        }

    //Log completion of function
    util.logINFO("getTeamData(): Result is: " + response.success);

    return response;
    }


////////////////////////////////////////////////////////////
// Will edit the team to database
//
// @param[in]  user                     user information
// @param[in]  teamData                 Data of team to be added
//
// @param[out] {success, errorcode}     return variables indicating the success or failure of the request 
//
////////////////////////////////////////////////////////////
exports.editTeam = async (user, teamData) => 
    {
    var response = {success: false, errorcode: -1};
    var query = "";
    var values = [];

    try 
        {
        util.logINFO("editTeam(): called by: " + user.volunteer_id);

        //Set the query to update the information
        query =  "UPDATE team SET";
        query += " name = $1, sex = $2, leaderboard = $3";
        query += " WHERE team_id = $4;";

        values.push(teamData.name);
        values.push(teamData.sex);
        values.push(teamData.leaderboard);
        values.push(teamData.id);

        //Verify the user has valid permissions
        if(user.volunteer_type == enumType.VT_ADMIN || user.volunteer_type == enumType.VT_DEV)
            {
            await database.queryDB(query, values, (res, e) => 
                { 
                if(e) 
                    {
                    response.errorcode = error.DATABASE_ACCESS_ERROR;
                    response.success = false;
                    util.logWARN("editTeam(): Set errorcode to: " + error.DATABASE_ACCESS_ERROR, error.DATABASE_ACCESS_ERROR);
                    }
                else 
                    {
                    response.errorcode = error.NOERROR;
                    response.success = true;
                    }
                });
            }
        else 
            {
            response.errorcode = error.PERMISSION_ERROR;
            response.success = false;
            util.logWARN("editTeam(): User is of type: " + user.volunteer_type, error.PERMISSION_ERROR);
            }
        }
    catch (err)
        {
        response.errorcode = error.SERVER_ERROR;
        response.success = false;

        util.logWARN("editTeam(): Set errorcode to: " + error.SERVER_ERROR, error.SERVER_ERROR);
        util.logERROR("editTeam(): " + err.message, err.code);
        }

    //Log completion of function
    util.logINFO("editTeam(): Result is: " + response.success);
    
    return response;
    }


////////////////////////////////////////////////////////////
// Will add the team to database
//
// @param[in]  user                     user information
// @param[in]  teamData                 Data of team to be added
//
// @param[out] {success, errorcode}     return variables indicating the success or failure of the request 
//
////////////////////////////////////////////////////////////
exports.addTeam = async (user, teamData) => 
    {
    var response = {success: false, errorcode: -1};
    var query = "";
    var values = [];

    try 
        {
        util.logINFO("addTeam(): called by: " + user.volunteer_id);

        //Set the query to update the information
        query =  "INSERT INTO team(institution_id, name, leaderboard, sex)";
        query += " VALUES($1, $2, $3, $4);";

        values.push(user.institution_id);
        values.push(teamData.name);
        values.push(teamData.leaderboard);
        values.push(teamData.sex);

        //Verify the user has valid permissions
        if(user.volunteer_type == enumType.VT_ADMIN || user.volunteer_type == enumType.VT_DEV)
            {
            await database.queryDB(query, values, (res, e) => 
                { 
                if(e) 
                    {
                    response.errorcode = error.DATABASE_ACCESS_ERROR;
                    response.success = false;
                    util.logWARN("addTeam(): Set errorcode to: " + error.DATABASE_ACCESS_ERROR, error.DATABASE_ACCESS_ERROR);
                    }
                else 
                    {
                    response.errorcode = error.NOERROR;
                    response.success = true;
                    }
                });
            }
        else 
            {
            response.errorcode = error.PERMISSION_ERROR;
            response.success = false;
            util.logWARN("addTeam(): User is of type: " + user.volunteer_type, error.PERMISSION_ERROR);
            }
        }
    catch (err)
        {
        response.errorcode = error.SERVER_ERROR;
        response.success = false;

        util.logWARN("addTeam(): Set errorcode to: " + error.SERVER_ERROR, error.SERVER_ERROR);
        util.logERROR("addTeam(): " + err.message, err.code);
        }

    //Log completion of function
    util.logINFO("addTeam(): Result is: " + response.success);
    
    return response;
    }


////////////////////////////////////////////////////////////
// Will add the team to database
//
// @param[in]  user                     user information
// @param[in]  teamData                 Data of team to be added
//
// @param[out] {success, errorcode}     return variables indicating the success or failure of the request 
//
////////////////////////////////////////////////////////////
exports.deleteTeam = async (user, teamID) => 
    {
    var response = {success: false, errorcode: -1};
    var query = "";
    var values = [];

    try 
        {
        util.logINFO("deleteTeam(): called by: " + user.volunteer_id + " for team: " + teamID);

        //Set the query to delete the team
        query =  "DELETE FROM team WHERE team_id = $1;";

        values.push(teamID);

        //Verify the user has valid permissions
        if(user.volunteer_type == enumType.VT_ADMIN || user.volunteer_type == enumType.VT_DEV)
            {
            await database.queryDB(query, values, (res, e) => 
                { 
                if(e) 
                    {
                    response.errorcode = error.DATABASE_ACCESS_ERROR;
                    response.success = false;
                    util.logWARN("deleteTeam(): Set errorcode to: " + error.DATABASE_ACCESS_ERROR, error.DATABASE_ACCESS_ERROR);
                    }
                else 
                    {
                    response.errorcode = error.NOERROR;
                    response.success = true;
                    }
                });
            }
        else 
            {
            response.errorcode = error.PERMISSION_ERROR;
            response.success = false;
            util.logWARN("deleteTeam(): User is of type: " + user.volunteer_type, error.PERMISSION_ERROR);
            }
        }
    catch (err)
        {
        response.errorcode = error.SERVER_ERROR;
        response.success = false;

        util.logWARN("deleteTeam(): Set errorcode to: " + error.SERVER_ERROR, error.SERVER_ERROR);
        util.logERROR("deleteTeam(): " + err.message, err.code);
        }

    //Log completion of function
    util.logINFO("deleteTeam(): Result is: " + response.success);
    
    return response;
    }


////////////////////////////////////////////////////////////
// Will get teams to view -- function call for admin portal
//
// @param[in]  user             user information
//
// @param[out] teamInfo[]       Array of teamInfos that are part of an institution
//
////////////////////////////////////////////////////////////
exports.getTeamsForViewable = async user => 
    {
    var response = {success: false, errorcode: -1, teamInfo: []};

    util.logINFO("getTeamsForViewable(): called by: " + user.volunteer_id);
    util.logWARN("getTeamsForViewable(): Set errorcode to: " + error.NOT_SUPPORTED, error.NOT_SUPPORTED);
   
    //Log completion of function
    util.logINFO("getTeamsForViewable(): Result is: " + response.success);

    return response;
    }


////////////////////////////////////////////////////////////
// Will update user info in database
//
// @param[in]  user             user information
//
// @param[out] teamInfo         array of all teams from an insitution
//
////////////////////////////////////////////////////////////
exports.getTeamLeaderboard = async user => 
    {
    var response = {success: false, errorcode: -1, teamLeader: []};
    var query = "";
    var values = [];

    try 
        {
        util.logINFO("getTeamLeaderboard(): called by: " + user.volunteer_id);

        query =  " SELECT CONCAT(T.sex, ' - ', T.name) AS teamname, vstat.numhours";
        query += " FROM team AS T";
        query += " LEFT JOIN (SELECT team_id, SUM(num_hours) AS numhours FROM volunteer_stats GROUP BY team_id) vstat"
        query += " ON vstat.team_id = T.team_id";
        query += " WHERE T.institution_id = $1 AND T.leaderboard = true";
        query += " ORDER BY numhours DESC  NULLS LAST;";

        values.push(user.institution_id);
       
        await database.queryDB(query, values, (res, e) => 
            { 
            if(e) 
                {
                response.teamLeader = [];
                response.errorcode = error.DATABASE_ACCESS_ERROR;
                response.success = false;
                util.logWARN("getTeamLeaderboard(): Set errorcode to: " + error.DATABASE_ACCESS_ERROR, error.DATABASE_ACCESS_ERROR);
                }
            else 
                {
                response.teamLeader = res.rows;

                //Set the rank of each volunteer -- assuming they are in sorted order already
                for(var t = 0; t < response.teamLeader.length; t++)
                    {
                    response.teamLeader[t].numhours = response.teamLeader[t].numhours ?? 0;
                    response.teamLeader[t]['rank'] = t+1; 
                    }

                response.errorcode = error.NOERROR;
                response.success = true;
                }
            });
        }
    catch (err)
        {
        response.teamLeader = null;
        response.errorcode = error.SERVER_ERROR;
        response.success = false;

        util.logWARN("getTeamLeaderboard(): Set errorcode to: " + error.SERVER_ERROR, error.SERVER_ERROR);
        util.logERROR("getTeamLeaderboard(): " + err.message, err.code);
        }

    //Log completion of function
    util.logINFO("getTeamLeaderboard(): Result is: " + response.success);

    return response;
    }


////////////////////////////////////////////////////////////////////////////////////
// Will add the opportunity types to the institution enum
//
// @param[in]  user                     user Information
// @param[in]  opportunityType          opportunity type to be added
//
// @param[out] {success, errorcode}     Values indicating success of add  
//
////////////////////////////////////////////////////////////////////////////////////
function isValidEnum_ST(value)
    {
    var enums = {
        'M': true,
        'W': true
        };

    return enums[value] || false; 
    }