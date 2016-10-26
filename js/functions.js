var EnemyBullet = function (posbullet, directionbullet, scene, pseudobullet) {
    // 1. Création du mesh et du material de la munition
    var mesh = BABYLON.Mesh.CreateSphere("bullet", 1, 1, scene);
    mesh.material = new BABYLON.StandardMaterial("texture1", scene);
    mesh.material.alpha =0;
    mesh.tag=pseudobullet;
    var particleSystem = new BABYLON.ParticleSystem("particles", 20000, scene/*, customEffect*/);
    particleSystem.particleTexture = new BABYLON.Texture("../textures/particles.png", scene);
    particleSystem.textureMask = new BABYLON.Color4(0, 01, 01, 1.0);
    particleSystem.emitter = mesh; 
    particleSystem.updateSpeed = 0.005;
    particleSystem.minLifeTime = 0.01;
    particleSystem.maxLifeTime = 0.1;
    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);


    // Emission rate
    particleSystem.emitRate = 500;
    particleSystem.minEmitPower = 10; 
    particleSystem.maxEmitPower = 30;
    particleSystem.start();


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
    this.speed = 15;

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
                lossOfHP();
                appendChat(mesh.tag+" t'as touché");
                if(hp<=0){
                    alert('T mor dan lgame frr '+mesh.tag);
                    respawn();

                }
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
    BABYLON.SceneLoader.ImportMesh("", "../models/", "map.babylon", scene, function (newMeshes) {
        var newMesh = BABYLON.Mesh.MergeMeshes(newMeshes, true, true);
        newMesh.scaling = new BABYLON.Vector3(3, 3, 3  );
        newMesh.checkCollisions = true;
        for(var i=0;i<newMeshes.length;i++){
            newMeshes[i].dispose;
        }
        return newMesh;
    });

}
function createBattleMap(scene){
    var groundMaterial = new BABYLON.StandardMaterial("texture1", scene);
    var objectMaterial = new BABYLON.StandardMaterial("texture2", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0, 0.2, 0.7);
    objectMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0.7);

    var ground = BABYLON.Mesh.CreateGround("ground", 500, 500, 2, scene);
    ground.checkCollisions=true;
    ground.material = groundMaterial;

    var knot = BABYLON.Mesh.CreateTorusKnot("knot", 40, 10, 128, 64, 2, 3, scene, false, BABYLON.Mesh.DEFAULTSIDE);
    knot.checkCollisions=true;
    knot.material = objectMaterial;

    var cylinder = BABYLON.Mesh.CreateCylinder("cylinder", 100, 40, 40, 6, 1, scene);
    cylinder.position = new BABYLON.Vector3(-100,50,200);
    cylinder.checkCollisions=true;
    cylinder.material = objectMaterial;


    var box = BABYLON.Mesh.CreateBox("box", 60, scene);
    box.position.x = -200; 
    box.position.z = -100;
    box.rotation.x = Math.PI/7; 
    box.rotation.y = Math.PI/5; 
    box.rotation.z = Math.PI/2; 
    box.checkCollisions=true;


}
function getServerMap(scene){
    socket.emit('serverMapRequest');
}
function createServerMap(s, scene){
    var arrayOfBoxes=s.split(";");
    //alert(arrayOfBoxes.length);
    for(var i = 0 ;i<arrayOfBoxes.length;i++){
        //alert("creation d'une box");
        var box = BABYLON.Mesh.CreateBox("box", 10, scene);
        box.position.x = arrayOfBoxes[i].split(",")[0]*10; 
        box.position.z = arrayOfBoxes[i].split(",")[1]*10; 
        box.position.y = arrayOfBoxes[i].split(",")[2]*10; 
        box.checkCollisions=true;
    }

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
        for(var i=0;i<newMeshes.length;i++){
            newMeshes[i].dispose;
        }
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
        for(var i=0;i<newMeshes.length;i++){
            newMeshes[i].dispose;
        }
    });

}
function createEnemy(scene, camera, pseudo) {
    var player = BABYLON.Mesh.CreateBox(pseudo, 0.1, scene);//lala
    BABYLON.SceneLoader.ImportMesh("", "../models/", "ak-47.babylon", scene, function (newMeshes) {
        var newMesh = BABYLON.Mesh.MergeMeshes(newMeshes, true, true);
        newMesh.parent=player;
        newMesh.position.x = 1;
        newMesh.position.y = -0.7;
        newMesh.position.z = 2;
        newMesh.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        for(var i=0;i<newMeshes.length;i++){
            newMeshes[i].dispose;
        }
    });
    BABYLON.SceneLoader.ImportMesh("", "../models/", "bear.babylon", scene, function (newMeshes) {
        var newMesh = BABYLON.Mesh.MergeMeshes(newMeshes, true, true);
        newMesh.parent=player;
        newMesh.position.y = -0.7;
        for(var i=0;i<newMeshes.length;i++){
            newMeshes[i].dispose;
        }
    });
    BABYLON.SceneLoader.ImportMesh("", "../models/", "hand.babylon", scene, function (newMeshes) {
        var newMesh = BABYLON.Mesh.MergeMeshes(newMeshes, true, true);
        newMesh.parent=player;
        newMesh.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
        newMesh.position.x = -2;
        newMesh.position.z = 3;
        newMesh.tag="hand"+pseudo;
        for(var i=0;i<newMeshes.length;i++){
            newMeshes[i].dispose;
        }
    });
    player.position = new BABYLON.Vector3(1,100,1);
    return player;
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
var oliveJump = function(scene, camera) {
    //alert("olive");
    var cam = camera;
    cam.animations = [];
    var a = new BABYLON.Animation(
        "a",
        "position", 20,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    // Animation keys
    var keys = [];
    keys.push({ frame: 0, value: cam.position });
    keys.push({ frame: 10, value: new BABYLON.Vector3(random(5,20), random(20,50), random(5,20)) });
    a.setKeys(keys);
    var easingFunction = new BABYLON.QuarticEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    a.setEasingFunction(easingFunction);
    cam.animations.push(a);
    scene.beginAnimation(cam, 0, 10, false);




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
var giffleAnimation = function(scene, hand, player) {
    var prt = player;
    hand.animations = [];

    var b = new BABYLON.Animation(
        "b",
        "position.z", 20,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    // Animation keys
    var keys = [];
    keys.push({ frame: 0, value: prt.position.z - prt.position.z+3});
    keys.push({ frame: 10, value: prt.position.z - prt.position.z+50});
    keys.push({ frame: 20, value: prt.position.z - prt.position.z+3});

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
function lossOfHP(){
    hp=hp-random(20,40);
    $(".actualLife").width(hp + '%');
}
function respawn(){
    camera.position.x=random(-200,200);
    camera.position.z=random(-200,200);
    hp=100;
    $(".actualLife").width(hp + '%');
}
function random(min, max) {
    return (Math.random() * (max - min) + min);
}
function getForwardVector(rotation){
    var rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(rotation.y, rotation.x, rotation.z);  
    var forward = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, 1), rotationMatrix);
    return forward;
}
