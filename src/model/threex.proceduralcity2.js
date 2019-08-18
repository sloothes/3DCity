// from @mrdoob http://www.mrdoob.com/lab/javascript/webgl/city/01/

var THREEx = THREEx || {}

THREEx.ProceduralCity	= function(scene,renderer,places,buildingTextures){
	this.places=places;
	this.scene=scene;
	this.buildingTextures=buildingTextures;
	// build the base geometry for each building
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	// translate the geometry to place the pivot point at the bottom instead of the center
	geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, .5, 0 ) );
	geometry.faces.splice( 6, 2 );
	geometry.faceVertexUvs[0].splice( 6,2 );

	geometry.faceVertexUvs[0][4][0].set( 0, 0 );
	geometry.faceVertexUvs[0][4][1].set( 0, 0 );
	geometry.faceVertexUvs[0][4][2].set( 0, 0 );
	geometry.faceVertexUvs[0][5][0].set( 0, 0 );
	geometry.faceVertexUvs[0][5][1].set( 0, 0 );
	geometry.faceVertexUvs[0][5][2].set( 0, 0 );
	//geometry.faceVertexUvs[0][4][3].set( 0, 0 );

	// get rid of the bottom face - it is never seen
	/*
	geometry.faces.splice( 3, 1 );
	geometry.faceVertexUvs[0].splice( 3, 1 );
	// change UVs for the top face
	// - it is the roof so it wont use the same texture as the side of the building
	// - set the UVs to the single coordinate 0,0. so the roof will be the same color
	//   as a floor row.
	geometry.faceVertexUvs[0][2][0].set( 0, 0 );
	geometry.faceVertexUvs[0][2][1].set( 0, 0 );
	geometry.faceVertexUvs[0][2][2].set( 0, 0 );
	geometry.faceVertexUvs[0][2][3].set( 0, 0 );
	*/

	// buildMesh
	var buildingMesh= new THREE.Mesh( geometry );

	this.createBuilding	= function(){
		return buildingMesh
	}

	//////////////////////////////////////////////////////////////////////////////////
	//		buildingTexture							//
	//////////////////////////////////////////////////////////////////////////////////
			
	// generate the texture
	var buildingTexture		= new THREE.Texture( generateTextureCanvas2b_OK(false) );//generateTextureCanvas2_a_OK
	buildingTexture.anisotropy	= renderer.capabilities.getMaxAnisotropy()
	//buildingTexture.repeat.y=2;
	
	//buildingTexture.wrapT = THREE.RepeatWrapping;
	buildingTexture.needsUpdate	= true;

	var buildingTextureEmissive		= new THREE.Texture( generateTextureCanvas2Emissive(false) );
	buildingTextureEmissive.anisotropy	= renderer.capabilities.getMaxAnisotropy()
	//buildingTexture.repeat.y=2;
	
	//buildingTexture.wrapT = THREE.RepeatWrapping;
	buildingTextureEmissive.needsUpdate	= true;
	
	
	//////////////////////////////////////////////////////////////////////////////////
	//		lamp								//
	//////////////////////////////////////////////////////////////////////////////////
	
	var lampGeometry= new THREE.CubeGeometry( 0.1, 3, 0.1)
	var lampMesh	= new THREE.Mesh(lampGeometry)
	
	//////////////////////////////////////////////////////////////////////////////////
	//		comment								//
	//////////////////////////////////////////////////////////////////////////////////
	
	var nBlockX	= 8
	var nBlockZ	= 8
	var blockSizeX	= 224//50
	var blockSizeZ	= 224//50
	var blockDensity= 20 //decreases with dist
	var roadW	= 32
	var roadD	= 32
	var buildingMaxW= 280
	var buildingMaxD= 280
	var sidewalkW	= 2
	var sidewalkH	= 0.1
	var sidewalkD	= 2
	var lampDensityW= 4
	var lampDensityD= 4
	var lampH	= 3

	this.createSquareGround	= function(){
		var geometry	= new THREE.PlaneGeometry( 1, 1, 1 );
		var material	= new THREE.MeshLambertMaterial({
			color	: 0x222222
		})
		var ground	= new THREE.Mesh(geometry, material)
		ground.lookAt(new THREE.Vector3(0,1,0))
		ground.scale.x	= (nBlockZ)*blockSizeZ
		ground.scale.y	= (nBlockX)*blockSizeX
		
		return ground
	}
	this.createSquareLamps	= function(){
		var object3d	= new THREE.Object3D()
		
		var lampGeometry= new THREE.CubeGeometry(1,1,1)
		lampGeometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0.5, 0 ) );
		var lampMesh	= new THREE.Mesh(lampGeometry)

		var lightsGeometry	= new THREE.Geometry();
		var lampsGeometry	= new THREE.Geometry();
		for( var blockZ = 0; blockZ < nBlockZ; blockZ++){
			for( var blockX = 0; blockX < nBlockX; blockX++){
				// lampMesh.position.x	= 0
				// lampMesh.position.z	= 0
				function addLamp(position){
					//////////////////////////////////////////////////////////////////////////////////
					//		light								//
					//////////////////////////////////////////////////////////////////////////////////
					
					var lightPosition	= position.clone()
					lightPosition.y		= sidewalkH+lampH+0.1
					// set position for block
					lightPosition.x		+= (blockX+0.5-nBlockX/2)*blockSizeX
					lightPosition.z		+= (blockZ+0.5-nBlockZ/2)*blockSizeZ

					lightsGeometry.vertices.push(lightPosition );
					//////////////////////////////////////////////////////////////////////////////////
					//		head								//
					//////////////////////////////////////////////////////////////////////////////////
					
					// set base position
					lampMesh.position.copy(position)
					lampMesh.position.y	= sidewalkH+lampH
					// add poll offset				
					lampMesh.scale.set(0.2,0.2,0.2)
					// colorify
					for(var i = 0; i < lampMesh.geometry.faces.length; i++ ) {
						lampMesh.geometry.faces[i].color.set('white' );
					}					
					// set position for block
					lampMesh.position.x	+= (blockX+0.5-nBlockX/2)*blockSizeX
					lampMesh.position.z	+= (blockZ+0.5-nBlockZ/2)*blockSizeZ
					// merge it with cityGeometry - very important for performance
					//THREE.GeometryUtils.merge( lampsGeometry, lampMesh )
					lampsGeometry.mergeMesh(lampsGeometry)	
								
					//////////////////////////////////////////////////////////////////////////////////
					//		poll								//
					//////////////////////////////////////////////////////////////////////////////////
					
					// set base position
					lampMesh.position.copy(position)
					lampMesh.position.y	+= sidewalkH
					// add poll offset				
					lampMesh.scale.set(0.1,lampH,0.1)
					// colorify
					for(var i = 0; i < lampMesh.geometry.faces.length; i++ ) {
						lampMesh.geometry.faces[i].color.set('grey' );
					}					
					// set position for block
					lampMesh.position.x	+= (blockX+0.5-nBlockX/2)*blockSizeX
					lampMesh.position.z	+= (blockZ+0.5-nBlockZ/2)*blockSizeZ
					// merge it with cityGeometry - very important for performance
					THREE.GeometryUtils.merge( lampsGeometry, lampMesh )	
								
					//////////////////////////////////////////////////////////////////////////////////
					//		base								//
					//////////////////////////////////////////////////////////////////////////////////		
					// set base position
					lampMesh.position.copy(position)
					lampMesh.position.y	+= sidewalkH
					// add poll offset				
					lampMesh.scale.set(0.12,0.4,0.12)
					// colorify
					for(var i = 0; i < lampMesh.geometry.faces.length; i++ ) {
						lampMesh.geometry.faces[i].color.set('maroon' );
					}					
					// set position for block
					lampMesh.position.x	+= (blockX+0.5-nBlockX/2)*blockSizeX
					lampMesh.position.z	+= (blockZ+0.5-nBlockZ/2)*blockSizeZ
					// merge it with cityGeometry - very important for performance
					THREE.GeometryUtils.merge( lampsGeometry, lampMesh );					
				}
				// south							
				var position	= new THREE.Vector3()
				for(var i = 0; i < lampDensityW+1; i++){
					position.x	= (i/lampDensityW-0.5)*(blockSizeX-roadW-sidewalkW)
					position.z	= -0.5*(blockSizeZ-roadD-sidewalkD)
					addLamp(position)
				}
				// north
				for(var i = 0; i < lampDensityW+1; i++){
					position.x	= (i/lampDensityW-0.5)*(blockSizeX-roadW-sidewalkW)
					position.z	= +0.5*(blockSizeZ-roadD-sidewalkD)
					addLamp(position)
				}
				// east
				for(var i = 1; i < lampDensityD; i++){
					position.x	= +0.5*(blockSizeX-roadW-sidewalkW)
					position.z	= (i/lampDensityD-0.5)*(blockSizeZ-roadD-sidewalkD)
					addLamp(position)
				}
				// west
				for(var i = 1; i < lampDensityD; i++){
					position.x	= -0.5*(blockSizeX-roadW-sidewalkW)
					position.z	= (i/lampDensityD-0.5)*(blockSizeZ-roadD-sidewalkD)
					addLamp(position)
				}


			}
		}
		
		// build the lamps Mesh
		var material	= new THREE.MeshLambertMaterial({
			vertexColors	: THREE.VertexColors
		});
		var lampsMesh	= new THREE.Mesh(lampsGeometry, material );
		object3d.add(lampsMesh)
	
		//////////////////////////////////////////////////////////////////////////////////
		//		comment								//
		//////////////////////////////////////////////////////////////////////////////////
		
		var texture	= THREE.ImageUtils.loadTexture( "../images/lensflare2_alpha.png" );
		var material	= new THREE.ParticleBasicMaterial({
			map		: texture,
			size		: 8, 
			transparent	: true
		});
		var lightParticles	= new THREE.ParticleSystem( lightsGeometry, material );
		lightParticles.sortParticles = true;
		object3d.add( lightParticles );

		return object3d
	}
	this.createSquareCarLights	= function(){
		var carLightsDensityD	= 4
		var carW		= 1
		var carH		= 2

		var geometry	= new THREE.Geometry();
		var position	= new THREE.Vector3()
		position.y	= carH/2
		
		var colorFront		= new THREE.Color('white')
		var colorBack		= new THREE.Color('red')

		for( var blockX = 0; blockX < nBlockX; blockX++){
			for( var blockZ = 0; blockZ < nBlockZ; blockZ++){	
				function addCarLights(position){
					//////////////////////////////////////////////////////////////////////////////////
					//		comment								//
					//////////////////////////////////////////////////////////////////////////////////
					
					var positionL	= position.clone()
					positionL.x	+= -carW/2
					// set position for block
					positionL.x	+= (blockX+0.5-nBlockX/2)*blockSizeX
					positionL.z	+= (blockZ+0.5-nBlockZ/2)*blockSizeZ
					geometry.vertices.push( positionL );
					geometry.colors.push( colorFront )

					var positionR	= position.clone()
					positionR.x	+= +carW/2
					// set position for block
					positionR.x	+= (blockX+0.5-nBlockX/2)*blockSizeX
					positionR.z	+= (blockZ+0.5-nBlockZ/2)*blockSizeZ
					geometry.vertices.push( positionR );
					geometry.colors.push( colorFront )

					//////////////////////////////////////////////////////////////////////////////////
					//		comment								//
					//////////////////////////////////////////////////////////////////////////////////
					position.x	= -position.x
					
					var positionL	= position.clone()
					positionL.x	+= -carW/2
					// set position for block
					positionL.x	+= (blockX+0.5-nBlockX/2)*blockSizeX
					positionL.z	+= (blockZ+0.5-nBlockZ/2)*blockSizeZ
					geometry.vertices.push( positionL );
					geometry.colors.push( colorBack )

					var positionR	= position.clone()
					positionR.x	+= +carW/2
					// set position for block
					positionR.x	+= (blockX+0.5-nBlockX/2)*blockSizeX
					positionR.z	+= (blockZ+0.5-nBlockZ/2)*blockSizeZ
					geometry.vertices.push( positionR );
					geometry.colors.push( colorBack )
				}
				// east
				for(var i = 0; i < carLightsDensityD+1; i++){
					position.x	= +0.5*blockSizeX-roadW/4
					position.z	= (i/carLightsDensityD-0.5)*(blockSizeZ-roadD)
					addCarLights(position)
				}
			}
		}
		//////////////////////////////////////////////////////////////////////////////////
		//		comment								//
		//////////////////////////////////////////////////////////////////////////////////

		var object3d	= new THREE.Object3D
		
		var texture	= THREE.ImageUtils.loadTexture( "../images/lensflare2_alpha.png" );
		var material	= new THREE.ParticleBasicMaterial({
			map		: texture,
			size		: 6, 
			transparent	: true,
			vertexColors	: THREE.VertexColors
		});
		var particles	= new THREE.ParticleSystem( geometry, material );
		particles.sortParticles = true;
		object3d.add(particles)
		
		return object3d
	}

	this.createPlaces	= function(places){
		var planeMesh= new THREE.Mesh( new THREE.PlaneGeometry(1,1,1,1) );
		var placesGeometry= new THREE.Geometry();
		places.forEach(function(r){
			var pm= new THREE.Mesh( new THREE.BoxGeometry(1,.5,1,1,1,1))
			pm.position.x=r.center().x;
			pm.position.z=r.center().y;
			pm.scale.x=r._width-64;
			pm.scale.z=r._height-64;
			placesGeometry.mergeMesh(pm);
		})
		// build the mesh
		var material	= new THREE.MeshLambertMaterial({
			color	: new THREE.Color().setHSL(0.18, 0.30, 0.06),
			wireframe : false
		});
		var pMesh	= new THREE.Mesh(placesGeometry, material );
		return pMesh
	}

	this.createSquareSideWalks	= function(){
		var buildingMesh= this.createBuilding()
		var sidewalksGeometry= new THREE.Geometry();
		for( var blockZ = 0; blockZ < nBlockZ; blockZ++){
			for( var blockX = 0; blockX < nBlockX; blockX++){
				// set position
				buildingMesh.position.x	= (blockX+0.5-nBlockX/2)*blockSizeX+16
				buildingMesh.position.z	= (blockZ+0.5-nBlockZ/2)*blockSizeZ+16

				buildingMesh.scale.x	= blockSizeX-roadW*1.7
				buildingMesh.scale.y	= sidewalkH*5
				buildingMesh.scale.z	= blockSizeZ-roadD*1.7

				// merge it with cityGeometry - very important for performance
				//THREE.GeometryUtils.merge( sidewalksGeometry, buildingMesh );	
				sidewalksGeometry.mergeMesh(buildingMesh)				
			}
		}		
		// build the mesh
		var material	= new THREE.MeshLambertMaterial({
			color	: new THREE.Color().setHSL(0.18, 0.30, 0.06)
			
		});
		var sidewalksMesh	= new THREE.Mesh(sidewalksGeometry, material );
		return sidewalksMesh
	}
	this.createFenceSides = function(mesh,g,scale,mPromo, gPromo) {
		for(var i=0;i<4;i++) {
			var offset=(roadW/2-blockSizeX/2)*scale;
			var offset2=offset*.99
			var bm=mesh.clone();
			bm.scale.x	= (blockSizeX-roadW)*scale
			if(i<2)	{
				if(i==0)bm.position.z+=offset;else bm.position.z-=offset 
			}	else {
				bm.rotation.y=Math.PI/2;
				if(i==2)bm.position.x+=offset;else bm.position.x-=offset 
			}
			//THREE.GeometryUtils.merge( g, bm );
			g.mergeMesh(bm)
			if(mPromo!=null &&Math.random()>.5) {
				var mp=mesh.clone();
				mp.scale.x	= (blockSizeX-roadW)*scale
				if(i<2)	{
					mp.rotation.y=Math.PI;
					if(i==0)mp.position.z+=offset2;else mp.position.z-=offset2 
				}	else {
						mp.rotation.y=-Math.PI/2;
						if(i==2)mp.position.x+=offset2;else mp.position.x-=offset2 
				}
				gPromo.mergeMesh(mp)
			}
			

		}
	}
	this.createCrane=function(mesh,g,scale) {
		var boxMeshCrane= new THREE.Mesh( new THREE.BoxGeometry(2,2,2,50,1,1) );

		//crane
		var offset=0;//(roadW/2-blockSizeX/2)*scale*.9;
		var bm=mesh.clone();
		
		var bm2=boxMeshCrane.clone();
		bm2.geometry.applyMatrix(new THREE.Matrix4().makeTranslation( .5,0,0) );
		bm2.scale.x=50;
		//bm2.position.x+=50;
		bm2.rotation.y=Math.random()*Math.PI;
		bm2.position.x=bm.position.x
		bm2.position.z=bm.position.z
		bm2.position.y+=bm2.scale.x*2;
		var g1=new THREE.Geometry();
		g1.mergeMesh(bm2);
		g1.mergeMesh(bm);
		g1.applyMatrix( new THREE.Matrix4().makeTranslation( offset,0,offset) );
		g.merge(g1)
		
		
		
	}
	this.createStamps=function(mesh,g,scale) {
		var offset=(roadW/2-blockSizeX/2)*scale;
		var a=mesh.position.x-offset;
		var b=mesh.position.x+offset;
		var d=Math.abs(a-b)/10;
		for(var i=0;i<10;i++) {
			var bm=mesh.clone();
			bm.position.z+=offset;
			bm.position.x=Math.min(a,b)+d/2+d*i//+(a-b)/20;
			g.mergeMesh(bm)
			bm=mesh.clone();
			bm.position.z-=offset;
			bm.position.x=Math.min(a,b)+d/2+d*i
			g.mergeMesh(bm)
		}
		a=mesh.position.z-offset;
		b=mesh.position.z+offset;
		for(var i=0;i<10;i++) {
			var bm=mesh.clone();
			bm.position.x+=offset;
			bm.position.z=Math.min(a,b)+d/2+d*i//+(a-b)/20;
			g.mergeMesh(bm)
			bm=mesh.clone();
			bm.position.x-=offset;
			bm.position.z=Math.min(a,b)+d/2+d*i
			g.mergeMesh(bm)
		}
	}
	this.createFence	= function(object3d){
		
		var fenceMesh= new THREE.Mesh( new THREE.PlaneGeometry(1,1,20,3) );//  this.createBuilding()
		var mPromo= new THREE.Mesh( new THREE.PlaneGeometry(20,10,1,1) );
		var boxMesh= new THREE.Mesh( new THREE.BoxGeometry(.2,1,.2,1,1,1) );//  this.createBuilding()
		var boxMeshCrane= new THREE.Mesh( new THREE.BoxGeometry(2,1,2,1,50,1) );
		
		var g= new THREE.Geometry();
		var gPromo= new THREE.Geometry();
		for( var blockZ = 0; blockZ < nBlockZ; blockZ++){
			for( var blockX = 0; blockX < nBlockX; blockX++){
				if(blockZ==5 && blockX==1) continue; //tanke
				if(blockZ==5 && blockX==6) continue;
				if(blockZ==2 && blockX==1) continue;
				if(blockZ==2 && blockX==6) continue;

				if(Math.random()>.7) { //create extra stuff here (construction place)
					fenceMesh.position.x	= (blockX+0.5-nBlockX/2)*blockSizeX+16
					fenceMesh.position.z	= (blockZ+0.5-nBlockZ/2)*blockSizeZ+16
					fenceMesh.scale.y	= (blockSizeZ-roadD)*.1
					fenceMesh.position.y	= fenceMesh.scale.y*.51
					this.createFenceSides(fenceMesh,g,.79,mPromo,gPromo)

					boxMesh.position.x	= (blockX+0.5-nBlockX/2)*blockSizeX+16
					boxMesh.position.z	= (blockZ+0.5-nBlockZ/2)*blockSizeZ+16
					boxMesh.scale.y	= (blockSizeZ-roadD)*.101
					boxMesh.position.y	= boxMesh.scale.y*.51
					//if(blockZ==0 && blockX==0)
					this.createStamps(boxMesh,g,.79)
					boxMeshCrane.scale.y=125
					boxMeshCrane.position.y	= boxMeshCrane.scale.y*.5
					boxMeshCrane.position.x	= (blockX+0.5-nBlockX/2)*blockSizeX+16
					boxMeshCrane.position.z	= (blockZ+0.5-nBlockZ/2)*blockSizeZ+16
					
					this.createCrane(boxMeshCrane,g,.79)

				}
			}
		}
		var color1=new THREE.Color().setHex(0xff0000)
		for ( var j = 0, jl = g.faces.length; j < jl; j +=1 ) {
			g.faces[j].vertexColors[0]=color1;
			g.faces[j].vertexColors[1]=color1;
			g.faces[j].vertexColors[2]=color1;
		}
		var colorStart=g.faces.length;
		for( var blockZ = 0; blockZ < nBlockZ; blockZ++){
			for( var blockX = 0; blockX < nBlockX; blockX++){
				if(blockZ==5 && blockX==1) continue; //tanke
				if(blockZ==5 && blockX==6) continue;
				if(blockZ==2 && blockX==1) continue;
				if(blockZ==2 && blockX==6) continue;

				fenceMesh.position.x	= (blockX+0.5-nBlockX/2)*blockSizeX+16
				fenceMesh.position.z	= (blockZ+0.5-nBlockZ/2)*blockSizeZ+16
				fenceMesh.scale.y	= (blockSizeZ-roadD)*.02
				fenceMesh.position.y	= fenceMesh.scale.y*.51
				if(Math.random()>0.5) {
					this.createFenceSides(fenceMesh,g,.97)
					//this.createFenceSides(fenceMesh,g,.975)
				}

				boxMesh.position.x	= (blockX+0.5-nBlockX/2)*blockSizeX+16
				boxMesh.position.z	= (blockZ+0.5-nBlockZ/2)*blockSizeZ+16
				boxMesh.scale.y	= (blockSizeZ-roadD)*.11
				boxMesh.position.y	= boxMesh.scale.y*.51
				//if(blockZ==0 && blockX==0)
				//this.createStamps(boxMesh,g,.79)

				boxMesh.scale.y	= (blockSizeZ-roadD)*0.02
				boxMesh.position.y	= boxMesh.scale.y*.501
				this.createStamps(boxMesh,g,.97)
	
				
			}
		}	
		
		var color2=new THREE.Color().setHex(0x444444)
		for ( var j = colorStart, jl = g.faces.length; j < jl; j +=1 ) {
			g.faces[j].vertexColors[0]=color2;
			g.faces[j].vertexColors[1]=color2;
			g.faces[j].vertexColors[2]=color2;
		}

		// build the mesh
		var material	= new THREE.MeshStandardMaterial({
			color	: 0x444444, 
			wireframe:true,
			vertexColors: THREE.VertexColors
		});
		var pmat1	= new THREE.MeshStandardMaterial({
			color	: 0x888888, 
			side: THREE.DoubleSide,
			emissive: 0xFFFFFF,
			emissiveIntensity:.2,

			map: this.buildingTextures['promotion_texture']
		});
		//promo_tex.wrapS=THREE.RepeatWrapping
		//promo_tex.wrapT=THREE.RepeatWrapping

		//promo_tex.repeat.set(.7,1);

		//responses[6].wrapS = THREE.RepeatWrapping;
		//responses[6].wrapT = THREE.RepeatWrapping;
		//responses[6].repeat.set(8,8);

		/*
		var pmat2	= new THREE.MeshStandardMaterial({
			color	: 0xFFFFFF, 
			side: THREE.DoubleSide,
			map:promo_tex
		});
		var materials=[pmat1,pmat2];
		for (var i = 0, len = gPromo.faces.length; i < len; i++) {
			var face = gPromo.faces[i].clone();
			face.materialIndex = 1;
			gPromo.faces.push(face);
			gPromo.faceVertexUvs[0].push(gPromo.faceVertexUvs[0][i].slice(0));
		}	
		*/	
		var promo=new THREE.Mesh(gPromo, pmat1);//new THREE.MeshFaceMaterial(materials) );
		object3d.add(promo);

		var sidewalksMesh	= new THREE.Mesh(g, material );
		return sidewalksMesh
	}
	this.collides=function(ix,arr) {
		console.log("----")
		for(var i=0;i<arr.length;i++) {
			var dist=arr[i].z+ix.z;
			var a=Math.sqrt(Math.pow(ix.x-arr[i].x,2),Math.pow(ix.y-arr[i].y,2))
			//var out=""+a+" "+dist+" "; console.log(out)
			if(a<dist) return true;
		}
		//console.log("OK")
		return false;

	}
	this.randomizePosition = function(p) {
		p.x	= (Math.random()-0.5)*(p.x)
		p.y	= (Math.random()-0.5)*(p.y)
		return p;
	}
// this functions attempts to build a circle
// at the given coords. If it works, it will
// spawn additional circles.
this.buildCircle= function (x, y, X, Y, r, cc){

	// if this circle does not fit in the rectangle, BAIL
	if(X-r < 0 || X+r > x || Y-r < 0 || Y+r > y)
		return cc;
	
	// if this circle is too close to another circle, BAIL
	for(var c in cc){
		if( Math.sqrt(Math.pow(cc[c].x - X, 2) + Math.pow(cc[c].y - Y, 2)) < (r*2) )
			return cc;
	}
	
	// checks passed so lets call this circle valid and add it to stack
	cc.push({"x": X, "y": Y});
	
	// now rotate to try to find additional spots for circles
	var a = 0; // radian for rotation
	while(a < Math.PI){
		XX = Math.cos(a)*r*2 + X;
		YY = Math.sin(a)*r*2 + Y;
		cc = this.buildCircle(x, y, XX, YY, r, cc);
		a += .5; // CHANGE FOR MORE OR LESS PRECISION
	}
	
	return cc;
}

// this function slowly reduces the radius
// and checks for correct solutions
// also prints svg graphic code

this.circlesinRect= function(x, y, n){

	var r = 100;//x + y; // pick a big radius
	var X, Y; // these are the coords of the current circle. golf by combining this with `var r..`?
	var cc = []; // array of coordinates of the circles
	
	// while we cant fit n circles, reduce the radius and try again
	while(cc.length < n){
		X = Y = r;
		cc = this.buildCircle(x, y, X, Y, r, []);
		r-=.5; // CHANGE FOR MORE OR LESS PRECISION
	}
	
	console.log('Highest possible radius: ' + Math.round(r*100)/100);
	var s = '<svg width="' + x + '" height="' + y + '"><rect width="' + x + '" height="' + y + '" style="fill:red" />';
	for(var c in cc){
		console.log('Circle '+c+' Focus: (' + Math.round(cc[c].x*100)/100 + ', ' + Math.round(cc[c].y*100)/100 + ')');
		s += '<circle cx="' + cc[c].x + '" cy="' + cc[c].y + '" r="' + r + '" fill="blue" />';
	}
	s += '</svg>';
	console.log(s);
	return {r:r,arr: cc}
	//document.write(s);
}
	

	//materialindex:
	// Icosahedron - colorize
	// Cylinder - colorize or texture
	// Bigbuilding - generated texture1
	// Small building - colorize or generated Texture2 or texture
	// 0: colorize only
	// 1: texture_building
	// 2: texture_generated1
	// 3: texture_generated2
	this.createSquareBuildings	= function(){
		
		
		buildingMesh=this.createBuilding();// new THREE.Mesh( geometry );//this.createBuilding();
		var cylinderMesh=new THREE.Mesh(new THREE.CylinderGeometry( .5, .5, 1, 16 ))
		//ar lampGeometry= new THREE.BoxGeometry( 1,1,1,1,8,1)
		//var buildingMesh	= new THREE.Mesh(lampGeometry)
	
		//<cylinderMesh.applyMatrix(new THREE.Matrix4().makeTranslation( 0,5,0) );
		cylinderMesh.position.y=.5
		var cityGeometry= new THREE.Geometry();
		
		for( var blockZ = 0; blockZ < nBlockZ; blockZ++){
			for( var blockX = 0; blockX < nBlockX; blockX++){
				if(blockZ==5 && blockX==1) continue; //tanke
				if(blockZ==5 && blockX==6) continue;
				if(blockZ==2 && blockX==1) continue;
				if(blockZ==2 && blockX==6) continue;

				var a=(blockX+0.5-nBlockX/2)*blockSizeX
				var b=(blockZ+0.5-nBlockZ/2)*blockSizeZ
				var dist=Math.min(280/(1+Math.sqrt(a*a+b*b)),1)
				/*
				if(dist>.85)
				if(Math.random()>.9 &&dist<.4) {
					var bm=new THREE.Mesh(new THREE.IcosahedronGeometry( 30+Math.random()*30,2 ))
					bm.position.x	= -.25*(blockSizeX-buildingMaxW-roadW-sidewalkW)
					bm.position.z	= -.25*(blockSizeZ-buildingMaxD-roadD-sidewalkD)
					bm.position.x	+= (blockX+0.5-nBlockX/2)*blockSizeX
					bm.position.z	+= (blockZ+0.5-nBlockZ/2)*blockSizeZ

					this.colorifyBuilding(bm)
					bm.geometry.faces.forEach(function (face, i) {
 						face.materialIndex = 0;
					});
					cityGeometry.mergeMesh(bm)		
				}
				else if(Math.random()*Math.random()<.05 &&dist<.4) {
					var bm=cylinderMesh;
					var n=Math.round(Math.random()*80)/10+1;
					var r=20;
					var maxw=blockSizeX;//-buildingMaxW-roadW-sidewalkW
					var maxd=blockSizeZ//-buildingMaxD-roadD-sidewalkD
					var positions=[]
					var cir=this.circlesinRect(Math.abs(maxw-50),Math.abs(maxd-50),n);
			
					for( var i = 0; i < cir.arr.length; i++){
						//var v=this.randomizePosition(new THREE.Vector2(maxw,maxd))
						// set position
						
						bm.position.x	= cir.arr[i].x-70;//(Math.random()-0.5)*(blockSizeX-buildingMaxW-roadW-sidewalkW)
						bm.position.z	= cir.arr[i].y-70;//(Math.random()-0.5)*(blockSizeZ-buildingMaxD-roadD-sidewalkD)

						// add position for the blocks
						bm.position.x	+= (blockX+0.5-nBlockX/2)*blockSizeX
						bm.position.z	+= (blockZ+0.5-nBlockZ/2)*blockSizeZ

						// put a random scale
						bm.scale.x	= cir.r*1.5;//Math.min(Math.random() * 5 + 40, buildingMaxW);


						
						
						console.log(dist);//Math.round(1000*dist)/10)
						//bm.scale.y	=r*((Math.random() * Math.random() * bm.scale.x) * 4 + 40)*.75;
						bm.scale.y	=Math.min(dist*((Math.random() * Math.random() * 100)  + 40),100);
						bm.scale.z	= Math.min(bm.scale.x, buildingMaxD)

						this.colorifyBuilding(bm)
						bm.geometry.faces.forEach(function (face, i) {
							face.materialIndex = 0;
					   });
   
						// merge it with cityGeometry - very important for performance
						//THREE.GeometryUtils.merge( cityGeometry, buildingMesh );
						cityGeometry.mergeMesh(bm)					
					}
					
				}
				else {
					*/
					var blocksTextured=Math.random()>.3;
					var bm=buildingMesh;
					var zone=(dist<.4)?2:(dist<.75)?1:0; //0:center,1:middle,2:outer
					switch(zone) {
						case 2: texturedBuildingType=3; break;
						case 1: texturedBuildingType=1; break;
						case 0: texturedBuildingType=2; break;
					}
					if(texturedBuildingType ==3 &&Math.random()>.9 ) {
						var bm=new THREE.Mesh(new THREE.IcosahedronGeometry( 30+Math.random()*30,2 ))
						bm.position.x	= roadW/2//+(Math.random()-0.5)*roadW*4;//(Math.random()-0.5)*(3*blockSizeX/2-buildingMaxW-roadW-sidewalkW)
						bm.position.z	= roadD/2//+(Math.random()-0.5)*roadD*4;//(Math.random()-0.5)*(3*blockSizeZ/2-buildingMaxD-roadD-sidewalkD)
						// add position for the blocks
						bm.position.x	+= (blockX+0.5-nBlockX/2)*blockSizeX
						bm.position.z	+= (blockZ+0.5-nBlockZ/2)*blockSizeZ
	
						this.colorifyBuilding(bm)
						bm.geometry.faces.forEach(function (face, i) {
							 face.materialIndex = 0;
						});
						cityGeometry.mergeMesh(bm)
						continue;		
					} else if(texturedBuildingType ==3 &&Math.random()>.9 ) {
						var bm=cylinderMesh;
						var n=Math.round(Math.random()*80)/10+1;
						var r=20;
						var maxw=blockSizeX;//-buildingMaxW-roadW-sidewalkW
						var maxd=blockSizeZ//-buildingMaxD-roadD-sidewalkD
						var cir=this.circlesinRect(Math.abs(maxw-50),Math.abs(maxd-50),n);
				
						for( var i = 0; i < cir.arr.length; i++){
							//var v=this.randomizePosition(new THREE.Vector2(maxw,maxd))
							// set position
							
							bm.position.x	= cir.arr[i].x-70;//(Math.random()-0.5)*(blockSizeX-buildingMaxW-roadW-sidewalkW)
							bm.position.z	= cir.arr[i].y-70;//(Math.random()-0.5)*(blockSizeZ-buildingMaxD-roadD-sidewalkD)
	
							// add position for the blocks
							bm.position.x	+= (blockX+0.5-nBlockX/2)*blockSizeX
							bm.position.z	+= (blockZ+0.5-nBlockZ/2)*blockSizeZ
	
							// put a random scale
							bm.scale.x	= cir.r*1.5;//Math.min(Math.random() * 5 + 40, buildingMaxW);
	
	
							
							
							console.log(dist);//Math.round(1000*dist)/10)
							//bm.scale.y	=r*((Math.random() * Math.random() * bm.scale.x) * 4 + 40)*.75;
							bm.scale.y	=Math.min(dist*((Math.random() * Math.random() * 100)  + 40),100);
							bm.scale.z	= Math.min(bm.scale.x, buildingMaxD)
	
							this.colorifyBuilding(bm)
							bm.geometry.faces.forEach(function (face, i) {
								face.materialIndex = 0;
						   });
	   
							// merge it with cityGeometry - very important for performance
							//THREE.GeometryUtils.merge( cityGeometry, buildingMesh );
							cityGeometry.mergeMesh(bm)					
						}
						continue;
					}
					//
					for( var i = 0; i < Math.round(blockDensity*dist); i++){
						// set place center position
						bm.position.x	= roadW/2+(Math.random()-0.5)*roadW*4;//(Math.random()-0.5)*(3*blockSizeX/2-buildingMaxW-roadW-sidewalkW)
						bm.position.z	= roadD/2+(Math.random()-0.5)*roadD*4;//(Math.random()-0.5)*(3*blockSizeZ/2-buildingMaxD-roadD-sidewalkD)
						// add position for the blocks
						bm.position.x	+= (blockX+0.5-nBlockX/2)*blockSizeX
						bm.position.z	+= (blockZ+0.5-nBlockZ/2)*blockSizeZ
						// put a random scale
						bm.scale.x	= Math.min(Math.random() * 6 + 40, buildingMaxW);
						bm.scale.z	= Math.min(bm.scale.x, buildingMaxD)
						var height=Math.min(dist*dist*((Math.random() * Math.random() * 100)  + 40),200);
						bm.scale.y=blocksTextured?20+i/50:height;
						// set textureindex
						bm.geometry.faces.forEach(function (face, i) {
							face.materialIndex = blocksTextured?texturedBuildingType:0;
						});
						//random basecolor
					   	var baseColor	= new THREE.Color().setHSL(Math.random(), 0.30, 0.5+Math.random()*.3)
						// merge it with cityGeometry - very important for performance
						
						if(blocksTextured) {
							var topColor	= baseColor.clone().multiply( light );
							var bottomColor	= baseColor.clone().multiply( shadow );
							var iter=0;
							while(iter<height) iter+=bm.scale.y;
							iter/=bm.scale.y;
							var t=1, b=1, delta=1/iter;
							while(bm.position.y<height) {
								//console.log(iter+" "+(mxh-bm.position.y)/mxh)
								t-=delta;
								if(Math.random()>.5) this.colorifyBuilding2(bm,topColor.clone().lerp(bottomColor,t),topColor.clone().lerp(bottomColor,b))
								b-=delta;
								cityGeometry.mergeMesh(bm)
								bm.position.y+=bm.scale.y;	
							} 
						}
						else {
							this.colorifyBuilding(bm)
							cityGeometry.mergeMesh(bm)	
						}
						bm.position.y=0;	
					//}
				}
			}		
		}
		
	// 0: colorize only
	// 1: texture_building
	// 2: texture_generated1
	// 3: texture_generated2
		this.scene.userData={}
		this.scene.userData['emissivemaps']=[];
		// build the city Mesh
		var material0	= new THREE.MeshLambertMaterial({
			//side: THREE.DoubleSide,
			color: 0xffFFFF, 
			vertexColors: THREE.VertexColors
		});
		var material	= new THREE.MeshLambertMaterial({
			//map: buildingTexture,//this.buildingTextures['building1_texture'],//buildingTexture,
			map: this.buildingTextures['building1_texture'],//buildingTexture,
			side: THREE.DoubleSide,
			//color: 0xffFFFF, 
			//transparent: true,
			//envMap: buildingTextures['envbuilding_texture'],
			emissiveMap: this.buildingTextures['building1emissive_texture'],//buildingTextureEmissive,
			emissive: 0xffFFCC,
			emissiveIntensity:.5,
			vertexColors: THREE.VertexColors
		});
		this.scene.userData['emissivemaps'].push(material);
		var material2	= new THREE.MeshLambertMaterial({
			//map: buildingTexture,//this.buildingTextures['building1_texture'],//buildingTexture,
			map: this.buildingTextures['building2_texture'],//buildingTexture,
			side: THREE.DoubleSide,
			//color: 0xffFFFF, 
			//transparent: true,
			//envMap: buildingTextures['envbuilding_texture'],
			emissiveMap: this.buildingTextures['building2emissive_texture'],//buildingTextureEmissive,
			emissive: 0xffFFCC,
			emissiveIntensity:.5,
			vertexColors: THREE.VertexColors
		});
		this.scene.userData['emissivemaps'].push(material2);
		var material3	= new THREE.MeshLambertMaterial({
			//map: buildingTexture,//this.buildingTextures['building1_texture'],//buildingTexture,
			map: this.buildingTextures['building3_texture'],//buildingTexture,
			side: THREE.DoubleSide,
			//color: 0xffFFFF, 
			//transparent: true,
			//envMap: buildingTextures['envbuilding_texture'],
			emissiveMap: this.buildingTextures['building1emissive_texture'],//buildingTextureEmissive,
			emissive: 0xffFFCC,
			emissiveIntensity:.5,
			vertexColors: THREE.VertexColors
		});
		this.scene.userData['emissivemaps'].push(material3);
		var material4	= new THREE.MeshLambertMaterial({
			//side: THREE.DoubleSide,
			color: 0xffFFFF, 
			vertexColors: THREE.VertexColors,
			map: this.buildingTextures['promotion_texture']
			
		});
		cityGeometry.computeBoundingBox();
		var cityMesh	= new THREE.Mesh(cityGeometry, [material0,material,material2,material3] );
		return cityMesh
	}

	this.createSquareCity	= function(){
		
		// 0: promotion texture
		// 1: environment texture
		// 2: building1
		var object3d		= new THREE.Object3D()
		/*
		var carLightsMesh	= this.createSquareCarLights()
		object3d.add(carLightsMesh)
		
		var lampsMesh		= this.createSquareLamps()
		object3d.add(lampsMesh)

		var sidewalksMesh	= this.createSquareSideWalks()
		object3d.add(sidewalksMesh)
		
		var buildingsMesh	= this.createSquareBuildings()
		object3d.add(buildingsMesh)	
		*/
		var buildingsMesh	= this.createSquareBuildings()
		object3d.add(buildingsMesh)	

		//var sidewalksMesh	= this.createSquareSideWalks()
		//object3d.add(sidewalksMesh)
		var placesMesh	= this.createPlaces(places)
		//object3d.add(placesMesh)

		var fenceMesh	= this.createFence(object3d)
		object3d.add(fenceMesh)

		var groundMesh	= this.createSquareGround()
		//object3d.add(groundMesh)	
		
		return object3d
	}
	
	//////////////////////////////////////////////////////////////////////////////////
	//		comment								//
	//////////////////////////////////////////////////////////////////////////////////
	
	this.createMrDoobCity	= function(){
		var buildingMesh= this.createBuilding()
		var cityGeometry= new THREE.Geometry();
		for( var i = 0; i < 20000; i ++ ){
			// put a random position
			buildingMesh.position.x	= Math.floor( Math.random() * 200 - 100 ) * 10;
			buildingMesh.position.z	= Math.floor( Math.random() * 200 - 100 ) * 10;
			// put a random rotation
			buildingMesh.rotation.y	= Math.random()*Math.PI*2;		

			// put a random scale
			buildingMesh.scale.x	= Math.random() * Math.random() * Math.random() * Math.random() * 50 + 10;
			buildingMesh.scale.y	= (Math.random() * Math.random() * Math.random() * buildingMesh.scale.x) * 8 + 8;
			buildingMesh.scale.z	= buildingMesh.scale.x

			this.colorifyBuilding(buildingMesh)
			// merge it with cityGeometry - very important for performance
			THREE.GeometryUtils.merge( cityGeometry, buildingMesh );
		}
		// build the mesh
		var material	= new THREE.MeshLambertMaterial({
			map		: buildingTexture,
			vertexColors	: THREE.VertexColors
		});
		var cityMesh	= new THREE.Mesh(cityGeometry, material );
		return cityMesh
	}
	
	//////////////////////////////////////////////////////////////////////////////////
	//		comment								//
	//////////////////////////////////////////////////////////////////////////////////
	
	// base colors for vertexColors. light is for vertices at the top, shaddow is for the ones at the bottom
	var light	= new THREE.Color( 0xffffFF )
	var shadow	= new THREE.Color( 0x303030)

	this.colorifyBuilding2	= function(buildingMesh,topColor,bottomColor){
		// establish the base color for the buildingMesh
		//var value	= 1 - Math.random() * Math.random();
		//var baseColor1	= new THREE.Color().setRGB( value + Math.random() * 0.1, value, value + Math.random() * 0.1 );
		//var baseColor2	=new THREE.Color().setHSL(Math.random(), 0.30, 0.5+Math.random()*.3)
		//var baseColor=Math.random()>.5?baseColor1:baseColor2

		// set topColor/bottom vertexColors as adjustement of baseColor
		//var topColor	= baseColor.clone().multiply( light );
		//var bottomColor	= baseColor.clone().multiply( shadow );
		// set .vertexColors for each face
		var geometry	= buildingMesh.geometry;	
		var cBlue=	bottomColor;//new THREE.Color().setHex(0xFF)
		var cRed=	topColor;//new THREE.Color().setHex(0xFF0000)

		for ( var j = 0, jl = geometry.faces.length; j < jl; j +=2 ) {
			var f  = geometry.faces[ j ];
			var f1  = geometry.faces[ j+1 ];
			for( var k = 0; k < 3; k++ )
			{
				if ( j===4) {
				 f.vertexColors[ k ] = topColor;//new THREE.Color().setHex(0xffffff) 
				 f1.vertexColors[ k ] = topColor;//new THREE.Color().setHex(0xffffff) 
				}
				else {
					if(j<jl) {
						var c=k==1 ?cBlue:cRed
						
						f.vertexColors[ k ] = c
						c=k==2 ?cRed:cBlue
						f1.vertexColors[ k ] = c

					} else{
						f.vertexColors[ k ] = new THREE.Color().setHex(0) 
						f1.vertexColors[ k ] = new THREE.Color().setHex(0) 
	
					}
				}
			}
		}	
	}


	this.colorifyBuilding	= function(buildingMesh){
		// establish the base color for the buildingMesh
		var value	= 1 - Math.random() * Math.random();
		var baseColor1	= new THREE.Color().setRGB( value + Math.random() * 0.1, value, value + Math.random() * 0.1 );
		var baseColor2	=new THREE.Color().setHSL(Math.random(), 0.30, 0.5+Math.random()*.3)
		var baseColor=Math.random()>.5?baseColor1:baseColor2
		// set topColor/bottom vertexColors as adjustement of baseColor
		var topColor	= baseColor.clone().multiply( light );
		var bottomColor	= baseColor.clone().multiply( shadow );
		// set .vertexColors for each face
		var geometry	= buildingMesh.geometry;	
		var cBlue=	bottomColor;//new THREE.Color().setHex(0xFF)
		var cRed=	topColor;//new THREE.Color().setHex(0xFF0000)

		for ( var j = 0, jl = geometry.faces.length; j < jl; j +=2 ) {
			var f  = geometry.faces[ j ];
			var f1  = geometry.faces[ j+1 ];
			for( var k = 0; k < 3; k++ )
			{
				if ( j===4) {
				 f.vertexColors[ k ] = topColor;//new THREE.Color().setHex(0xffffff) 
				 f1.vertexColors[ k ] = topColor;//new THREE.Color().setHex(0xffffff) 
				}
				else {
					if(j<jl) {
						var c=k==1 ?cBlue:cRed
						
						f.vertexColors[ k ] = c
						c=k==2 ?cRed:cBlue
						f1.vertexColors[ k ] = c

					} else{
						f.vertexColors[ k ] = new THREE.Color().setHex(0) 
						f1.vertexColors[ k ] = new THREE.Color().setHex(0) 
	
					}
				}
			}
		}	
	}
	
	
	
	//////////////////////////////////////////////////////////////////////////////////
	//		comment								//
	//////////////////////////////////////////////////////////////////////////////////
	function generateTextureCanvas2(){
		// build a small canvas 32x64 and paint it in white
		var canvas	= document.createElement( 'canvas' );
		canvas.width	= 32*4;
		canvas.height	= 64*4;
		var context	= canvas.getContext( '2d' );
		// plain it in white
		context.fillStyle	= '#ffffff';
		context.fillRect( 0, 0, 4*32, 4*64 );
		// draw the window rows - with a small noise to simulate light variations in each room
		for( var y = 8*4; y < (4*64-8*2); y +=16*4 ){
			for( var x = 0; x < 4*32; x += 4*4*2 ){
				var value	= Math.floor( 64+Math.random() * 128 );
				context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
				context.fillRect( x, y, 4*4*2-2, 2*8*4 );
				
				//context.beginPath();
				//context.beginPath();
				//context.lineWidth = "1";
				value	= Math.floor( Math.random() * 128 );
				//context.strokeStyle ='grey'
				//context.strokeStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
				context.strokeStyle='rgb(' + [22, 22, 22].join( ',' )  + ')';//'red';
				context.rect(x,y, 4*4, 8*4*2);
				context.stroke();
				context.lineWidth = "1";
				context.strokeStyle='rgb(' + [128, 64, 64].join( ',' )  + ')';//'red';
				context.rect(x+1,y, 4*4-1, 8*4*2);
				context.stroke();
				
				
			}
		}
		var du=canvas.toDataURL();
		// build a bigger canvas and copy the small one in it
		// This is a trick to upscale the texture without filtering
		var canvas2	= document.createElement( 'canvas' );
		canvas2.width	= 512;
		canvas2.height	= 1024;
		var context	= canvas2.getContext( '2d' );
		// disable smoothing
		context.imageSmoothingEnabled		= false;
		context.webkitImageSmoothingEnabled	= false;
		context.mozImageSmoothingEnabled	= false;
		// then draw the image
		context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
		// return the just built canvas2
		return canvas2;
	}
	function generateTextureCanvas2Emissive(){
		// build a small canvas 32x64 and paint it in white
		var canvas	= document.createElement( 'canvas' );
		canvas.width	= 32*4;
		canvas.height	= 64*4;
		var context	= canvas.getContext( '2d' );
		// plain it in white
		context.fillStyle	= '#000000';
		context.fillRect( 0, 0, 4*32, 4*64 );
		// draw the window rows - with a small noise to simulate light variations in each room
		for( var y = 8*4; y < (4*64-8*2); y +=16*4 ){
			for( var x = 0; x < 4*32; x += 4*4*2 ){
				var value	= Math.floor( 64+Math.random() * 128 );
				context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
				context.fillRect( x, y, 4*4*2-2, 2*8*4 );
			}
		}
		var du=canvas.toDataURL();
		// build a bigger canvas and copy the small one in it
		// This is a trick to upscale the texture without filtering
		var canvas2	= document.createElement( 'canvas' );
		canvas2.width	= 512;
		canvas2.height	= 1024;
		var context	= canvas2.getContext( '2d' );
		// disable smoothing
		context.imageSmoothingEnabled		= false;
		context.webkitImageSmoothingEnabled	= false;
		context.mozImageSmoothingEnabled	= false;
		// then draw the image
		context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
		// return the just built canvas2
		return canvas2;
	}
	
	function generateTextureCanvas2b_OK(){
		// build a small canvas 32x64 and paint it in white
		var canvas	= document.createElement( 'canvas' );
		canvas.width	= 32*4;
		canvas.height	= 64*4;
		var context	= canvas.getContext( '2d' );
		// plain it in white
		context.fillStyle	= '#ffffff';
		context.fillRect( 0, 0, 4*32, 4*64 );
		// draw the window rows - with a small noise to simulate light variations in each room
		for( var y = 8*4; y < (4*64-8*2); y +=16*4*2 ){
			for( var x = 0; x < 4*32; x += 4*4*2 ){
				var value	= Math.floor( 64+Math.random() * 64 );
				context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
				context.fillRect( x, y, 4*4, 2*8*4 );
				
				//context.beginPath();
				//context.beginPath();
				//context.lineWidth = "1";
				value	= Math.floor( Math.random() * 128 );
				//context.strokeStyle ='grey'
				//context.strokeStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
				context.strokeStyle='rgb(' + [22, 22, 22].join( ',' )  + ')';//'red';
				context.rect(x,y, 4*4, 8*4*2);
				context.stroke();
				context.lineWidth = "1";
				context.strokeStyle='rgb(' + [128, 64, 64].join( ',' )  + ')';//'red';
				context.rect(x+1,y, 4*4-1, 8*4*2);
				context.stroke();
				
				
			}
		}
		var du=canvas.toDataURL();
		// build a bigger canvas and copy the small one in it
		// This is a trick to upscale the texture without filtering
		var canvas2	= document.createElement( 'canvas' );
		canvas2.width	= 512;
		canvas2.height	= 1024;
		var context	= canvas2.getContext( '2d' );
		// disable smoothing
		context.imageSmoothingEnabled		= false;
		context.webkitImageSmoothingEnabled	= false;
		context.mozImageSmoothingEnabled	= false;
		// then draw the image
		context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
		// return the just built canvas2
		return canvas2;
	}

	function generateTextureCanvas2_a_OK(){
		// build a small canvas 32x64 and paint it in white
		var canvas	= document.createElement( 'canvas' );
		canvas.width	= 32*4;
		canvas.height	= 64*4;
		var context	= canvas.getContext( '2d' );
		// plain it in white
		context.fillStyle	= '#ffffff';
		context.fillRect( 0, 0, 4*32, 4*64 );
		// draw the window rows - with a small noise to simulate light variations in each room
		for( var y = 8*2; y < (4*64-8*2); y +=16*4 ){
			for( var x = 0; x < 4*32; x += 4*4 ){
				var value	= Math.floor( 64+Math.random() * 64 );
				context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
				context.fillRect( x, y, 4*4, 8*4 );
				
				//context.beginPath();
				//context.beginPath();
				//context.lineWidth = "1";
				value	= Math.floor( Math.random() * 128 );
				//context.strokeStyle ='grey'
				//context.strokeStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
				context.strokeStyle='rgb(' + [22, 22, 22].join( ',' )  + ')';//'red';
				context.rect(x,y, 4*4, 8*4);
				context.stroke();
				context.lineWidth = "1";
				context.strokeStyle='rgb(' + [196, 122, 122].join( ',' )  + ')';//'red';
				context.rect(x+1,y, 4*4-1, 8*4);
				context.stroke();
				
			}
		}
		var du=canvas.toDataURL();
		// build a bigger canvas and copy the small one in it
		// This is a trick to upscale the texture without filtering
		var canvas2	= document.createElement( 'canvas' );
		canvas2.width	= 512;
		canvas2.height	= 1024;
		var context	= canvas2.getContext( '2d' );
		// disable smoothing
		context.imageSmoothingEnabled		= false;
		context.webkitImageSmoothingEnabled	= false;
		context.mozImageSmoothingEnabled	= false;
		// then draw the image
		context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
		// return the just built canvas2
		return canvas2;
	}
	function generateTextureCanvas(){
		// build a small canvas 32x64 and paint it in white
		var canvas	= document.createElement( 'canvas' );
		canvas.width	= 32;
		canvas.height	= 64;
		var context	= canvas.getContext( '2d' );
		// plain it in white
		context.fillStyle	= '#ffffff';
		context.fillRect( 0, 0, 32, 64 );
		// draw the window rows - with a small noise to simulate light variations in each room
		for( var y = 8; y < (64-8); y +=16 ){
			for( var x = 0; x < 32; x += 4 ){
				var value	= Math.floor( Math.random() * 128 );
				context.fillStyle = 'rgb(' + [value, value, value].join( ',' )  + ')';
				context.fillRect( x, y, 2, 8 );
			}
		}

		// build a bigger canvas and copy the small one in it
		// This is a trick to upscale the texture without filtering
		var canvas2	= document.createElement( 'canvas' );
		canvas2.width	= 512;
		canvas2.height	= 1024;
		var context	= canvas2.getContext( '2d' );
		// disable smoothing
		context.imageSmoothingEnabled		= false;
		context.webkitImageSmoothingEnabled	= false;
		context.mozImageSmoothingEnabled	= false;
		// then draw the image
		context.drawImage( canvas, 0, 0, canvas2.width, canvas2.height );
		// return the just built canvas2
		return canvas2;
	}

}