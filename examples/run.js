var  mqtt2opc = require("../mqtt2opcua").run;
var  Events = require('events').EventEmitter;

forward = new Events();
backward = new Events();

// Set up forward and reverse data conversion functions
// These are based on topic path - the finer grained pattern will be used.
// MQTT data should be like so {"Topic":"/Maintopic/subtopic","Payload":"Your Payload here"}
// Set how the MQTT data is handled examples below

// I Created this to Handle Integers
forward.on("Maintopic/+/Values/#", function(payload) {
    return {
            dataType: "Int32", // OPCUA Datatype
            value: parseInt(payload) // JS convert the "Payload" to a Int
         }
});

// I Created this one to handle Strings
forward.on("MainTopic/+/Strings/#", function(payload) {
    return {
            dataType: "String", // OPCUA Datatype
            value: String(payload) // JS convert the "Payload" to a String
         };
});

// I Created this one to handle Booleans
forward.on("Devices/+/Bools/#", function(payload) {
        switch(String(payload).toLowerCase().trim()){
        case "true": case "yes": case "1": return {dataType: "Boolean",value: true }; // JS convert the "Payload" to$        case "false": case "no": case "0": case null: return {dataType: "Boolean",value: false}; // JS convert the "$        default: return {dataType: "String",value: String(payload)}; // to account for invalid Boolean data
    }
});
backward.on("Devices/#", function(variant) {
            return {
                topic:variant.topic,
                payload:variant.value
            };
});

options = {
    opcName:"/MQTT_Local",
    opcHost:"localhost",
    opcPort:4335,
    mqttHost:"localhost",
    mqttPort:1883,
    mqttUsername:"",
    mqttPassword:"",
    debug:true,
    roundtrip:false,    // set to true to limit updates to onMessage (i.e. validate an accuator is set)
    forward:forward,    // data converter - mqtt -> opcua
    backward:backward,  // data converter - opcua -> mqtt
    topics:['#','Devices/#'] // Customize to override. These are the default so uncessary.
};

var server = new mqtt2opc(options);
