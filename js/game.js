function runDemo(canvasId) {
    var canvas = document.getElementById(canvasId);
    var engine = new BABYLON.Engine(canvas, true);
    // Création de la scène
    var scene = new BABYLON.Scene(engine);
    scene.gravity = new BABYLON.Vector3(0, -1, 0);
    scene.collisionsEnabled = true;
    // Ajout d'une caméra et de son contrôleur
    var camera = new BABYLON.FreeCamera("MainCamera", new BABYLON.Vector3(0, 2.5, 5), scene);
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 2.5, 1);
    camera.checkCollisions = true;
    camera.speed = 0.8;
    camera.position.y +=5;
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




    // Enfin la scène de démo
    createDemoScene(scene);

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
    var hp=5;
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
        /*var dirbullet = getForwardVector(camera.rotation);
        var posbullet = camera.position.clone();
        socket.emit('bulletFire', dirbullet+";"+posbullet+";"+pseudo);*/
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



    var joueurs=[];
    var pseudos=[];
    socket.on('connexion', function(joueur) {
        alert(joueur+' viens de se connecter');
        //etape1
        socket.emit('replyPseudo', pseudo);
        // on cré le corps du nouveau joueur
        var player = BABYLON.Mesh.CreateBox(joueur, 0.1, scene);//lala
        BABYLON.SceneLoader.ImportMesh("", "../models/", "ak-47.babylon", scene, function (newMeshes) {
            //merge meshes
            var newMesh = BABYLON.Mesh.MergeMeshes(newMeshes, true, true);
            //attach weapon to camera
            newMesh.parent=player;
            newMesh.position.x = 1;
            newMesh.position.y = -0.7;
            newMesh.position.z = 2;
            newMesh.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        });
        BABYLON.SceneLoader.ImportMesh("", "../models/", "bear.babylon", scene, function (newMeshes) {
            //merge meshes
            var newMesh = BABYLON.Mesh.MergeMeshes(newMeshes, true, true);
            //attach weapon to camera
            newMesh.parent=player;
            newMesh.position.y = -0.7;
            //newMesh.scaling = new BABYLON.Vector3(3, 3, 3);
        });
        player.position = new BABYLON.Vector3(1,1,1);
        // on ajoute le joueur a notre tableau de joueurs
        joueurs.push(player);
        pseudos.push(joueur);
    })
    //3e etape en construction
    socket.on('broadcastPseudo', function(p) {
        // on cré le corps du nouveau joueur
        //alert('fonction broadcastPseudo recue');
        var testPseudo=false;
        for(var i=0; i<pseudos.length;i++){
            if(pseudos[i]==p){
                testPseudo=true;
            }
        }
        if(!testPseudo){
            var player = BABYLON.Mesh.CreateBox(joueur, 0.1, scene);//lala
            BABYLON.SceneLoader.ImportMesh("", "../models/", "ak-47.babylon", scene, function (newMeshes) {
                //merge meshes
                var newMesh = BABYLON.Mesh.MergeMeshes(newMeshes, true, true);
                //attach weapon to camera
                newMesh.parent=player;
                newMesh.position.x = 1;
                newMesh.position.y = -0.7;
                newMesh.position.z = 2;
                newMesh.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
            });
            BABYLON.SceneLoader.ImportMesh("", "../models/", "bear.babylon", scene, function (newMeshes) {
                //merge meshes
                var newMesh = BABYLON.Mesh.MergeMeshes(newMeshes, true, true);
                //attach weapon to camera
                newMesh.parent=player;
                newMesh.position.y = -0.7;
                //newMesh.scaling = new BABYLON.Vector3(3, 3, 3);
            });
            player.position = new BABYLON.Vector3(1,1,1);
            // on ajoute le joueur a notre tableau de joueurs
            joueurs.push(player);
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
        alert('un joueur viens de se deconnecter');
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
            //check colision

        }

        for (var i = 0, l = toRemove.length; i < l; i++) {
            bullets.splice(toRemove[i], 1);
        }

        scene.render();
    });
}




var EnemyBullet = function (posbullet, directionbullet, scene, pseudobullet) {
    // 1. Création du mesh et du material de la munition
    var mesh = BABYLON.Mesh.CreateSphere("bullet", 1, 1, scene);
    mesh.material = new BABYLON.StandardMaterial("bMat", scene);
    mesh.tag=pseudobullet
    mesh.material.diffuseColor = new BABYLON.Color3(1, 0, 0);

    if(mesh.tag==pseudo){
        mesh.position=posbullet;
        var direction=directionbullet;
    }
    else{
        mesh.position.x = Number(posbullet.split(':')[1].trim().split('Y')[0].trim());
        mesh.position.y = Number(posbullet.split(':')[2].trim().split('Z')[0].trim());
        mesh.position.z = Number(posbullet.split(':')[3].trim().split('}')[0].trim());

        // 2. On determine la direction

        var direction = new BABYLON.Vector3(1, 1, 1);
        direction.x = Number(directionbullet.split(':')[1].trim().split('Y')[0].trim());
        direction.y = Number(directionbullet.split(':')[2].trim().split('Z')[0].trim());
        direction.z = Number(directionbullet.split(':')[3].trim().split('}')[0].trim());
        direction.normalize();


    }




    // 3. Il est vivant ! (pour le moment)
    var alive = true;
    var lifeTimer = null;

    var internalDispose = function () {
        if (alive) {
            if (lifeTimer) {
                clearTimeout(lifeTimer);
            }

            mesh.dispose();
            lifeTimer = null;
            alive = false;
        } 
    };

    // 4. Au bout de 1.5 secondes on supprime le projectil de la scène.
    lifeTimer = setTimeout(function() {
        internalDispose();
    }, 5000);

    // La vitesse est publique, on peut la modifier facilement
    this.speed = 5;

    // 5. Logique de mise à jour
    this.update = function () {
        if (!alive) {
            return false;
        }
        // On incrémente la position avec la direction et la vitesse désirée.

        try {
            mesh.position.x += direction.x * this.speed;
            mesh.position.y += direction.y * this.speed;
            mesh.position.z += direction.z * this.speed;

        }
        catch (e) {
            alert(e); 
        }
        //alert(mesh.position);
        // On test les collision manuellement. Si on tombe sur un objet ayant un tag
        // Alors on le supprime
        var meshToRemove = null;
        var i = 0;
        var size = scene.meshes.length;
        var hit = false;
        if(mesh.tag!=pseudo){
            while (i < size && !hit) {
                if (scene.meshes[i].tag=="hitbox" && mesh.intersectsMesh(scene.meshes[i], false) ) {
                    meshToRemove = scene.meshes[i];
                }
                i++;
            }
            if (meshToRemove) { 
                //hp=hp-1;
                //if(hp = 0){
                    alert('T mor dan lgame frr'+mesh.tag);
                  //  hp=5;
                //}
                //meshToRemove.dispose();
                return true;
            }
        }


        return false;
    };

    this.dispose = function () {
        internalDispose();
    };
};
var bullets = [];

function createDemoScene(scene) {
    // Création d'un sol
    var material1 = new BABYLON.StandardMaterial("texture1", scene);
    material1.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7);
    BABYLON.SceneLoader.ImportMesh("", "../models/", "map.babylon", scene, function (newMeshes) {
        // Set the target of the camera to the first imported mesh
        for(var i=0; i<newMeshes.length;i++){
            newMeshes[i].scaling = new BABYLON.Vector3(3, 3, 3  );
            newMeshes[i].material = new BABYLON.StandardMaterial("gMaterial", scene);
            newMeshes[i].checkCollisions = true;
            newMeshes[i].material = material1;
        }

    });

}
var weapon;
var hand;
function createPlayer(scene, camera) {
    var hitbox = BABYLON.Mesh.CreateBox("", 3.0, scene);//lala
    hitbox.parent=camera;
    var materialAlpha = new BABYLON.StandardMaterial("texture1", scene);
    hitbox.material =materialAlpha;
    materialAlpha.alpha = 0;
    hitbox.tag="hitbox";
    BABYLON.SceneLoader.ImportMesh("", "../models/", "ak-47.babylon", scene, function (newMeshes) {
        //merge meshes
        var newMesh = BABYLON.Mesh.MergeMeshes(newMeshes, true, true);
        //attach weapon to camera
        newMesh.parent=camera;
        newMesh.position.x = 1;
        newMesh.position.y = -0.7;
        newMesh.position.z = 2;
        newMesh.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        weapon=newMesh;
    });
    BABYLON.SceneLoader.ImportMesh("", "../models/", "hand.babylon", scene, function (newMeshes) {
        //merge meshes
        var newMesh = BABYLON.Mesh.MergeMeshes(newMeshes, true, true);
        //attach weapon to camera
        newMesh.parent=camera;

        newMesh.position.x = -2;
        newMesh.position.y = -5 /*NORMALEMENT 0*/;
        newMesh.position.z = 3;
        newMesh.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
        newMesh.checkCollisions=true;
        hand=newMesh;
    });

}
var cameraJump = function(scene, camera) {
    var cam = camera;
    cam.animations = [];
    var a = new BABYLON.Animation(
        "a",
        "position.y", 20,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    // Animation keys
    var keys = [];
    keys.push({ frame: 0, value: cam.position.y });
    keys.push({ frame: 20, value: cam.position.y + 10 });
    keys.push({ frame: 40, value: cam.position.y-10 });
    a.setKeys(keys);
    var easingFunction = new BABYLON.QuarticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    a.setEasingFunction(easingFunction);
    cam.animations.push(a);
    scene.beginAnimation(cam, 0, 20, false);
} 
var fireAnimation = function(scene, weapon, camera) {
    var cam = camera;
    weapon.animations = [];

    var b = new BABYLON.Animation(
        "b",
        "position.z", 20,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    // Animation keys
    var keys = [];
    keys.push({ frame: 0, value: cam.position.z - cam.position.z+2});
    keys.push({ frame: 2, value: cam.position.z - cam.position.z+1.9});
    keys.push({ frame: 4, value: cam.position.z - cam.position.z+2});

    b.setKeys(keys);
    var easingFunction = new BABYLON.QuarticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    b.setEasingFunction(easingFunction);
    weapon.animations.push(b);

    scene.beginAnimation(weapon, 0, 4, false);
} 
var giffleAnimation = function(scene, hand, camera) {
    var cam = camera;
    hand.animations = [];

    var b = new BABYLON.Animation(
        "b",
        "position.z", 20,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    // Animation keys
    var keys = [];
    keys.push({ frame: 0, value: cam.position.z - cam.position.z+3});
    keys.push({ frame: 10, value: cam.position.z - cam.position.z+30});
    keys.push({ frame: 20, value: cam.position.z - cam.position.z+3});

    b.setKeys(keys);
    var easingFunction = new BABYLON.QuarticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    b.setEasingFunction(easingFunction);
    hand.animations.push(b);

    scene.beginAnimation(hand, 0, 20, false);
} 
var rangerArme = function(scene, weapon, camera, varY) {
    var cam = camera;
    weapon.animations = [];

    var b = new BABYLON.Animation(
        "b",
        "position.y", 40,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    // Animation keys
    var keys = [];
    keys.push({ frame: 0, value: cam.position.y - cam.position.y+varY});
    keys.push({ frame: 50, value: cam.position.y - cam.position.y-5});

    b.setKeys(keys);
    var easingFunction = new BABYLON.QuarticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    b.setEasingFunction(easingFunction);
    weapon.animations.push(b);

    scene.beginAnimation(weapon, 0, 50, false);
} 
var sortirArme = function(scene, weapon, camera, varY) {
    var cam = camera;
    weapon.animations = [];

    var b = new BABYLON.Animation(
        "b",
        "position.y", 40,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    // Animation keys
    var keys = [];
    keys.push({ frame: 0, value: cam.position.y - cam.position.y-5});
    keys.push({ frame: 50, value: cam.position.y - cam.position.y+varY});

    b.setKeys(keys);
    var easingFunction = new BABYLON.QuarticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    b.setEasingFunction(easingFunction);
    weapon.animations.push(b);

    scene.beginAnimation(weapon, 0, 50, false);
} 

function random(min, max) {
    return (Math.random() * (max - min) + min);
}
function getForwardVector(rotation){
    var rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(rotation.y, rotation.x, rotation.z);  
    var forward = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, 1), rotationMatrix);
    return forward;
}
runDemo("renderCanvas");