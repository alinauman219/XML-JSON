'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto') 

const dirPath = path.join(__dirname, '/../public/assets/files/players.json');

let rawdata = fs.readFileSync(dirPath);
let playersData = JSON.parse(rawdata);

module.exports = {
    addPlayerPage: (req, res) => {
        res.render('add-player.ejs', {
            title: "Welcome to Socka | Add a new player"
            ,message: ''
        });
    },
    addPlayer: (req, res) => {
        if (!req.files) {
            return res.status(400).send("No files were uploaded.");
        }

        let message = '';
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
                        "first_name":first_name,
                        "last_name": last_name,
                        "position": position,
                        "number": number,
                        "user_name": username
                    };


        for (let key in playersData) {
            if (playersData[key].username === username) {
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
                // send the player's details to the database
                // let query = "INSERT INTO `players` (first_name, last_name, position, number, image, user_name) VALUES ('" +
                //     first_name + "', '" + last_name + "', '" + position + "', '" + number + "', '" + image_name + "', '" + username + "')";
                // db.query(query, (err, result) => {
                //     if (err) {
                //         return res.status(500).send(err);
                //     }
                //     res.redirect('/');
                // });
                
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
