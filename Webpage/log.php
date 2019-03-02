<?php

$db_host 	= 'localhost';
$db_name	= 'ams';
$db_user 	= 'root';
$db_pass 	= 'root';

$connection = null;

foreach ($_POST as $name => $value){
    $content[$name] = $value;
}
$method = $content['method'];
$args   = json_decode($content['args']);

switch($method){
    case 'getlog':
        $res->code = 0;
        $res->msg = $method;
        $res->data = null;

        $conn = new mysqli($db_host,$db_user,$db_pass,$db_name);
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
            $res->code = 1;
            $res->msg = $conn->connect_error;
            echo json_encode($res);
            return;
        }
        $sql = "SELECT `id`,`timestamp`, `name`,`action` FROM log";
        $result = $conn->query($sql);
        if($result){
            while ($r = $result->fetch_assoc()) {
                $userLog[] = $r;
            }
        }else{
            $res->code = 1;
            $res->msg = $conn->error;
        }
        $res->data = $userLog;
        echo json_encode($res);
        $conn->close();
    break;
}

?>