var http = require('http');
var soap = require('soap');
var color = require('colors');

var fs = require('fs');
var myService = {
    HTTPWebService: {
        authenticate: function(args) {
            console.log("!!!!! Function 1");
        },

        MyPort: {
            authenticate: function(args) {
                console.log("!!!!! Function 2");
                return {
                    name: "hello"
                };
            },

            clientVersion: function(args) {
                console.log("AAAAA".green);
            },

            ClientVersion: function(args) {
                console.log("BBBB".green);
            },

            clientVersionResponse: function(args) {
                console.log("CCCCCC".green);
            }
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

