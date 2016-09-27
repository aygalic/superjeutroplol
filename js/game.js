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
    camera.ellipsoid = new BABYLON.Vector3(1, 2, 1);
    camera.checkCollisions = true;
    camera.speed = 0.5;
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



    //document.addEventListener("contextmenu", function (e) { e.preventDefault();	});

    // On ajoute une skybox
    createSkybox(scene);

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
    var bullets = [];
    canvas.addEventListener("mouseup", function (e) {
        var dirbullet = getForwardVector(camera.rotation);
        var posbullet = camera.position.clone();
        socket.emit('bulletFire', dirbullet+";"+posbullet+";"+pseudo);
        var bullet = new EnemyBullet(posbullet, dirbullet, scene, pseudo);
        bullets.push(bullet);
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
        var player = BABYLON.Mesh.CreateBox(joueur, 1.0, scene);//lala

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
            var player = BABYLON.Mesh.CreateBox(p, 1.0, scene);//lala

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
    // Lancement de la boucle principale
    engine.runRenderLoop(function() {
        //on envoi au serveur notre position si celle ci change
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
                alert('T mor dan lgame frr'+mesh.tag);
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
function createSkybox(scene) {
    // Création d'une material
    var sMaterial = new BABYLON.StandardMaterial("skyboxMaterial", scene);
    sMaterial.backFaceCulling = false;
    sMaterial.reflectionTexture = new BABYLON.CubeTexture("../textures/skybox/skybox", scene);
    sMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    // Création d'un cube avec la material adaptée
    var skybox = BABYLON.Mesh.CreateBox("skybox", 2500, scene);
    skybox.infiniteDistance = true;
    skybox.material = sMaterial;
}
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
function createPlayer(scene, camera) {
    var hitbox = BABYLON.Mesh.CreateBox("", 3.0, scene);//lala
    hitbox.parent=camera;
    var materialAlpha = new BABYLON.StandardMaterial("texture1", scene);
    hitbox.material =materialAlpha;
    materialAlpha.alpha = 0;
    hitbox.tag="hitbox";
    BABYLON.SceneLoader.ImportMesh("", "../models/", "ak-47.babylon", scene, function (newMeshes) {
        // Set the target of the camera to the first imported mesh
        for(var i=0; i<newMeshes.length;i++){
            //newMeshes[i].material = new BABYLON.StandardMaterial("shoe", scene);
            newMeshes[i].position.x = 1;
            newMeshes[i].position.y = -0.7;;
            newMeshes[i].position.z = 2
            newMeshes[i].parent = camera;
            newMeshes[i].scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        }
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
function random(min, max) {
    return (Math.random() * (max - min) + min);
}
function getForwardVector(rotation){
    var rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(rotation.y, rotation.x, rotation.z);  
    var forward = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, 1), rotationMatrix);
    return forward;
}
runDemo("renderCanvas");