/**
 * This example shows how to do the following in a web app.
 * 1) At initialization time, enroll the web app with the block chain.
 *    The identity must have already been registered.
 * 2) At run time, after a user has authenticated with the web app:
 *    a) register and enroll an identity for the user;
 *    b) use this identity to deploy, query, and invoke a chaincode.
 */

// To include the package from your hyperledger fabric directory:
//    var hfc = require("myFabricDir/sdk/node");
// To include the package from npm:
//      var hfc = require('hfc');
process.env.GOPATH = "/Users/umasuthan/Documents/workspace/HyperLedger"

var hfc = require('hfc');
var util = require('util');


// Create a client chain.
// The name can be anything as it is only used internally.
var chain = hfc.newChain("itopschain");

// Configure the KeyValStore which is used to store sensitive keys
// as so it is important to secure this storage.
// The FileKeyValStore is a simple file-based KeyValStore, but you
// can easily implement your own to store whereever you want.
chain.setKeyValStore( hfc.newFileKeyValStore('tmp_keyValStore') );

// Set the URL for member services
chain.setMemberServicesUrl("grpc://localhost:7054/");

// Add a peer's URL
chain.addPeer("grpc://localhost:7051/");

var test_user_Member1;


mode='net'
// chain.setDevMode(true);
chain.setDevMode(false);


// Path to the local directory containing the chaincode project under $GOPATH
var testChaincodePath = "github.com/ITOpsChain/chaincode/";
//var testChaincodePath = "chaincode_example02/";

// Chaincode hash that will be filled in by the deployment operation or
// chaincode name that will be referenced in development mode.
var testChaincodeName = "itops";

// testChaincodeID will store the chaincode ID value after deployment.
var testChaincodeID;



function deploysample() {

  var deployRequest = {
    // Function to trigger
    fcn: "init",
    // Arguments to the initializing function
    //args: ["a", initA, "b", initB]
	args: ["Test"]
  };

  if (mode === 'dev') {
      // Name required for deploy in development mode
      deployRequest.chaincodeName = testChaincodeName;
  } else {
      // Path (under $GOPATH) required for deploy in network mode
      deployRequest.chaincodePath = testChaincodePath;
      console.log("deployRequest.chaincodePath: " + deployRequest.chaincodePath);
  }

  // Trigger the deploy transaction
  var deployTx = test_user_Member1.deploy(deployRequest);
  console.log("deployTx %j", deployTx);


  deployTx.on('complete', function(results) {
    // Deploy request completed successfully
    console.log(util.format("deploy results: %j",results));
    // Set the testChaincodeID for subsequent tests
    testChaincodeID = results.chaincodeID;
    console.log("testChaincodeID:" + testChaincodeID);
    console.log(util.format("Successfully deployed chaincode: request=%j, response=%j", deployRequest, results));
  });
  deployTx.on('error', function(err) {
    // Deploy request failed
    console.log(util.format("Failed to deploy chaincode: request=%j, error=%j",deployRequest,err));
  });


}

function querysample() {
      var fcn = "getIncident";
      var args = ["0001"];
      var user = test_user_Member1;
      var chaincodeID = "57d3d3a1f3f51e90bb07089ad5df44153e54ec2d7471a0a5db0f913ddb09cf7e";

      // Issue an invoke request
      var queryRequest = {
        // Name (hash) required for invoke
        chaincodeID: chaincodeID,
        // Function to trigger
        fcn: fcn,
        // Parameters for the invoke function
        args: args
     };
     var tx = user.query(queryRequest);
     // Listen for the 'submitted' event
     tx.on('submitted', function(results) {
        console.log("submitted query: %j",results);
     });
     // Listen for the 'complete' event.
     tx.on('complete', function(results) {
        console.log("completed query: %j",results);
        data = results.result;
        console.log("results.result " + data);
     });
     // Listen for the 'error' event.
     tx.on('error', function(err) {
        console.log("error on query: %j",err);
     });
}

function invokesample() {
      var fcn = "addIncident";
      var args = ["0001", "{\"incidentID\":\"0001\",\"incidentTitle\":\"Sample Incident 1\",\"incidentType\":\"Issue\",\"severity\":\"2\",\"status\":\"new\",\"refIncidentID\":\"\",\"originalIncidentIDd\":\"0001\",\"participantIDFrom\":\"\",\"participantIDTo\":\"\",\"contactEmail\":\"\",\"createdDate\":\"\",\"expectedCloseDate\":\"\",\"actualCloseDate\":\"\"}"];
      var user = test_user_Member1;
      var chaincodeID = "57d3d3a1f3f51e90bb07089ad5df44153e54ec2d7471a0a5db0f913ddb09cf7e";

      // Issue an invoke request
      var invokeRequest = {
        // Name (hash) required for invoke
        chaincodeID: chaincodeID,
        // Function to trigger
        fcn: fcn,
        // Parameters for the invoke function
        args: args
     };
     // Invoke the request from the user object.
     var tx = user.invoke(invokeRequest);
     // Listen for the 'submitted' event
     tx.on('submitted', function(results) {
        console.log("submitted invoke: %j",results);
     });
     // Listen for the 'complete' event.
     tx.on('complete', function(results) {
        console.log("completed invoke: %j",results);
     });
     // Listen for the 'error' event.
     tx.on('error', function(err) {
        console.log("error on invoke: %j",err);
     });

}


// Enroll "WebAppAdmin" which is already registered because it is
// listed in fabric/membersrvc/membersrvc.yaml with its one time password.
// If "WebAppAdmin" has already been registered, this will still succeed
// because it stores the state in the KeyValStore
// (i.e. in '/tmp/keyValStore' in this sample).
// chain.enroll("WebAppAdmin", "DJY27pEnl16d", function(err, user) {
chain.enroll("test_user1", "jGlNl6ImkuDo", function(err, user) {
   if (err)
	return console.log("ERROR: failed to register %s: %s",err);

   // Successfully enrolled WebAppAdmin during initialization.
   // Set this user as the chain's registrar which is authorized to register other users.
   // chain.setRegistrar(user);

   // Now begin listening for web app requests
   // listenForUserRequests();

   test_user_Member1 = user;

   //deploysample();
   //invokesample();
   querysample();
   //setTimeout(function() { invokesample(); }, 5000);
   //setTimeout(function() { querysample(); }, 15000);
});
