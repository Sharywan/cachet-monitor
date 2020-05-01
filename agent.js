//Custom librairies
const ParserHQ = require("./systems/ParserHQ.js");
const CallerHQ = require("./systems/CallerHQ.js");

//Ping libraries
const http = require('node-http-ping'); //Web http pinger
const tcpp = require('tcp-ping'); //IP Port pinger
const icmp = require('icmp'); //Ip pinger

//Init parser and load configuration
const parser = new ParserHQ();
const config = parser.readConfig();

//Init caller with parsed configuration url and token
const caller = new CallerHQ(config.api_url,config.token,config.app_name);


caller.ping((response) => {
   console.log(response);
});
caller.version((response) => {
    console.log(response);
});



// setInterval(() => {
//     console.log('lol');
// }, 1000);

// pinger('46.105.120.87', 10011 /* optional */)
//     .then(time => console.log(`Response time: ${time}ms`))
//     .catch(() => console.log(`Failed to ping google.com`));


config.components.forEach((component, index) => {



    var interval = (component.interval) * 1000;
    var counter = 0;
    eval('var incident_'+component.component_id+' = undefined;');


    setInterval(() => {
        if (component.type === "ping") {
            if (component.port !== "") {
                tcpp.probe(component.adress, component.port, function(err, available) {
                    if (available) {
                        tcpp.ping({ address: component.adress,port: component.port }, function(err, data) {
                          console.log('true');
                        });
                    } else {
                        if (counter == component.retries) {
                            console.log("PASSAGE EN PERF " + component.name);
                            caller.updateComponent(component.component_id, 2, (response) => {
                                console.log('PASSAGE EFFECTUER');
                            });
                        } else if (counter == (component.retries + 5)) {
                            console.log("PASSAGE EN MINEUR " + component.name);
                            caller.updateComponent(component.component_id, 3, (response) => {
                                console.log('PASSAGE EFFECTUER');
                            });
                            caller.createIncident("ERREUR HOST UNREACHBLE", "L'hôte distant n'a pas été atteint", 1, 1, component.component_id, 3, (response) => {
                                 eval('incident_'+component.component_id+' = '+response.data.id+';');
                                console.log('INCIDENT '+response.data.id+" HAS BEEN CREATED");
                                //console.log(eval('incident_'+component.component_id));
                            });
                        } else if (counter == (component.retries + 10)) {
                            console.log ("PASSAGE EN MAJEUR "+ component.name);
                            var isIncident = eval('incident_'+component.component_id);
                            caller.updateComponent(component.component_id, 4, (response) => {
                                console.log('PASSAGE EFFECTUER');
                            });
                            if (isIncident !== undefined) {
                               /* caller.updateIncident(isIncident,2,"Panne majeur",component.component_id,4, (response) => {
                                   console.log("PASSED UPDATE INCIDENT ");
                                });*/
                               caller.createIncidentUpdate(isIncident,2,"Panne Majeur", (response) => {
                                   console.log("PASSED UPDATE INCIDENT ");
                               });
                            } else {
                                caller.createIncident("ERREUR HOST UNREACHBLE", "L'hôte distant n'a pas été atteint", 1, 1, component.component_id, 4, (response) => {
                                    eval('var incident_'+component.component_id+' = '+response.data.id+';');
                                    console.log('INCIDENT '+response.data.id+" HAS BEEN CREATED");
                                });
                            }
                        }
                    }
                });
            } else {
                icmp.ping(component.adress, 3000)
                    .then(obj => {
                        if (obj.open) {
                            //console.log(obj);
                        } else {
                            //console.log(obj);
                        }
                    })
                    .catch(err => console.log(err));
            }
        } else if  (component.type === "http") {

        } else {
            console.log('Incorrect type for component: ' + component.name);
        }
        counter++;
        console.log('TOUR NUMERO '+counter + " INDEX "+index);
    }, interval);




});




