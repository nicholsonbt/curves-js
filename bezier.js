var BEZIER = {};
BEZIER.controls = [];
BEZIER.steps = null;
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
	
	BEZIER.Draw();
}

BEZIER.SetupCamera = function() {
	BEZIER.camera = new THREE.OrthographicCamera(-BEZIER.width / 2, BEZIER.width / 2, BEZIER.height / 2, -BEZIER.height / 2, 1, 1000)
	BEZIER.camera.position.z = 100;
}

BEZIER.SetupRenderer = function() {
	BEZIER.renderer = new THREE.WebGLRenderer();
	BEZIER.renderer.setClearColor(0x000000, 1.0);
	BEZIER.renderer.setSize(BEZIER.width, BEZIER.height);
}

BEZIER.GetScaleAndOffset = function() {
	let size = BEZIER.GetSize(BEZIER.controls);
	let scale = BEZIER.GetScale(size);
	let offset = BEZIER.GetOffset(size);
	
	return [scale, offset];
}


BEZIER.Draw = function() {
	BEZIER.controls = [{x : -10, y : -10}, {x : -10, y : 10}, {x : 10, y : 10}, {x : 10, y : -10}, {x: 20, y: 0}];
	BEZIER.steps = 100;
	
	let so = BEZIER.GetScaleAndOffset()
	
	BEZIER.DrawControls(so[0], so[1]);
	BEZIER.DrawCurve(so[0], so[1]);
	
	BEZIER.renderer.render(BEZIER.scene, BEZIER.camera);
}


BEZIER.DrawControls = function(scale, offset) {
	var node;
	
	for (let i = 0; i < BEZIER.controls.length; i++) {
		
		node = new THREE.Mesh(
			new THREE.SphereGeometry(5, 16, 16),
			new THREE.MeshBasicMaterial( {color: new THREE.Color( 0xff0000 )} )
		);
		
		node.position.set(
			(BEZIER.controls[i].x - offset[0]) * scale,
			(BEZIER.controls[i].y - offset[1]) * scale,
			0
		);
		
		BEZIER.scene.add(node);
	}
}



BEZIER.DrawCurve = function(scale, offset) {
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
		
		curve[3 * step + 0] = (node.x - offset[0]) * scale;
		curve[3 * step + 1] = (node.y - offset[1]) * scale;
		curve[3 * step + 2] = z;
	}
	
	curveGeometry.setDrawRange(0, BEZIER.steps + 1);
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

BEZIER.GetSize = function(controls) {
	let minX = Number.MAX_VALUE;
	let minY = Number.MAX_VALUE;
	let maxX = -Number.MAX_VALUE;
	let maxY = -Number.MAX_VALUE;
	
	for (let i = 0; i < controls.length; i++) {
		minX = Math.min(minX, controls[i].x);
		minY = Math.min(minY, controls[i].y);
		maxX = Math.max(maxX, controls[i].x);
		maxY = Math.max(maxY, controls[i].y);
	}
	
	return [minX * 1.5, minY * 1.5, maxX * 1.5, maxY * 1.5];
}

BEZIER.GetScale = function(size) {
	widthScale = BEZIER.width / (size[2] - size[0]);
	heightScale = BEZIER.height / (size[3] - size[1]);
	
	return Math.min(widthScale, heightScale);
}

BEZIER.GetOffset = function(size) {
	return [(size[2] + size[0]) / 2, (size[3] + size[1]) / 2];
}