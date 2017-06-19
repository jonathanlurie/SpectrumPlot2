
import Chart from 'chart.js'

class SpectrumPlot2 {
  
  constructor( parentContainer, width, height ){
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
    
    this._initChart();
  }
  
  
  _initChart(){
    var ctx = this._canvas.getContext('2d');
    
    this._chart =  new Chart(ctx, {
      type: 'line',
      data: {
        /*
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        datasets: [
          {
            label: "The red line",
            borderColor: "rgba(255, 0, 0, 1)",
            pointBackgroundColor: "rgba(255, 0, 0, 0.25)",
            pointBorderWidth: 0,
            pointBorderColor: "rgba(0, 0, 0, 0)",
            pointRadius: 3,
            borderWidth: "1px",
            data: [100, 20, 140, 60, 180, 100, 220, 140, 260, 180, 300, 220],
            fill: false,
          },
          
          {
            label: "The blue line",
            borderColor: "rgba(0, 0, 255, 1)",
            pointBackgroundColor: "rgba(0, 0, 255, 0.25)",
            pointBorderWidth: 0,
            pointBorderColor: "rgba(0, 0, 0, 0)",
            pointRadius: 3,
            borderWidth: "1px",
            data: [20, 140, 60, 180, 100, 220, 140, 260, 180, 300, 220, 340],
            fill: false,
          },
          
        ] // END of datasets
        */
      }, // END of data
      
      options: {
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
        },
        responsiveAnimationDuration: 0, // animation duration after a resize
        
      } /* END of options */
      
      
    });
    
    this._chartData = this._chart.chart.data;
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
  addSpectrum( spectrumName, data, color, displayPoint = true ){
    var newSpectrumIndex = this._chartData.datasets.length;
    
    var spectrumData = {
      label: spectrumName,
      borderColor: color,
      pointBackgroundColor: displayPoint ? color : "rgba(0, 0, 0, 0)",
      pointBorderWidth: 0,
      pointBorderColor: "rgba(0, 0, 0, 0)",
      pointRadius: 2,
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
  

  
  
}


export { SpectrumPlot2 }
