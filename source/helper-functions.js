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

function stringsToNumbers (arr) {
  return arr.map(Number);
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
    
    // bound target to the lower and upper limit of the sorted arr
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

function binarySearchMatchMax(arr, target, l=0, h=arr.length-1){
    
    // bound target to the lower and upper limit of the sorted arr
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
    // find val that is greater or equal to target
    ? arr[l] >= target ? [arr[l]==target, l] : [arr[h]==target, h] 
    : target < arr[mid]
    ? binarySearchMatchMax(arr, target, l, mid)
    : target > arr[mid] 
    ? binarySearchMatchMax(arr, target, mid, h)
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
        
        // clamp lo and hi between 0 and arr length just in case 
        
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
    
    // create new node internal object
    this.createNewInternalNode = function(weight, data){
        
        // create new internal node object    
        let newInternalNode = {
                frame  : { x: 0, y: 0, width: 0, height: 0 },
                weight : weight,
                data   : data
        }
        
        return newInternalNode;
    }
 
   
    this.getTotalWeight = function(){
        return this.totalWeight;
    }
    this.getMaxFontSize = function(size){
        return 0.1 * (size.height + size.width);
    }

    this.getMinFontSize = function(){
        return 25;
    }
    this.getFontSize = function(canvasSize, tileSize){
        
        let mi = this.getMinFontSize(canvasSize);
        let ma = this.getMaxFontSize(canvasSize);
        
        // return font size that's small enough to fit into the smallest dimension of tile 
        return max(mi, ma * ((tileSize.width + tileSize.height) / (canvasSize.width + canvasSize.height)) );
    }
    
    this.createFrame = function(x, y, width, height, n, node){

        n.frame = {
            x: node.frame.x + x,
            y: node.frame.y + y,
            width: width,
            height: height
        };
    }
    
   
    this.weigh = function(node) {
        
        // weigh current node 
        let level2Nodes = [];
        let nodesToWeigh = [];
        
        // set the initial level to 0
        node.level = 0;
        
        // push the current node
        nodesToWeigh.push(node);
        
        // iterate while node list is non empty
        while (nodesToWeigh.length >= 1) {
            
            // pop current node and search it
            let nodeToSearch = nodesToWeigh.pop();
            
            // if level 2 node of search node level doesn't exist,
            // then create an arr inside of it 
            
            if (!level2Nodes[nodeToSearch.level]){
                level2Nodes[nodeToSearch.level] = [];
            }
            
            // push level 2 node given search node at current search node level 
            level2Nodes[nodeToSearch.level].push(nodeToSearch);
            
            if (nodeToSearch.nodes){
                for (let i = 0; i < nodeToSearch.nodes.length; ++i) {
                    let nextNode = nodeToSearch.nodes[i];
                    nextNode.level = nodeToSearch.level + 1;
                    nextNode.parent = nodeToSearch;
                    nodesToWeigh.push(nextNode);
                }
                
            }
        }
        
        // weigh every node within level2Nodes arr
        for (let i = level2Nodes.length - 2; i >= 0; i--) {
            for (let j = 0; j < level2Nodes[i].length; j++) {
                
                let weight = 0;
        
                for (let k = 0; k < level2Nodes[i][j].nodes.length; ++k) {
                    weight = weight + level2Nodes[i][j].nodes[k].weight;
                }
                
                level2Nodes[i][j].weight = weight;
            }
        }
    }
    

    this.internalPartitionNode = function(node, nodes, width, height) {
         
        // get shallow copy of children of nodes
        let childrenOfNode = nodes.slice(0);
        
        // scale weights so that their weight correctly adds  up to the area of 
        // width and height rectangle that encompasses all nodes
        
        this.scaleWeights(nodes, width, height);

        childrenOfNode.sort(function (n0, n1) {return n1.weight - n0.weight});
        childrenOfNode.push(this.createNewInternalNode(0, null));
        
        // decide whether to split vertically or horizontally
        // depending on which dimension is the greatest
        
        let horizontal = width < height;
        
        // initialise with to total width or height of the initial node
        let w = horizontal ? width : height;
        
        // set x and y values to 0
        let x = 0;
        let y = 0;
        
        // set remaining width and height to the starting values
        let rw = width;
        let rh = height;
        
        // create row arr
        let row = [];
        
        // while childrenOfNode  is non empty
        while (childrenOfNode.length >= 1) {
            
            // get the first child
            let c = childrenOfNode[0];
            
            // get first child's weight
            let r = c.weight;
            
            // get min and max values of the row
            let mi = this.min(row);
            let ma = this.max(row);
            
            // get sum of the current row 
            let s = this.sum(row);
            
            
            // get two partitions' worst ratio and use it later on to 
            // decide which one is best to use 
            let wit = this.worst(r + s, min(r, mi), max(r, ma), w);
            
            // get worst ratio
            let without = this.worst(s, mi, ma, w);
            
            if (row.length < 1 || wit < without) {
                row.push(c);
                childrenOfNode.shift();
            }
            
            else{
                
                // initialte remaining x and y to current x and y
                let rx = x;
                let ry = y;
                
                let z = s / w;
                let j = 0;
                
                // go through every row nodes
                for (j = 0; j < row.length; j++) {
                    
                    let d = row[j].weight / z;
                    
                    // if we're dividing vertically then create a new node 
                    // and add row val to the remaining y value 
                    
                    if (horizontal) {
                        this.createFrame(rx, ry, d, z, row[j], node);
                        rx = rx + d;
                    }
                    // else do the above on the horizontal axis
                    else {
                        this.createFrame(rx, ry, z, d, row[j], node);
                        ry = ry + d;
                    }
                }
                
                // if vertical, then squarify along the x axis
                if (horizontal){             
                    y = y + z;
                    rh = rh - z;
                }
                // else squarify along the y axis
                else
                {
                    x = x + z;
                    rw = rw - z;
                }
                
                // check if we should squarify vertically
                // only if the remaining height is less than
                // remaining width 
                horizontal = rw < rh;
                
                // set width equal to row height or width depending
                // on if we're dividing vertically or not
                w = horizontal ? rw : rh;
                
                row = [];
                
            }
        }
    };

    this.worst = function(s, mi, ma, w) {
        // calculate worst ratio that allows us to check if we should
        // be dividing vertically or horizontally to keep aspect ratio
        // as constant as possible
        
        let worst0 = (w ** 2 * ma) / s ** 2 
        let worst1 = s ** 2 / (w ** 2 * mi);
        
        // return the maximum of the worst
        return max(worst0, worst1);
    };
    this.scaleWeights = function(weights, width, height) {
        
        // scale weights given frame width and height
        // this is to make the sum of weights equal to 
        // the total tree area 
        
        // calculate area and total weights
        let area         = width * height;
        let totalWeights = this.sum(weights);
        
        // scale weights
        for (let i = 0; i < weights.length; i++) {
            weights[i].weight = (area/totalWeights) * weights[i].weight;
        }
        
    };
    
    this.max = function(arr) {
        // return maximum weight 
        return Math.max.apply(
            Math, 
            arr.map(function (n) { return n.weight;}, arr)
        );
        
    };
    
    this.min = function(arr) {
        // return minimum weight 
        return Math.min.apply(
            Math, 
            arr.map(function (n) { return n.weight;}, arr)
        );
        
    };
    
    this.sum = function(arr) {
        // get sum of weights
        // used to rescale weights 
        let total = 0;
        for (let i = 0; i < arr.length; i++) {
            total = total + arr[i].weight;
        }
        return total;
    };
    

    this.squarifyMain = function(rootNode, f) {

        // create new nodesArray 
        let nodesArray = new Array();

        // initialize total weight of the tree
        this.totalWeight = rootNode.frame.width * rootNode.frame.height;
        
        // weigh root node 
        // this node will be the one that will get partitioned
        this.weigh(rootNode);
        
        // push root node into nodes arr
        nodesArray.push(rootNode);
        
        while (nodesArray.length >= 1) {
    
            let node = nodesArray.shift();
            
            if (node.nodes && node.nodes.length >= 1) {
                
                // squarify every node given frame width / height 
                this.internalPartitionNode(
                    node,
                    node.nodes, 
                    node.frame.width, 
                    node.frame.height,
                );
                
                // push child nodes into nodes arr 
                for (let i = 0; i < node.nodes.length; i++) {
                    let childNode = node.nodes[i];
                    if (childNode.nodes && childNode.nodes.length >= 1) {
                        nodesArray.push(childNode);
                    }
                }
            }
        }
        
        // push main root node into nodes arr
        nodesArray.push(rootNode);
        
        // while nodes stack is non-empty, push nodes out
        while (nodesArray.length >= 1) {
            
            // pop current node
            let node = nodesArray.pop();
            
            // push current node to tree node arr for later use
            this.nodes.push(node);
            
            // if there are nodes within current node, push those nodes into nodes arr
            if (node.nodes) {
                for (let i = 0; i < node.nodes.length; i++) {
                    nodesArray.push(node.nodes[i]);
                }
            }
        }
    }
    
    this.getNodesOfLevel = function(level){
        
        let filteredNodes = [];
        
        for (let i=0; i<this.nodes.length; i++){

            let node = this.nodes[i];
            if (node.level == level){
                filteredNodes.push(node);
            }
            
        }
        
        // return filtered nodes of specified level / depth
        return filteredNodes;
    }

    this.clearCollapsedNodes = function(){
        this.nodes = [];
    }
    this.getCollapsedNodes = function(){
        return this.nodes;
    }
    
}
    

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


// convolutional nearest neighbor average function
// finds the average value in a specified block 2d arr

function nearestNeighborAverage(arr, x0, y0, w, h, ignoreval=-9999){
    
    let sum = 0;
    let n   = 0;
    
    for (let x = x0; x < x0 + w; x++){
        for (let y = y0; y < y0 + h; y++){
            if (arr[x][y] != ignoreval){
                sum += arr[x][y];
                n++;
            }
        } 
    }
    return sum / n;
}
  
// graphing functions 
// for calculating good looking domain range 

let graphing = {};
graphing.getAestheticDivisor = function(range, shouldRound){
    // get exponent of the given range 
    let exponent     = floor(Math.log10(range));;

    // calculate fractional part 
    let fraction     = range / 10 ** exponent;

    // retrieve the correct 1D lookup arr 
    let mapFrom1DLookUp = shouldRound ? [1, 2, 5, 10] : [1.5, 3, 7, 10];

    // arr that will be used to lookup given the map from lookup arr
    let mapTo1DLookUp   = [1, 2, 5, 10];

    // get maximum value index by binary searching the lookup arr given fractional part 

    let [numFound, numIndex] = binarySearchMatchMax(mapFrom1DLookUp, fraction);

    // get retrieved divisor 
    let retrievedNum  = mapTo1DLookUp[numIndex];

    return retrievedNum * Math.pow(10, exponent);
}

graphing.getAestheticDomainRange = function(minDomain, maxDomain, numTicks, round=false){
    
    // initialize out domains
    let minDomainOut = minDomain;
    let maxDomainOut = maxDomain;
    
    // calculate aesthetic range and tick spacing 
    let range       = graphing.getAestheticDivisor(maxDomain - minDomain, round);
    let tickSpacing = graphing.getAestheticDivisor(range / numTicks, true);   
    
    // calculate new domain range 
    minDomainOut     = floor(minDomainOut / tickSpacing) * tickSpacing;
    maxDomainOut     = ceil(maxDomain / tickSpacing) * tickSpacing;

    return [minDomainOut, maxDomainOut];
}
 






