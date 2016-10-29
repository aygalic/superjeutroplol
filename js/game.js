function runDemo(canvasId) {

    var canvas = document.getElementById(canvasId);
    var engine = new BABYLON.Engine(canvas, true);
    // Création de la scène
    var scene = new BABYLON.Scene(engine);
    scene.gravity = new BABYLON.Vector3(0, -0.2, 0);
    scene.collisionsEnabled = true;
    // Ajout d'une caméra et de son contrôleur
    camera = new BABYLON.FreeCamera("MainCamera", new BABYLON.Vector3(0, 2.5, 5), scene);
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 2.5, 1);
    camera.checkCollisions = true;
    camera.speed = 2;
    camera.position.y +=3;
    camera.angularSensibility = 1000;

    camera.keysUp = [90]; // Touche Z
    camera.keysDown = [83]; // Touche S
    camera.keysLeft = [81]; // Touche Q
    camera.keysRight = [68]; // Touche D;
    scene.activeCamera.attachControl(canvas);
    // engine.isPointerLock = true;




    canvas.addEventListener('click', function (event) {
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
        if (canvas.requestPointerLock) canvas.requestPointerLock();
    });

    // control handling: no mouse swipe
    camera.attachControl(canvas, true);
    camera.inputs.remove(camera.inputs.attached.mouse);

    // mouse move when pointer is locked
    document.addEventListener('mousemove', function(event) {
        if(document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {

            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            // apply rotation to active camera
            scene.activeCamera.rotation.y += movementX * 0.002;
            scene.activeCamera.rotation.x += movementY * 0.002;
            scene.activeCamera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, scene.activeCamera.rotation.x));
        }
    }, false);





    // Ajout d'une lumière

    var light0 = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, 1, 0), scene);
    light0.diffuse = new BABYLON.Color3(1, 1, 1);
    light0.specular = new BABYLON.Color3(1, 1, 1);
    light0.groundColor = new BABYLON.Color3(0, 0, 0);




    /*
    var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(20, 20, 100), scene);
    var godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 1, camera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, engine, false);

    // By default it uses a billboard to render the sun, just apply the desired texture
    // position and scale
    godrays.mesh.material.diffuseTexture = new BABYLON.Texture('textures/sun.png', scene, true, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
    godrays.mesh.material.diffuseTexture.hasAlpha = true;
    godrays.mesh.position = new BABYLON.Vector3(-150, 150, 150);
    godrays.mesh.scaling = new BABYLON.Vector3(35, 35, 35);

    light.position = godrays.mesh.position;

    */


    // Enfin la scène de démo

    //var map = createDemoScene(scene);

    getServerMap(scene);
    socket.on('serverMapReply', function(s) {
        createServerMap(s, scene);
    })





    // Ajout du joueur
    createPlayer(scene, camera);                
    // Gestion des saut
    window.addEventListener("keyup", onKeyUp, false);
    function onKeyUp(event) {
        switch (event.keyCode) {
            case 32:
                cameraJump(scene, camera);
                break;
        }
    }
    //gestion du changement d'arme
    var actualWeapon=1;
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        //alert(evt.sourceEvent.key);
        if (evt.sourceEvent.key == "Shift") {
            if(actualWeapon==2){
                rangerArme(scene, hand, camera,0);
                actualWeapon=1;
                sortirArme(scene, weapon, camera,-0.7);
            }
            else if(actualWeapon==1){
                rangerArme(scene, weapon, camera,-0.7);
                actualWeapon=2;
                sortirArme(scene, hand, camera,0);
            }
        }
    }));
    var bullets = [];
    var autoFire = setInterval(fire, 0);
    clearInterval(autoFire);
    function fire()
    {
        var dirbullet = getForwardVector(camera.rotation);
        var posbullet = camera.position.clone();
        socket.emit('bulletFire', dirbullet+";"+posbullet+";"+pseudo);
        fireAnimation(scene, weapon, camera);
        var bullet = new EnemyBullet(posbullet, dirbullet, scene, pseudo);
        bullets.push(bullet);
    }
    function giffle()
    {
        var dirhand = getForwardVector(camera.rotation);
        var poshand = camera.position.clone();
        socket.emit('handFire', dirhand+";"+poshand+";"+pseudo);
        giffleAnimation(scene, hand, camera);
    }
    canvas.addEventListener("mousedown", function (e) {
        if(actualWeapon==1)
            autoFire = setInterval(fire, 150);
        else if(actualWeapon==2){
            giffle();
        }
    });
    canvas.addEventListener("mouseup", function (e) {
        if(actualWeapon==1)
            clearInterval(autoFire);
    });
    socket.on('broadcastBulletFire', function(b) {
        var posbullet= b.split(";")[1];
        var dirbullet= b.split(";")[0];
        var pseudobullet = b.split(";")[2];
        var bullet = new EnemyBullet(posbullet, dirbullet, scene, pseudobullet);
        bullets.push(bullet);

    })
    socket.on('broadcastHandFire', function(b) {
        var poshand= b.split(";")[1];
        var dirhand= b.split(";")[0];
        var pseudohand = b.split(";")[2];
        var enemyCamera;
        var enemyHand;
        for(var i=0, l=joueurs.length;i<l;i++ ){
            if(joueurs[i].id==pseudohand){
                enemyCamera=joueurs[i];
            }
            for(var i=0;i<scene.meshes.length;i++){
                if(scene.meshes[i].tag=="hand"+pseudohand){
                    enemyHand=scene.meshes[i];
                }
            }
        }   
        giffleAnimation(scene, enemyHand, enemyCamera) ;
    })

    var joueurs=[];
    var pseudos=[];
    socket.on('connexion', function(p) {
        appendChat(p+" viens de se connecter");
        socket.emit('replyPseudo', pseudo);
        var enemy = createEnemy(scene, camera, p) ;
        joueurs.push(enemy);
        pseudos.push(p);

    })
    socket.on('broadcastPseudo', function(p) {
        var testPseudo=false;
        for(var i=0; i<pseudos.length;i++){
            if(pseudos[i]==p){
                testPseudo=true;
            }
        }
        if(!testPseudo){
            var enemy = createEnemy(scene, camera, p) ;
            joueurs.push(enemy);
            pseudos.push(p);
        }

    })


    socket.on('posJoueur', function(pos) {
        var nomJoueur = pos.split('pos:')[0].trim();
        //recuperer la position du joueur
        var pos = pos.split('pos:')[1];
        //décomposer la position
        var x=pos.split(':')[1].trim().split('Y')[0];
        var y=pos.split(':')[2].trim().split('Z')[0];
        var z=pos.split(':')[3].trim().split('}')[0];
        //retrouver le bon joueur parmit la liste
        var test=1;
        for(var i=0, l=joueurs.length;i<l;i++ ){
            if(joueurs[i].id==nomJoueur){
                //actualiser la position de la boite
                joueurs[i].position = new BABYLON.Vector3(x,y,z);
                test=0;
            }

        }
        if(test==1){
            socket.emit('message', 'impossible dacctualiser la position');
        }

    })
    socket.on('rotJoueur', function(rot) {
        var nomJoueur = rot.split('rot:')[0].trim();
        //recuperer la position du joueur
        var rot = rot.split('rot:')[1];
        //décomposer la position
        var x=rot.split(':')[1].trim().split('Y')[0];
        var y=rot.split(':')[2].trim().split('Z')[0];
        var z=rot.split(':')[3].trim().split('}')[0];
        //retrouver le bon joueur parmit la liste
        var test=1;
        for(var i=0, l=joueurs.length;i<l;i++ ){
            if(joueurs[i].id==nomJoueur){
                //actualiser la position de la boite
                joueurs[i].rotation = new BABYLON.Vector3(x,y,z);
                test=0;
            }

        }
        if(test==1){
            socket.emit('message', 'impossible dacctualiser la rotation');
        }

    })


    socket.on('disconect', function(nomJoueur) {
        for(var i=0, l=joueurs.length;i<l;i++ ){
            if(joueurs[i].id==nomJoueur){
                //suppression du joueur
                joueurs.splice(i);

            }
        }
        appendChat(nomJoueur+' viens de se deconnecter');
    })
    socket.on('message', function(s) {
        appendChat(s);
    })
    var posjoueur;
    var rotjoueur;
    // Lancement de la boucle principale
    engine.runRenderLoop(function() {
        //on envoi au serveur notre position si celle ci change
        if(rotjoueur!=camera.rotation.toString()){
            rotjoueur=camera.rotation.toString()
            socket.emit('rotation', rotjoueur);
        }
        if(posjoueur!=camera.position.toString()){
            posjoueur=camera.position.toString()
            socket.emit('position', posjoueur);
        }
        var toRemove = [];
        for (var i = 0, l = bullets.length; i < l; i++) {
            if (bullets[i].update()) {
                toRemove.push(i);
                bullets[i].dispose();
            }

        }
        for (var i = 0, l = toRemove.length; i < l; i++) {
            bullets.splice(toRemove[i], 1);
        }
        for(var i=0;i<scene.meshes.length;i++){
            for(var j=0;j<scene.meshes.length;j++){
                if(scene.meshes[i].tag!=null&&scene.meshes[j].tag!=null){
                    if(scene.meshes[i].tag.indexOf("hand") != -1 &&scene.meshes[j].tag=="hitbox"){
                        if (scene.meshes[i].intersectsMesh(scene.meshes[j], false)) {
                            oliveJump(scene,camera);
                        } 
                    }
                }
            }
        }

        scene.render();
    });
}