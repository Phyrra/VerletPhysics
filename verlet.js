function VObject(){
	this.axVertex = Array();
	this.axEdge = Array();
	
	this.x = 0;
	this.y = 0;
	
	this.addVertex = function(x, y){
		this.axVertex.push(new Vertex(x, y));
		
		return this.axVertex[this.axVertex.length -1];
	}
	
	this.addEdge = function(v1, v2){
		this.axEdge.push(new Edge(v1, v2));
		
		return this.axEdge[this.axEdge.length -1];
	}

	this.projectToAxis = function(xAxis){
		var fDotP = dotP(xAxis, new Vec2(this.axVertex[0].x, this.axVertex[0].y));
		var xVals = new Vec2(fDotP, fDotP);
		
		for(var i = 1; i < this.axVertex.length; i++){
			fDotP = dotP(xAxis, new Vec2(this.axVertex[i].x, this.axVertex[i].y));
			
			if(fDotP < xVals.x)
				xVals.x = fDotP;
			if(fDotP > xVals.y)
				xVals.y = fDotP;
		}
		
		return xVals;
	}
	
	this.collisionCheck = function(o){
		var xObj;
		var xAxis;
		
		var xVals1;
		var xVals2;
		
		var fDist;
		var fMinDist = 1000000;
		
		var collNormal;
		var collEdge;
		var collVert;
		var collObj;
		
		for(var k = 0; k < 2; k++){
			if(k == 0)
				xObj = this;
			else
				xObj = o;

			for(var q = 0; q < xObj.axEdge.length; q++){
				var e = xObj.axEdge[q];

				xAxis = new Vec2(e.v2.y - e.v1.y, e.v1.x - e.v2.x);
				xAxis.normalise();

				xVals1 = this.projectToAxis(xAxis);
				xVals2 = o.projectToAxis(xAxis);

				fDist = (xVals1.x < xVals2.x) ? xVals2.x - xVals1.y : xVals1.x - xVals2.y;
				if(fDist > 0)
					return false;
				else{
					fDist = Math.abs(fDist);
					
					if(fDist < fMinDist){
						fMinDist = fDist;
						collNormal = xAxis;

						collObj = k;
						collEdge = e;
					}
				}
			}
		}
		
		var xObj1 = this;
		var xObj2 = o;
		if(collObj != 1){
			var tmp = xObj2;
			xObj2 = xObj1;
			xObj1 = tmp;
		}
		
		var sgn = dotP(collNormal, new Vec2(xObj1.x - xObj2.x, xObj1.y - xObj2.y));
		if(sgn < 0){
			collNormal.x *= -1;
			collNormal.y *= -1;
		}
		
		var fSmallestDist = 1000000;
		for(var q = 0; q < xObj1.axVertex.length; q++){
			var v = xObj1.axVertex[q];
			
			fDist = dotP(collNormal, new Vec2(v.x - xObj2.x, v.y - xObj2.y));
			
			if(fDist < fSmallestDist){
				fSmallestDist = fDist;
				collVert = v;
			}
		}
		
		var collVector = new Vec2(collNormal.x * fMinDist, collNormal.y * fMinDist);
		
		var xE1 = collEdge.v1;
		var xE2 = collEdge.v2;
		
		var fT;
		if (Math.abs(xE1.x - xE2.x) > Math.abs(xE1.y - xE2.y))
			fT = (collVert.x - collVector.x - xE1.x) / (xE2.x - xE1.x);
		else
			fT = (collVert.y - collVector.y - xE1.y) / (xE2.y - xE1.y);

		var fLambda = 1.0 / (fT * fT + (1 - fT) * (1 - fT));
		
		xE1.x -= collVector.x * (1 - fT) * 0.5 * fLambda;
		xE1.y -= collVector.y * (1 - fT) * 0.5 * fLambda;
		
		xE2.x -= collVector.x * fT * 0.5 * fLambda;
		xE2.y -= collVector.y * fT * 0.5 * fLambda;
		
		collVert.x += collVector.x * 0.5;
		collVert.y += collVector.y * 0.5;
	}
};

var Verlet = {
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
	
	axObject: null,
	
	getMousePos: function(event){
		if(event.pageX || event.pageY){
			this.mouseX = event.pageX;
			this.mouseY = event.pageY;
		}
		
		this.mouseX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		this.mouseY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		
		var off = this.canvas.offset();
		this.mouseX -= off.left;
		this.mouseY -= off.top;
	},
	
	init: function(canvasId){
		if (this.canvas) {
			this.canvas.off('click');
		}
		
		this.canvas = $('#' + canvasId);
		this.graphics = this.canvas[0].getContext('2d');
		
		this.width = parseInt(this.canvas.prop('width'));
		this.height = parseInt(this.canvas.prop('height'));
		
		this.axObject = [];
		
		var self = this;
		this.canvas.on('click', function(event) {
			self.getMousePos(event);
				
			// new square
			var square = new VObject();
				
			var p1 = square.addVertex(self.mouseX - 25, self.mouseY - 25);
			var p2 = square.addVertex(self.mouseX + 25, self.mouseY - 25);
			var p3 = square.addVertex(self.mouseX + 25, self.mouseY + 25);
			var p4 = square.addVertex(self.mouseX - 25, self.mouseY + 25);
			
			square.addEdge(p1, p2);
			square.addEdge(p2, p3);
			square.addEdge(p3, p4);
			square.addEdge(p4, p1);
			
			square.addEdge(p1, p3);
			square.addEdge(p2, p4);
			
			self.axObject.push(square);		
		});
		
		this.interval = window.setInterval(function(){
			self.update();
		}, 17);
	},
	
	update: function(){
		this.cls();
		
		for(var i = 0; i < this.axObject.length; i++){
			var o = this.axObject[i];
			
			o.x = 0;
			o.y = 0;
			
			// <!-- Particle update
			this.graphics.fillStyle = "#dddddd";
			
			for(var j = 0; j < o.axVertex.length; j++){
				var p = o.axVertex[j];
				
				this.graphics.beginPath();
				this.graphics.arc(p.x, p.y, 5, 0, Math.PI * 2, true);
				this.graphics.closePath();
				this.graphics.fill();
				
				var tmpX = p.x;
				var tmpY = p.y;
				
				var dX = p.x - p.oldX;
				var dY = p.y - p.oldY;
			
				p.x = (2 - this.FRIC) * p.x - (1 - this.FRIC) * p.oldX + (p.aX + this.GRAVX) * this.TIMESTEP * this.TIMESTEP;
				p.y = (2 - this.FRIC) * p.y - (1 - this.FRIC) * p.oldY + (p.aY + this.GRAVY) * this.TIMESTEP * this.TIMESTEP;
			
				p.oldX = tmpX;
				p.oldY = tmpY;
			
				p.aX = 0;
				p.aY = 0;
				
				if(p.x < 1)
					p.x = 1;
				if(p.x > this.width -1)
					p.x = this.width -1;
				if(p.y < 1)
					p.y = 1;
				if(p.y > this.height -1)
					p.y = this.height -1;
					
				o.x += p.x;
				o.y += p.y;
			}
			
			o.x /= o.axVertex.length;
			o.y /= o.axVertex.length;
			// Particle update -->
							
			// <!-- Edge update
			this.graphics.strokeStyle = '#000000';
			this.graphics.beginPath();
			
			for(var j = 0; j < o.axEdge.length; j++){
				var e = o.axEdge[j];
				
				this.graphics.moveTo(e.v1.x, e.v1.y);
				this.graphics.lineTo(e.v2.x, e.v2.y);
				
				var dx = e.v2.x - e.v1.x;
				var dy = e.v2.y - e.v1.y;
				
				var d = Math.sqrt(dx * dx + dy * dy);
				
				var diff = 0.5 * (d - e.l) /d;
				
				dx *= diff;
				dy *= diff;
				
				e.v1.x += dx;
				e.v1.y += dy;
				
				e.v2.x -= dx;
				e.v2.y -= dy;
			}
							
			this.graphics.stroke();
			this.graphics.closePath();
			// Edge update -->
			
			for(var j = i + 1; j < this.axObject.length; j++)
				o.collisionCheck(this.axObject[j]);
		}
	},
	
	cls: function(){
		this.graphics.fillStyle = "#6495ED";
		this.graphics.fillRect(0, 0, this.width, this.height);
	},
	
	clear: function() {
		this.axObject = [];
	}
};