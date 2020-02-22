//TASK ONE

function makeRows(row) {
	var puzzle = [];
    for (let i=0; i<4; i++){
        puzzle.push(row.slice());
    }
    return puzzle;
}

//TASK TWO
// this is the constructor of the queue data structure
function Queue() {
	this.arr = [];
	this.head = function() {
		return this.arr[0];
	};
	this.dequeue = function() {
		if (this.arr.length == 0) {
			return "Queue underflow!";
		} else {
			return this.arr.shift();
		}
	};
	this.enqueue = function(o) {
		this.arr.push(o);
	};
	this.isEmpty = function() {
			return this.arr.length == 0;
	};
}

function permuteRow(row, p) {
    
    // initialize queue
    let q = new Queue();
    

    // p.1  populate queue 
    for (let i=0; i<row.length; i++){
        q.enqueue(row[i]);
    }
    
    // p.2  permute queue 'p' places to the left
    for (let i=0; i<p; i++){
        let head = q.head();
        q.dequeue();
        q.enqueue(head);
    }
    
    // p.3  re-assign array values given queue
    let i=0;    
    while (!q.isEmpty()){
        let head = q.head();
        row[i]   = head;
        q.dequeue();    
        i+=1;
    }
    
    
    return row;
    
}

//TASK THREE

function permutePuzzle(puzzle, p, q, r) {
    for (let i=0; i<3; i++){
        permuteRow(puzzle[i + 1], [p,q,r][i]);
    }
    return puzzle;
}

//TASK FOUR

function linearSearch(array, item) {
	var n = array.length;
	for (var i = 0; i < n; i++) {
		if (array[i] == item) {
			return true;
		}
 	}
	return false;
}

function checkColumn(puzzle, j) {
    let jCol = [puzzle[0][j], puzzle[1][j], puzzle[2][j], puzzle[3][j]];
    for (let i=1; i<=4; i++){
        if (!linearSearch(jCol, i)){
            return false;
        }
    }
    return true;
}

//TASK FIVE

function colCheck(puzzle) {
    let colsValid = true;
    for (let i=0; i<4; i++){
        if (!checkColumn(puzzle, i)){
            return false;
        }
    }
    return true; 
}

//TASK SIX

function makeGrid(puzzle, row1, row2, col1, col2) {
	//this copies all elements in a grid from co-ordinates (row1, col1) to (row2,col2) to an array
	var array = [];
	for (var i = row1; i <= row2; i++) {
		for (var j = col1; j <= col2; j++) {
			array.push(puzzle[i][j]);
		}
	}
	return array;
}

function checkGrid(puzzle, row1, row2, col1, col2) {
    
    let grid      = makeGrid(puzzle, row1, row2, col1, col2);
    
    for (let i=1; i<=4; i++){
        if (!linearSearch(grid, i)){
            return false;
        }
    }
    return true;
}

//TASK SEVEN
function checkGrids(puzzle) {
    
    for (let i=0; i<4; i++){
        
        let startCol = i%2 * 2; 
        let endCol   = startCol + 1;
        
        let startRow = i < 2 ? 0 : 2;
        let endRow   = startRow + 1;
        
        let gridValid = checkGrid(puzzle, startRow, endRow, startCol, endCol);
        
        if (!gridValid){
            return false;
        }
        
    }
    
    return true;

}

//TASK EIGHT
function makeSolution(row) {

    let grid = makeRows(row);
      
    // 64 maximum iterations to find a solution
    // 3 nested loops collapsed into one 
    for (let i=0; i<4**3; i++){
        
        let newGrid = permutePuzzle(makeRows(row), Math.floor(i/16) % 4, Math.floor(i/4) % 4, i%4);

        // check if its columns are valid 

        if (colCheck(newGrid) && checkGrids(newGrid))
        {            
            grid = newGrid;
            break; 
        }

    }
        
    return grid;
        
}


// TASK NINE

// a function to randomly select n (row,column) entries of a 2d array with size columns and size rows, where size is assumed to be an integer and n is also assumed to be an integer
function entriesToDel(n) {
	if (n <= 16) {
		// this creates an array of all the rows and column indices
		var array = [];
		for (var i = 0; i < 4; i++) {
			for (var j = 0; j < 4; j++) {
				array[j+(4 * i)] = [i,j];
			}
		}
		// this creates a new array, called array2 to store randomly chose elements of the array that will be removed, and then removes those elements from array
		var num = 16;
		var array2 = [];
		for (var i = 0; i < n; i++) {
			var x = Math.round( (num - i - 1) * Math.random() );
			array2[i] = array[x];
			array.splice(x,1);
		}
		return array2;
	}
	return "Number of elements to delete exceeds size of array!";
}

function genPuzzle(row, n) {

    let grid   = makeSolution(row);
    let todel  = entriesToDel(n);
    
    for (let i=0; i<todel.length; i++){
        let cell = todel[i];
        grid[cell[0]][cell[1]] = " ";
    }
    
    return grid;
    
}

// The following function is used to visualise the puzzles

function visPuzzle(puzzle) {
	var viz = "";

	for (var i = 0; i < puzzle.length; i++) {
		for (var j = 0; j < puzzle.length; j++) {
			viz = viz + "----";
		}
		viz = viz + "-\n";
		for (var j = 0; j < puzzle.length; j++) {
			viz = viz + "| " + puzzle[i][j] + " ";
		}
		viz = viz + "| " + "\n";
	}
	for (var j = 0; j < puzzle.length; j++) {
			viz = viz + "----";
	}
	viz = viz + "-";

	return viz;
}


// DO NOT DELETE BELOW THIS LINE OR NOTHING WILL WORK AND YOU MAY GET NO MARKS

module.exports = {makeRows : makeRows, makeSolution : makeSolution, genPuzzle : genPuzzle, checkGrid : checkGrid, checkGrids : checkGrids, colCheck : colCheck, checkColumn : checkColumn, permuteRow : permuteRow, permutePuzzle : permutePuzzle}

function createPuzzle() {
	function swap(array, i, j) {
		var x = array[i];
		array[i] = array[j];
		array[j] = x;
		return array;
	}
	var row = [2,3,1,4];
	var rand = [Math.round(Math.random()),Math.round(Math.random()),Math.round(Math.random()),Math.round(Math.random())]
	if (rand[0]==1) {
		swap(row,0,1);
	}
	if (rand[1]==1) {
		swap(row,1,2);
	}
	if (rand[2]==1) {
		swap(row,2,3);
	}
	if (rand[3]==1) {
		swap(row,0,3);
	}
	var puzzle = genPuzzle(row,3 + Math.round(7*Math.random()));
	var string = "";
	for (var i = 0; i < 4; i++) {
		string += "<tr>";
		for (var j = 0; j < 4; j++) {
  		string += "<td>" + puzzle[i][j] + "</td>";
		}
		string += "</tr>";
	}
	document.getElementById("1").innerHTML = string
}
