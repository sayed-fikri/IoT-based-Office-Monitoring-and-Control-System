<head>
<title>AmsIot.com/mainpage</title>
<style>
         body {
            
            background-image: url("things.png");
            height: 100%; 

            /* Center and scale the image nicely */
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
         

         }
        /*Style the header*/
         .header {
        
        padding: 23px;
        text-align: center;
        font-size: 32px;
        }

        

        .button {

        display: inline-block;
        
        border-radius: 3px;
        background-color: #008CBA;
        border: none;
        color:  #FFFFFF;
        text-align: center;
        font-size: 28px;
        padding: 20px;
        width: 200px;
        transition: all 0.5s;
        cursor: pointer;
        margin-right: -320px;
        margin-left : 400px;
        margin-top : 40px;
        
        }

        .button span {
        cursor: pointer;
         display: inline-block;
         position: relative;
         transition: 0.5s;
        }

       .button span:after {
         content: '\00bb';
        position: relative;
         opacity: 0;
        top: 0;
        right: 5px;
        transition: 0.5s;
       }

        .button:hover span {
        padding-right: 10px;
        }

        .button:hover span:after {
         opacity: 1;
          right: 0;
        }
            
         </style>
          <nav class="navbar navbar-inverse">
        <div class="container-fluid">
          <div class="navbar-header">
            <a class="navbar-brand" href="/IoTAxcesattfyp/MainPage.php"></a>
          </div>
      
          
        </div>
            </nav>
         <body>
            
         <div class="header">
            <h1>IOT-Based Office Monitoring and Automation System</h1>
            
            </div>

             <div>
           <a class="button" href="door.php"><span>AxcesDoor </span></button1>
           <a class="button" href="light.html"><span>LightControl </span></button2>
      
            

            </body>
</html>
