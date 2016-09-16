function runDemo(canvasId) {
    var canvas = document.getElementById(canvasId);
    var engine = new BABYLON.Engine(canvas, true);

    // Création de la scène
    var scene = new BABYLON.Scene(engine);
    scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    scene.collisionsEnabled = true;

    // Ajout d'une caméra et de son contrôleur
    var camera = new BABYLON.FreeCamera("MainCamera", new BABYLON.Vector3(0, 2.5, 5), scene);
    camera.applyGravity = true;
    camera.checkCollisions = true;

    camera.speed = 0.5;
    camera.angularSensibility = 1000;

    camera.keysUp = [90]; // Touche Z
    camera.keysDown = [83]; // Touche S
    camera.keysLeft = [81]; // Touche Q
    camera.keysRight = [68]; // Touche D;
    scene.activeCamera.attachControl(canvas);

    // Ajout d'une lumière
    var light = new BABYLON.PointLight("DirLight", new BABYLON.Vector3(0, 10, 0), scene);
    light.diffuse = new BABYLON.Color3(1, 1, 1);
    light.specular = new BABYLON.Color3(0.6, 0.6, 0.6);
    light.intensity = 2.5;


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
        var bullet = new Bullet(camera, scene);
        bullets.push(bullet);
    });

    // Lancement de la boucle principale
    engine.runRenderLoop(function() {
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

        scene.render();
    });
}
// Lancement de la boucle principale
engine.runRenderLoop(function() {
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

    scene.render();
});
