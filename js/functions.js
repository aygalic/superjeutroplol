function random(min, max) {
    return (Math.random() * (max - min) + min);
}
function getForwardVector(rotation){
    var rotationMatrix = BABYLON.Matrix.RotationYawPitchRoll(rotation.y, rotation.x, rotation.z);  
    var forward = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0, 0, 1), rotationMatrix);
    return forward;
}