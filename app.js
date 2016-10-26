var http            = require('http');
var fs              = require('fs');
var express         = require('express');
var app             = express();
var verbose         = false;
var server          = http.createServer(app);



var ip = require("ip");




var ipaddress= ip.address() ;

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









// Chargement de socket.io
var io = require('socket.io').listen(server);
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




server.listen(8080);
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
