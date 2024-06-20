(function showStates() {
  var width = 960;
  var height = 500;
  var projection = d3.geo.albersUsa().scale([1000]);
  var path = d3.geo.path().projection(projection);

  var svg = d3
    .select("#states")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  var div = d3
    .select("#states")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  d3.json("police.json", function (data) {
    var stateCounts = {};

    for (var i = 1; i < 7729; i++) {
      var state = data[i].state;
      stateCounts[state] = (stateCounts[state] || 0) + 1;
    }

    var maxCases = d3.max(Object.values(stateCounts));

    var maxCasesPer100 = Math.ceil(maxCases / 100) * 100;

    var colorDomain = [];
    for (var j = 1; j <= Math.ceil(maxCasesPer100 / 100); j++) {
      colorDomain.push(j * 100);
      if (j*100 > 500) {
        break;
      }
    }
    colorDomain.push("All");
    var colorRange = ["red", "orange", "yellow", "green", "blue", "indigo", 'gray'];
    var color = d3.scale.threshold()
      .domain(colorDomain)
      .range(colorRange);

    d3.json("states.json", function (json) {
      svg
        .selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#fff")
        .style("stroke-width", "1")
        .style("fill", function (d) {
          var stateName = d.properties.name;
          var cases = stateCounts[stateName] || 0;
          if (cases > 500) {
            var caseTemp = 550;
            return color(caseTemp);
          }
          else {
            return color(cases);
          }
        })
        .on("mouseover", function (d) {
          var stateName = d.properties.name;
          var cases = stateCounts[stateName] || 0;
          div.transition().duration(200).style("opacity", 0.9);
          div.html(stateName + "<br>" + "Cases: " + cases);
        })
        .on("mouseout", function (d) {
          div.transition().duration(500).style("opacity", 0);
        });

      var legend = svg.selectAll(".legend")
        .data(color.range())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
          return "translate(0," + i * 20 + ")";
        })
        .on("mouseover", function() {
          d3.select(this).style("cursor", "pointer");
        })
        .on("click", function (d, i) {
          var clickedColor = colorDomain[i];
          svg.selectAll("path")
            .style("fill", function (d) {
              var stateName = d.properties.name;
              var cases = stateCounts[stateName] || 0;
              if (cases > 500 && clickedColor == 600){
                return color (550);
              }
              else if (clickedColor === 'All') {
                if (cases > 500) {
                  return color (550);
                }
                else {
                  return color(cases);
                }
              }
              else {
                return cases < clickedColor && cases > clickedColor - 100 ? color(cases) : "gray";
              }
            })
        });
        

      legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d, i) {
          return color.range()[i];
        });

      legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function (d, i) {
          if (i === 0) {
            return "0 - " + colorDomain[i];
          } else if (i === color.range().length - 2) {
            return colorDomain[color.range().length - 2] + "+";
          } else if (colorDomain[i - 1] != 600){
            return colorDomain[i - 1] + " - " + colorDomain[i];
          }
          else {
            return "All";
          }
        });
    });
  });
})();
