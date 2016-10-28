var PORT = process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT  || 8080;
var IPADDRESS = process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var fs              = require('fs');
var app             = require('express')();
var verbose         = false;
//var server          = http.createServer(app);
var http            = require('http');
//var io = require('socket.io').listen(server);
var ip = require("ip");
var ipaddress= ip.address() ;





app.set('port', PORT || 8080);
app.set('ipaddress', IPADDRESS);
app.use(function(req,res,next){

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    next();})

var server = http.createServer(app);

server.listen(app.get('port'), app.get('ipaddress'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
var io = require('socket.io').listen(server);








// Import our common modules.
var Handlebars = require('./common/handlebars').Handlebars;
var Message = require('./common/models').Message;
var User = require('./common/models').User;
// Grab any arguments that are passed in.
var argv = require('optimist').argv;


// Allow cross origin requests.
app.use(function(req, res, next) {
    var origin = '*';
    try {
        var parts = req.headers.referer.split('/').filter(function(n){return n;});
        if (parts.length >= 2){
            origin = parts[0] + '//' + parts[1];
        }
    } catch (e) {
        // no referrer
    }

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    next();
});
app.use('/varSocketURI.js', function(req, res) {
    var port = argv['websocket-port'];
    // Modify the URI only if we pass an optional connection port in.
    var socketURI = port ? ':'+port+'/' : '/';
    res.set('Content-Type', 'text/javascript');
    res.send('var socketURI=window.location.hostname+"'+socketURI+'";');
});

// Our express application functions as our main listener for HTTP requests
// in this example which is why we don't just invoke listen on the app object.
server = require('http').createServer(app);
server.listen(PORT, IPADDRESS);





// socket.io augments our existing HTTP server instance.
io = require('socket.io').listen(server);




























app.engine('ntl', function (filePath, options, callback) { // define the template engine
    fs.readFile(filePath, function (err, content) {
        if (err) return callback(new Error(err));
        // this is an extremely simple template engine
        var rendered = content.toString().replace('#ip#', options.ip );
        return callback(null, rendered);
    });
});
app.set('views', './'); // specify the views directory
app.set('view engine', 'ntl'); // register the template engine

app.get( '/', function( req, res ){
    /*console.log('trying to load %s', __dirname + '/index.html');
    res.sendFile( '/index.html' , { root:__dirname });*/
    res.render('index', { ip: ipaddress});

});
app.get( '/*' , function( req, res, next ) {

    //This is the current file they have requested
    var file = req.params[0];

    //For debugging, we can track what files are requested.
    if(verbose) console.log('\t :: Express :: file requested : ' + file);

    //Send the requesting client the file.
    res.sendFile( __dirname + '/' + file );

});









var logged = false;
io.sockets.on('connection', function (socket, pseudo) {


    // Quand un client se connecte, on lui envoie un message
    socket.emit('message', 'Vous êtes bien connecté !');
    // On signale aux autres clients qu'il y a un nouveau venu

    // Dès qu'on nous donne un pseudo, on le stocke en variable de session
    socket.on('petit_nouveau', function(pseudo) {
        socket.pseudo = pseudo;
        // une fois connecté on broadcast le pseudo du joueur
        socket.broadcast.emit('connexion', pseudo);
        logged = true;
    });
    socket.on('replyPseudo', function(p) {
        socket.broadcast.emit('broadcastPseudo',p);
    }); 

    //écoute des position
    socket.on('position', function(position) {
        if(logged){
            console.log(socket.pseudo + ' position : ' + position);
            socket.broadcast.emit('posJoueur',socket.pseudo + ' pos: ' + position);
        }
    });
    socket.on('rotation', function(rotation) {
        if(logged){
            console.log(socket.pseudo + ' rotation : ' + rotation);
            socket.broadcast.emit('rotJoueur',socket.pseudo + ' rot: ' + rotation);
        }
    });


    socket.on('serverMapRequest', function(s) {
        console.log("sending map");
        socket.emit('serverMapReply',map.asString);
    });


    // Dès qu'on reçoit un "message" (clic sur le bouton), on le note dans la console
    socket.on('message', function (message) {
        // On récupère le pseudo de celui qui a cliqué dans les variables de session
        console.log(socket.pseudo + ' sent message : ' + message);
    }); 



    //gestion des attaques
    socket.on('bulletFire', function(b) {
        console.log('bullets fired'+b);
        socket.broadcast.emit('broadcastBulletFire',b);
    }); 
    socket.on('handFire', function(b) {
        console.log('hand fired'+b);
        socket.broadcast.emit('broadcastHandFire',b);
    }); 
    //fin de la gestion de attaques
    socket.on('disconnect', function () {
        socket.broadcast.emit('disconect',socket.pseudo);

    });
});




//server.listen(8080);

var world = function(){
    this.height = random(1,2);
    this.width = random(30,40);
    this.lenght = random(30,40);
    this.asString = "";

    for(var i = 0 ; i <= this.width ; i++){
        for(var j = 0 ; j <= this.lenght ; j++){
            for(var k = 0 ; k <= this.height ; k++){
                if(i==0||j==0||k==0||i+1>=this.width||j+1>=this.lenght){
                    this.asString=this.asString+i+","+j+","+k+";";
                }
                else
                {
                    if(random(0,30)<=1){
                        this.asString=this.asString+i+","+j+","+k+";";
                    }
                }
            }
        }
    }
}

function random(min, max) {
    return (Math.random() * (max - min) + min);
}
var map = new world;
