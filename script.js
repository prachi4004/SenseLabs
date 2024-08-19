let accXData = [];
let accYData = [];
let accZData = [];
let accXMovingAvg = [];
let accYMovingAvg = [];
let accZMovingAvg = [];
const MAX_POINTS = 50;

const ctxX = document.getElementById('accXChart').getContext('2d');
const ctxY = document.getElementById('accYChart').getContext('2d');
const ctxZ = document.getElementById('accZChart').getContext('2d');

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'second',
        tooltipFormat: 'HH:mm:ss.SSS',
        displayFormats: {
          second: 'HH:mm:ss'
        }
      },
      title: {
        display: true,
        text: 'Time',
        font: {
          size: 14
        }
      },
      ticks: {
        font: {
          size: 12
        }
      }
    },
    y: {
      title: {
        display: true,
        text: 'Acceleration (m/s²)',
        font: {
          size: 14
        }
      },
      ticks: {
        font: {
          size: 12
        }
      }
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top'
    }
  },
  animation: false,
  elements: {
    line: {
      tension: 0 // Straight lines
    },
    point: {
      radius: 2 // Small data points
    }
  }
};

const createChart = (ctx, label, color) => new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [
      {
        label: label,
        data: [],
        borderColor: color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        fill: false
      },
      {
        label: label + ' Moving Average',
        data: [],
        borderColor: 'rgba(255, 165, 0, 1)', // Orange for moving average
        backgroundColor: 'transparent',
        borderWidth: 2,
        fill: false
      }
    ]
  },
  options: chartOptions
});

const accXChart = createChart(ctxX, 'X', 'rgba(75, 192, 192, 1)'); 
const accYChart = createChart(ctxY, 'Y', 'rgba(75, 192, 192, 1)'); 
const accZChart = createChart(ctxZ, 'Z', 'rgba(75, 192, 192, 1)'); 

const calculateMovingAverage = (data, window = 5) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const end = i + 1;
    const slice = data.slice(start, end);
    const avg = slice.reduce((sum, val) => sum + val.y, 0) / slice.length;
    result.push({x: data[i].x, y: avg});
  }
  return result;
};

const updateChart = (chart, newData, newMovingAvg) => {
  chart.data.datasets[0].data = newData;
  chart.data.datasets[1].data = newMovingAvg;
  chart.update('none');
};

if (!!window.EventSource) {
  var source = new EventSource('/events');
  
  source.addEventListener('open', function(e) {
    console.log("Events Connected");
  }, false);
  
  source.addEventListener('error', function(e) {
    if (e.target.readyState != EventSource.OPEN) {
      console.log("Events Disconnected");
    }
  }, false);
  
  source.addEventListener('accelerometer_readings', function(e) {
    console.log("accelerometer_readings", e.data);
    var obj = JSON.parse(e.data);
    
    const currentTime = new Date();
    
    accXData.push({x: currentTime, y: obj.accX});
    accYData.push({x: currentTime, y: obj.accY});
    accZData.push({x: currentTime, y: obj.accZ});
    
    if (accXData.length > MAX_POINTS) {
      accXData.shift();
      accYData.shift();
      accZData.shift();
    }
    
    accXMovingAvg = calculateMovingAverage(accXData);
    accYMovingAvg = calculateMovingAverage(accYData);
    accZMovingAvg = calculateMovingAverage(accZData);
    
    updateChart(accXChart, accXData, accXMovingAvg);
    updateChart(accYChart, accYData, accYMovingAvg);
    updateChart(accZChart, accZData, accZMovingAvg);
  }, false);
}