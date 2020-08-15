const albumsFolder = './albums/'
const fs = require('fs')
const multer = require('multer')
const path = require('path')

exports.healthCheck = (req, res) => {
    return res.status(200).send({
        message: "OK"
    })
}

exports.listPhotos = (req, res) => {
    if (Object.keys(req.body).length == 0){
        return res.status(400).send({
            message: "Please fill all required field"
        })
    }
    
    let arrayFile = []
    let arrayResponse = []
    let customeAlbumFolder = albumsFolder.substr(1)
    fs.readdirSync(albumsFolder).forEach(folder => {
        if (folder != 'placeholder'){
            fs.readdirSync(albumsFolder+'/'+folder).forEach(file => {
                arrayFile.push(file)
                arrayResponse.push({
                            album : folder.charAt(0).toUpperCase()+folder.slice(1),
                            name : file,
                            path : customeAlbumFolder+folder+'/'+file,
                            raw : req.protocol+'://'+req.get('host')+customeAlbumFolder+folder+'/'+file
                    })
            })
        }
    })
    let lengthArray = arrayFile.length


    if (req.body.skip > 0 && req.body.limit > 0) {
        arrayResponse = arrayResponse.slice(req.body.skip,req.body.limit+req.body.skip)
    }else if (req.body.skip == 0 && req.body.limit > 0){
        arrayResponse = arrayResponse.slice(req.body.skip,req.body.limit)
    }else {
        arrayResponse = arrayResponse.slice(req.body.skip,lengthArray)
    }
    
    return res.status(200).send({
        message : "OK",
        documents : arrayResponse,
        count : lengthArray,
        skip : req.body.skip,
        limit : req.body.limit
    })
    
}

exports.uploadPhotos = (req, res) => { 
    let arrayResponse = []
    let customeAlbumFolder = albumsFolder.substr(1)
    let customNameAlbum;

    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            customNameAlbum = req.body.album.charAt(0).toLowerCase() + req.body.album.slice(1)
            let checkDirectory = fs.existsSync(albumsFolder+customNameAlbum)
            if(!checkDirectory){
                fs.mkdirSync(albumsFolder+customNameAlbum)
            }
            cb(null, albumsFolder+customNameAlbum);
        }, 
        filename: function (req, file, cb) { 
                arrayResponse.push({
                    album : req.body.album,
                    name : file.originalname,
                    path : customeAlbumFolder+req.body.album+'/'+file.originalname,
                    raw : req.protocol+'://'+req.get('host')+customeAlbumFolder+req.body.album+'/'+file.originalname
                })
            cb(null , file.originalname);
        }
        });
    
    const upload = multer({ storage: storage }).array('documents');

    upload(req, res, (err) => {
        if(err) {
        res.status(400).send(err);
        }
        res.status(200).send({
            message : "OK",
            data: arrayResponse
        })
    });

}

exports.deletePhoto = (req, res) => {
    let folderDir = albumsFolder+req.params.Album
    let checkDirectory = fs.existsSync(folderDir)
    let checkFile = fs.existsSync(folderDir+'/'+req.params.FileName)
    if (!checkDirectory){
        return res.status(404).send({
            message : `Directory with name ${req.params.Album} not found.`
        })
    }
    
    if (!checkFile) {
        return res.status(404).send({
            message : `File with name ${req.params.FileName} not found.`
        })
    }

    fs.unlinkSync(folderDir+'/'+req.params.FileName)
    return res.status(200).send({
        message : "OK"
    })
}

exports.readFile = (req, res) => {
    let folderDir = albumsFolder+req.params.Album
    let checkDirectory = fs.existsSync(folderDir)
    let checkFile = fs.existsSync(folderDir+'/'+req.params.FileName)
    if (!checkDirectory){
        return res.status(404).send({
            message : `Directory with name ${req.params.Album} not found.`
        })
    }
    
    if (!checkFile) {
        return res.status(404).send({
            message : `File with name ${req.params.FileName} not found.`
        })
    }

    let fileDirectory = folderDir + '/' + req.params.FileName
    res.sendFile(path.join(__dirname, '../..', fileDirectory));
}

exports.deletePhotos = (req, res) => {
    req.body.forEach(function(filePath){
        let folderDir = albumsFolder+filePath.album
        let checkDirectory = fs.existsSync(folderDir)
        
        if (!checkDirectory){
            return res.status(404).send({
                message : `Directory with name ${filePath.album} not found.`
            })
        }
        
        let splitDouble = filePath.documents.split(", ");
        splitDouble.forEach(function(FileName) {
            let checkFile = fs.existsSync(folderDir+'/'+FileName)
            if (!checkFile) {
                return res.status(404).send({
                    message : `File with name ${FileName} in directory ${filePath.album} not found.`
                })
            }
            
            fs.unlinkSync(folderDir+'/'+FileName)
        })

        return res.status(200).send({
            message : "OK"
        })
    })
}

