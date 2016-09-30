var http = require('http');
var fs = require('fs');
var express         = require('express');
var app             = express();
var    verbose         = false;
var  server          = http.createServer(app);



     

app.get( '/', function( req, res ){
    console.log('trying to load %s', __dirname + '/index.html');
    res.sendFile( '/index.html' , { root:__dirname });
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
    //socket.emit('message', 'Vous êtes bien connecté !');
    // On signale aux autres clients qu'il y a un nouveau venu

    // Dès qu'on nous donne un pseudo, on le stocke en variable de session
    socket.on('petit_nouveau', function(pseudo) {
        socket.pseudo = pseudo;
        // une fois connecté on broadcast le pseudo du joueur
        socket.broadcast.emit('connexion', pseudo);
        logged = true;
    });

    //écoute des position
    socket.on('position', function(position) {
        if(logged){
            console.log(socket.pseudo + ' position : ' + position);
            socket.broadcast.emit('posJoueur',socket.pseudo + ' pos: ' + position);
        }
    });

    // Dès qu'on reçoit un "message" (clic sur le bouton), on le note dans la console
    socket.on('message', function (message) {
        // On récupère le pseudo de celui qui a cliqué dans les variables de session
        console.log(socket.pseudo + ' me parle ! Il me dit : ' + message);
    }); 
    socket.on('replyPseudo', function(p) {
        socket.broadcast.emit('broadcastPseudo',p);
    }); 

    socket.on('bulletFire', function(b) {
        console.log('bullets fired'+b);

        socket.broadcast.emit('broadcastBulletFire',b);
    }); 
    socket.on('disconnect', function () {
        socket.broadcast.emit('disconect',socket.pseudo);

    });
});



server.listen(80);