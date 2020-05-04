class ParserHQ {
    constructor() {
        this.fs = require('fs');
        console.log ("[ParserHQ] Initialised !");
    }

    parse(json_data) {
        console.log ("PARSER");
        console.log(json_data);

        var result = JSON.parse(json_data);

        return result;
    };

    readConfig() {
        var config = this.fs.readFileSync('config/config.json');

        return JSON.parse(config);
    };

    writeCache(json_data) {
        var json_parsed = JSON.stringify(json_data);
        this.fs.writeFile('cache.json', json_parsed, (error) => {
            if (error) {
                console.log(error);
            }
        });
    };
}

module.exports = ParserHQ;