function Joint(x, y){
	this.x = x;
	this.y = y;
	
	this.oldX = x;
	this.oldY = y;
	
	this.aX = 0;
	this.aY = 0;
	
	this.fixed = false;
	
	this.addAcc = function(x, y){
		this.aX = x;
		this.aY = y;
	}
}

function Bone(v1, v2, url, order){
	this.v1 = v1;
	this.v2 = v2;
	
	var dx = v1.x - v2.x;
	var dy = v1.y - v2.y;
	
	this.l = Math.sqrt(dx * dx + dy * dy);
	
	this.parent = null;
	
	this.minA = -180;
	this.maxA = 180;
	
	this.setAngleConstraint = function(parent, min, max){
		this.parent = parent;
		
		this.minA = min + 180;
		this.maxA = max + 180;
	}
	
	this.image = null;
	this.setImage = function(url) {
		this.image = new Image();
		this.image.src = url;
	}
	
	if (url) {
		this.setImage(url);
	}
	
	this.order = 0;
	this.setOrder = function(order) {
		this.order = order;
	}
	
	if (order) {
		this.setOrder(order);
	}
}

function Ragdoll(){
	this.axJoint = Array();
	this.axBone = Array();
	
	this.dead = false;
	
	this.addJoint = function(x, y){
		var j = new Joint(x + 320, y + 240); //HARDCODED RAGDOLL POS!! ATTENTION!
		
		this.axJoint.push(j);
		
		return j;
	}
	
	this.addBone = function(j1, j2, url, order){
		var b = new Bone(j1, j2, url, order);
		
		this.axBone.push(b);
		
		return b;
	}
	
	this.update = function(dt){
		for(var i = 0; i < this.axJoint.length; i++){
			var v = this.axJoint[i];
			
			if(!v.fixed){
				if(this.dead){
					v.aX += RagdollApp.GRAVX;
					v.aY += RagdollApp.GRAVY;
				} else {
					v.oldX = v.x;
					v.oldY = v.y;
				}
				
				var tmpX = v.x;
				var tmpY = v.y;
				
				v.x = (2 - RagdollApp.FRIC) * v.x - (1 - RagdollApp.FRIC) * v.oldX + v.aX * dt * dt;
				v.y = (2 - RagdollApp.FRIC) * v.y - (1 - RagdollApp.FRIC) * v.oldY + v.aY * dt * dt;
				
				v.oldX = tmpX;
				v.oldY = tmpY;
				
				v.aX = 0;
				v.aY = 0;
				
				if (v.y > RagdollApp.height - 10)
					v.y = RagdollApp.height - 10;
				if (v.x < 0)
					v.x = 0;
				if (v.x > RagdollApp.width)
					v.x = RagdollApp.width;
					
				for(var j = 0; j < RagdollApp.circles.length; j++){
					var c = RagdollApp.circles[j];
					
					var dx = v.x - c.x;
					var dy = v.y - c.y;
					
					var d = Math.sqrt(dx * dx + dy * dy);
					
					if (d < c.r){
						dx *= c.r /d;
						dy *= c.r /d;
						
						v.x = c.x + dx;
						v.y = c.y + dy;
					}
				}
			}
		}
			
		for(var iter = 0; iter < 1; iter++)
			for(var i = 0; i < this.axBone.length; i++){
				var b = this.axBone[i];
				
				//length
				var dx = b.v2.x - b.v1.x;
				var dy = b.v2.y - b.v1.y;
				
				var dist = Math.sqrt(dx * dx + dy * dy);
				
				var diff = 0.5 * (dist - b.l) /dist;
				
				dx *= diff;
				dy *= diff;
				
				if(!b.v1.fixed){
					b.v1.x += dx;
					b.v1.y += dy;
				}
				if(!b.v2.fixed){
					b.v2.x -= dx;
					b.v2.y -= dy;
				}
				
				//angle
				if(b.parent != null){
					var l0, l1, l2;
					if (b.parent.v1 == b.v1){
						l0 = b.parent.v2;
						l1 = b.v1;
						l2 = b.v2;
					} else if(b.parent.v1 == b.v2){
						l0 = b.parent.v2;
						l1 = b.v2;
						l2 = b.v1;
					}else if(b.parent.v2 == b.v1){
						l0 = b.parent.v1;
						l1 = b.v1;
						l2 = b.v2;
					}else if(b.parent.v2 == b.v2){
						l0 = b.parent.v1;
						l1 = b.v2;
						l2 = b.v1;
					}
					
					var dx1 = l0.x - l1.x;
					var dy1 = l0.y - l1.y;
					
					var dx2 = l2.x - l1.x;
					var dy2 = l2.y - l1.y;
					
					var oCTx = (l0.x + l1.x + l2.x) /3;
					var oCTy = (l0.y + l1.y + l2.y) /3;
					
					var dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
					var dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
					
					var ang1 = Math.atan2(dy1, dx1);
					var ang2 = Math.atan2(dy2, dx2);
					
					var ang = (ang1 - ang2) * (180 /Math.PI);
					
					if(ang < 0)
						ang += 360;
						
					if(ang < b.minA || ang > b.maxA){
						var dAng;
						if(ang < b.minA)
							dAng = (b.minA - ang) /180.0 /Math.PI;
						else if(ang > b.maxA)
							dAng = (b.maxA - ang) /180.0 /Math.PI;
							
						l0.x = l1.x + dist1 * Math.cos(ang1 + dAng);
						l0.y = l1.y + dist1 * Math.sin(ang1 + dAng);
						
						l2.x = l1.x + dist2 * Math.cos(ang2 - dAng);
						l2.y = l1.y + dist2 * Math.sin(ang2 - dAng);
						
						var nCTx = (l0.x + l1.x + l2.x) /3;
						var nCTy = (l0.y + l1.y + l2.y) /3;
						
						var CTx = nCTx - oCTx;
						var CTy = nCTy - oCTy;
						
						l0.x -= CTx;
						l0.y -= CTy;
						
						l1.x -= CTx;
						l1.y -= CTy;
						
						l2.x -= CTx;
						l2.y -= CTy;
					}
				}
		}
	}
	
	this.init = function() {
        var jL = Array();
        var bL = Array();

        jL.push( this.addJoint(0, 0) ); // [0] Neck
        jL.push( this.addJoint(0, -40) ); // [1] Head(tip)
        jL.push( this.addJoint(0, 60) ); // [2] Hip
        jL.push( this.addJoint(-10, 120) ); // [3] Knee 1
        jL.push( this.addJoint(-10, 180) ); // [4] Foot 1
        jL.push( this.addJoint(10, 120) ); // [5] Knee 2
        jL.push( this.addJoint(10, 180) ); // [6] Foot 2
        jL.push( this.addJoint(-50, 0) ); // [7] Ellbow 1
        jL.push( this.addJoint(-100, 0) ); // [8] Hand 1
        jL.push( this.addJoint(50, 0) ); // [9] Ellbow 2
        jL.push( this.addJoint(100, 0) ); // [10] Hand 2

        bL.push( this.addBone(jL[0], jL[2], 'RagdollSprites/Body.png', 10) );
        bL.push( this.addBone(jL[0], jL[1], 'RagdollSprites/Head.png', 11) );
        bL.push( this.addBone(jL[2], jL[3], 'RagdollSprites/OLeg.png', 9) );
        bL.push( this.addBone(jL[3], jL[4], 'RagdollSprites/ULeg.png', 9) );
        bL.push( this.addBone(jL[2], jL[5], 'RagdollSprites/OLeg.png', 11) );
        bL.push( this.addBone(jL[5], jL[6], 'RagdollSprites/ULeg.png', 11) );
        bL.push( this.addBone(jL[0], jL[7], 'RagdollSprites/OArm.png', 8) );
        bL.push( this.addBone(jL[7], jL[8], 'RagdollSprites/UArm.png', 8) );
        bL.push( this.addBone(jL[0], jL[9], 'RagdollSprites/OArm.png', 12) );
        bL.push( this.addBone(jL[9], jL[10], 'RagdollSprites/UArm.png', 12) );

        //head
        bL[1].setAngleConstraint(bL[0], -10, 10);

        //upper leg 1
        bL[2].setAngleConstraint(bL[0], -80, 90);

        //lower leg 1
        bL[3].setAngleConstraint(bL[2], -135, 10);

        //upper leg 2
        bL[4].setAngleConstraint(bL[0], -80, 90);

		//lower leg 2
        bL[5].setAngleConstraint(bL[4], -135, 10);

        //upper arms don't work..

        //lower arm 1
        bL[7].setAngleConstraint(bL[6], -5, 170);

        //lower arm 2
        bL[9].setAngleConstraint(bL[8], -5, 170);
		
		this.sortBones();
	}
	
	this.sortBones = function() {
		for (var i = this.axBone.length -1; i >= 0; i--) {
			for (var j = 0; j < i; j++) {
				if (this.axBone[j].order > this.axBone[j+1].order) {
					var tmpBone = this.axBone[j+1];
					this.axBone[j+1] = this.axBone[j];
					this.axBone[j] = tmpBone;
				}
			}
		}
	}
}

function Circle(x, y, r){
	this.x = x;
	this.y = y;
	this.r = r;
}

var RagdollApp = {
	canvas: null,
	graphics: null,
	interval: null,
	
	width: 0,
	height: 0,
	
	mouseX: 0,
	mouseY: 0,
	
	TIMESTEP: 0.1,
	FRIC: 0.025,
	GRAVX: 0,
	GRAVY: 9.81,
	
	raggy: null,
	ptFound: false,
	movePt: null,
	
	circles: null,
	
	getMousePos: function(event){
		var rect = this.canvas[0].getBoundingClientRect();

		this.mouseX = event.clientX - rect.left;
		this.mouseY = event.clientY - rect.top;
	},
	
	init: function(canvasId){
		if (this.canvas) {
			this.canvas.off();
		}
		
		this.canvas = $('#'  +canvasId);
		this.graphics = this.canvas[0].getContext('2d');
		
		this.width = this.canvas.prop('width');
		this.height = this.canvas.prop('height');
		
		// INIT SOME OBJECTS
		this.raggy = new Ragdoll();
		this.raggy.init();
		
		this.circles = [];
		this.circles.push(new Circle(20, 20, 100));
		this.circles.push(new Circle(400, 100, 50));
		this.circles.push(new Circle(200, 400, 100));
		this.circles.push(new Circle(500, 500, 150));
		
		// START
		var self = this;
		
		this.canvas.on('mousedown', function(event) {
			self.getMousePos(event);
			
			self.ptFound = false;
			
			for(var i = 0; i < self.raggy.axJoint.length; i++){
				var pt = self.raggy.axJoint[i];
				
				var dx = pt.x - self.mouseX;
				var dy = pt.y - self.mouseY;
				
				var d = Math.sqrt(dx * dx + dy * dy);
				
				if(d < 15){
					self.ptFound = true;
					self.movePt = pt;
					
					break;
				}
			}
		});
		
		this.canvas.on('mouseup', function(event) {
			self.ptFound = false;
		});
		
		this.canvas.on('mousemove', function(event){
			self.getMousePos(event);
	
			if(self.ptFound == true){
				var dx = self.movePt.x - self.mouseX;
				var dy = self.movePt.y - self.mouseY;
				
				var d = Math.sqrt(dx * dx + dy * dy);
				
				if(d < 20){
					self.movePt.x = self.mouseX;
					self.movePt.y = self.mouseY;
				}else
					self.ptFound = false;
			}
		});
		
		this.interval = window.setInterval(function(){
			self.update();
		}, 17);
	},
	
	update: function(){
		this.cls();
		
		this.raggy.dead = true;
		this.raggy.update(this.TIMESTEP);
		
		// <!-- Draw Bones
		//this.graphics.strokeStyle = '#000000';
		this.graphics.strokeStyle = '#ff0000';
		this.graphics.beginPath();
		
		for(var i = 0; i < this.raggy.axBone.length; i++){
			var b = this.raggy.axBone[i];
			
			if (b.image) {
				//this.graphics.save();
				
				var alpha = Math.atan2(b.v2.y - b.v1.y, b.v2.x - b.v1.x) - Math.PI/2;
				this.graphics.rotate(alpha);
				
				var x0 = (b.v1.x + b.v2.x) / 2;
				var y0 = (b.v1.y + b.v2.y) / 2;
				
				var x = Math.cos(alpha) * x0 + Math.sin(alpha) * y0;
				var y = -Math.sin(alpha) * x0 + Math.cos(alpha) * y0;
				
				var size = b.l * 1.2;
				this.graphics.drawImage(b.image, x - size/2, y - size/2, size, size);
				
				//this.graphics.restore();
				this.graphics.rotate(-alpha);
			} else {
				this.graphics.moveTo(b.v1.x, b.v1.y);
				this.graphics.lineTo(b.v2.x, b.v2.y);
			}
		}
		
		this.graphics.stroke();
		this.graphics.closePath();
		// -->
		
		this.graphics.strokeStyle = "#dddddd";
		for(var i = 0; i < this.circles.length; i++){
			var c = this.circles[i];
			
			this.graphics.beginPath();
			this.graphics.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
			this.graphics.closePath();
			//this.graphics.fill();
			this.graphics.stroke();
		}
	},
	
	cls: function(){
		this.graphics.fillStyle = "#6495ED";
		this.graphics.fillRect(0, 0, this.width, this.height);
	},
	
	clear: function() {
		this.raggy = null;
		this.circles = [];
	}
}
