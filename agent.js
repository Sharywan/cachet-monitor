//Custom librairies
const ParserHQ = require("./systems/ParserHQ.js");
const CallerHQ = require("./systems/CallerHQ.js");

//Ping libraries
const http = require('node-http-ping'); //Web http pinger
const tcpp = require('tcp-ping'); //IP Port pinger
const icmp = require('icmp'); //Ip pinger
const ping = require("net-ping");

//Init parser and load configuration
const parser = new ParserHQ();
const config = parser.readConfig();
const language = parser.readLanguage();
const languageActive = language.active_language;
const trans = eval('language.'+languageActive);

//Init caller with parsed configuration url and token
const caller = new CallerHQ(config.api_url,config.token,config.app_name);



/*caller.ping((response) => {
   console.log(response);
});
caller.version((response) => {
    console.log(response);
});*/

// setInterval(() => {
//     console.log('lol');
// }, 1000);

// pinger('46.105.120.87', 10011 /* optional */)
//     .then(time => console.log(`Response time: ${time}ms`))
//     .catch(() => console.log(`Failed to ping google.com`));



config.components.forEach((component, index) => {

    var session = ping.createSession();
    var interval = (component.interval) * 1000;
    var counter = 0;
    var response;
   // var IsIncident = eval('var incident_'+component.component_id+' = undefined;');

/*icmp.ping("95.177.35.5", 3000)
    .then(obj => {
        console.log(obj);
        if (obj.open) {
            console.log('A MARCHE HOUHOU');
        } else {
            console.log('A MARCHE PAS');
        }
    })
    .catch(err => console.log(err));*/
  
    setInterval(() => {
        var IsIncident = eval('incident_'+component.component_id);
        if (component.type === "ping") {
            if (component.port !== "") {
                tcpp.probe(component.adress, component.port, function(err, available) {
                    if (available) {
                        counter = 0;
                        if (IsIncident !== undefined) {
                            caller.createIncidentUpdate(IsIncident,4,trans.resolved, (response) => {
                                console.log("UPDATE INCIDENT to RESOLVED");
                                eval('incident_'+component.component_id+' = undefined;');
                            });
                        }
                    } else {
                        if (counter == component.retries) {
                            console.log(trans.performance_problem + component.name);
                            caller.updateComponent(component.component_id, 2, (response) => {
                                console.log('PASSAGE EFFECTUER');
                            });
                        } else if (counter == (component.retries + 5)) {
                            console.log(trans.partial_failure + component.name);
                            caller.updateComponent(component.component_id, 3, (response) => {
                                console.log('PASSAGE EFFECTUER');
                            });
                            caller.createIncident("ERREUR HOST UNREACHBLE", "L'hôte distant n'a pas été atteint", 1, 1, component.component_id, 3, (response) => {
                                 eval('incident_'+component.component_id+' = '+response.data.id+';');
                                console.log('INCIDENT '+response.data.id+" HAS BEEN CREATED");
                                //console.log(eval('incident_'+component.component_id));
                            });
                        } else if (counter == (component.retries + 10)) {
                            console.log (trans.major_outage+ component.name);
                            caller.updateComponent(component.component_id, 4, (response) => {
                                console.log('PASSAGE EFFECTUER');
                            });
                            if (IsIncident !== undefined) {
                               /* caller.updateIncident(isIncident,2,"Panne majeur",component.component_id,4, (response) => {
                                   console.log("PASSED UPDATE INCIDENT ");
                                });*/
                               caller.createIncidentUpdate(IsIncident,2,trans.major_outage, (response) => {
                                   console.log("PASSED UPDATE INCIDENT ");
                               });
                            } else {
                                caller.createIncident("ERREUR HOST UNREACHBLE", "L'hôte distant n'a pas été atteint", 1, 1, component.component_id, 4, (response) => {
                                    eval('incident_'+component.component_id+' = '+response.data.id+';');
                                    console.log('INCIDENT '+response.data.id+" HAS BEEN CREATED");
                                });
                            }
                        }
                    }
                });
            } else {
                session.pingHost (component.adress, function (error, target) {
                    if (error) {
                        if (counter == component.retries) {
                            console.log(trans.performance_problem + component.name);
                            caller.updateComponent(component.component_id, 2, (response) => {
                                console.log('PASSAGE EFFECTUER');
                            });
                        } else if (counter == (component.retries + 5)) {
                            console.log(trans.partial_failure + component.name);
                            caller.updateComponent(component.component_id, 3, (response) => {
                                console.log('PASSAGE EFFECTUER');
                            });
                            caller.createIncident("ERREUR HOST UNREACHBLE", "L'hôte distant n'a pas été atteint", 1, 1, component.component_id, 3, (response) => {
                                eval('incident_'+component.component_id+' = '+response.data.id+';');
                                console.log('INCIDENT '+response.data.id+" HAS BEEN CREATED");
                                //console.log(eval('incident_'+component.component_id));
                            });
                        } else if (counter == (component.retries + 10)) {
                            console.log(trans.major_outage + component.name);
                            caller.updateComponent(component.component_id, 4, (response) => {
                                console.log('PASSAGE EFFECTUER');
                            });
                            if (IsIncident !== undefined) {
                                /* caller.updateIncident(isIncident,2,"Panne majeur",component.component_id,4, (response) => {
                                    console.log("PASSED UPDATE INCIDENT ");
                                 });*/
                                caller.createIncidentUpdate(IsIncident, 2, trans.major_outage, (response) => {
                                    console.log("PASSED UPDATE INCIDENT ");
                                });
                            } else {
                                caller.createIncident("ERREUR HOST UNREACHBLE", "L'hôte distant n'a pas été atteint", 1, 1, component.component_id, 4, (response) => {
                                    eval('incident_' + component.component_id + ' = ' + response.data.id + ';');
                                    console.log('INCIDENT ' + response.data.id + " HAS BEEN CREATED");
                                });
                            }
                        }
                    } else {
                        counter = 0;
                        if (IsIncident !== undefined) {
                            caller.createIncidentUpdate(IsIncident,4,trans.resolved, (response) => {
                                console.log("UPDATE INCIDENT to RESOLVED");
                                eval('incident_'+component.component_id+' = undefined;');
                            });
                        }
                    }
                });
                session.close ();
            }
        } else if  (component.type === "http") {
            http(component.adress, component.port)
                .then(time => {
                    counter = 0;
                    if (IsIncident !== undefined) {
                        caller.createIncidentUpdate(IsIncident,4,trans.resolved, (response) => {
                            console.log("UPDATE INCIDENT to RESOLVED");
                            eval('incident_'+component.component_id+' = undefined;');
                        });
                    }
                })
                .catch(() => {
                    if (counter == component.retries) {
                        console.log(trans.performance_problem + component.name);
                        caller.updateComponent(component.component_id, 2, (response) => {
                            console.log('PASSAGE EFFECTUER');
                        });
                    } else if (counter == (component.retries + 5)) {
                        console.log(trans.partial_failure + component.name);
                        caller.updateComponent(component.component_id, 3, (response) => {
                            console.log('PASSAGE EFFECTUER');
                        });
                        caller.createIncident("ERREUR ADRESS UNREACHBLE", "Ce site web est inaccesible", 1, 1, component.component_id, 3, (response) => {
                            eval('incident_'+component.component_id+' = '+response.data.id+';');
                            console.log('INCIDENT '+response.data.id+" HAS BEEN CREATED");
                            //console.log(eval('incident_'+component.component_id));
                        });
                    } else if (counter == (component.retries + 10)) {
                        console.log (trans.major_outage + component.name);
                        caller.updateComponent(component.component_id, 4, (response) => {
                            console.log('PASSAGE EFFECTUER');
                        });
                        if (IsIncident !== undefined) {
                            /* caller.updateIncident(isIncident,2,"Panne majeur",component.component_id,4, (response) => {
                                console.log("PASSED UPDATE INCIDENT ");
                             });*/
                            caller.createIncidentUpdate(IsIncident,2,trans.major_outage, (response) => {
                                console.log("PASSED UPDATE INCIDENT ");
                            });
                        } else {
                            caller.createIncident("ERREUR ADRESS UNREACHBLE", "Ce site web est inaccesible", 1, 1, component.component_id, 4, (response) => {
                                eval('incident_'+component.component_id+' = '+response.data.id+';');
                                console.log('INCIDENT '+response.data.id+" HAS BEEN CREATED");
                            });
                        }
                    }
                });
        } else {
            console.log('Incorrect type for component: ' + component.name);
        }
        counter++;
        console.log('TOUR NUMERO '+counter + " INDEX "+index);
    }, interval);
});




