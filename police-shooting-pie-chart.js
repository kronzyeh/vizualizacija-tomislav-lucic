function drawPieChart(state) {
    const width = 700;
    const height = 500;
    const radius = Math.min(width, height) / 2.5;

    const raceNames = {
        B: "Black",
        A: "Asian",
        W: "White",
        O: "Other",
        N: "Native",
        H: "Hispanic",
        "": "Unknown"  
    };

    const colorMapping = {
        B: "#1f77b4",  
        A: "#ff7f0e",  
        W: "#2ca02c", 
        O: "#d62728", 
        N: "#9467bd", 
        H: "#8c564b",  
        "": "#e377c2"  
    };

    const arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    const pie = d3.layout.pie()
        .sort(null)
        .value(d => d.value);

    const svg = d3.select("#pie-chart-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 3},${height / 2})`);

    const url = 'police.json';
    d3.json(url, function(error, data) {
        if (error) throw error;

        const shootingsByRace = {};
        for (const entry of Object.values(data)) {
            if (state === "All" || entry.state === state) {
                const race = entry.race || "";  
                shootingsByRace[race] = (shootingsByRace[race] || 0) + 1;
            }
        }

        const g = svg.selectAll(".arc")
            .data(pie(d3.entries(shootingsByRace)))
            .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", d => colorMapping[d.data.key]);

        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${radius + 20}, -${radius})`);

        const legendItem = legend.selectAll(".legend-item")
            .data(d3.entries(shootingsByRace))
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);

        legendItem.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => colorMapping[d.key]);

        legendItem.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(d => `${raceNames[d.key] || d.key} (${d.value})`);
    });
}

drawPieChart("All");
