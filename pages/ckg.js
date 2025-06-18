const ctx = document.getElementById('wilayahChart').getContext('2d');
const wilayahChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['JAWA BARAT', 'JAWA TIMUR', 'DKI JAKARTA', 'SUMATERA UTARA', 'BANTEN', 'SUMATERA BARAT', 'KEPULAUAN RIAU'],
    datasets: [{
      label: 'Jumlah Didata',
      data: [3467677, 2908508, 2230653, 2048480, 1449205, 456467, 237432],
      backgroundColor: '#e91e63',
      borderRadius: 8,
      barThickness: 40
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 30   // Tambahkan padding atas untuk menampung angka di atas bar
      }
    },
    scales: {
      x: {
        ticks: {
          callback: function (val, index) {
            return this.getLabelForValue(val).toUpperCase();
          }
        }
      },
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return context.parsed.y.toLocaleString();
          }
        }
      }
    },
    animation: {
      onComplete: function (animation) {
        const chart = animation.chart;
        const ctx = chart.ctx;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        chart.data.datasets.forEach(function (dataset, i) {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach(function (bar, index) {
            const data = dataset.data[index];
            ctx.fillText(data.toLocaleString(), bar.x, bar.y - 6);
          });
        });
      }
    }
  }
});
