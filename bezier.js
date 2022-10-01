var BEZIER = {};
BEZIER.controls = [];
BEZIER.steps = 100;
BEZIER.camera = null;
BEZIER.scene = null;
BEZIER.renderer = null;
BEZIER.width = null;
BEZIER.height = null;

BEZIER.Setup = function(width, height) {
	BEZIER.width = width;
	BEZIER.height = height;
	
	BEZIER.scene = new THREE.Scene();
	BEZIER.SetupCamera();
	BEZIER.SetupRenderer();
	
	document.body.appendChild(BEZIER.renderer.domElement);
	
	BEZIER.DrawCurve();
}

BEZIER.SetupCamera = function() {
	BEZIER.camera = new THREE.PerspectiveCamera(75, BEZIER.width / BEZIER.height, 1, 1000);
	BEZIER.camera.position.z = 100;
}

BEZIER.SetupRenderer = function() {
	BEZIER.renderer = new THREE.WebGLRenderer();
	BEZIER.renderer.setClearColor(0x000000, 1.0);
	BEZIER.renderer.setSize(BEZIER.width, BEZIER.height);
}


BEZIER.DrawCurve = function() {
	BEZIER.controls = [{x : -10, y : -10}, {x : -10, y : 10}, {x : 10, y : 10}, {x : 10, y : -10}, {x: 20, y: 0}];
	
	let curveGeometry = new THREE.BufferGeometry();
	let curveMaterial = new THREE.LineBasicMaterial();
	
	let curveLine = new THREE.Line(curveGeometry, curveMaterial);
	
	BEZIER.scene.add(curveLine);
	
	let curve = new Float32Array((BEZIER.steps + 1) * 3);
	
	curveGeometry.setAttribute('position', new THREE.BufferAttribute(curve, 3));
	
	let z = 0;
	let node;
	
	for (let step = 0; step <= BEZIER.steps; step += 1) {
		node = BEZIER.GetNode(BEZIER.controls, step / BEZIER.steps);
		
		curve[3 * step + 0] = node.x;
		curve[3 * step + 1] = node.y;
		curve[3 * step + 2] = z;
	}
	
	curveGeometry.setDrawRange(0, BEZIER.steps + 1);
	
	BEZIER.renderer.render(BEZIER.scene, BEZIER.camera);
}

BEZIER.GetNode = function(points, t) {
	let n = points.length;
	
	if (n == 1)
		return points[0];
	
	let a, b;
	
	let newPoints = []
	
	for (let i = 0; i < n - 1; i++) {
		a = points[i];
		b = points[i+1];
		
		newPoints.push({x : a.x + (b.x - a.x) * t, y : a.y + (b.y - a.y) * t});
	}
	
	return BEZIER.GetNode(newPoints, t);
}


// window.addEventListener('load', function(e) {
	// BEZIER.Setup(window.innerWidth, window.innerHeight);
// });