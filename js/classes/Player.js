function createPlayer(scene, camera) {
    var weapon = BABYLON.Mesh.CreateBox("weapon", 1, scene);
    weapon.scaling = new BABYLON.Vector3(0.2, 0.2, 0.5);
    weapon.material = new BABYLON.StandardMaterial("wMaterial", scene);
    weapon.material.diffuseTexture = new BABYLON.Texture("textures/gun.png", scene);
    weapon.position.x = 0.4;
    weapon.position.y = -0.3;;
    weapon.position.z = 1;;
    weapon.parent = camera;
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
    keys.push({ frame: 10, value: cam.position.y + 8 });
    keys.push({ frame: 20, value: cam.position.y });
    a.setKeys(keys);
    var easingFunction = new BABYLON.CircleEase();
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    a.setEasingFunction(easingFunction);
    cam.animations.push(a);
    scene.beginAnimation(cam, 0, 20, false);
} 