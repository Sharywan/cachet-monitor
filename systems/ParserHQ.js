class ParserHQ {
    constructor() {
        this.fs = require("fs-extra");
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

    readLanguage() {
        var language = this.fs.readFileSync('config/language.json');

        return JSON.parse(language);
    };

    async updateCache() {
        if (fs.existsSync('cache.json')) {
            console.log('true');
            return;
        }
        try {
            await this.fs.writeFile('cache.json', JSON.stringify())
            console.log('success!')
        } catch (err) {
            console.error(err)
        }
    }

}

module.exports = ParserHQ;