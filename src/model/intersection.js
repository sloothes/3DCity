TRAFFIC.Intersection = function (rect) {
    this.rect = rect;
    this.id = TRAFFIC.uniqueId('intersection');
    this.roads = [];
    this.inRoads = [];
    this.controlSignals = new TRAFFIC.ControlSignals(this);
}

TRAFFIC.Intersection.prototype = {
    constructor: TRAFFIC.Intersection,
    copy : function(intersection) {
        var result;
        var tr=new TRAFFIC.Rect();
        intersection.rect = tr.copy(intersection.rect);//new TRAFFIC.Rect().copy(intersection.rect);
        result = Object.create( TRAFFIC.Intersection.prototype );
        TRAFFIC.extend(result, intersection);
        result.roads = [];
        result.inRoads = [];
        result.controlSignals = new TRAFFIC.ControlSignals(result);
        return result;
    },
    toJSON : function() {
        var obj;
        return obj = { id: this.id, rect: this.rect };
    },
    update : function() {
        for(var i=0; i<this.roads.length;i++) {
            this.roads[i].update();
        }
        var results=[];
        for(var i=0; i<this.inRoads.length;i++) {
            results.push(this.inRoads[i].update());
        }
        return results;

    }
}