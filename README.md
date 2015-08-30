qbws
=========

Goal: A Node.js based web service for integrating with Quickbooks Web Connector

## Status ##

This project mostly replicates the functionality of the C# web service found in the QBSDK. Unfortunately that means some things are hard coded that should not be, and other things are left unimplemented. Eventually, qbws will diverge from that C# example to serve less of an SDK example and more as a reliable utility.

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
- [x] `parseForVersion()`
- [ ] `authenticate()` - needs uuid generator
- [ ] `buildRequest()` - needs dynamic building


 [1]: https://developer-static.intuit.com/qbsdk-current/samples/readme.html#WCWebService (C# ASP.NET) (qbxml) (desktop)
 

