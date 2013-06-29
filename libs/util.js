function Vec2(x, y){
	this.x = x;
	this.y = y;
	
	this.normalise = function(){
		var l = Math.sqrt(x * x + y * y);
		
		this.x /= l;
		this.y /= l;
	}
}
function dotP(v1, v2){
	return v1.x * v2.x + v1.y * v2.y;
}

function Vertex(x, y){
	this.x = x;
	this.y = y;
	
	this.oldX = x;
	this.oldY = y;
	
	this.aX = 0;
	this.aY = 0;
	
	this.addAcc = function(x, y){
		this.aX = x;
		this.aY = y;
	}
}

function Edge(v1, v2){
	this.v1 = v1;
	this.v2 = v2;
	
	var dx = v1.x - v2.x;
	var dy = v1.y - v2.y;
	
	this.l = Math.sqrt(dx * dx + dy * dy);
}