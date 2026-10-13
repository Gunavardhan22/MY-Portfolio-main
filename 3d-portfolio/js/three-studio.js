/* Shared three.js helpers for the hero scene and the project turntable. */
(function () {
  'use strict';

  // Hex colours are authored in sRGB; three.js lights in linear space.
  window.srgbColor = (THREE, hex) => new THREE.Color(hex).convertSRGBToLinear();

  // Soft studio lighting baked into an environment map, for believable reflections.
  window.createStudioEnvironment = function createStudioEnvironment(THREE, renderer) {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(
      new THREE.BoxGeometry(20, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0x0b0b10, side: THREE.BackSide })
    ));
    const panel = (color, strength, w, h, x, y, z) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(strength), side: THREE.DoubleSide })
      );
      mesh.position.set(x, y, z);
      mesh.lookAt(0, 0, 0);
      env.add(mesh);
    };
    panel(0xffffff, 3, 8, 4, 0, 8, 2);      // overhead softbox
    panel(0xffb08a, 2.5, 3, 10, -8, 1, 3);  // warm side strip
    panel(0x7fb2ff, 2.5, 3, 10, 8, 0, -3);  // cool kicker
    panel(0xffffff, 1.2, 6, 3, 0, 1, 9);    // front fill

    const pmrem = new THREE.PMREMGenerator(renderer);
    const texture = pmrem.fromScene(env, 0.02).texture;
    pmrem.dispose();
    return texture;
  };
})();
