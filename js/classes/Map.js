function createSkybox(scene) {
    // Création d'une material
    var sMaterial = new BABYLON.StandardMaterial("skyboxMaterial", scene);
    sMaterial.backFaceCulling = false;
    sMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox/skybox", scene);
    sMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    // Création d'un cube avec la material adaptée
    var skybox = BABYLON.Mesh.CreateBox("skybox", 250, scene);
    skybox.infiniteDistance = true;
    skybox.material = sMaterial;
}
function createDemoScene(scene) {
    // Création d'un sol
    var ground = BABYLON.Mesh.CreatePlane("ground", 150, scene);
    ground.rotation.x = Math.PI / 2;
    ground.material = new BABYLON.StandardMaterial("gMaterial", scene);
    ground.material.diffuseTexture = new BABYLON.Texture("textures/ground.png", scene);
    ground.checkCollisions = true;

    // Et quelques cubes...
    var boxMaterial = new BABYLON.StandardMaterial("bMaterial", scene);
    boxMaterial.diffuseTexture = new BABYLON.Texture("textures/crate.png", scene);

    var cubeSize = 2.5;

    for (var i = 0; i < 150; i++) {
        var box = BABYLON.Mesh.CreateBox("box1", cubeSize, scene);
        box.tag = "enemy";
        box.position = new BABYLON.Vector3(random(0, 50),random(1, 50), random(0, 50));
        box.material = boxMaterial;
        box.checkCollisions = true;
    }
}