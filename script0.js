
window.onload=function(){
	var guiparams=function() {
		this.type=0;
		this.length=0;
		this.curve=0;
		this.timefactor;
		this.maxspeed=0;
		this.id="";
		this.followMe=true;
		this.intersection="";
		this.inter="";
		this.distance="";
        this.lightcolor='#feeec8';
        this.bgcolor='#cfcfcf';
		this.direction=0;
        this.fog=true;
        this.fogdistance=700;
		this.flash=false;
		this.car="car_1";
		this.carlights=true;
		this.cam2=false;
		this.signals=true;
		this.night=false;
		
	}
	var gp=new guiparams();
	/*global THREE*/
	var GAMMA_OUTPUT=false;
	var sceneWidth;
	var sceneHeight;
	var camera,camera2,orbitTargetSave=new THREE.Vector3(0,0,0),orbitTarget=new THREE.Vector3(0,0,0);
	var scene;
	var renderer;
	var dom;
	var sun;
	var ground;
	var orbitControl;
	var container;
	var dolly,dollySafePosition=new THREE.Vector3(),dollyCam=new THREE.PerspectiveCamera();
	var world;
	var lastUpdate;
	var cars = [];
	var carsarr=[];
	var roads = [];
	var inter = [];
	var places =[];
	var buildingTextures={}
	var grid;
	var pool;
	var cameraCar,ccTarget,meshCameraHelper;
	var env;
	var glowMap,blinkMap;
	var signalMesh,streetlampMesh,tanke;
	var loaded01=false, loaded02=false;
	var gui;
	var debugtext="";
	var mouse = new THREE.Vector2(), INTERSECTED;
	var stats;
	var light,flashlight,flashlightMesh,ambientLight,hemisphereLight;
    var fog;
	var BUILDING_MAT;
	var PRESENTING=false;
	var flashReady=true;
	var sky;
	

    var car_geo, car_mat = [],car_mat2 = [];
    var inter_geo, road_geo, inter_mat,  road_mat, inter_matx, marble_mat,inter_maty, inter_matz, inter_matw, inter_mate;

	var sets = {timeFactor:4};
	var V = {};
	var C = {};
	C.CarPool = function(){
    	this.meshes = {};
	}	

V.randColor = function () { return '#'+Math.floor(Math.random()*16777215).toString(16); }
V.lerp = function (a, b, percent) { return a + (b - a) * percent; }
V.randInt = function (a, b) { return V.lerp(a, b, Math.random()).toFixed(0)*1;}
V.randCarColor = function () {
	var carcolors = [
	[0xFFFFFF, 0xD0D1D3, 0XEFEFEF, 0xEEEEEE],//white
	[0x252122, 0x302A2B, 0x27362B, 0x2F312B],//black
	[0x8D9495, 0xC1C0BC, 0xCED4D4, 0xBEC4C4],//silver
	[0x939599, 0x424242, 0x5A5A5A, 0x747675],//gray
	[0xC44920, 0xFF4421, 0x600309, 0xD9141E],//red
	[0x4AD1FB, 0x275A63, 0x118DDC, 0x2994A6],//blue
	[0xA67936, 0x874921, 0xD7A56B, 0x550007],//brown
	[0x5FF12C, 0x188047, 0x8DAE29, 0x1AB619],//green
	[0xFFF10A, 0xFFFFBD, 0xFCFADF, 0xFFBD0A],//yellow/gold
	[0xB92968, 0x5C1A4F, 0x001255, 0xFFB7E7]//other
	];
	var l;
	var p = V.randInt(0,100), base=0xFFFFFF;
	var n = V.randInt(0,3);

	if(p<23)l=0;
	else if(p<44)l=1;
	else if(p<62)l=2;
	else if(p<76)l=3;
	else if(p<84)l=4;
	else if(p<90)l=5;
	else if(p<96)l=6;
	else if(p<97)l=7;
	else if(p<98)l=8;
	else l=9;

	var base =carcolors[l][n];

    var resl = base.toString(16);
    if(resl.length<6) resl = '#0'+resl;
    else resl = '#'+resl;
	return resl;
}
V.SeaPool = function(){
    this.meshes = {};
}
V.SeaPool.prototype = {
    constructor: V.SeaPool,
    load:function(name, callback){
        this.callback = callback || function(){};
        var list = "";
        var loader = new THREE.SEA3D( true );
        loader.onComplete = function( e ) {
            this.meshes[name] = {};
            var i = loader.meshes.length, m;
            while(i--){
                m = loader.meshes[i];
                this.meshes[name][m.name] = m;
                list+=m.name+',';
            }
            this.callback();
        }.bind(this);

        loader.parser = THREE.SEA3D.DEFAULT;
        loader.load( 'models/'+name+'.sea' );
        //loader.invertZ = true;
        //loader.flipZ = true;
    },
    getGeometry:function(obj, name){
        var g = this.meshes[obj][name].geometry;
        //var mtx = new THREE.Matrix4().makeScale(1, 1, -1);
        //g.applyMatrix(mtx);
        return g;
    }
}
init();
	function initObject(){
	    pool = new V.SeaPool()
	    pool.load('cars', init);
    }
	function init() {
		stats = new Stats();
		stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom	
		document.body.appendChild( stats.dom );

		pool= new C.CarPool();
		world = new TRAFFIC.World();
		//world.load();
		if (world.intersections.length === 0) {
			world.generateMap(3,3,7, 1);
			world.carsNumber = 75;
		}
		world.carsNumber = 60;
		previousTime = 0;
		sets.timeFactor = 5;// TRAFFIC.settings.defaultTimeFactor;

		// set up the scene
		createScene();

		//call game loop
		//update();
		//setInterval(update, 1000/60);
	}
	function isMobile()
	{
	return (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) );
	}
	function stylizeElement( element ) {

		element.style.position = 'absolute';
		element.style.bottom = '20px';
		element.style.padding = '12px 6px';
		element.style.border = '1px solid #fff';
		element.style.borderRadius = '4px';
		element.style.background = 'rgba(0,0,0,0.1)';
		element.style.color = '#fff';
		element.style.font = 'normal 13px sans-serif';
		element.style.textAlign = 'center';
		element.style.opacity = '0.5';
		element.style.outline = 'none';
		element.style.zIndex = '999';

	}
	function createVRButton() {
		document.body.appendChild( WEBVR.createButton( renderer ) );
		var button = document.createElement( 'button' );
		button.style.display = 'none';
		stylizeElement( button );
		button.style.display = '';

		button.style.cursor = 'pointer';
		button.style.left = 'calc(50% - 250px)';
		button.style.width = '100px';

		button.textContent = 'ENABLE VR';
		button.onmouseenter = function () { button.style.opacity = '1.0'; };
		button.onmouseleave = function () { button.style.opacity = '0.5'; };

		button.onclick = function () {
			//renderer.gammaOutput=!renderer.gammaOutput;
			renderer.vr.enabled=!renderer.vr.enabled;
			if(!renderer.vr.enabled)
			orbitControl.reset();

		};
		document.body.appendChild(button );
	}
	function promisifyLoader ( loader, onProgress ) {

		function promiseLoader ( url ) {

			return new Promise( ( resolve, reject ) => {

				loader.load( url, resolve, onProgress, reject );

			} );
		}

		return {
		originalLoader: loader,
		load: promiseLoader,
		};

	}
	function createCamera() {
		camera = new THREE.PerspectiveCamera( 50, sceneWidth / sceneHeight, 0.1, 10000 );//perspective camera
		//camera2 = new THREE.PerspectiveCamera( 110, sceneWidth / sceneHeight, 0.1, 10000 );//perspective camera
		camera2 = new THREE.OrthographicCamera( sceneWidth / - 1, sceneWidth / 1, sceneHeight / 1, sceneHeight / - 1, 1, 1000 );
		camera2.zoom=20;
		camera2.position.set(32*0,50,0);
		camera2.lookAt(new THREE.Vector3(0,0,0))
		
		camera.position.set(8,5,50);
		dolly=new THREE.Group();
		dolly.position.y=camera.position.y;
		dolly.add(camera);
		scene.add( dolly );
	}
	function createLights() {
		
		scene.add( ambientLight=new THREE.AmbientLight( 0xFFFFFF,1 ) );
		scene.add( hemisphereLight = new THREE.HemisphereLight( 0xffffbb, 0x080820,1 ) );
					light = new THREE.DirectionalLight( 0xffffff );
					light.position.set(0, 30, 10);//.normalize();
					light.castShadow = false;
					//light.castShadow = true;
					scene.add( light );
						//light.shadow.mapSize.width = 256;
						//light.shadow.mapSize.height = 256;
						//light.shadow.camera.near = 0.5;
						//light.shadow.camera.far = 50 ;


		sun = new THREE.DirectionalLight( 0xffffff, 0.95);
		sun.position.set( 0,5,1 );
		sun.castShadow = false;
		scene.add(sun); 
		light.intensity = 1;
		//Set up shadow properties for the sun light
		sun.shadow.mapSize.width = 64*1;
		sun.shadow.mapSize.height = 64*1;
		sun.shadow.camera.near = 0.5;
		sun.shadow.camera.far = 500 ;
		//var helper = new THREE.DirectionalLightHelper( sun, 5 );
		var blinkcolor=0xFFFFFF;
		//var sphere = new THREE.SphereBufferGeometry( .25, 16, 8 );
		flashlight = new THREE.PointLight(blinkcolor , 2, 50 );
                //flashlight.add( flashlightMesh=new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: blinkcolor } ) ) );
                //sphere.visible=false;
                flashlight.position.y=20;
				flashlight.intensity=0;
				flashlight.castShadow = false;
				scene.add( flashlight );
		//scene.add( helper );

	}
	function createRenderer() {
		raycaster = new THREE.Raycaster();
		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.gammaOutput=GAMMA_OUTPUT;
		renderer.shadowMap.enabled = false;//enable shadow
		//renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.setSize( sceneWidth, sceneHeight );
		renderer.vr.enabled = isMobile();
	}
	function getRandomColor() {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}
	function colorToSigned24Bit(s) {
    return (parseInt(s.substr(1), 16) << 8) / 256;
	}
	function createObjects(){
		const  TextureLoader = promisifyLoader( new THREE.TextureLoader() );
		const  GLTFLoader = promisifyLoader( new THREE.GLTFLoader() );
		Promise.all([
		TextureLoader.load('./images/env.jpg'),
		TextureLoader.load('./images/cars.png'),
		TextureLoader.load('./images/blink.png'),
		TextureLoader.load('./images/roadx2.png'),
		TextureLoader.load('./images/road2zebra.png'),
		TextureLoader.load('./images/road2.png'),
		TextureLoader.load('./images/marble.jpg'),
		TextureLoader.load('./images/promo.jpg'),
		TextureLoader.load('./images/envBuilding.jpg'),
		TextureLoader.load('./images/building1.png'),
		TextureLoader.load('./images/building1emissive.png'),
		TextureLoader.load('./images/building2.png'),
		TextureLoader.load('./images/building2emissive.png'),
		TextureLoader.load('./images/building3.png'),
		]).then (responses=> {
				env= responses[0];
				env.envMapIntensity=22.2;
				env.mapping = THREE.SphericalReflectionMapping;
				glowMap= responses[1];
				glowMap.flipY=false;
				blinkMap= responses[2];
				blinkMap.flipY=false;
				inter_mat= new THREE.MeshStandardMaterial( { map:responses[3],roughness:1,metalness:0.1});
				inter_mat.needsUpdate=true;
				inter_matx= new THREE.MeshStandardMaterial( { map:responses[4],roughness:1,metalness:0.1 });
				inter_matx.needsUpdate=true;
				road_mat=new THREE.MeshStandardMaterial( { map:responses[5],roughness:1,metalness:0.1 });
				responses[6].wrapS = THREE.RepeatWrapping;
				responses[6].wrapT = THREE.RepeatWrapping;
				responses[6].repeat.set(8,8);
		
				marble_mat=new THREE.MeshStandardMaterial( {color:0x222222, map:responses[6],roughness:1,metalness:0.1 });
				var promo_tex=responses[7];
				buildingTextures['promotion_texture']=promo_tex;
				var envBuilding= responses[8];
				envBuilding.envMapIntensity=2;
				envBuilding.mapping = THREE.SphericalReflectionMapping;
				buildingTextures['envbuilding_texture']=envBuilding;
				var building1= responses[9];
				building1.anisotropy	= renderer.capabilities.getMaxAnisotropy()
				building1.needsUpdate	= true;
				buildingTextures['building1_texture']=building1;
				var building1e= responses[10];
				building1e.anisotropy	= renderer.capabilities.getMaxAnisotropy()
				building1e.needsUpdate	= true;
				buildingTextures['building1emissive_texture']=building1e;
				var building2= responses[11];
				building2.anisotropy	= renderer.capabilities.getMaxAnisotropy()
				building2.needsUpdate	= true;
				buildingTextures['building2_texture']=building2;
				var building2e= responses[12];
				building2e.anisotropy	= renderer.capabilities.getMaxAnisotropy()
				building2e.needsUpdate	= true;
				buildingTextures['building2emissive_texture']=building2e;
				var building3= responses[13];
				building3.anisotropy	= renderer.capabilities.getMaxAnisotropy()
				building3.needsUpdate	= true;
				buildingTextures['building3_texture']=building3;
				
				
				Promise.all([
					GLTFLoader.load('./models/signal6.gltf'),
					GLTFLoader.load('./models/streetlamp4.gltf'),
					GLTFLoader.load('./models/tanke2.gltf'),
					GLTFLoader.load('./models/carpool.gltf'),
					//GLTFLoader.load('./models/car001a2a.gltf'),
					//GLTFLoader.load('./models/car002a.gltf')
					]).then (loadedObjects=> {
						signalMesh=loadedObjects[0].scene;
						signalMesh.scale.set(.75,.75,.75);
						streetlampMesh=loadedObjects[1].scene;
						streetlampMesh.scale.set(.8,.8,.8);
						tanke=loadedObjects[2].scene;
						var m=streetlampMesh.children[0].children[1].material;//    
						//var m=getMaterialByName(streetlampMesh,"bright");
						m.emissive.setHex(0xffffff);
						m.emissiveIntensity=10;

						
						pool.meshes['cars']={};
						//var nbm=new THREE.MeshBasicMaterial();
						var cnt=0;
						loadedObjects[3].scene.traverse(function(child){
							
							if ( child instanceof THREE.Mesh && child.name.startsWith('Mesh_')&& child.name.endsWith('_0')) {
								cnt++;
								//console.log("loading pool_mesh "+child.name);
								//child.material.color.setHex(0xffffff);
								
								var material1=child.material;
								material1.transparent=true;
								//material1.opacity=0.1;
								var col=V.randCarColor();
								//console.log(col);
								var material0=new THREE.MeshPhongMaterial( {
									//transparent:true,
									//opacity: 0.5,
									//color:(cnt%2==0)?'#000000': getRandomColor(), //'#770000',
									color: col,// getRandomColor(),
									//wireframe: true,
									visible: true,
									name: "MBasic"
								} );
								var materials = [ material1, material0];
								child.geometry.clearGroups();
								child.geometry.addGroup( 0, child.geometry.index.count, 0 );
								child.geometry.addGroup( 0, child.geometry.index.count, 1 );
								//child.geometry.addGroup( 0, Infinity, 0 );
								//child.geometry.addGroup( 0, Infinity, 1 );
								child.material=materials;
								//generateRandomColor(glowMap.image, child.material);
								child.material[1].envMap = env;
								child.material[1].envMapIntensity=2;
								
								
								//carMesh=loadedObjects[1].scene;
								var name=child.parent.name;
								child.geometry.computeBoundingBox();
								pool.meshes['cars'][name]=child.parent;//loadedObjects[1].scene;
							}
						});
						//cube= pool.meshes['cars']["car004"];
						//cube.position.y=200;	
						//scene.add(cube);
						//camera2.lookAt(cube.position);	
						

						init3d();
						createVRButton();
						animate();
						//setInterval(update, 1000/60);
					});
				}
			)
		  ;
	}
	
	function addControls() {
		orbitControl = new THREE.OrbitControls( camera, renderer.domElement );//helper to rotate around in scene
		//orbitControl = new THREE.TrackballControls( camera, renderer.domElement );//helper to rotate around in scene
		orbitControl.enableZoom = true;
		//orbitControl.enablePan = false;
		//orbitControl.enableRotate = false;
		//orbitControl.screenSpacePanning = true;
		orbitControl.zoomSpeed=.15;
		orbitControl.rotateSpeed = .15;
		orbitControl.target=orbitTarget;
		orbitTarget.y=camera.position.y;
		
		//this.rotateSpeed = 1.0;
		//this.zoomSpeed = 1.2;
		//this.panSpeed = 0.3;
			

		window.addEventListener('resize', onWindowResize, false);//resize callback
		/*
		window.addEventListener('click', function(e){
			mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    		mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

			raycaster.setFromCamera( mouse, camera );
			
			var intersects = raycaster.intersectObjects( carsarr,true );
			if(intersects && intersects[0]) {
				//if(intersects[0].object.userData.length>0)
				cameraCar=cars[intersects[0].object.name.substring(3)];
				world.cameraCar=intersects[0].object.name;
				//console.log(intersects.length);
				//for(var i=0;i<intersects.length;i++)
				console.log(intersects[0].object.name);
			}
			intersects = raycaster.intersectObjects( scene.children,true );
			if(intersects && intersects[0]) {
				if(intersects[0].object.parent.name.startsWith("interGroup_")) {
					var name=intersects[0].object.parent.name;
					gp.intersection=name;
					dollyposition.x=inter[name.substring(11)].position.x;
					dollyposition.z=inter[name.substring(11)].position.z;
					console.log(dollyposition);

					//dolly.position.set(dollyposition.x,dollyOffsetY,dollyposition.z);
					orbitControl.target.fromArray([dollyposition.x,0,dollyposition.z]);//=dolly;
					orbitControl.update();
					//camera.lookAt(dollyposition);
								}
				console.log(intersects[0].object);
			}

		}, false);//resize callback
		*/
		
		window.onkeypress = function(event){
			console.log(event.keyCode);
			switch(event.keyCode) {
				case 83: console.log(world.save()); break;//SHIFT S save world
				case 76: world.load(); break; //SHIFT L
				case 114: //r camera up
					camera.position.y++;
					orbitTarget.y= camera.position.y;
					break;
				case 102: //r camera down
					camera.position.y--; 
					orbitTarget.y= camera.position.y;
					break;
			}
		};
		window.addEventListener( 'vrdisplaypresentchange', () =>  {

			const device = renderer.vr.getDevice();
		  
			if ( device && device.isPresenting === true ) {
				var controller=renderer.vr.getController();
				var cam=renderer.vr.getCamera(camera);
				PRESENTING=true;
				  
			} else {
				PRESENTING=false;
			}
		  
		  } );




		gui = new dat.GUI({
    			height : 5 * 32 - 1
		});
		//gui.add(gp,'debugtext').listen();
		gui.add(gp,'cam2').onChange(function(value) {
			sky.visible=!value;
			
			scene.fog=value?null:fog;
		});
		gui.add(sets,'timeFactor');
		//gui.add(gp,'curve').listen();
		gui.add(gp,"night").onChange(function(value){
				scene.userData['emissivemaps'].forEach(function(mat){
					mat.emissiveIntensity=value?1:.3;
				})
				scene.fog.far=value?gp.fogdistance+400:gp.fogdistance;
				if(value) {
					scene.background.setHex(0x343434);
					fog.color.setHex(0x343434);
					ambientLight.intensity=0;
				}else {
					scene.background.setHex(gp.bgcolor.replace( '#','0x' ));
					fog.color.setHex(gp.bgcolor.replace( '#','0x' ));
					ambientLight.intensity=0;
				}
		
		});
		//gui.add(gp,'length').listen();
		//gui.add(gp,'type').listen();
		//gui.add(gp,'id').listen();
		gui.add(gp,'followMe');
		var followmeCars=[];
		for(var i=0;i<14;i++) followmeCars.push('car_'+(i+1));
		gui.add(gp,'car',followmeCars).onChange(function(value) {
			cameraCar=cars[Object.keys(cars)[value.substring(4)-1]];
			world.cameraCar=value; //for debug only
		});
		//gui.add (gp,'carlights');
		TRAFFIC.settings.signals=gp.signals;
		gui.add (TRAFFIC.settings,'signals');

		var intergroups=[];
		for(var i=0;i<49;i++) intergroups.push('interGroup_'+(i+1));
		gui.add(gp,'inter',intergroups).name('intersection').onChange(function(value) {
			if(gp.followMe) {
				gp.followMe=false;
			}
			if(!gp.followMe) {
				
				//console.log(inter[value.substring(11)]);
				//dollyposition.x=inter[value.substring(11)].position.x;
				//dollyposition.z=inter[value.substring(11)].position.z;
				//console.log(world.intersections.objects["intersection"+value.substring(11)].roads.length);
				//orbitControl.target.fromArray([dollyposition.x,6,dollyposition.z]);//=dolly;
				dolly.position.set(inter[value.substring(11)].position.x,6,inter[value.substring(11)].position.z);
				orbitControl.target.fromArray([inter[value.substring(11)].position.x,6,inter[value.substring(11)].position.z]);//=dolly;
				var intersection=world.intersections.objects["intersection"+value.substring(11)];
				intersection.inRoads.forEach(function(item){console.log(item.sourceSideId)});
				//orbitControl.dIn(10);
				//orbitControl.update();	
			}	
		});
		scene.fog=gp.fog?fog:null;
		scene.fog.far=gp.fogdistance;
		gui.add (gp,'fog').onChange(function(value  ) {
			scene.fog=value?fog:null;
        })
        gui.add (gp,'fogdistance').onChange(function(value  ) {
			scene.fog.far=value;
		})
		gui.add(gp,'flash').name('blue lights');
		var colors=gui.addFolder("colors")
		colors.add(ambientLight,'intensity',0,3).name('ambient Intensity');
		colors.add(hemisphereLight,'intensity',0,3).name('hemisphere Intensity');


		light.color.setHex(gp.bgcolor.replace( '#','0x' ));
		colors.addColor(gp,'lightcolor').onChange(function(colorValue  ) {
			colorValue=colorValue.replace( '#','0x' );
            light.color.setHex(colorValue);
        });
		

		scene.background.setHex(gp.bgcolor.replace( '#','0x' ));
		fog.color.setHex(gp.bgcolor.replace( '#','0x' ));
		colors.addColor(gp,'bgcolor').onChange(function(colorValue  ) {
			colorValue=colorValue.replace( '#','0x' );
            scene.background.setHex(colorValue);
            fog.color.setHex(colorValue);
        });
        //var obj = { restart:function(){scene.remove.apply(scene, scene.children);createScene();  }};
		//gui.add(obj,'restart')
		//dat.GUI.toggleHide();
		gui.close();
		
		//gui.add(gp,'debugtext').listen();


	}
	function createScene(){
		sceneWidth=window.innerWidth;
		sceneHeight=window.innerHeight;
		scene = new THREE.Scene();//the 3d scene
		scene.background = new THREE.Color( 0xABC0DE );
		fog=new THREE.Fog(0xabc0de, 10, 400);
		scene.fog = fog;//new THREE.Fog(0x000000, 10, 800);//enable fog
		createCamera();
		createLights();
		createRenderer();
		raycaster = new THREE.Raycaster();
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		container.appendChild(renderer.domElement);
		addControls();
		createObjects();
		

	}
	function findInterId(sinter,ix) {
		var f1 = sinter[ix].inRoads.find(function(element) {
			return element.sourceSideId===3;//east
		});
		var f2 = sinter[ix+7].inRoads.find(function(element) {
			return element.sourceSideId===1;//west
		});
		return f1&&f2;
	}
	function calcPlaces() {
		var sinter=[]
		var o0 = world.intersections.all();
		for (id in o0) {
			sinter.push(o0[id])
		}
		sinter.sort(function(a,b) {
			if(a.rect.x<b.rect.x)
			return -1;
			else if(a.rect.x>b.rect.x)
			return 1;
			else 
			return  a.rect.y - b.rect.y
		})
		var sp= Math.sqrt(TRAFFIC.settings.gridNxN); //7
		for(var x=0;x<(sp-1);x++) {
			var prev=0;
			var rPrev=sinter[x*sp].rect;
			for(var y=0;y<sp; y++) {
				if(findInterId(sinter,x*sp+y)) {
					if(y>0) {
						var r1=sinter[x*sp+y].rect;
						var r2=sinter[(1+x)*sp+y].rect;
						var r=new TRAFFIC.Rect(rPrev.center().x,rPrev.center().y, (r2.center().x-rPrev.center().x),(r1.center().y-rPrev.center().y));
						rPrev=r1;
						places.push(r);
						/*
						var pm= new THREE.Mesh( new THREE.BoxGeometry(1,.5,1,1,1,1),new THREE.MeshStandardMaterial({color:new THREE.Color().setHex(0xff0000)}) )
						pm.position.x=r.center().x;
						pm.position.z=r.center().y;
						pm.scale.x=r._width-32;
						pm.scale.z=r._height-32;
						scene.add(pm);
						*/
						/*
						var pm= new THREE.Mesh( new THREE.PlaneGeometry(1,1,1,1),new THREE.MeshStandardMaterial({color:new THREE.Color().setHex(0xff0000)}) )
						pm.geometry.applyMatrix(new THREE.Matrix4().makeRotationX( -Math.PI/4) );
						pm.geometry.applyMatrix(new THREE.Matrix4().makeTranslation( .5,.5,.5) );
						pm.position.x=r.x+16;
						pm.position.y=1;
						pm.position.z=r.y+16;
						pm.scale.x=r._width-32;
						pm.scale.z=r._height-3;
						scene.add(pm);
						*/
						/*
						var pm= new THREE.Mesh( new THREE.BoxGeometry(1,1,1,1,1,1),new THREE.MeshStandardMaterial({color:new THREE.Color().setHex(0xff0000)}) )
						pm.geometry.applyMatrix(new THREE.Matrix4().makeTranslation( .5,0,.5) );
						pm.position.x=r.x+16;
						pm.position.z=r.y+16;
						pm.scale.x=r._width-32;
						pm.scale.z=r._height-32;
						scene.add(pm);
						*/
					}
					prev=y;
					
				}
			}
		}

	}
	function init3d() {
		scene.add( meshCameraHelper=new THREE.AxesHelper( 5 ) );
		grid = TRAFFIC.settings.gridSize;
		var t = (7*5)
		var t2=(7*8);//t+2;

		//geometry intersection
		inter_geo = new THREE.PlaneBufferGeometry( grid, grid );
		inter_geo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));
		//geometry intersection
		road_geo = new THREE.PlaneGeometry( grid, grid );
		road_geo.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));

		//ground mesh
		var g = new THREE.PlaneGeometry(grid*t2,grid*t2, 1,1);
		g.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));
		var ground = new THREE.Mesh( g, marble_mat );
		ground.name="ground";
		scene.add(ground);
		var d = grid*0.5;
        ground.position.set(d, -0.5, d);

		//sky mesh
		sky = new THREE.GridHelper( grid*t*2, 100, 0x0000ff, 0x808080 );
		sky.position.y =  100;
		scene.add( sky );

		//generate intersections
		var o0 = world.intersections.all();
		for (id in o0) {
			//console.log(o0[id].rect);
			addInter(o0[id]);
			
		}
		//places
		calcPlaces();

		//generate roads
		var o1 = world.roads.all();
		for (id in o1) {
			addRoad(o1[id]);
		}

		//generate cars
		while(world.cars.length < world.carsNumber) {
			world.addRandomCar();
		}
		//add cars
		var o3 = world.cars.all();
		var first=true;
		for (car in o3) {
			if(cars[car.substring(3)]==null) {
				addCar(o3[car]);
				if(first) {
					cameraCar=cars[car.substring(3)];
					ccTarget=new THREE.Object3D();
					ccTarget.position.z=10;
					cameraCar.add(ccTarget);
					first=false;
				}
			}
		}


		var proceduralCity	= new THREEx.ProceduralCity(scene,renderer,places,buildingTextures)
		//var building		= proceduralCity.createSquareBuildings()
		// var building		= proceduralCity.getBuilding().clone()
		// proceduralCity.scaleBuilding(building)
		// proceduralCity.colorifyBuilding(building)
		// scene.add(building)	
	
		// var mesh	= proceduralCity.createMrDoobCity()
		
		//var sidewalks=proceduralCity.createSquareSideWalks();
		//scene.add(sidewalks)
		//var mplaces=proceduralCity.createPlaces(places);
		//scene.add(mplaces)
		
		var mesh	= proceduralCity.createSquareCity()
		scene.add(mesh)
		//var edges = new THREE.EdgesGeometry( mesh.children[2].geometry );
		//var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x00ff } ) );
		//scene.add( line );
		var tanke1=tanke.clone();
		tanke1.position.set(580,0,350)
		tanke1.scale.set(1.5,1.5,1.5);
		scene.add(tanke1);
		var tanke2=tanke.clone();
		tanke2.position.set(580,0,-320)
		tanke2.scale.set(1.5,1.5,1.5);
		scene.add(tanke2);
		var tanke3=tanke.clone();
		tanke3.position.set(-540,0,350)
		tanke3.scale.set(1.5,1.5,1.5);
		scene.add(tanke3);
		var tanke4=tanke.clone();
		tanke4.position.set(-540,0,-320)
		tanke4.scale.set(1.5,1.5,1.5);
		scene.add(tanke4);
		var edges2 = new THREE.EdgesGeometry( mesh.children[0].geometry );
		var line2 = new THREE.LineSegments( edges2, new THREE.LineBasicMaterial( { color: 0x444444 } ) );
		scene.add( line2 );

	}
	function addInter(intersection){//intersection
		var c = intersection.rect.center();
		var id = intersection.id.substring(12);
		if(inter[id]==null){
			var inRoadslength = intersection.inRoads.length;
			var group=new THREE.Group();
			var mat=inter_mat;
			
			if(inRoadslength==2) {
				var a=intersection.inRoads[0].sourceSideId+intersection.inRoads[1].sourceSideId;
				var b=intersection.inRoads[1].sourceSideId+intersection.inRoads[1].sourceSideId;
				if(a+b==4 || a+b==2)
				mat=inter_matx;
			}
			//if(Math.random()>.5)
			mat.color.setHex(0x555555);

			//inter_mat.color.setHex(0x555555);
			group.add(new THREE.Mesh( inter_geo, mat ));
			
			for(var i=0;i<4;i++) {
				group.add(signalMesh.clone() );
				for(var j=0;j<4;j++ ) {
					group.children[i+1].children[0].children[1+j].material=group.children[i+1].children[0].children[1+j].material.clone();
					group.children[i+1].children[0].children[1+j].material.emissiveIntensity=10;
				}
			}
			//var sm= new THREE.Geometry();
			for(var i=0;i<4;i++) {
				var sl=streetlampMesh.clone();
				//for(var i=0;i<sl.children[0].children.length;i++) {
				//	sm.mergeMesh(sl.children[0].children[i]);
				//}
				
				group.add(sl);
				var f=grid*1.3;
				switch(i) {
					case 0: sl.children[0].position.z=-f; sl.children[0].position.x=f;break;
					case 1: sl.children[0].position.z=-f;sl.children[0].position.x=-f;break;
					case 2: sl.children[0].position.z=f;sl.children[0].position.x=f;break;
					case 3: sl.children[0].position.z=f;sl.children[0].position.x=-f;break;
				}
				
				
			}
			
			group.name="interGroup_"+id;
			//console.log("add "+group.name);
    		inter[id] = group;
    		scene.add( inter[id] );
			var type = intersection.roads.length;
			
			inter[id].position.set(c.x,0,c.y);
			for(var i=0;i<4;i++) {
				inter[id].children[i+1].visible=inRoadslength==4;
			}
			var visi=[2,3,0,1];
			if(inRoadslength==3) {
				intersection.inRoads.forEach(function(item){
					var ix=item.sourceSideId;
					inter[id].children[visi[ix]+1].visible=true;
					//console.log(item.sourceSideId)
				});
			} 
			//inter[id].children[2].visible=true;
			//var possx=[-20,20,20,-20];
			//var possz=[-20,-20,20,20];
			
			var possx=[-20,20,20,-20];
			var possz=[-20,-20,20,20];
			for(var i=0;i<4;i++) {
				inter[id].children[i+1].position.x+=possx[i];
				inter[id].children[i+1].position.z+=possz[i];
			}

			inter[id].children[2].rotation.y=-Math.PI*0.5;
			inter[id].children[4].rotation.y=Math.PI*0.5;
			inter[id].children[3].rotation.y=Math.PI;
			for(var i=0;i<4;i++) {
				var side =inter[id].children[1+i];
				var mRed=getMeshByMaterial(side,'Red');
				var mGreen=getMeshByMaterial(side,'Green');
				var mYellow=getMeshByMaterial(side,'Yellow');
				var mLeft=getMeshByMaterial(side,'Left');
				side.userData={};
				side.userData['Red']=mRed;
				side.userData['Green']=mGreen;
				side.userData['Yellow']=mYellow;
				side.userData['Left']=mLeft;

			}
			
    	} 
    }

	function addRoad(road){
		if ((road.source == null) || (road.target == null)) throw Error('invalid road');
		var id = road.id.substring(4);
		if(roads[id]==null){
			//var sourceSide = road.sourceSide;
		   // var targetSide = road.targetSide

			var p0 = road.source.rect.center();
			var p1 = road.target.rect.center();
			var lngx = ((p1.x-p0.x)/grid);
			var lngy = ((p1.y-p0.y)/grid);
			var side = 0;
			var dir = 1;

			if(lngy!=0) side=1;
			var i;

			if(side==0){
				i = Math.abs(lngx)-1;
				if(lngx<0) dir = -1;
			}else{
				i = Math.abs(lngy)-1;
				if(lngy<0) dir = -1;
			}

			var g = new THREE.Geometry();
			var m = new THREE.Matrix4();

			while(i--){
				if(side==0){
					m.makeTranslation((p0.x+(grid*dir)+((i*grid)*dir)), 0, p0.y);
					m.multiply(new THREE.Matrix4().makeRotationY(Math.PI*0.5));
				}else{
					m.makeTranslation(p0.x, 0, (p0.y+(grid*dir)+((i*grid)*dir)));

				}
				g.merge( road_geo, m );
			}
			/*
			g.computeBoundingBox();
			var bb=g.boundingBox;
			var gf=.75;
			
			if(side==0) {
				if(dir==1) {
					var dx=bb.max.x-bb.min.x;
					var dy=bb.max.z-bb.min.z

					var a = new THREE.PlaneGeometry(dx-grid/2,2, 40,3);
					fence.merge(a,new THREE.Matrix4().makeTranslation(road.source.rect.x+dx/2+grid,1,road.source.rect.y+dy/2-grid*gf));
					fence.merge(a,new THREE.Matrix4().makeTranslation(road.source.rect.x+dx/2+grid,1,road.source.rect.y+dy/2+grid*gf));
					a.dispose();
					
					for(var i=0;i<(dx-grid/2);i+=grid) {
						var b = new THREE.BoxGeometry(.2,3,.2,1,1,1);
						fence.merge(b,new THREE.Matrix4().makeTranslation(i+road.source.rect.x+grid+grid/2,1,road.source.rect.y+dy/2-grid*gf));
						fence.merge(b,new THREE.Matrix4().makeTranslation(i+road.source.rect.x+grid+grid/2,1,road.source.rect.y+dy/2+grid*gf));
						b.dispose();
					}
					
					

				}
			} else {
				if(dir==-1) {
					var dx=bb.max.x-bb.min.x;
					var dy=bb.max.z-bb.min.z
					var a = new THREE.PlaneGeometry(2,dy-grid/2, 3,40);
					a.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI*0.5));
					a.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI*0.5));
					fence.merge(a,new THREE.Matrix4().makeTranslation(road.source.rect.x+dx/2+grid*gf,1,road.source.rect.y-dy/2));
					fence.merge(a,new THREE.Matrix4().makeTranslation(road.source.rect.x+dx/2-grid*gf,1,road.source.rect.y-dy/2));
					a.dispose();
					
					for(var i=0;i<dy-(grid/2);i+=grid) {
						var b = new THREE.BoxGeometry(.2,3,.2,1,1,1);
						fence.merge(b,new THREE.Matrix4().makeTranslation(road.source.rect.x+dx/2+grid*gf,1,-dy+i+road.source.rect.y+grid/2));//-grid+grid/2));
						fence.merge(b,new THREE.Matrix4().makeTranslation(road.source.rect.x+dx/2-grid*gf,1,-dy+i+road.source.rect.y+grid/2));//-grid+grid/2));
						b.dispose();
					}
					
					
					

				}
			}
			*/
			var mat=road_mat;
			//if(road.lanesNumber==2) {
			//	mat=inter_matx;
			//}
			//if(Math.random()>.5)
			mat.color.setHex(0x555555);
			var c = new THREE.Mesh( g, mat );
			c.name="road";
			scene.add( c );


			/*var dir = 0, lng;
			if(lng1>lng0) dir=1;

			if(dir == 0 ) lng = lng0/14;
			else lng = lng1/14;*/

			//console.log(lngx, lngy)

    		//c.position.set(p0.x, 0.8,p0.y);
			roads[id] = c;
		}
		/*;
		var start = sourceSide.source.x;*/
		//var end = targetSide.target.center();
		//console.log(sourceSide)



		//(sourceSide.source, sourceSide.target, targetSide.source, targetSide.target)
	}
    function getMeshByMaterial(obj,n) {
		var ret=null, found=false; 
		obj.traverse(function(child){
				if(child instanceof THREE.Mesh && child.material.name==n) {
					if(!found) {ret= child; found=true;}
				}
			});
		return ret;
	}
    function getMeshesByMaterial(obj,n) {
		var ret=[]; 
		obj.traverse(function(child){
				if(child instanceof THREE.Mesh && child.material.name==n) {
					ret.push(child);
					console.log
				}
			});
		return ret;
	}
	function getMaterialByName(obj,n) {
		var ret=null, found=false; 
		obj.traverse(function(child){
				if(child instanceof THREE.Mesh && child.material.name==n) {
					if(!found) {ret= child.material; found=true;}
				}
				if(!found) {
					if(child instanceof THREE.Mesh) {
						if(Array.isArray( child.material )) {
							for(var i=0;i<child.material.length;i++) {
								if(child.material[i].name==n) {
									child.material[i]=child.material[i].clone();
								ret= child.material[i]; found=true; break;
							}

							}
						}else {
							if(child.material.name==n) {
								child.material=child.material.clone();
								ret= child.material; found=true;
							}
						}
						if(!found) {ret= child.material; found=true;}
					}
				}
			});
		return ret;
	}
	function cloneMaterial(dest, src, name) {
		var srcmesh=getMeshByMaterial(src,name);
		var destmesh=getMeshByMaterial(dest,name);
		if(srcmesh!=null &&destmesh!=null) {
			destmesh.material=srcmesh.material.clone();
		}
	}
	function cloneMaterial2(dest, src, name) {
		var srcmesh=getMeshByMaterial(src,name);
		var destmesh=getMeshByMaterial(dest,name);
		if(srcmesh!=null &&destmesh!=null) {
			destmesh.material=srcmesh.material.clone();
			dest.userData[name]=destmesh.material;
		}
				

	}
	function addCar(car){
		//var oe= new THREE.OBJExporter();
		//if(carMesh==undefined) return;
		var id = car.id.substring(3);
		var r = car.type;
		var index= TRAFFIC.TYPE_OF_CARS[r].m;
		var srcMesh= pool.meshes['cars'][index];//.children[0];
		var c= srcMesh.clone();//carMesh.children[0].clone();
		
		cloneMaterial2(c,srcMesh,"BackLight");
		cloneMaterial2(c,srcMesh,"FrontLight");
		cloneMaterial2(c,srcMesh,"BlinkLeft");
		cloneMaterial2(c,srcMesh,"BlinkRight");
		c.name=id;
		//console.log("addCar"+id);
		scene.add(c );
		c.position.set(11000, 0,0);
		c.scale.set(2,2,2);
		//c.scale.set(car.length, car.length/2, car.width);
		cars[id] = c;
		c.children[0].name=car.id;
		carsarr.push(c.children[0]);
	}
	function lowPass(car, input) {
		var rate=.1;
		if ((car.oldrot-input)>Math.PI)
			car.oldrot-=(Math.PI*2);
		else if((input-car.oldrot)>Math.PI)
			car.oldrot+=(Math.PI*2);
			//return input;
		
		return  (car.oldrot=rate*input+(1.0-rate)*car.oldrot);
	}
	function normalizeAngleDeg(inp) {
		return (inp % 360)>=0 ? inp: (inp+360);
	}
	function normalizeAngleRad(inp) {
		return (inp % 2*Math.PI)>=0 ? inp: (inp+2*Math.PI);
	}

	function updateCar(car) {
		var id = car.id.substring(3);
		var p = car.coords;
		var r = car.direction;
		//gp.curve=car.inCurve;
		var carlights=gp.carlights;
		cars[id].position.set(p.x,0,p.y);
		//cars[id].rotation.y =  normalizeAngleRad(+r-(Math.PI*0.5));//    lowPass(car, +r-(Math.PI*0.5));
		cars[id].rotation.y =  lowPass(car,normalizeAngleRad(+r-(Math.PI*0.5)));
		//cars[id].rotation.y =  lowPass(car,r);//+Math.PI*1.5);
		if(car.inCurve) {
			//console.log(Math.round(cars[id].rotation.y/Math.PI*180));//+"/"+normalizeAngleDeg(Math.round(cars[id].rotation.y/Math.PI*180)))
		}
		var time = ((Date.now()*car.blinkFreq)/250)%2;
		var backlight=cars[id].userData["BackLight"];
		backlight.emissive.emissiveIntensity=20;
		backlight.emissive.setHex(car.currentAcceleration<-0.5?0xff0000:carlights?0xAA0000:0x660000);
		var frontlight=cars[id].userData["FrontLight"];
		var r=Math.random()*Math.random()*Math.random();
		frontlight.emissive.emissiveIntensity=20;
		frontlight.emissive.setHex(r>0.5 && car.speed>5?0xffffff:carlights?0xeeeeee:0xaaaaaa);
		var blinkleft=cars[id].userData["BlinkLeft"];
		blinkleft.emissive.setHex(car.nextDirection==0 && time>0.8 ?0xffcc00:blinkleft.color.getHex() );
		var blinkright=cars[id].userData["BlinkRight"];
		blinkright.emissive.setHex(car.nextDirection==2 && time>0.8 ?0xffcc00:blinkright.color.getHex() );
		if(car.radar) {
			car.radar=false;
			if (flashReady) {
				flashReady=false;
				//var pp=cameraCar.position;
				flashlight.position.set(p.x,5,p.y);
				//flashlight.position.set(p.x+2*Math.sin(car.direction),3,p.y+2*Math.cos(car.direction));
				flashlight.color.setHex(0xffffff);
				flashlight.intensity=20;
				setTimeout(function() {
					flashlight.intensity=0;
					//console.log("flashed");
					setTimeout(function(){flashReady=true;},10)
					
				},50);
			} 

		}

	}
	function updateCameraCar(time) {
		if(gp.flash) {
			var p=cameraCar.position;
			var bb=cameraCar.children[0].geometry.boundingBox;
			var s=new THREE.Vector3();
			bb.getSize(s);
			flashlight.position.set(p.x-1,s.z*.6,p.z);
			flashlight.color.setHex(0xFF);
			flashlight.intensity=((time/200)%2)>.2? 0:10;
		}
	}
	function updateDolly() {
		if(gp.followMe) {
			var p=cameraCar.position;
			var tVec= new THREE.Vector3(0,0,0);
			tVec.applyAxisAngle( new THREE.Vector3(0,1,0), -cameraCar.rotation.y);
			dolly.position.x=p.x;//+Math.sin(cameraCar.rotation.y);
			dolly.position.z=p.z;//-Math.cos(cameraCar.rotation.y);
			orbitTarget.set(p.x+tVec.x,dolly.position.y,p.z+tVec.z);
			dolly.rotation.y=-cameraCar.rotation.y+Math.PI;
			meshCameraHelper.position.set(orbitTarget.x,orbitTarget.y,orbitTarget.z);
		}

	}
	function updateSignals(road){
		var intersection=road.target;
		var segment= road.targetSide;
		var sideId = road.targetSideId;
		var lights = intersection.controlSignals.state[sideId];
		var id = intersection.id.substring(12);
		var lightMeshes2=inter[id].children[1+sideId];
		var mRed=lightMeshes2.userData['Red'];//getMeshByMaterial(lightMeshes2,'Red');
		var mGreen=lightMeshes2.userData['Green'];//getMeshByMaterial(lightMeshes2,'Green');
		var mYellow=lightMeshes2.userData['Yellow'];//getMeshByMaterial(lightMeshes2,'Yellow');
		var mLeft=lightMeshes2.userData['Left'];//getMeshByMaterial(lightMeshes2,'Left');
		var time=intersection.controlSignals.time;
		if(TRAFFIC.settings.signals==false) {
			mGreen.material.emissive.setHex(0);
			mRed.material.emissive.setHex(0);
			mLeft.material.emissive.setHex(0);
			mYellow.material.emissive.setHex(time%4>2?0xFFFF00:0);
		} else {

			var redSignal=(lights[0]==false) && (lights[1]==false) && (lights[2]==false);
			var leftSignal=(lights[0]==true);
			var greenSignal=(lights[1]==true ||lights[2]==true);
			
			if(intersection.roads.length==2) {
				mRed.material.emissive.setHex(0);
				mGreen.material.emissive.setHex(0);
				mYellow.material.emissive.setHex(time%4>2?0xFFFF00:0);
				mLeft.material.emissive.setHex(0);
			} else {
				if(redSignal) {
					mRed.material.emissive.setHex(0xFF0000);
					mGreen.material.emissive.setHex(0x0000);
					mYellow.material.emissive.setHex(0);
					mLeft.material.emissive.setHex(0x0000);
					//mLeft.material.color.setHex(0x0000);
				} else {
					
					mRed.material.emissive.setHex((leftSignal || (greenSignal && time<5)  )?0xff0000:0x0000);
					mYellow.material.emissive.setHex((greenSignal && (time>27 ||time<5 ))?0xFFFF00:0);
					mLeft.material.emissive.setHex(leftSignal?0x00FF00:0xff0000);
					
					var blink= (time<20) || (time%2)>0.5;
					mGreen.material.emissive.setHex( (blink&&greenSignal )?(time<5 || time>27)?0:0x00FF00:0);
				}
			}
		}
		
	}

	function removeCar(id){
    	var id = id.substring(3);
    	if(cars[id]!=null){
    		scene.remove( cars[id] );
    		cars[id] = null;
    	}
    }
	var startup=0;
	var toggle=false;
	function update(){
		var now = Date.now();
		var dt = now - lastUpdate;
		if(startup<999) {
			startup++;
		} 
		lastUpdate = now;
		var time = Date.now();
		//console.log(time);
		stats.update();
		var delta = (time - previousTime) || 0;
		if (delta > 100) { delta = 100;  }
		previousTime = time;
		world.onTick(sets.timeFactor * delta / 1000);

		var o0, o1, o2, o3, id;
		o1 = world.roads.all();
		for (id in o1) {
			updateSignals(o1[id]);
		}
		// remove car
		var i = world.toRemove.length;
		while(i--){ removeCar(world.toRemove[i]); };
		world.clearTmpRemove();
		updateCameraCar(time);
		updateDolly();
		//orbitControl.update();
		o3 = world.cars.all();
		for (id in o3) {
			updateCar(o3[id]);
		}
	}
	function animate() {
		renderer.setAnimationLoop( render );
	}
	function render(){
		update();
		if(gp.cam2==false) {
			renderer.render(scene, camera);//draw
		}
		else {
			renderer.render(scene, camera2);//draw
		}
		

	}
	function onWindowResize() {
		//resize & align
		sceneHeight = window.innerHeight;
		sceneWidth = window.innerWidth;
		renderer.setSize(sceneWidth, sceneHeight);
		camera.aspect = sceneWidth/sceneHeight;
		camera.updateProjectionMatrix();
	}
	function onDocumentMouseMove( event ) {
				event.preventDefault();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			}

}
