var http = require('http');
var soap = require('soap');
var color = require('colors');

var fs = require('fs');
var myService = {
    TroubleshootWebServiceFS: {
        TroubleshootWebServiceFSSoap: function() {
            console.log("Oh".red);
        },
        TroubleshootWebServiceFSSoap12: function() {
            console.log("Yeah".yellow);
        }
    }
};

var xml = fs.readFileSync('myservice.wsdl', 'utf8'),
server = http.createServer(function(request,response) {
    response.end("404: Not Found: " + request.url)
});

server.listen(8000);
var soapServer = soap.listen(server, '/wsdl', myService, xml);

soapServer.clientVersion = function() {
    console.log("Help me".green);
};

soapServer.serverVersion = function() {
    console.log("Help you".green);
};

soapServer.log = function(type, data) {
    console.log("Log.type: ".yellow + type);
    console.log("Log.data: ".yellow + data);
};

