var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var cors = require('cors');
var methodOverride = require('method-override');

var app = express();
var serve = require('http').createServer(app);
// app.set('port', process.env.PORT || 5000);
// var ip = process.env.IP || "127.0.0.1";

app.use(express.static('www'));
app.use(bodyParser.urlencoded({ 'extended': 'true' })); // parse aserverpplication/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
//app.use(methodOverride());
app.use(cors());


// CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.set('port', process.env.PORT || 5000);

//Connection with MongoDB
var mongoose = require('mongoose');
var url = '';
mongoose.connect(url);
// When successfully connected
mongoose.connection.on('connected', function() {
    console.log('Mongoose default connection open to ' + url);
});
// If the connection throws an error
mongoose.connection.on('error', function(err) {
    console.log('Mongoose default connection error: ' + err);

});
// When the connection is disconnected
mongoose.connection.on('disconnected', function() {
    console.log('Mongoose default connection disconnected');
});


var User = mongoose.model('Users', {
    _id: mongoose.Schema.Types.ObjectId,
    expertise: { type: String, default: "" },
    experience: { type: String, default: "" },
    shop: { type: String, default: "" },
    fname: { type: String, default: "" },
    lname: { type: String, default: "" },
    email: { type: String, default: "" },
    password: { type: String, default: "" },
    joined: { type: Date, default: Date.now },
    last_active: { type: Date, default: Date.now },
    total_points: { type: Number, default: 0 }, //points available for usage
    level: { type: String, default: "Novice" },
    total_fix: { type: Number, default: 0 },
    total_help: { type: Number, default: 0 },
    last_viewed: { type: String, default: "" },
    avatar: { type: String, default: '' }
});
var projectSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Userid: { type: String, default: '' }, //Links to _id of user only for treasure!!!
    brand: { type: String, default: '' },
    year: { type: Number, default: 0 },
    model: { type: String, default: '' },
    complete: { type: String, default: 'no' },
    errorcode: { type: String, default: '' },
    symptoms: { type: String, default: '' },
    engine: { type: String, default: '' },
    uploaded: { type: String, default: 'no' },
    opendate: { type: Date, default: Date.now },
    verifications: { type: Array, default: [] },
    numcomments: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    bingSearchURL: { type: String, default: '' }
});
projectSchema.index({ '$**': 'text' });

var Project = mongoose.model('Project', projectSchema);
//Data contains the details of each project/treasure
var Detail = mongoose.model('detail', {
    _id: mongoose.Schema.Types.ObjectId,
    ProjectID: String, //links to _id of Project
    type: String, // sets type of the detail for examlpe symptom/diagnosis...
    sentence: String,
    resourceUrl: { type: String, default: '' },
    step: { type: Number, default: 0 }, // the steps are not beeing used yet, but are supposed to provide an easy way to reorganize your details
    numpic: { type: Number, default: 0 },
    numvid: { type: Number, default: 0 },

});

app.post('/', function(req, res) {
    console.log(req.body)

    if (req.body.result.action == "checkVote") {

        var age = req.body.result.parameters.age;
        console.log(age)

        var response = "";

        if (age.amount >= 18) {
            response = "Yes";
        } else {
            response = "No";
        }

        res.json({
            "speech": response,
            "displayText": response
        })

    } else if (req.body.result.action == "Add") {

        var sum = parseFloat(req.body.result.parameters.number1) + parseFloat(req.body.result.parameters.number2);
        var responseText = "The sum of " + req.body.result.parameters.number1 + " and " + req.body.result.parameters.number2 + " is " + sum;
        res.json({ "speech": responseText, "displayText": sum })

    } else if (req.body.result.action == "Subtract") {

        var diff = parseFloat(req.body.result.parameters.number1) - parseFloat(req.body.result.parameters.number2);
        var responseText = "The difference between " + req.body.result.parameters.number1 + " and " + req.body.result.parameters.number2 + " is " + diff;
        res.json({ "speech": responseText, "displayText": diff })

    } else if (req.body.result.action == "Multiply") {

        var product = parseFloat(req.body.result.parameters.number1) * parseFloat(req.body.result.parameters.number2);
        var responseText = "The product of " + req.body.result.parameters.number1 + " and " + req.body.result.parameters.number2 + " is " + (product);
        console.log(responseText);
        res.json({ 'speech': responseText, 'displayText': product });

    } else if (req.body.result.action == "Divide") {

        var quo = parseFloat(req.body.result.parameters.number2) / parseFloat(req.body.result.parameters.number1);
        var responseText = req.body.result.parameters.number2 + " divided by " + req.body.result.parameters.number1 + " is " + (quo);
        console.log(responseText);
        res.json({ 'speech': responseText, 'displayText': product });

    } else if (req.body.result.action == "Get-Weather") {

        var city = req.body.result.parameters.city;

        var url = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=53591a412c95932221df665561b01151";

        request(url, function(error, response, body) {

            var temp = Math.round(JSON.parse(body).main.temp - 273.15);

            var responseText = "Temperature in " + city + " is " + temp + " degree centigrade.";

            res.json({ "speech": responseText, "displayText": responseText })

        })

    }

});
//Routes for users(adding/getting)
app.get('/api/user/search/:search', function(req, res) {
    console.log("searching through users for expertise")
    User.find({ $text: { $search: req.params.search } }, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .exec(function(err, docs) {
            if (err)
                res.send(err);
            res.send(docs);
        });
});

//get all users
app.get('/api/user/id/:id', function(req, res) {
    console.log("getting one users by id");
    User.findById(req.params.id, function(err, users) {
        console.log(users)
        if (err)
            res.send(err);
        res.json(users);
        console.log(users);

    });

});

//find one user with some username
app.get('/api/email/:email', function(req, res) {
    console.log("authenticating user");
    User.find({ email: req.params.email }, function(err, docs) {
        if (err)
            res.send(err)
        if (!docs)
            res.send(["notfound"])
        res.json(docs);
        console.log(docs);
    });
});

var ObjectId = require('mongodb').ObjectId;

app.post('/api/user', function(req, res) {
    User.findById(req.body._id, function(err, u) {
        //no user found
        if (!err && !u) {
            console.log("registering user");
            User.create({
                _id: new ObjectId(),
                expertise: req.body.expertise,
                experience: req.body.experience,
                shop: req.body.shop,
                fname: req.body.fname,
                lname: req.body.lname,
                email: req.body.email,
                password: req.body.password,
                done: false
            }, function(err, user) {
                if (err) {
                    res.send(err);
                    console.log(err);
                } else {
                    res.send(user);
                }
            });
        }
    });
})

//create new user
app.post('/api/user/update', function(req, res) {
    console.log("in user update")
    console.log(req.body)
    User.findById(req.body._id, function(err, u) {
        //no user found
        if (!err && !u) {
            console.log("registering user");
            User.create({
                _id: new ObjectId(),
                expertise: req.body.expertise,
                experience: req.body.experience,
                shop: req.body.shop,
                fname: req.body.fname,
                lname: req.body.lname,
                email: req.body.email,
                password: req.body.password,
                done: false
            }, function(err, user) {
                if (err) {
                    res.send(err);
                    console.log(err);
                } else {
                    res.send(user);
                }
            });
        } else { //update user
            console.log("updating user")
            u.lname = req.body.lname;
            u.fname = req.body.fname;
            u.shop = req.body.shop;
            u.email = req.body.email;
            u.total_help = req.body.total_help;
            u.total_fix = req.body.total_fix;
            u.total_points = req.body.total_points;
            u.expertise = req.body.expertise;
            u.last_active = req.body.last_active;
            u.last_viewed = req.body.last_viewed;

            u.save(function(err, user) {
                if (err) {
                    res.send(err)
                } else {
                    console.log(u);
                    console.log(user)
                    res.send(user);
                }
            });
        }
    })

});

//create or update a project
app.post('/api/Project', function(req, res) {
    console.log("creating/updating Projects");
    console.log(req.body);


    Project.findById(req.body._id, function(err, project) {
        if (!project && !err) {
            console.log("creating new project");
            project = new Project();
            project._id = new ObjectId(); //req.body.id ? new ObjectId(req.body.id) : new ObjectId();
            project.year = req.body.year;
            project.brand = req.body.brand;
            project.model = req.body.model;
            project.errorcode = req.body.errorcode;
            project.symptoms = req.body.symptoms;
            project.Userid = req.body.Userid;
            project.engine = req.body.engine;
            project.imageUrl = req.body.imageUrl;
            project.bingSearchURL = req.body.bingSearchURL;

            project.save(function(err, proj) {
                if (err) {
                    console.log('error');
                    console.log(err)
                    res.send(err);
                } else {
                    console.log(project);
                    console.log("abc");
                    console.log('success')
                    res.send(proj);
                }

            });
        } else {
            //  updating existing project
            // project._id = req.body._id;

            project.PID = req.body.PID;
            project.TID = req.body.TID;
            project.year = req.body.year;
            project.brand = req.body.brand;
            project.model = req.body.model;
            project.engine = req.body.engine;
            project.errorcode = req.body.errorcode;
            project.complete = req.body.complete;
            project.uploaded = req.body.uploaded;
            project.numofpics = req.body.numofpics;
            project.numcomments = req.body.numcomments;
            project.verifications = req.body.verifications;
            project.imageUrl = req.body.imageUrl;
            project.bingSearchURL = req.body.bingSearchURL;

            project.save(function(err, proj) {
                if (err) {
                    console.log('error');
                    console.log(err)
                } else {
                    console.log(project);
                    console.log('success')
                    res.send(proj);
                }

            });
        }
    });
});

// upload media from local and bing search by car model
var AWS = require('aws-sdk');
var bucket = 'katcher';
var accessKey = '';
var secretAccessKey = "";

var s3 = new AWS.S3({
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
    apiVersions: {
        "s3": "2006-03-01"
    },
    signatureVersion: 'v4',
    region: "us-east-1",
    params: { Bucket: bucket, timeout: 6000000 }
});

app.get('/api/getSignedRequest', function(req, res) {
    //console.log(req, res);
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
        Bucket: bucket,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'private'
    };
    console.log(s3Params);

    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) {
            console.log(err);
            return res.end();
        }
        const returnData = {
            signedRequest: data,
            url: `https://${bucket}.s3.amazonaws.com/${fileName}`
        };
        console.log(returnData);
        return res.json(returnData);
    });
});

app.post('/api/uploadfile', function(req, res) {

    let base64Image = req.body.fileBase64;
    let fileName = req.body.fileName;
    let type = req.body.fileType;
    let buf = '';
    if (type.includes('image')) {
        buf = new Buffer(base64Image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    } else {
        buf = new Buffer(base64Image.replace(/^data:video\/\w+;base64,/, ""), 'base64');
    }
    let data = {
        Key: fileName,
        Body: buf,
        ContentEncoding: 'base64',
        ContentType: type
    };
    s3.putObject(data, function(err, data) {
        if (err) {
            console.log(err);
            console.log('Error uploading data: ', data);
            return res.end();
        } else {
            console.log('succesfully uploaded the image!');
            return res.json(data);
        }
    });

});

var fs = require('fs'),
    request = require('request');

app.post('/api/uploadImageFromBingSearch', function(req, res) {

    let _uri = req.body.imageDownloadUrl,
        _filename = `./${req.body.fileName}`,
        _fileDestination = req.body.fileDestination;
    let download = function(uri, filename, callback) {
        request.head(uri, function(err, res, body) {
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    };

    download(_uri, _filename, () => {
        console.log('done');
        fs.readFile(_filename, (err, fileData) => {
            let params = {
                ACL: 'public-read',
                Key: _fileDestination,
                Body: fileData,
                ContentType: 'binary'
            };
            s3.putObject(params, (error, data) => {
                if (error) return res.end();
                fs.unlink(_filename, function(error) {
                    console.log(error);
                });
                return res.json(data);
            })
        })
    });

});

//added for instant messaginging capability
serve.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
