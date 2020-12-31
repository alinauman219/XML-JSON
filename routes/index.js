'use strict';
const fs = require('fs');
const path = require('path');
const dirPath = path.join(__dirname, '/../public/assets/files/players.json');

let rawdata = fs.readFileSync(dirPath);
let result = JSON.parse(rawdata);

module.exports = {
    getHomePage: (req, res) => {
        res.render('index.ejs', {
                title:" Welcome to Soccor Players | View Players", 
                players: result
        });
    },
};
