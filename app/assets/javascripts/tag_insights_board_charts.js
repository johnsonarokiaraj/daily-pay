// app/assets/javascripts/tag_insights_board_charts.js
// Basic chart handler for Tag Insights Board

function toggleDropdown(id) {
  var el = document.getElementById(id);
  if (el.style.display === 'none' || el.style.display === '') {
    el.style.display = 'block';
    document.addEventListener('click', function handler(e) {
      if (!el.contains(e.target) && e.target.closest('button') === null) {
        el.style.display = 'none';
        document.removeEventListener('click', handler);
      }
    });
  } else {
    el.style.display = 'none';
  }
}

function generateChart(scope, type, tag) {
  // Remove any existing chart
  var existing = document.getElementById('chart-placeholder');
  if (existing) existing.remove();

  // Create a placeholder chart element
  var chart = document.createElement('div');
  chart.id = 'chart-placeholder';
  chart.style.margin = '24px 0';
  chart.style.padding = '32px';
  chart.style.background = '#f6faff';
  chart.style.border = '1px solid #e6f4ff';
  chart.style.borderRadius = '8px';
  chart.style.textAlign = 'center';
  chart.innerHTML = `<b>Chart Type:</b> ${type}<br><b>Tag:</b> ${tag}<br><i>(Placeholder chart)</i>`;

  // Insert after the summary section
  var summary = document.querySelector('details[open]');
  if (summary) {
    summary.parentNode.insertBefore(chart, summary.nextSibling);
  } else {
    document.body.appendChild(chart);
  }
}

