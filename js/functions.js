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
    BABYLON.SceneLoader.ImportMesh("", "../models/", "map.babylon", scene, function (newMeshes) {
        var newMesh = BABYLON.Mesh.MergeMeshes(newMeshes, true, true);
        newMesh.scaling = new BABYLON.Vector3(3, 3, 3  );
        newMesh.checkCollisions = true;
        for(var i=0;i<newMeshes.length;i++){
            newMeshes[i].dispose;
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
    camera.applyGravity = true;

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
    camera.applyGravity = true;




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
    keys.push({ frame: 10, value: prt.position.z - prt.position.z+30});
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

function random(min, max) {
    return (Math.random() * (max - min) + min);
}
function getForwardVector(rotation){
    var rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(rotation.y, rotation.x, rotation.z);  
    var forward = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, 1), rotationMatrix);
    return forward;
}
