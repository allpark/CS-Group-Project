function NutrientsTimeSeries() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'Nutrients: 1974-2018';

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = 'nutrients-timeseries';

  // Title to display above the plot.
  this.title = 'Nutrients: Average intake as a percentage of weighted reference nutrient intakes';

    // Names for each axis.
  this.xAxisLabel = 'year';
  this.yAxisLabel = '%';

  this.colors = [];

  var marginSize = 35;

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    marginSize: marginSize,

    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,

    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },

    // Boolean to enable/disable background grid.
    grid: true,

    // Number of axis tick labels to draw so that they are not drawn on
    // top of one another.
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/food/nutrients74-18.csv', 'csv', 'header',
      // Callback function to set the value
      // this.loaded to true.
      function(table) {
        self.loaded = true;
      });

  };

  this.setup = function() {
    // Font defaults.
    textSize(16);

    console.log(this.data.columns);

    // Set min and max years: assumes data is sorted by date.
    this.startYear = Number(this.data.columns[1]);
    this.endYear = Number(this.data.columns[this.data.columns.length - 2]);
    console.log(this.endYear);

    for (var i = 0; i < this.data.getRowCount(); i++) {
      this.colors.push(color(random(0, 255), random(0, 255), random(0, 255)));
    }

    // Find min and max pay gap for mapping to canvas height.
    this.minPercentage = 80;         // Pay equality (zero pay gap).
    this.maxPercentage = 340;
  };

  this.destroy = function() {
  };

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Draw the title above the plot.
    this.drawTitle();

    // Draw all y-axis labels.
    drawYAxisTickLabels(this.minPercentage,
                        this.maxPercentage,
                        this.layout,
                        this.mapPercentageToHeight.bind(this),
                        0);

    // Draw x and y axis.
    drawAxis(this.layout);

    // Draw x and y axis labels.
    drawAxisLabels(this.xAxisLabel,
                   this.yAxisLabel,
                   this.layout);

    // Plot all pay gaps between startYear and endYear using the width
    // of the canvas minus margins.
    var previous;
    var numYears = this.endYear - this.startYear;

    // Loop over all rows and draw a line from the previous value to
    // the current.
    for (var i = 0; i < this.data.getRowCount(); i++) {

      // will give us nutrients
      var row = this.data.getRow(i);
      var previous = null;

      var l = row.getString(0);

      // will give us columns (data for each year)
      for (var j = 1; j < numYears; j++) {
        // Create an object to store data for the current year.
        var current = {
        
        // Convert strings to numbers.
        'year': this.startYear + (j - 1),
        'percentage': row.getNum(j), 
        };

        //console.log(current);

        if (previous != null) {
          // Draw line segment connecting previous year to current
          // year pay gap.
          stroke(this.colors[i]);
          line(this.mapYearToWidth(previous.year),
              this.mapPercentageToHeight(previous.percentage),
              this.mapYearToWidth(current.year),
              this.mapPercentageToHeight(current.percentage));

          // The number of x-axis labels to skip so that only
          // numXTickLabels are drawn.
          var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);
          
          console.log(numYears);
          // Draw the tick label marking the start of the previous year.
          if (i % xLabelSkip == 0) {
            textSize(8);
            drawXAxisTickLabel(previous.year, this.layout, this.mapYearToWidth.bind(this));
          }
          textSize(16);
        } else {
          noStroke();
          fill(this.colors[i]);
          text(l, 100, this.mapPercentageToHeight(current.percentage))
        }
        // Assign current year to previous year so that it is available
        // during the next iteration of this loop to give us the start
        // position of the next line segment.
        previous = current;
      }
    }
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');

    text(this.title,
         (this.layout.plotWidth() / 2) + this.layout.leftMargin,
         this.layout.topMargin - (this.layout.marginSize / 2));
  };

  this.mapYearToWidth = function(value) {
    return map(value,
               this.startYear,
               this.endYear,
               this.layout.leftMargin,   // Draw left-to-right from margin.
               this.layout.rightMargin);
  };

  this.mapPercentageToHeight = function(value) {
    return map(value,
               this.minPercentage,
               this.maxPercentage,
               this.layout.bottomMargin, // Smaller pay gap at bottom.
               this.layout.topMargin);   // Bigger pay gap at top.
  };
}
