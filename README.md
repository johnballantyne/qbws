qbws
=========

Goal: A Node.js based web service for integrating with Quickbooks Web Connector

## Status ##

This project is largely incomplete. Right now it can be used to successfuly connect to QBWC, but the communication functions are mostly stubs so far.

## Next Milestone ##
Version 0.0.2 will be a loose port of [Intuit's WCWebService][1] provided in the QBSDK samples.

- [x] `serverVersion()`
- [x] `clientVersion()`
- [x] `sendRequestXML()`
- [x] `closeConnection()`
- [x] `connectionError()`
- [x] `getLastError()`
- [x] `logEvent()`
- [x] `getInteractiveURL()`
- [x] `interactiveDone()`
- [x] `interactiveRejected()`
- [ ] `authenticate()` - needs uuid generator
- [ ] `buildRequest()` - needs dynamic building
- [ ] `parseForVersion()`


 [1]: https://developer-static.intuit.com/qbsdk-current/samples/readme.html#WCWebService (C# ASP.NET) (qbxml) (desktop)
 

