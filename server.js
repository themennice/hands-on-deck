//This is a test comment 

var express = require('express')
const app = express();
var http = require('http');

var server = app.listen(process.env.PORT || 5000, () => console.log(`Listening on 5000`));

app.get('/', function(request, response){
    response.sendFile(__dirname + '/index.html');
});
