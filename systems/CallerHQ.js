// Constructor
class CallerHQ {
    constructor(url,token,app_name) {

        //Call request module
        const axios = require("axios");
        //Call Parser module
        const ParserHQ = require("./ParserHQ.js");

        //Axios init
        this.requester = axios.create({
            baseURL: url,
            headers: {'x-cachet-application': app_name,'content-type': 'application/json', 'x-cachet-token': token}
        });

        //Set class var from arguments
        this.url = url;
        this.token = token;
        this.parser = new ParserHQ();

        //Indicate to client init state
        console.log ("[CallerHQ] Initialised !");
    }

    //REQUESTS METHOD AXIOS
    async getRequest(url) {
        try {
            const response = await this.requester.get(url);
            return response.data;
        } catch (error) {
            console.error(error);
            return error;
        }
    };
    async postRequest(url,body) {
        try {
            const response = await this.requester.post(url,body);
            return response.data;
        } catch (error) {
            console.error(error);
            return error;
        }
    };
    async putRequest(url,body) {
        try {
            const response = await this.requester.put(url,body);
            return response.data;
        } catch (error) {
            console.error(error);
            return error;
        }
    };

    //GET METHOD
    async ping(callback) {
        var resp = await this.getRequest('/ping');
        callback(resp.data);
    };
    async version(callback) {
        var resp = await this.getRequest('/version');
        callback(resp.data);
    };

    //POST METHOD
    async createIncident(name,message,status,visible,component_id,component_status,callback) {
        var currentDate = new Date();
        var created_at = currentDate.getFullYear()+"-"+currentDate.getMonth()+"-"+currentDate.getDay()+" "+currentDate.getHours()+":"+currentDate.getMinutes()+":"+currentDate.getSeconds();
        var body = {
            name: name,
            message: message,
            status: status,
            visible: visible,
            component_id: component_id,
            component_status: component_status,
            created_at: currentDate
        };

        var resp = await this.postRequest('/incidents',body);
        callback(resp);
    };
    async createIncidentUpdate(incident_id,incident_status,message = "Default message",callback) {
        var body = {
            status: incident_status,
            message: message
        };

        var resp = await this.postRequest('/incidents/'+incident_id+'/updates',body);
        callback(resp);
    };

    //PUT METHOD
    async updateComponent(component_id,component_status,callback) {
        var body = {
            status: component_status
        };

        var resp = await this.putRequest('/components/'+component_id,body);
        callback(resp);
    };

    async updateIncident(incident_id,incident_status, message = "Default message",component_id,component_status,callback) {
        var body = {
            message: message,
            status: incident_status,
            component_id: component_id,
            component_status: component_status
        };

        var resp = await this.putRequest('/incidents/'+incident_id,body);
        callback(resp);
    };
}


// export the class
module.exports = CallerHQ;