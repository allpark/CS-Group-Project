// --------------------------------------------------------------------
// Data processing helper functions.
// --------------------------------------------------------------------
function sum(data) {
  var total = 0;

  // Ensure that data contains numbers and not strings.
  data = stringsToNumbers(data);

  for (let i = 0; i < data.length; i++) {
    total = total + data[i];
  }

  return total;
}

function mean(data) {
  var total = sum(data);

  return total / data.length;
}
function sliceRowNumbers (row, start=0, end) {
  var rowData = [];

  if (!end) {
    // Parse all values until the end of the row.
    end = row.arr.length;
  }

  for (i = start; i < end; i++) {
    rowData.push(row.getNum(i));
  }

  return rowData;
}

function stringsToNumbers (array) {
  return array.map(Number);
}

// --------------------------------------------------------------------
// Plotting helper functions
// --------------------------------------------------------------------

function drawAxis(layout, colour=0) {
  stroke(color(colour));

  // x-axis
  line(layout.leftMargin,
       layout.bottomMargin,
       layout.rightMargin,
       layout.bottomMargin);

  // y-axis
  line(layout.leftMargin,
       layout.topMargin,
       layout.leftMargin,
       layout.bottomMargin);
}

function drawAxis2(layout, rt, colour=0) {
    
  rt.stroke(color(colour));

    
  // x-axis
  rt.line(layout.leftMargin,
       layout.bottomMargin,
       layout.rightMargin,
       layout.bottomMargin);

  // y-axis
  rt.line(layout.leftMargin,
       layout.topMargin,
       layout.leftMargin,
       layout.bottomMargin);
}



function drawAxisLabels(xLabel, yLabel, layout, rt) {
    
    if (rt)
    {
        rt.fill(0);
        rt.noStroke();
        rt.textAlign('center', 'center');

        // Draw x-axis label.
        rt.text(xLabel, (layout.plotWidth() / 2) + layout.leftMargin,
             layout.bottomMargin + (layout.marginSize * 1.5));

        // Draw y-axis label.

        rt.translate(layout.leftMargin - (layout.marginSize * 1.5), layout.bottomMargin / 2);
        rt.rotate(- PI / 2);
        rt.text(yLabel, 0, 0);

        // undo rotations and translations 
        rt.rotate(PI/2);
        rt.translate(-(layout.leftMargin - (layout.marginSize * 1.5)), -layout.bottomMargin / 2);
        
        

    }
    
    else{
        
        fill(0);
        noStroke();
        textAlign('center', 'center');

        // Draw x-axis label.
        text(xLabel, (layout.plotWidth() / 2) + layout.leftMargin,
         layout.bottomMargin + (layout.marginSize * 1.5));

        // Draw y-axis label.
        push();
        translate(layout.leftMargin - (layout.marginSize * 1.5), layout.bottomMargin / 2);
        rotate(- PI / 2);
        text(yLabel, 0, 0);
        pop();

        
    }
   
}

function drawYAxisTickLabels(min, max, layout, mapFunction,
                             decimalPlaces, rt) {
    
  // if rt (render target) is unspecified, draw to p5js default rt 
  // else draw to the specified one 
    
  // Map function must be passed with .bind(this).
  var range = max - min;
  var yTickStep = range / layout.numYTickLabels;
    
  if (rt){
      rt.fill(0);
      rt.noStroke();
      rt.textAlign('right', 'center');    
  }
  else{
      fill(0);
      noStroke();
      textAlign('right', 'center');
  }
    
  // Draw all axis tick labels and grid lines.
  for (i = 0; i <= layout.numYTickLabels; i++) {
    var value = min + (i * yTickStep);
    
    var y = mapFunction(value);

 
    // Add tick label.
      
    if (rt){
        rt.text(value.toFixed(decimalPlaces), layout.leftMargin - layout.pad, y);
    }
    else{
        text(value.toFixed(decimalPlaces), layout.leftMargin - layout.pad, y);
    }

    if (layout.grid) {
      // Add grid line.
        
        if (rt){
            rt.stroke(200);
            rt.line(layout.leftMargin, y, layout.rightMargin, y);
            
        }
        else{
            
            stroke(200);
            line(layout.leftMargin, y, layout.rightMargin, y);    

        }
 
    }
  }
}
function drawXAxisTickLabel(value, layout, mapFunction, rt) {
    // Map function must be passed with .bind(this).
    var x = mapFunction(value);
    
    if (x >= layout.leftMargin && x <= layout.rightMargin){
        
        if (rt){
            rt.fill(0);
            rt.noStroke();
            rt.textAlign('center', 'center');

            // Add tick label.
            rt.text(value, x, layout.bottomMargin + layout.marginSize / 2);
            if (layout.grid) {
                // Add grid line.
                rt.stroke(220);
                rt.line(x, layout.topMargin, x, layout.bottomMargin);
            }

        }
        else{

            fill(0);
            noStroke();
            textAlign('center', 'center');

            // Add tick label.
            text(value, x, layout.bottomMargin + layout.marginSize / 2);

            if (layout.grid) {
                // Add grid line.
                stroke(220);
                line(x, layout.topMargin, x, layout.bottomMargin);
            }

        }
  
    
    }
   
}

// --------------------------------------------------------------------
// Array searching / retrieving functions
// --------------------------------------------------------------------

function binarySearchMatchApprox(arr, target, l=0, h=arr.length-1) {
    
    // bound target to the lower and upper limit of the sorted array
    if (target < arr[l]){
        return [arr[0]==target,0];
    }
    if (target > arr[h]){
        return [arr[h]==target,h];
    }
    
    // calculate midpoint of the high and low 
    let mid = Math.floor((h + l) / 2);
    
    
    // if the difference between high and low is less than two, then we've reached a 
    // point where there are only two possible elements
    return (h - l) < 2 
    // pick the one that's off by the least by the target and return if the match was found
    ? (target - arr[l]) < (arr[h] - target) ? [arr[l]==target, l] : [arr[h]==target, h] 
    : target < arr[mid]
    ? binarySearchMatchApprox(arr, target, l, mid)
    : target > arr[mid] 
    ? binarySearchMatchApprox(arr, target, mid, h)
    : [arr[mid]==target, mid]

    
}

function minMax(arr, lo=-1, hi=-1){
        
    let mi = 0;
    let ma = 0;
    
    let narrowedScope = (lo!=-1 && hi!=-1);
         
    if (arr.length==1){
        return [arr[0], arr[1]];
    }
    // handle the case when lo and hi are the same
    if (narrowedScope){
        
        // clamp lo and hi between 0 and array length just in case 
        
        lo = constrain(lo, 0, arr.length);
        hi = constrain(hi, 0, arr.length);
        
        if (hi==lo){
            return [arr[lo], arr[lo]];
        }
        
        
    }

    // if lo and hi are specified 
    // initialize mi and max to them #
    
    if (narrowedScope){
        if (arr[lo] > arr[hi]){
            ma = arr[lo]; 
            mi = arr[hi];       
        } 
        else{ 
            ma = arr[hi]; 
            mi = arr[lo];      
        }
    }
    else
    {
        if (arr[0] > arr[1]){
            ma = arr[0]; 
            mi = arr[1];       
        } 
        else{ 
            ma = arr[1]; 
            mi = arr[0];      
        }
    }
  
    
    for (let i=(narrowedScope ? lo: 2); i<(narrowedScope ? hi: arr.length); i++){
        ma = max(ma, arr[i]);
        mi = min(mi, arr[i]);
    }
    
    return [mi, ma]; 
}

// --------------------------------------------------------------------
// Other functions
// --------------------------------------------------------------------


function drawLineGraphGrid(graph, layout, mapFunction, mapFunction2, rt) {

    if (!layout.grid){
        return;
    }
    
    let max   = graph.domainY[1];
    let min   = graph.domainY[0];
    var range = max - min;
    
    let numTicks = layout.plotYTicksMax;
    
    let startPlotting = false;
    let previous      = null;

    // draw x axis grid lines
    rt.stroke(220);
    rt.strokeWeight(1);
    
    for (let i = 0; i < round(graph.domainX[1]-graph.domainX[0]); i++) {

        // Create an object to store data for the current year.
        var current = {
        // Convert strings to numbers.
            'year': floor(graph.domainX[0]) + i,
        };
        
        if (previous != null) {
            if (previous.year % layout.plotXTickLabelStartYearDiv == 0 && !startPlotting){
                startPlotting = true;
            }
            
            let x = mapFunction(previous.year);

            // start plotting once we found a matching year that's divisible by 
            if (startPlotting && previous.year % (layout.plotXTickLabelYearDiv +layout.plotXTickLabelYearDivMod) == 0){
           
                rt.line(x, layout.topMargin, x, layout.bottomMargin);    
            }
            
        }
      previous = current;
    }

    
    // Draw all y grid lines 
    for (i = 0; i < numTicks; i++) {

        var value = min + i * (range/numTicks);
        var y = mapFunction2(value);

        rt.line(layout.leftMargin, y, layout.rightMargin, y);

    }
}



function drawLineGraphWindow(layout, w, h, rt){
  
    rt.fill(255);
    rt.noStroke();
    rt.rect(0,0, layout.leftMargin, layout.rightMargin);
    rt.rect(0,0, width, layout.topMargin);
    rt.rect(layout.rightMargin,0, w - layout.rightMargin, layout.bottomMargin);
    rt.rect(0,layout.bottomMargin, w, h - layout.bottomMargin);
}

function drawLineGraphGridLabels(graph, layout, mapFunction, mapFunction2, rt) {


   
    let max   = graph.domainY[1];
    let min   = graph.domainY[0];
    var range = max - min;
    let numYTicks = layout.plotYTicksMax;
    

    let startPlotting = false;
    let previous      = null;

    // draw x axis labels 
    
    rt.fill(0);
    rt.noStroke();
    rt.textAlign('center', 'center');
    
    for (let i = 0; i < round(graph.domainX[1]-graph.domainX[0]); i++) {

        // Create an object to store data for the current year.
        var current = {
        // Convert strings to numbers.
            'year': floor(graph.domainX[0]) + i,
        };

        if (previous != null) {
            
            let x     = mapFunction(previous.year);
            let value = previous.year;

            if (previous.year % layout.plotXTickLabelStartYearDiv == 0 && !startPlotting){
                startPlotting = true;
            }

            // start plotting once we found a matching year that's divisible by 
            if (startPlotting && previous.year % (layout.plotXTickLabelYearDiv +layout.plotXTickLabelYearDivMod) == 0){
    
            
            // Add tick label.
            rt.text(value, x, layout.bottomMargin + layout.marginSize / 2);
      
            }
        }

      previous = current;
    }
    
    // draw y axis labels
    rt.textAlign('right', 'center');
    
    // use decimals only when range/numYTicks is less than 1.0
    
    let yStepAsStringSplit = (range/numYTicks).toString().split(".");

    let numOfDecimals;
    
    if (yStepAsStringSplit.length <= 1){
        numOfDecimals = 0;
    }
    else{
        numOfDecimals = 2
    }
    
    
    // draw y axis labels 
    for (i = 0; i < numYTicks; i++) {
        var value = min + i * (range/numYTicks);
        var y     = mapFunction2(value);
        rt.text(value.toFixed(numOfDecimals), layout.leftMargin - layout.pad, y);
    }
    
}



// --------------------------------------------------------------------
// Date functions
// --------------------------------------------------------------------


var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
              "August", "September","October", "November", "December"];

function fractYearToDate(fractYear, monthsAsNum=false){
    
    // not every year is equal...
    // this is only an approximate 
    
    let year       = floor(fractYear);
    let days       = (365 * (fractYear % 1)) + 1;
    let month      = floor(days/30.42);
    
    
    return [floor((days/30.42)+1).toString(), monthsAsNum ? month : MONTHS[month], year.toString()];
}


function fractYearToDateShort(fractYear, monthsAsNum=false){
    
    // not every year is equal...
    // this is only an approximate 
    
    let year       = floor(fractYear);
    let days       = (365 * (fractYear % 1)) + 1;
    let month      = constrain( floor(days/30.42),0,11);
    
    
    return MONTHS[month].slice(0,3) + " " +  floor((days/30.42)+1).toString() + ", " + year.toString();
}

// --------------------------------------------------------------------
// Hierarchal data processing
// --------------------------------------------------------------------

function treeMap(){
    
    // list of nodes to render
    this.nodes = [];
    
    // total weight of the graph
    this.totalWeight = 0.0;
    
    this.createNewInternalNode = function(weight, data){
        
        let newInternalNode = {
                frame  : { x: 0, y: 0, width: 0, height: 0 },
                weight : weight,
                data   : data
        }
        return newInternalNode;
    }
    
    this.weigh = function(node) {
        
        // weigh node 
        
        let nodeLevel2Nodes = [];
        let nodeList = [];
        
        node.level = 0;
        nodeList.push(node);
        
        while (nodeList.length > 0) {
            
            let searchNode = nodeList.pop();
            
            if (!nodeLevel2Nodes[searchNode.level]) {
                nodeLevel2Nodes[searchNode.level] = [];
            }
            nodeLevel2Nodes[searchNode.level].push(searchNode);
            
            if (searchNode.nodes) {
                
                for (let i = 0; i < searchNode.nodes.length; ++i) {
                    let nextNode = searchNode.nodes[i];
                    nextNode.level = searchNode.level + 1;
                    nextNode.parent = searchNode;
                    nodeList.push(nextNode);
                }
                
            }
        }
        for (let i = nodeLevel2Nodes.length - 2; i >= 0; --i) {
            for (let j = 0; j < nodeLevel2Nodes[i].length; ++j) {
                
                let weight = 0;
                
                for (let k = 0; k < nodeLevel2Nodes[i][j].nodes.length; ++k) {
                    weight = weight + nodeLevel2Nodes[i][j].nodes[k].weight;
                }
                
                nodeLevel2Nodes[i][j].weight = weight;
            }
        }
        
    }
    
    this.getMaxFontSize = function(size){
        return 0.1 * (size.width + size.height);
    }

    this.getMinFontSize = function(){
        return 25;
    }

    this.getFontSize = function(canvasSize, tileSize){
        
        let min = this.getMinFontSize(canvasSize);
        let max = this.getMaxFontSize(canvasSize);
        // return font size that's small enough to fit into the smallest dimension of tile 
        return Math.max(min, ((tileSize.width + tileSize.height) / (canvasSize.width + canvasSize.height)) * max);
    }
    
    this.getTotalWeight = function(){
        return this.totalWeight;
    }


    this.internalSquarify = function(nodes, width, height, createRect) {
        
        
        // get children of node
        let children = nodes.slice(0);
        
        // scale weights so that their weight correctly adds  up to the area of 
        // width and height rectangle that encompasses all nodes
        
        this.scaleWeights(nodes, width, height);

        children.sort(function (n0, n1) {return n1.weight - n0.weight});
        children.push(this.createNewInternalNode(0, null));
        
        // decide whether to split vertically or horizontally
        // depending on which dimension is the greatest
        
        let vertical = width > height;
        
        let w = vertical ? height : width;
        let x = 0;
        let y = 0;
        let rw = width;
        let rh = height;
        let row = [];
        
        while (children.length > 0) {
            
            let c = children[0];
            let r = c.weight;
            let s = this.sum(row);
            let min = this.min(row);
            let max = this.max(row);
            let wit = this.worst(s + r, Math.min(min, r), Math.max(max, r), w);
            let without = this.worst(s, min, max, w);
            
            if (row.length == 0 || wit < without) {
                row.push(c);
                children.shift();
            }
            
            else{
                
                let rx = x;
                let ry = y;
                let z = s / w;
                let j;
                
                for (j = 0; j < row.length; ++j) {
                    let d = row[j].weight / z;
                    if (vertical) {
                        createRect(rx, ry, z, d, row[j]);
                        ry = ry + d;
                    }
                    else {
                        createRect(rx, ry, d, z, row[j]);
                        rx = rx + d;
                    }
                }
                
                if (vertical){
                    x = x + z;
                    rw = rw - z;
                }
                else{
                    y = y + z;
                    rh = rh - z;
                }
                vertical = rh < rw;
                w = vertical ? rh : rw;
                row = [];
                
            }
        }
    };

    this.worst = function(s, min, max, w) {
        // calculate worst ratio that allows us to check if we should
        // be dividing vertically or horizontally to keep aspect ratio
        // as constant as possible
        return Math.max(w * w * max / (s * s), s * s / (w * w * min));
    };
    this.scaleWeights = function(weights, width, height) {
        
        // scale weights given frame width and height
        // this is to make the sum of weights equal to 
        // the total tree area 
        
        let scale = width * height / this.sum(weights);
        for (let i = 0; i < weights.length; i++) {
            weights[i].weight = scale * weights[i].weight;
        }
        
    };
    this.max = function(array) {
        // return maximum weight 
        return Math.max.apply(Math, this.weights(array));
    };
    this.min = function(array) {
        // return minimum weight 
        return Math.min.apply(Math, this.weights(array));
    };
    
    this.sum = function(array) {
        // get sum of weights
        // used to rescale weights 
        let total = 0;
        for (let i = 0; i < array.length; ++i) {
            total = total + array[i].weight;
        }
        return total;
    };
    this.weights = function(array) {
        return array.map(function (d) { return d.weight; }, array);
    };
    
    this.squarifyMain = function(rootNode, f) {
            
        // initialize total weight of the tree
        this.totalWeight = rootNode.frame.width * rootNode.frame.height;
        
        // weigh root node 
        this.weigh(rootNode);
        
        // create new nodes array
        let nodes = new Array();
        
        // push root node into nodes array
        nodes.push(rootNode);
        
        while (nodes.length > 0) {
    
            let node = nodes.shift();
            
            if (node.nodes && node.nodes.length > 0) {
                // squarify every node given frame width / height 
                this.internalSquarify(node.nodes, node.frame.width, node.frame.height, function(x, y, width, height, n) {
                    n.frame = {
                        x: node.frame.x + x,
                        y: node.frame.y + y,
                        width: width,
                        height: height
                    };
                });
                // push child nodes into nodes array 
                for (let i = 0; i < node.nodes.length; ++i) {
                    let childNode = node.nodes[i];
                    if (childNode.nodes && childNode.nodes.length > 0) {
                        nodes.push(childNode);
                    }
                }
            }
        }
        
        nodes.push(rootNode);
        
        // while nodes stack is non-empty, push nodes out
        while (nodes.length > 0) {
            
            let node = nodes.pop();
            
            // ignore level 0 nodes
            if (node.level > 1){
                this.preRenderer(node);        
            }
            
            if (node.nodes) {
                for (let i = 0; i < node.nodes.length; ++i) {
                    nodes.push(node.nodes[i]);
                }
            }
        }
    }
    
    
    this.preRenderer = function(node){
        // push current retrieved to node array 
        this.nodes.push(node);  
    }
    this.clearCollapsedNodes = function(){
        this.nodes = [];
    }
    this.getCollapsedNodes = function(){
        return this.nodes;
    }
    
}
    
// geometry functions

/*
function loadOBJModelFromString(strings){
    
    var model = new p5.default.Geometry();

    parseObj(model, strings);


    return model;

}
*/


//======================== button methods ===========================\\ 

var buttons = {};

buttons.addButton = function(x, y, w, h, drawFunc, onClickFunc, vis){
	
	let btn = {
		x : x,
		y : y,
		w : w,
		h : h,
		hovered : false,
		draw    : drawFunc, 
		onClick : onClickFunc,
        state   : true,
		parent  : vis
	}
	
	if (vis.buttons==undefined){
		vis.buttons = [];
	}
	vis.buttons.push(btn);
    
    return btn;
}

buttons.drawButtons = function(vis){
	for (let i=0; i<vis.buttons.length; i++){
		vis.buttons[i].draw();
	}  
}

	
buttons.buttonsOnMouseClick = function(vis) {
	for (let i=0; i<vis.buttons.length; i++){
		
		let btn = vis.buttons[i];
		
		// if mouse clicked is within the button's bounds 
		if (mouseX >= btn.x && mouseX <= (btn.x + btn.w) && 
			mouseY >= btn.y && mouseY <= (btn.y + btn.h))
		{
			if (btn.onClick != undefined) {btn.onClick()}
		}
	}
	
}

buttons.thinkButtons = function(vis){
	for (let i=0; i<vis.buttons.length; i++){

		let btn = vis.buttons[i];
		
		// if mouse is within the button's bounds.. set its hover state to true else false
		if (mouseX >= btn.x && mouseX <= (btn.x + btn.w) && 
			mouseY >= btn.y && mouseY <= (btn.y + btn.h))
		{
			btn.hovered = true;   
		}
		else{
			btn.hovered = false;   
		}
	}
}

	
// other less used functions

function smoothstep(edge0, edge1, x) {

    let xout = constrain((x - edge0) / (edge1 - edge0), 0.0, 1.0);
	
    // Evaluate polynomial
    return xout * xout * (3.0 - 2.0 * xout);
}


  
  