<!DOCTYPE html>
<html>
<title>Axces IoT</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<link rel="stylesheet" href="css/bootstrap.min.css">
<link rel="stylesheet" href="css/datatables.min.css">

<style>
html,body,h1,h2,h3,h4,h5 {font-family: "Raleway", sans-serif}
</style>
<body class="w3-light-grey">

<!-- Top container -->
<div class="w3-bar w3-top w3-black w3-large" style="z-index:4">
  <button class="w3-bar-item w3-button w3-hide-large w3-hover-none w3-hover-text-light-grey" onclick="w3_open();"><i class="fa fa-bars"></i>  Menu</button>
  <span class="w3-bar-item w3-center">IoT-Office Monitoring and Control System</span>
  
</div>

<!-- Sidebar/menu -->
<nav class="w3-sidebar w3-collapse w3-white w3-animate-left" style="z-index:3;width:300px;" id="mySidebar"><br>
  <div class="w3-container w3-row">
    <div class="w3-col s4">
      <img src="Logo Universiti Teknologi Malaysia (UTM).png" class="w3-circle w3-margin-right" style="width:46px">
    </div>
    <div class="w3-col s8 w3-bar">
      <span>Welcome, <strong>Admin</strong></span><br>
     
    </div>
  </div>
  <hr>
  <div class="w3-container">
    <h5>Dashboard</h5>
  </div>
  <div class="w3-bar-block">
    <a href="#" class="w3-bar-item w3-button w3-padding-16 w3-hide-large w3-dark-grey w3-hover-black" onclick="w3_close()" title="close menu"><i class="fa fa-remove fa-fw"></i>  Close Menu</a>
    <a href="light.html" class="w3-bar-item w3-button w3-padding"><i class="fa fa-cog fa-fw"></i>  Light Control</a>
    <a href="index.php" class="w3-bar-item w3-button w3-padding"><i class="fa fa-history fa-fw"></i>  Main Page</a></div>
</nav>


<!-- Overlay effect when opening sidebar on small screens -->
<div class="w3-overlay w3-hide-large w3-animate-opacity" onclick="w3_close()" style="cursor:pointer" title="close side menu" id="myOverlay"></div>

<!-- !PAGE CONTENT! -->
<div class="w3-main" style="margin-left:300px;margin-top:43px;">

  <!-- Header -->
  <header class="w3-container" style="padding-top:22px">
    <h5><b><i class="fa fa-dashboard"></i> My Dashboard</b></h5>
  </header>

  
  <div class="w3-quarter">
    <div class="w3-container w3-orange w3-text-white w3-padding-16">
      <div class="w3-left">
        <i class="fa fa-users w3-xxxlarge"></i>
      </div>
      <div class="w3-right">
          <h3>50</h3>
        </div>
        <div class="w3-clear">
        </div>
        <h4>Workers</h4>
    </div>
  </div>

  <div class="w3-twothird" style="margin-left:300px;overflow-x:auto;">
    <h5>Door Log</h5>
    <!--table class="w3-table w3-bordered">
          <tr>
            <th>Name</th>
            <th>Times</th>
            <th>Day</th>
            <th>Dates</th>
            <th>Log</th>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td><i></i></td>
          </tr>
          <tr>
            <td><i </i></td>
            <td></td>
            <td></i></td>
          </tr>
          <tr>
            <td></i></td>
            <td></td>
            <td><i></i></td>
          </tr>
          <tr>
            <td></i></td>
            <td></td>
            <td><i></i></td>
          </tr>
          <tr>
            <td></i></td>
            <td></td>
            <td><i></i></td>
          </tr>
        </table-->
      </div>

      <table class="table table-striped compact" cellspacing="0" id="dtLog">
      <thead>
        <tr>
          <th>Date/Time</th>
          <th>Name</th>
          <th>Log</th>
        </tr>
        </thead>
        <tbody>

        </tbody>
    </table>

</div>

<script>
// Get the Sidebar
var mySidebar = document.getElementById("mySidebar");

// Get the DIV with overlay effect
var overlayBg = document.getElementById("myOverlay");

// Toggle between showing and hiding the sidebar, and add overlay effect
function w3_open() {
    if (mySidebar.style.display === 'block') {
        mySidebar.style.display = 'none';
        overlayBg.style.display = "none";
    } else {
        mySidebar.style.display = 'block';
        overlayBg.style.display = "block";
    }
}

// Close the sidebar with the close button
function w3_close() {
    mySidebar.style.display = "none";
    overlayBg.style.display = "none";
}
</script>

</body>
</html>

<script type="text/javascript" src="js/jquery-3.3.1.min.js"></script>
<script type="text/javascript" src="js/bootstrap.min.js"></script>
<script type="text/javascript" src="js/datatables.min.js"></script>
<script type="text/javascript" src="js/door.js"></script>