(function showShootings() {
  var width = 960;
  var height = 500;
  var projection = d3.geo.albersUsa().scale([1000]);
  var path = d3.geo.path().projection(projection);

  var svg = d3
    .select("#shootings")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  var div = d3
    .select("#shootings")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  var zoom = d3.behavior.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

  svg.call(zoom);

  function zoomed() {
    svg.selectAll("path").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    svg.selectAll("circle").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

  d3.json("states.json", function (states) {
    svg
      .selectAll("path")
      .data(states.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("stroke", "#fff")
      .style("stroke-width", "1")
      .style("fill", "rgb(213,222,217)");
  });

  d3.json("police.json", function (error, data) {
    if (error) throw error;

    var dataArray = Object.keys(data).map(key => data[key]);

    var filteredData = dataArray.filter(d => d.longitude && d.latitude && d.name);

    var latestData = filteredData.slice(-500);

    svg
      .append("g")
      .selectAll("circle")
      .data(latestData)
      .enter()
      .append("circle")
      .attr("class", "shooting")
      .attr("cx", function (d) {
        var coords = projection([d.longitude, d.latitude]);
        return coords[0];
      })
      .attr("cy", function (d) {
        var coords = projection([d.longitude, d.latitude]);
        return coords[1];
      })
      .attr("r", 5) 
      .style("fill", "red")
      .style("opacity", 0.3)
      .style("stroke", "white")
      .on("mouseover", function (d) {
        div.transition().duration(200).style("opacity", 0.9);
        div
          .html(
            "<span class='tooltip-text-bold'>" +
              d.name +
              "<br><br>" +
              "City: " +
              d.city +
              "<br>" +
              "Signs of mental illness: " +
              d.signs_of_mental_illness +
              "<br>" +
              "Armed: " +
              d.armed
          )
          .style("left", (d3.event.pageX + 10) + "px") 
          .style("top", (d3.event.pageY - 28) + "px");
          
          d3.select(this).style("cursor", "pointer");
      })
      .on("mouseout", function (d) {
        div.transition().duration(500).style("opacity", 0);
      })
      .on("click", function (d) {
        var coords = projection([d.longitude, d.latitude]);
        var zoomLevel = 8;
        var scale = zoomLevel;
        var translate = [
          width / 2 - scale * coords[0],
          height / 2 - scale * coords[1]
        ];

        svg.transition()
          .duration(750)
          .call(zoom.translate(translate).scale(scale).event);
          setTimeout(function() {
            svg.transition()
              .duration(750)
              .call(zoom.translate([0, 0]).scale(1).event);
          }, 3000);
      });
      
  });
})();
