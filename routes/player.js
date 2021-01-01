'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto') 
var playerSchema = {type:"array", uniqueItems: true,items:[{type:"object",properties:{ id: { type: "string"}, image:{type:"string"},first_name:{type:"string"},last_name:{type:"string"},position:{type:"string"},number:{type:"string"},user_name:{type:"string"}}, required:["id","image","firs_name","last_name","position","number","user_name"]}]};
var playerObjectSchema = {type:"object",properties:{id:{type:"string"},image:{type:"string"},first_name:{type:"string"},last_name:{type:"string"},position:{type:"string"},number:{type:"string"},user_name:{type:"string"}},required:["id","image","firs_name","last_name","position","number","user_name"]};
const Ajv = require("ajv").default
const ajv = new Ajv({allErrors: true})
// require("ajv-errors")(ajv /*, {singleError: true} */)


// const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
// const valid = validate(data)
// if (!valid) console.log(validate.errors)


module.exports = {
    addPlayerPage: (req, res) => {
        res.render('add-player.ejs', {
            title: "Welcome to Socka | Add a new player"
            ,message: ''
        });
    },
    addPlayer: (req, res) => {
        const dirPath = path.join(__dirname, '/../public/assets/files/players.json');
        let rawdata = fs.readFileSync(dirPath);
        let playersData = JSON.parse(rawdata);
        
        if (!req.files) {
            return res.status(400).send("No files were uploaded.");
        }

        // let message = '';
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let position = req.body.position;
        let number = req.body.number;
        let username = req.body.username;
        let uploadedFile = req.files.image;
        let image_name = uploadedFile.name;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        image_name = username + '.' + fileExtension;       

        var pObj = {
                        "id": crypto.randomBytes(8).toString('hex'),
                        "image":image_name,
                        "firs_name":first_name,
                        "last_name": last_name,
                        "position": position,
                        "number": number,
                        "user_name": username
                    };    
                    
        const validate = ajv.compile(playerObjectSchema)
        const valid = validate(pObj)   
        
        if (!valid) { 
            var txt = ajv.errorsText(validate.errors)
            //console.log(txt);
            console.log(validate.errors)
            return res.status(400).send(txt);
        }


        for (let key in playersData) {
            if (playersData[key].username == username) {
                message = 'Username already exists';
                res.render('add-player.ejs', {
                    message,
                    title: "Welcome to Socka | Add a new player"
                });
            }
        }  

        if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') 
        {
            // upload the file to the /public/assets/img directory
            uploadedFile.mv(`public/assets/img/${image_name}`, (err ) => {
                if (err) {
                    return res.status(500).send(err);
                }
                
                playersData.push(pObj);                

                var updatedJson = JSON.stringify(playersData);
                 fs.writeFile(dirPath, updatedJson, (err) => { 
                    if (err){ 
                        console.log(err); 
                        return res.status(500).send(err);
                    }
                    else { 
                        console.log("File written successfully\n"); 
                        console.log("The written has the following contents:"); 
                        console.log(fs.readFileSync(dirPath, "utf8")); 
                    } 
                }); 
                res.redirect('/');


            });
        } else {
            message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
            res.render('add-player.ejs', {
                message,
                title: "Welcome to Socka | Add a new player"
            });
        }
    },
    editPlayerPage: (req, res) => {
        const dirPath = path.join(__dirname, '/../public/assets/files/players.json');
        let rawdata = fs.readFileSync(dirPath);
        let playersData = JSON.parse(rawdata);

        let foundPlayer = null;
        for (let key in playersData) {
            if (playersData[key].id == req.params.id) {
                foundPlayer = playersData[key];
                break;
            }
        }
        res.render('edit-player.ejs', {
            title: "Edit  Player",
            player: foundPlayer,
            message: ''
        });
    },
    editPlayer: (req, res) => {
        //console.log(req.params);

        const dirPath = path.join(__dirname, '/../public/assets/files/players.json');
        let rawdata = fs.readFileSync(dirPath);
        let playersData = JSON.parse(rawdata);

        let playerId = req.params.id;
        // console.log(playerId);
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let position = req.body.position;
        let number = req.body.number;

        for (var i=0; i<playersData.length; i++) {
          
            console.log(playersData[i].id);
            if (playersData[i].id == playerId) {

                //console.log(playersData[i].id + " is matched with" + playerId);
                playersData[i].first_name = first_name;                
                playersData[i].last_name = last_name;                
                playersData[i].position = position;                
                playersData[i].number = number;
                
                var updatedJson = JSON.stringify(playersData);
                 fs.writeFile(dirPath, updatedJson, (err) => { 
                    if (err){ 
                        console.log(err); 
                        return res.status(500).send(err);
                    }
                    else { 
                        console.log("File written successfully\n"); 
                        console.log("The written has the following contents:"); 
                        console.log(fs.readFileSync(dirPath, "utf8")); 
                    } 
                }); 
                res.redirect('/');
            }
        }
    },

    deletePlayer: (req, res) => {
        const dirPath = path.join(__dirname, '/../public/assets/files/players.json');
        let rawdata = fs.readFileSync(dirPath);
        let playersData = JSON.parse(rawdata);
        let playerId = req.params.id;       

        for (let key in playersData) {
            if (playersData[key].id == playerId) {
                // delete playersData[key];
                playersData.splice(key,1);

                var updatedJson = JSON.stringify(playersData);
                fs.writeFile(dirPath, updatedJson, (err) => { 
                    if (err){ 
                        console.log(err); 
                        return res.status(500).send(err);
                    }
                    else { 
                        console.log("File written successfully\n"); 
                        console.log("The written has the following contents:"); 
                        console.log(fs.readFileSync(dirPath, "utf8")); 
                    } 
                }); 
                res.redirect('/');
                break;
            }
        }
    }
};
