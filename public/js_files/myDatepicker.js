//////////////////////////////////////////////////////////////////
// myDatepicker.js -- datepicker scripts to create and operate datepicker
//
// Ryan Stolys - Aug 13, 2020 
//  - File created, basic functionality added
//
// Copyright © Ryan Stolys - All Rights Resevered
//////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////
//
// global varaibles
//
//////////////////////////////////////////////////////////////////
const weekdays_short = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const months_short = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];



//////////////////////////////////////////////////////////////////
//
// Dependencies -- need to have font-awesome 6 in html file where datepicker is used
//                  (https://fontawesome.com)
//
// How to use:
//
//    Create a basic div where you want the datepicker to be located
//         <div id="<datePickerID>" class="hideObj"></div>     //hideObj will keep it initially hidden
//    Call function to create datepicker -- createDatePicker(<inputID>, <datePickerID>, <dpNum>);
//        the dpNum is required to allow mutiple independent datepickers on the same page, max of 9 per page
//
//    Add speical positioning through css using the datepicker ID
//    done!
//
//////////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////
//
// Will create the datepicker in html to be displayed upon focus of input
//
//////////////////////////////////////////////////////////////////
function createDatePicker(inputId, datePickerID, dpNum)       //dpNum will allow for multiple datepickers on the same page
  {
  //Crate highest level div 
  var topLevelID = "dp_parentDiv_" + dpNum;
  const topLevelDiv = document.createElement('div');
  topLevelDiv.className = "datepickerFrame";
  topLevelDiv.id = topLevelID;
  topLevelDiv.style = "z-index:15; text-align:center; display:inline-block;";
  
  document.getElementById(datePickerID).appendChild(topLevelDiv); 


  //Create sub elements of the div
  createMonthDiv(topLevelID, datePickerID, dpNum);
  createDaysOfWeekDiv(topLevelID, dpNum);
  createDaysOfMonth(topLevelID, inputId, datePickerID, dpNum);
  loadCurrentMonth(dpNum);

  //Set function to open datepicker
  document.getElementById(inputId).onfocus = function(){showDatepicker(datePickerID)};
  }

  
//////////////////////////////////////////////////////////////////
//
// Will delete a previously created datepicker
//
//////////////////////////////////////////////////////////////////
function deleteDatePicker(inputId, datePickerID, dpNum)  
    {
    try
        {
        //Remove datepicker elements
        document.getElementById(datePickerID).innerHTML = "";

        //Remove function call function to open datepicker
        document.getElementById(inputId).onfocus = function(){return};
        }
    catch (error) 
        {
        console.log("Error Deleting Datepicker -- " + error.message);
        }
    
    return;
    }


//////////////////////////////////////////////////////////////////
//
// Will create and add month title to datepicker div
//
//////////////////////////////////////////////////////////////////
function createMonthDiv(topLevelParentID, datePickerID, dpNum)
  {
  //Create top level div
  var topLevelMonthDivId = "topLevelMonthDiv_" + dpNum;
  const monthOfYear = document.createElement('div');
  monthOfYear.style = "height:10%";
  monthOfYear.id = topLevelMonthDivId;

  //Create left arrow column
  const leftArrow = document.createElement('div');
  leftArrow.style = "float:left; width:16.6666%";
  leftArrow.innerHTML = "<span class=\"monthArrow\"><i class=\"fas fa-arrow-left\" id=\"DPA_Left_" + dpNum + "\"></i></span>"

  //Create month and year title
  const monthYearTitle = document.createElement('div');
  monthYearTitle.style = "float:left; width:50%";
  monthYearTitle.innerHTML = "<span id=\"dp_month_" + dpNum + "\">May</span> <span id=\"dp_year_" + dpNum + "\"> 2020</span>"
  
  //Create right arrow column
  const rightArrow = document.createElement('div');
  rightArrow.style = "float:left; width:16.6666%";
  rightArrow.innerHTML = "<span class=\"monthArrow\"><i class=\"fas fa-arrow-right\" id=\"DPA_Right_" + dpNum + "\"></i></span>"

  //Create X to close column
  const closeItem = document.createElement('div');
  closeItem.style = "float:left; width:16.6666%";
  closeItem.innerHTML = "<span class=\"monthArrow\" style=\"color:rgb(168,6,6)\"><i class=\"fas fa-times\" id=\"DP_Close_" + dpNum + "\"></i></span>"

  //Append elements for display
  document.getElementById(topLevelParentID).appendChild(monthOfYear); 
  document.getElementById(topLevelMonthDivId).appendChild(leftArrow); 
  document.getElementById(topLevelMonthDivId).appendChild(monthYearTitle); 
  document.getElementById(topLevelMonthDivId).appendChild(rightArrow); 
  document.getElementById(topLevelMonthDivId).appendChild(closeItem); 

  //Add DOM elements for arrows
  document.getElementById("DPA_Left_" + dpNum).onclick = function(){changeMonth(this.id, dpNum)};
  document.getElementById("DPA_Right_" + dpNum).onclick = function(){changeMonth(this.id, dpNum)};
  document.getElementById("DP_Close_" + dpNum).onclick = function(){hideDatepicker(datePickerID)};
  }


//////////////////////////////////////////////////////////////////
//
// Will add the days of week to the datepicker div
//
//////////////////////////////////////////////////////////////////
function createDaysOfWeekDiv(topLevelParentID, dpNum)
  {
  //Create top level div
  var topLevelDOWDivId = "topLevelDowDiv_" + dpNum;
  const daysOfWeekTopLevel = document.createElement('div');
  daysOfWeekTopLevel.style = "height:15%; margin-top: 5px"
  daysOfWeekTopLevel.className = "daysOfWeek";
  daysOfWeekTopLevel.id = topLevelDOWDivId;

  //Add top level div to parent
  document.getElementById(topLevelParentID).appendChild(daysOfWeekTopLevel); 

  //Create each day of week div
  for(var i = 0; i < 7; i++)
    {
    //Create Day of week
    const dayOfWeek = document.createElement('div');
    dayOfWeek.className = "col_dow";
    dayOfWeek.innerHTML = weekdays_short[i];

    //Add day to top level div
    document.getElementById(topLevelDOWDivId).appendChild(dayOfWeek); 
    }
  }


//////////////////////////////////////////////////////////////////
//
// Will create the days of month top level div and add to the datepicker div
//
//////////////////////////////////////////////////////////////////
function createDaysOfMonth(topLevelParentID, inputId, dpID, dpNum)
  {
  //Create top level div
  var topLevelDOMDivId = "topLevelDomDiv_" + dpNum;
  const daysOfMonthTopLevel = document.createElement('div');
  daysOfMonthTopLevel.style = "height:70%; margin-top:3px";
  daysOfMonthTopLevel.className = "daysOfMonth";
  daysOfMonthTopLevel.id = topLevelDOMDivId;

  //Add top level div to parent
  document.getElementById(topLevelParentID).appendChild(daysOfMonthTopLevel); 

  createDaysOfMonthContent(topLevelDOMDivId, inputId, dpID, dpNum);
  }
  

//////////////////////////////////////////////////////////////////
//
// Will add the days of month to the datepicker div
//
//////////////////////////////////////////////////////////////////
function createDaysOfMonthContent(upperLevelParentID, inputId, dpID, dpNum)
  {
  //Will have to create 5 weeks and 7 days per week
  for(var week = 1; week <= 6; week++)
    {
    //Create div to contain weeks in it
    var DOMsecondLevelId = "secondLevelDomDiv_" + week + "_" + dpNum;
    const daysOfMonthSecondLevel = document.createElement('div');
    daysOfMonthSecondLevel.style = "height:16.5%";
    daysOfMonthSecondLevel.id = DOMsecondLevelId;

    //Add div to datepicker
    document.getElementById(upperLevelParentID).appendChild(daysOfMonthSecondLevel); 

    for(var day = 1; day <= 7; day++)
      {
      //get day number 
      var dayNumber = ((week - 1) * 7) + day;
      var dayId = "dp_day" + "_" + dpNum + dayNumber;

      //Create day number div element 
      var DOMdivId = dayId + "_div";
      const dayOfMonth = document.createElement('div');
      dayOfMonth.className = "col_dow";
      dayOfMonth.innerHTML = "<span class=\"hideText\" id=\"" + dayId + "\">0</span>";      //We don't include any days so that only the desired days of month show
      dayOfMonth.id = DOMdivId;

      //Add div to month page
      document.getElementById(DOMsecondLevelId).appendChild(dayOfMonth);

      //Add DOM function call for selecting date
      document.getElementById(DOMdivId).onclick = function(){selectDate(this.id, inputId, dpID, dpNum)};
      }
    } 
  }


//////////////////////////////////////////////////////////////////
//
// Will get the days from the current month and load them into the 
//    the calendar format
//
//////////////////////////////////////////////////////////////////
function loadCurrentMonth(dpNum)
  {
  //Get the current Date
  var currentDate = new Date();

  //Load the month corresponding to that month
  loadMonth(currentDate.getMonth(), currentDate.getFullYear(), dpNum);
  }


//////////////////////////////////////////////////////////////////
//
// Will get the days from the selected month and load them into the 
//    the calendar format
//
//////////////////////////////////////////////////////////////////
function loadMonth(monthIndex, year, dpNum)
  {
  //Get the number of days in the month
  var ourMonth = new Date(year, monthIndex + 1, 0);    //By adding 1 to month and indexing day at 0 we get the final day of the month we care about
  var numDays = ourMonth.getDate();      //Will return integer of the number of days in the month we care about

  //Get the first day of the month
  var ourDate = new Date(year, monthIndex, 1);
  var startDay = ourDate.getDay();

  var dayId = "dp_day_" + dpNum;     
  
  for(var i = 1; i <= numDays; i++)
    {
    var dayId_dayNum = (i + startDay);
    dayId += dayId_dayNum;

    document.getElementById(dayId).innerHTML = i; 
    document.getElementById(dayId).classList.remove("hideText"); 
    document.getElementById(dayId + "_div").classList.add("dom");   //allow this selection to be highlighted

    //remove day num from dayId
    if(dayId_dayNum > 9)
      dayId = dayId.slice(0, -2); 
    else 
      dayId = dayId.slice(0, -1);
    }

  //Change the Month and year at title of datepicker
  document.getElementById('dp_month_' + dpNum).innerHTML = months[monthIndex];
  document.getElementById('dp_year_' + dpNum).innerHTML = year;
  }


//////////////////////////////////////////////////////////////////
//
// Will change the current month being displayed
//
//////////////////////////////////////////////////////////////////
function changeMonth(arrowID, dpNum)
  {
  //Get the index for the current month 
  var currentMonth = document.getElementById("dp_month_" + dpNum).innerHTML; 

  var monthIndex = 0;
  while(currentMonth != months[monthIndex])
    {
    monthIndex++;
    }
  
  //Get the current year 
  var currentYear = document.getElementById("dp_year_" + dpNum).innerHTML; 

  //Determine the next month
  if(arrowID.includes("Left"))
    {
    if(monthIndex == 0)
      {
      monthIndex = 11;
      currentYear--;
      } 
    else 
      monthIndex--;
    }
  else        //it was the right arrow selected
    {
    if(monthIndex == 11)
      {
      monthIndex = 0;
      currentYear++;
      } 
    else 
      monthIndex++;
    }

  //clear calendar days of month
  clearCalendarDaysOfMonth(dpNum);

  //Call function to change calendar days of month
  loadMonth(monthIndex, currentYear, dpNum);
  }


//////////////////////////////////////////////////////////////////
//
// Will make all days 0 and make them all invisible
//
//////////////////////////////////////////////////////////////////
function clearCalendarDaysOfMonth(dpNum)
  {
  var numDays = 42; 

  var dayId = "dp_day_" + dpNum;
  var divId_add = "_div";

  //For each element, set day number to 0, hideText and remove dom class
  for(var i = 1; i <= numDays; i++)
    {
    dayId += i; 

    document.getElementById(dayId).innerHTML = 0; 
    document.getElementById(dayId).classList.add("hideText");

    dayId = dayId + divId_add; 
    document.getElementById(dayId).classList.remove("dom");

    //Reset dayId   -- will remove the dayNum and _div
    if(i > 9)
      dayId = dayId.slice(0, -6);
    else 
      dayId = dayId.slice(0, -5);
    }
  }



//////////////////////////////////////////////////////////////////
//
// Will fill in the desired date and close the datepicker
//
//////////////////////////////////////////////////////////////////
function selectDate(dayId, inputId, dpID, dpNum)
  {
  //Remove the "_div" from the dayId
  dayId = dayId.slice(0, -4);
  
  //Get the day number for the selected day 
  var dayNumber = document.getElementById(dayId).innerHTML;
  var dayOfDate = "";

  if(dayNumber == 0)        //We want to ignore these clicks 
    return; 

  if(dayNumber < 10)
    dayOfDate = "0" + dayNumber;
  else 
    dayOfDate = dayNumber;
    

  //Get the year
  var currentYear = document.getElementById("dp_year_" + dpNum).innerHTML;

  //Get the month
  var currentMonth = document.getElementById("dp_month_" + dpNum).innerHTML;
  var monthOfDate = "";

  //Find the month index 
  var monthIndex = 0;
  while(currentMonth != months[monthIndex])
    {
    monthIndex++;
    }
  
  if(monthIndex < 9)
    monthOfDate = "0" + (monthIndex + 1);
  else 
    monthOfDate = (monthIndex + 1);

  //Create Date in YYYY-MM-DD format
  var UTCdate = currentYear + "-" + monthOfDate + "-" + dayOfDate;

  //Add day to input field
  document.getElementById(inputId).value = UTCdate; 

  //close datepicker
  hideDatepicker(dpID)
  }

//////////////////////////////////////////////////////////////////
//
// Will display the datepicker
//
//////////////////////////////////////////////////////////////////
function showDatepicker(DPid)
  {
  document.getElementById(DPid).classList.remove('hideObj');
  }

//////////////////////////////////////////////////////////////////
//
// Will hide the datepicker
//
//////////////////////////////////////////////////////////////////
function hideDatepicker(DPid)
  {
  document.getElementById(DPid).classList.add('hideObj');
  }