var http = require('http');
var soap = require('soap');
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

            // This is how to define an asynchronous function.  
            MyAsyncFunction: function(args, callback) {
                // do some work
                callback({
                    name: args.name
                })
            }
        }
    }
};

var xml = fs.readFileSync('myservice.wsdl', 'utf8'),
server = http.createServer(function(request,response) {
    response.end("404: Not Found: " + request.url)
});

server.listen(8000);
soap.listen(server, '/wsdl', myService, xml).log = function(type, data) {
    console.log(type);
    console.log(data);
};

