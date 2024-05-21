fetch('police.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    const processedData = processData(data);
    createChart(processedData);
  })
  .catch(function(error) {
    console.error('Error fetching data:', error);
  });

function processData(data) {
  const shootingsByGenderAndYear = {};
  for (const entry of Object.values(data)) {
    const { gender, date } = entry;
    const year = new Date(date).getFullYear();
    if (!shootingsByGenderAndYear[year]) {
      shootingsByGenderAndYear[year] = { M: 0, F: 0 };
    }
    if (gender === 'M') {
      shootingsByGenderAndYear[year].M++;
    } else if (gender === 'F') {
      shootingsByGenderAndYear[year].F++;
    }
  }
  return shootingsByGenderAndYear;
}

function createChart(data) {
  const years = Object.keys(data);
  const genders = ['M', 'F'];
  const dataset = genders.map(function(gender) {
    return {
      gender: gender,
      values: years.map(function(year) {
        return data[year][gender] || 0;
      })
    };
  });

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 600 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const xScale = d3.scale.ordinal()
    .domain(years)
    .rangeRoundBands([0, width], 0.1);

  const yScale = d3.scale.linear()
    .domain([0, d3.max(dataset, function(d) {
      return d3.max(d.values);
    })])
    .nice()
    .range([height, 0]);

  const svg = d3.select('.chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr("fill", "white");

  const bars = svg.selectAll('.bar')
    .data(dataset)
    .enter()
    .append('g')
    .attr('class', 'bar')
    .attr('fill', function(d) {
      return d.gender === 'M' ? 'blue' : 'pink';
    });

  bars.selectAll('rect')
    .data(function(d) {
      return d.values;
    })
    .enter()
    .append('rect')
    .attr('x', function(d, i) {
      return xScale(years[i]);
    })
    .attr('y', function(d) {
      return yScale(d);
    })
    .attr('width', xScale.rangeBand())
    .attr('height', function(d) {
      return height - yScale(d);
    });

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.svg.axis().scale(xScale).orient('bottom'))
    .attr("fill", "white");

  svg.append('g')
    .attr('class', 'y-axis')
    .call(d3.svg.axis().scale(yScale).orient('left'))
    .attr("fill", "white");

  const legend = svg.selectAll('.legend')
    .data(genders)
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      return 'translate(0,' + i * 20 + ')';
    })
    .attr("fill", "white");

  legend.append('rect')
    .attr('x', width - 18)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', function(d) {
      return d === 'M' ? 'blue' : 'pink';
    });

  legend.append('text')
    .attr('x', width - 24)
    .attr('y', 9)
    .attr('dy', '.35em')
    .style('text-anchor', 'end')
    .text(function(d) {
      return d === 'M' ? 'Male' : 'Female';
    })
    .attr("fill", "white");
}
