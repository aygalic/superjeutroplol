var Bullet = function (camera, scene) {
    // 1. Création du mesh et du material de la munition
    var mesh = BABYLON.Mesh.CreateSphere("bullet", 1, 1, scene);
    mesh.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
    mesh.material = new BABYLON.StandardMaterial("bMat", scene);
    mesh.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
    mesh.position = camera.position.clone();

    // 2. On determine la direction
    var direction = getForwardVector(camera.rotation);
    direction.normalize();

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
    }, 1500);

    // La vitesse est publique, on peut la modifier facilement
    this.speed = 0.5;

    // 5. Logique de mise à jour
    this.update = function () {
        if (!alive) {
            return false;
        }
        // On incrémente la position avec la direction et la vitesse désirée.
        mesh.position.x += direction.x * this.speed;
        mesh.position.y += direction.y * this.speed;
        mesh.position.z += direction.z * this.speed;

        // On test les collision manuellement. Si on tombe sur un objet ayant un tag
        // Alors on le supprime
        var meshToRemove = null;
        var i = 0;
        var size = scene.meshes.length;
        var hit = false;

        while (i < size && !hit) {
            if (scene.meshes[i].tag && mesh.intersectsMesh(scene.meshes[i], false)) {
                meshToRemove = scene.meshes[i];
            }
            i++;
        }

        if (meshToRemove) {
            meshToRemove.dispose();
            return true;
        }

        return false;
    };

    this.dispose = function () {
        internalDispose();
    };
};
var bullets = [];
canvas.addEventListener("mouseup", function (e) {
    var bullet = new Bullet(camera, scene);
    bullets.push(bullet);
});     