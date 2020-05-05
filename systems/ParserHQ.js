class ParserHQ {
    constructor() {
        this.fs = require("fs");
        console.log ("[ParserHQ] Initialised !");
    }

    parse(json_data) {
        var result = JSON.parse(json_data);

        return result;
    };

    readConfig() {
        var config = this.fs.readFileSync('config/config.json');

        return JSON.parse(config);
    };

    readLanguage() {
        var language = this.fs.readFileSync('config/language.json');

        return JSON.parse(language);
    };
}

module.exports = ParserHQ;