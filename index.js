var co = require('co');
var fs = require('fs');
var path = require('path');
var imgur = require('imgur');
var request = require('request');
var Promise = require('bluebird');

function saveImageToLocal(url){
    var basename = path.basename(url.split("?")[0].split("#")[0]);  // bug
    return new Promise((resolve, reject) => {
        request(url).pipe(fs.createWriteStream(basename))
            .on('error', err => {
                reject(err);
            })
            .on('close', () => {
                resolve(basename);
            });
    });
}

function uploadLocalFile(filePath){
    return co(function*(){
        var json = yield imgur.uploadFile(filePath);
        return json.data.link;
    });
}

var url = process.argv[2];

if(!url){
    console.log('node index.js url');
    return;
}

co(function*(){
    var filename = yield saveImageToLocal(url);
    var link = yield uploadLocalFile(filename);
    fs.unlinkSync(filename);
    console.log(link);
}).catch(err => {
    console.log(err);
});

// todo remove temp file

