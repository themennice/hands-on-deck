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
  //Setup open and close of popup box
  document.getElementById('addTeamButton').onclick = function(){toggleTeamBoxVisibility()};
  document.getElementById('cancelTeamChoice').onclick = function(){toggleTeamBoxVisibility()};
  document.getElementById('addTeamChoice').onclick = function(){addTeam()};

  document.getElementById('editViewVolunteer').onclick = function(){toggleViewVolunteerBoxVisibility()}; //Need to edit volunteer on this click
  document.getElementById('cancelViewVolunteer').onclick = function(){toggleViewVolunteerBoxVisibility()};
  document.getElementById('viewVolunteerInfo').onclick = function(){toggleViewVolunteerBoxVisibility()};
  
  
  initSlider('Teams');

  initLogout();

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
  toggleTeamBoxVisibility();
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
    return false;
}