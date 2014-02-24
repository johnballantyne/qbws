var http = require('http');
var soap = require('soap');
var color = require('colors');

var fs = require('fs');
var myService = {
    QBWebConnectorSvc: {
        QBWebConnectorSvcSoap: {
            authenticate: function(strUserName, strPassword) {
                console.log("authenticate Stub: ".yellow + strUserName + " " + strPassword);
            },
            clientVersion: function(strVersion) {
                console.log("clientVersion Stub".yellow);
            },
            closeConnection: function(ticket) {
                console.log("closeConnection Stub".red);
            },
            connectionError: function(ticket, hresult, message) {
                console.log("connectionError Stub".red);
            },
            getInteractiveURL: function() {
                console.log("getInteractiveURL Stub".yellow);
            },
            getLastError: function() {
                console.log("getLastError Stub".yellow);
            },
            getServerVersion: function() {
                console.log("getServerVersion Stub".yellow);
            },
            interactiveDone: function() {
                console.log("interactiveDone Stub".yellow);
            },
            interactiveRejected: function() {
                console.log("interactiveRejected Stub".yellow);
            },
            receiveResponseXML: function() {
                console.log("receiveResponseXML Stub".yellow);
            },
            sendRequestXML: function() {
                console.log("sendRequestXML Stub".yellow);
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

