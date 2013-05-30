function BObject(){
	this.axVertex = Array();
	this.axEdge = Array();

	this.x = 0;
	this.y = 0;
	
	this.area = 0;
	this.circ = 0;
	
	this.addVertex = function(x, y){
		this.axVertex.push(new Vertex(x, y));
		
		return this.axVertex[this.axVertex.length -1];
	}
	
	this.addEdge = function(v1, v2){
		this.axEdge.push(new Edge(v1, v2));
		
		return this.axEdge[this.axEdge.length -1];
	}
	
	this.getArea = function(){
		var area = 0;
		
		for(var j = this.axVertex.length -1, i = 0; i < this.axVertex.length; j = i, i++)
			area += (this.axVertex[j].x * this.axVertex[i].y - this.axVertex[j].y * this.axVertex[i].x);
		
		return area * 0.5;
	}
	
	this.getLength = function(){
		var l = 0;
		
		var dx;
		var dy;
		
		for(var j = this.axVertex.length -1, i = 0; i < this.axVertex.length; j = i, i++){
			dx = this.axVertex[i].x - this.axVertex[j].x;
			dy = this.axVertex[i].y - this.axVertex[j].y;
			
			l += Math.sqrt(dx * dx + dy * dy);
		}
		
		return l;
	}
	
	this.isPointInside = function(x, y){
		var ptIn = false;
			
		var x1, y1, x2, y2;
		for(var j = this.axVertex.length - 1, i = 0; i < this.axVertex.length; j=i, i++){
			 x1 = this.axVertex[i].x;
			 y1 = this.axVertex[i].y;
		 
			 x2 = this.axVertex[j].x;
			 y2 = this.axVertex[j].y;
		 
			 if( ( ((y1<=y) && (y<y2)) || ((y2<=y) && (y<y1)) ) && (x<(((x2-x1)*(y-y1))/(y2-y1))+x1))
				ptIn = !ptIn;
		}

		return ptIn;
	}

	this.collisionCheck = function(o){ // TODO: In work
		for(var i = 0; i < this.axVertex.length; i++){
			var p = this.axVertex[i];
			
			if(o.isPointInside(p.x, p.y)){
				var dx = p.x - o.x;
				var dy = p.y - o.y;
				
				var d = Math.sqrt(dx * dx + dy * dy);
				
				dx /= d;
				dy /= d;
				
				var dist = 0.1;
				while(o.isPointInside(p.x + dist * dx, p.y + dist * dy)){
					dist += 0.1;
				}
				
				dx *= dist * 0.5;
				dy *= dist * 0.5;
				
				p.x += dx;
				p.y += dy;
				
				for(var j = 0; j < o.axVertex.length; j++){
					o.axVertex[j].x -= dx;
					o.axVertex[j].y -= dy;
				}
			}
		}
	}
}

var Blob = {
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
			
			// new blob
			var seg = 32;
			var blob = new BObject();
			
			for(var i = 0; i < seg; i++){
				var angle = 2 * Math.PI / seg * i;
				
				blob.addVertex(Math.cos(angle) * 50 + self.mouseX, Math.sin(angle) * 50 + self.mouseY);
			}
			for(var j = seg -1, i = 0; i < seg; j = i, i++) {
				blob.addEdge(blob.axVertex[i], blob.axVertex[j]);
			}

			blob.area = blob.getArea();
			blob.circ = blob.getLength();
			
			self.axObject.push(blob);		
		});
		
		this.interval = setInterval(function(){
			self.update();
		}, 17);
	},
	
	update: function(){
		this.cls();
		
		for(var i = 0; i < this.axObject.length; i++){
			var o = this.axObject[i];
			
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
			
			// <!-- Blob update
			aN = Array();
			
			var h = 2 * (o.area - o.getArea()) / (o.circ + o.getLength());
			
			for(var j = o.axVertex.length -1, q = 0, k = 1; q < o.axVertex.length; k = (k + 1) % o.axVertex.length, j = q, q++){
				var dx1 = o.axVertex[q].x - o.axVertex[j].x;
				var dy1 = o.axVertex[q].y - o.axVertex[j].y;
				
				var dx2 = o.axVertex[k].x - o.axVertex[q].x;
				var dy2 = o.axVertex[k].y - o.axVertex[q].y;
				
				var nx =  dy1 + dy2;
				var ny = -dx1 - dx2;
				
				var n = Math.sqrt(nx * nx + ny * ny);
				
				nx /= n;
				ny /= n;
				
				aN.push(new Vec2(nx *h, ny *h));
			}
			
			for(var q = 0; q < o.axVertex.length; q++){
				o.axVertex[q].x += aN[q].x;
				o.axVertex[q].y += aN[q].y;
			}
			// Blob update -->
			
			// <!-- Particle update
			this.graphics.fillStyle = "#dddddd";
			
			o.x = 0;
			o.y = 0;
			
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