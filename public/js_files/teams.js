////////////////////////////////////////////////////////////////////////
// teams.js -- frontend behaviour for teams page
//                  
//
// Ryan Stolys, 18/07/20
//    - File Created
//    - Intial behaviour 
//
////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////
// 
// Will initialize 
//
//////////////////////////////////////////////////////////////////////// 
function init()
  {
  //Setup open and close of add team popup box
  document.getElementById('addTeamButton').onclick = function(){toggleTeamBoxVisibility()};
  document.getElementById('cancelTeamChoice').onclick = function(){toggleTeamBoxVisibility()};
  document.getElementById('addTeamChoice').onclick = function(){addTeam()};

  document.getElementById('editViewVolunteer').onclick = function(){toggleViewVolunteerBoxVisibility()}; //Need to edit volunteer on this click
  document.getElementById('cancelViewVolunteer').onclick = function(){toggleViewVolunteerBoxVisibility()};
  document.getElementById('viewVolunteerInfo').onclick = function(){toggleViewVolunteerBoxVisibility()};

  document.getElementById('backToAllTeamsButton').onclick = function(){toggleViewTeams()};
  
  initSlider('Teams');

  initLogout();

  loadTeams();

  }

////////////////////////////////////////////////////////////////////////
// 
// Will initialize 
//
//////////////////////////////////////////////////////////////////////// 
function loadTeams()
    {
    handleAPIcall({vol_ID: -1}, "/api/getTeamInfo", response => 
        {
        if(response.success)
            {
            console.log(response.teamInfo);
            alert("We found " + response.teamInfo.length + " teams");
            }
        else 
            {
            printUserErrorMessage(response.errorcode);
            }

        })
    
    .catch(error)
        {
        alert("Oops. We ran into an issue loading the page. Please try again");
        };
    
    }

///////////////////////////////////////////////////////////////////////
// 
// Will eiter display or hide the add team box depending on the current state
//
////////////////////////////////////////////////////////////////////////
function toggleTeamBoxVisibility()
  {
  //Open the add oppourtuntiy popup box
  var currentState = document.getElementById('addTeamPopup').style.display; 

  if(currentState === "none")
    {
    document.getElementById('addTeamPopup').style.display = "block"; 
    }
  else 
    {
    document.getElementById('addTeamPopup').style.display = "none"; 
    }

  return;
  }


////////////////////////////////////////////////////////////////////////
// 
// Will check inputs and add oppourtuntiy if valid, or provide errors if not
//
// currently does nothing, just closes  the oppourtunity box
//
////////////////////////////////////////////////////////////////////////
function addTeam()
  {
    //Collect Form Values
    var teamData = {
        name: document.getElementById('addTeam-name').value,
        leaderboards: document.getElementById('includeLeaderboards').value,
        sex: document.getElementById('teamSex').value,
    };
    console.log(teamData)

    handleAPIcall({teamData: teamData}, "/addTeam", response => 
        {
          console.log(response)
        if(response.success)
            {
            alert("You successfully added the team");
            toggleTeamBoxVisibility();
            }
        else 
            {
            printUserErrorMessage(response.errorCode);
            }
        })
    .catch(error)
        {
        alert("Error submitting request. Please try again");
        };
  }


///////////////////////////////////////////////////////////////////////
// 
// Will eiter display or hide the add team box depending on the current state
//
////////////////////////////////////////////////////////////////////////
function toggleViewVolunteerBoxVisibility()
  {
  //Open the add oppourtuntiy popup box
  var currentState = document.getElementById('viewVolunteerPopup').style.display; 

  if(currentState === "none")
    {
    document.getElementById('viewVolunteerPopup').style.display = "block"; 
    }
  else 
    {
    document.getElementById('viewVolunteerPopup').style.display = "none"; 
    }

  return;
  }


///////////////////////////////////////////////////////////////////////
// 
// Deletes the team row from the html, as well as all the volunteers in
// the team in the database
//
////////////////////////////////////////////////////////////////////////
function deleteTeam(e){
    if(confirm("Are you sure you want to delete this entry?")){
        // Finds the row of the delete button clicked
        e = e || event;
        var eventEl = e.srcElement || e.target, 
        parent = eventEl.parentNode,
        isRow = function(el) {
                    return el.tagName.match(/tr/i);
                };
            
        // Move up the DOM until tr is reached
        while (parent = parent.parentNode) {
            if (isRow(parent)) {
                // Delete the row visually
                parent.remove()
            
                //TODO: Delete the team from the back end
            
                return true;
            }
        }
    }
    return false
}


///////////////////////////////////////////////////////////////////////
// 
// View a specific team
//
////////////////////////////////////////////////////////////////////////
function viewTeam(e){
    // Switch view to the specific team page
    document.getElementById("teamMainPage").style.display = "none";
    document.getElementById("viewTeamPage").style.display = "block";

    // Determines the team
    e = e || event;
    var eventEl = e.srcElement || e.target, 
    parent = eventEl.parentNode,
    isRow = function(el) {
                return el.tagName.match(/tr/i);
            };

    // Move up the DOM until tr is reached
    while (parent = parent.parentNode) {
        if (isRow(parent)) {
            // Get team name and gender from the clicked row
            var teamName = parent.cells.item(0).innerHTML;
            var sex = parent.cells.item(1).innerHTML;

            document.getElementById("teamInfo-name").innerHTML = teamName;
            document.getElementById("teamInfoSexLabel").innerHTML = sex;

            //TODO: Get volunteers from the team and fill out team's table

           return true;
        }
    }
    return false;
}

////////////////////////////////////////////////////////////////////////
//
// This function will take a user from viewing a specific team to all teams
// from the institution
//
////////////////////////////////////////////////////////////////////////
function toggleViewTeams(){
    document.getElementById("teamMainPage").style.display = "block";
    document.getElementById("viewTeamPage").style.display = "none";
    return;
}