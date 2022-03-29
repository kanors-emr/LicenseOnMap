function createPie(data, cont, width) {
    // set the dimensions and margins of the graph
    var width = width,
        height = 200,
        margin = 2;

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2 - margin

    d3.select(cont).selectAll("*").remove();
    // append the svg object to the div called 'my_dataviz'
    var svg = d3.select(cont)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    var frm = d3.format(",");
    // Set tooltips
    const tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(d => {
            return `${d.data.key} (${frm(d.data.value)})`;
        });

    svg.call(tip);



    var innerRadius = 0, // inner radius of pie, in pixels (non-zero for donut)
        outerRadius = Math.min(width, height) / 2, // outer radius of pie, in pixels
        labelRadius = (innerRadius * 0.2 + outerRadius * 0.8);

    // shape helper to build arcs:
    var arcGenerator = d3.arc()
        .innerRadius(labelRadius)
        .outerRadius(labelRadius);

    update(data);

    // A function that create / update the plot for a given variable:
    function update(data) {

        // Compute the position of each group on the pie:
        var pie = d3.pie()
            .value(function(d) {
                return d.value;
            })
            .sort(function(a, b) {

                return d3.ascending(a.key, b.key);
            }) // This make sure that group order remains the same in the pie chart
        var data_ready = pie(d3.entries(data))

        // map to data
        var path = svg.selectAll("path")
            .data(data_ready)

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        path
            .enter()
            .append('path')
            .on('mouseover', function(d) {
                tip.show(d);
            })
            .on('mouseout', function(d) {
                tip.hide(d);
            })
            .merge(path)
            .transition()
            .duration(1000)
            .attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(radius)
            )
            .attr('fill', function(d) {

                if (regionWithColor[d.data.key]) {
                    return regionWithColor[d.data.key]
                } else { return colorForNa; }
            })
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 1);

        var totalData = _.sumBy(Object.values(data));

        // Now add the annotation. Use the centroid method to get the best coordinates
        path
            .enter()
            .append('text')
            .text(function(d) {

                if ((d.data.value / totalData) * 100 > 4)
                    return d.data.key;
                else return "";
            })
            .attr("transform", function(d) {
                return "translate(" + arcGenerator.centroid(d) + ")";
            })
            .style("text-anchor", "middle")
            .style("font-size", 10)


        // remove the group that is not present anymore
        path
            .exit()
            .remove()

    }

}


// Initialize the plot with the first dataset