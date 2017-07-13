
import Chart from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'

class SpectrumPlot2 {

  constructor( parentContainer, width, height, options = {} ){
    // Getting the parent div
    this._parentElem = null;
    if (typeof parentContainer === 'string' || parentContainer instanceof String){
      this._parentElem = document.getElementById( parentContainer );
    }else{
      this._parentElem = parentContainer;
    }

    this._chart = null;
    this._chartData = null;
    this._canvas = document.createElement('canvas');
    this._canvas.width = width;
    this._canvas.height = height;
    this._parentElem.appendChild(this._canvas);

    // when placing a marker on a click (vertical bar)
    // the spectrum data are stored here, and can get retrieved with the getter `.getMarkerData()`
    this._markerData = []

    this._events = {
      hover: null,
      click: null
    };

    // colors of the vertical markers
    this._verticalMarkers = {
      enabled: false,
      clickColor: "#000",
      hoverColor: "#66F",
      hiddenColor: "rgba(0, 0, 0, 0)"
    }

    this._initChart(options);
  }


  _initChart(options = {}){
    var that = this;
    var ctx = this._canvas.getContext('2d');

    // return an array of hovered values.
    // used for hover and click event on the plot
    function getHoveredValues( chartElements ){
      var hoveredValues = []
      var places = options.decimals ? Math.pow(10, options.decimals) : null;
      if( chartElements && chartElements.length){
        var x = chartElements[0]._index;
        for(var i=0; i<chartElements.length; i++){
          var yVal  = that._chartData.datasets[i].data[x];
          hoveredValues.push({
            label: that._chartData.datasets[i].label,
            x: that._chartData.labels[x],
            y: places ? Math.floor(yVal * places) / places : yVal,
          })
        }
      }
      return hoveredValues;
    }


    this._chart =  new Chart(ctx, {
      type: 'line',
      data: {
      }, // END of data

      options: {

        onClick: function(evt, chartElements){
          var hoveredValues = getHoveredValues( chartElements );
          that._markerData = hoveredValues;

          if( hoveredValues.length ){
            that.setVerticalClickMarkerValue(hoveredValues[0].x)
          }

          // call the click event
          if( that._events.click ){
            that._events.click.call(null, hoveredValues);
          }

        },
        responsive: true,

        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: false,
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: false,
            }
          }]
        },

        // From now: performance oriented features
        elements: {
            line: {
                tension: 0, // disables bezier curves
            }
        },
        animation: {
            duration: 0, // general animation time
        },
        hover: {
            animationDuration: 0, // duration of animations when hovering an item
            intersect: false,
            mode: 'index',
            onHover: function( evt, chartElements){
              var hoveredValues = getHoveredValues( chartElements );

              if( hoveredValues.length ){
                that.setVerticalHoverMarkerValue( hoveredValues[0].x )
              }

              // call the hover event
              if( that._events.hover ){
                that._events.hover.call(null, hoveredValues);
              }

            },
        },
        responsiveAnimationDuration: 0, // animation duration after a resize

        // the legend at the top
        legend: {
          display: options.showLegend === false ? false : true,
          labels: {
            usePointStyle: true
          }
        },

        annotation: {
          //events: null,

          annotations: [

            {
              drawTime: "afterDatasetsDraw",
              id: "clickLine",
              type: "line",
              mode: "vertical",
              scaleID: "x-axis-0",
              value: -Infinity,
              borderColor: that._verticalMarkers.enabled ? that._verticalMarkers.clickColor : that._verticalMarkers.hiddenColor ,
              borderWidth: 1,
            },

            {
              drawTime: "afterDatasetsDraw",
              id: "hoverLine",
              type: "line",
              mode: "vertical",
              scaleID: "x-axis-0",
              value: -Infinity,
              borderColor: that._verticalMarkers.enabled ? that._verticalMarkers.hoverColor : that._verticalMarkers.hiddenColor,
              borderWidth: 1,

            },

          ]
        } // END of annotation

      } /* END of options */


    });

    this._chartData = this._chart.chart.data;

    this._canvas.addEventListener('mouseleave', function( evt ){
      that._chart.options.annotation.annotations[1].borderColor = that._verticalMarkers.hiddenColor;
      that._chart.update();
    });

    this._canvas.addEventListener('mouseenter', function( evt ){
      that._chart.options.annotation.annotations[1].borderColor = that._verticalMarkers.enabled ? that._verticalMarkers.hoverColor : that._verticalMarkers.hiddenColor;
    });

  }

  showLegend(boolean) {
    this._chart.options.legend.display = boolean;
    this._chart.update();
  }

  setLabels( labels=null ){
    if( labels ){
      this._chartData.labels = labels;
    }else{
      var longuestSpectrumSize = 0;
      for(var i=0; i<this._chartData.datasets.length; i++){
        longuestSpectrumSize = Math.max(longuestSpectrumSize, this._chartData.datasets[i].data.length)
      }

      var autoLabels = new Array( longuestSpectrumSize )

      for(var i=0; i<longuestSpectrumSize; i++){
        autoLabels[i] = i;
      }

      this._chartData.labels = autoLabels;
    }
  }


  /**
  * Adds a new dataset to the SpectrumPlot
  * @param {String} spectrumName - name of the spectrum
  * @param {Array} data - series of number, y coordinates
  * @param {String} color - css style color (ie. "#FF0000", "rgba(255, 0, 0, 0.5)")
  * @return {Number} the index of the spectrum in internal data (usefull to update)
  */
  addSpectrum( spectrumName, data, color, displayPoint = true, options = {}){
    var newSpectrumIndex = this._chartData.datasets.length;

    var spectrumData = {
      label: spectrumName,
      borderColor: color,
      pointBackgroundColor: displayPoint ? color : "rgba(0, 0, 0, 0)",
      pointBorderWidth: 0,
      pointBorderColor: "rgba(0, 0, 0, 0)",
      pointRadius: 0,
      borderWidth: "1px",
      data: data,
      fill: false,
    }

    this._chartData.datasets.push( spectrumData );
    return newSpectrumIndex;
  }


  /**
  * Update the spectrum data
  * @param {Number} index - internal index of the spectrum (returned by addSpectrum)
  * @param {Array} data - new values of the spectrum
  */
  updateSpectrum( index, data ){
    var datasets = this._chartData.datasets;

    if( index < 0 || index >= datasets.length ){
      console.warn( "Updating dataset: wrong dataset index." );
      return;
    }

    datasets[ index ].data = data;
  }


  /**
  * Redraw the content of the chart. Has to be called after updateSpectrum or setLabels
  */
  draw(){
    this._chart.update();
  }


  /**
  * Specify a callback to an event. Events "click" and "hover" are available.
  * The callback will be called with the spectrum data at the pointer position
  */
  on( eventName, callback ){
    // only predefined events are allowed
    if( eventName in this._events && typeof callback === "function" ){
      this._events[ eventName ] = callback;
    }
  }


  /**
  * Get the spectrum data under the annotation, perfomed at the last click
  * @return {Array} each element is {x: Number, y: Number, label: String}
  */
  getMarkerData(){
    return this._markerData;
  }


  enableMarkers(){
    this._verticalMarkers.enabled = true;
    this._updateMarkerColor();
  }


  disableMarkers(){
    this._verticalMarkers.enabled = false;
    this._updateMarkerColor();
  }


  _updateMarkerColor(){
    if(this._verticalMarkers.enabled){
      this._chart.options.annotation.annotations[0].borderColor = this._verticalMarkers.clickColor;
      this._chart.options.annotation.annotations[1].borderColor = this._verticalMarkers.hoverColor;
    }else{
      this._chart.options.annotation.annotations[0].borderColor = this._verticalMarkers.hiddenColor;
      this._chart.options.annotation.annotations[1].borderColor = this._verticalMarkers.hiddenColor;
    }

    this.draw();
  }


  setMarkerColor( eventName, cssColor ){
    if( (eventName + "Color") in  this._verticalMarkers ){
      this._verticalMarkers[ eventName + "Color" ] = cssColor;
      this._updateMarkerColor();
    }
  }


  setVerticalClickMarkerValue( v ){
    this._chart.options.annotation.annotations[0].value = v;
    this._chart.update();
  }

  setVerticalHoverMarkerValue( v ){
    this._chart.options.annotation.annotations[1].value = v;
    this._chart.update();
  }


}


export { SpectrumPlot2 }
