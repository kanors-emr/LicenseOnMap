load();


var colorForNa = "whitesmoke";

var regionWithColor = {

    'AfricaNorth': "#FF00CC",
    'AfricaOther': "#D0A9AA",
    'AfricaSouth': "Yellow",
    'AfricaWest': "Green",
    'Argentina': "#EED6AF",
    'AsiaCen': "Indigo",
    'AsiaDev': "#FA1D2F",
    'AsiaEm': "#CD950C",
    'Australia': "Purple",
    'Brazil': "Turquoise",
    'Canada': "Gold",
    'China': "#BEE554",
    'EU28': "#FF9912",
    'EurDev': "Navy",
    'EurEm': "rgb(126 161 247)",
    'GCCother': "rgb(0 250 255)",
    'India': "Brown",
    'Indonesia': "#0276FD",
    'Japan': "#F7B3DA",
    'LatAm': "#EEB4B4",
    'Mexico': "#F54D70",
    'MidEast': "#00C957",

    'Russia': "Silver",
    'SaudiArabia': "#B22222",
    'USA': "Pink",
    'N/A': colorForNa,
    '-': colorForNa
};

function load() {
    d3.csv("CountryLicense.csv", function(data) {
        createWorldMap(data);
    });

}

function createWorldMap(oDataClas) {

    // Set tooltips
    const tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(d => {
            var groupName = (d.countryData === null) ? "-" : d.countryData["Total"];
            return `${d.properties.name} (${groupName})`
        });


    var w = document.getElementById("boxWorldMap").offsetWidth;
    var h = document.getElementById("boxWorldMap").offsetHeight;

    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = w - margin.left - margin.right;
    const height = h - margin.top - margin.bottom;

    var colorScale = d3.scaleLinear()
        .domain([-15, 7.5, 30])
        // .range(["#2c7bb6", "#ffff8c", "#d7191c"])
        .range(["#FFDFDA", "#FF0000"])
        .interpolate(d3.interpolateHcl);

    const svg = d3.select('#boxWorldMap')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('class', 'map');

    const projection = d3.geoMercator()
        .scale(150)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    svg.call(tip);

    queue()
        .defer(d3.json, 'world_countries.json')
        // .defer(d3.csv, 'data.csv')
        .await(ready);


    function ready(_error, arrWorldCountriesData) {


        arrWorldCountriesData.features.forEach(d => {
            var filterCountry = filterSelected(oDataClas, d);
            if (filterCountry.isPresent) {
                d.countryData = filterCountry.value;
            } else {
                d.countryData = null;
            }
        });

        svg.append('g')
            .attr('class', 'countries')
            .selectAll('path')
            .data(arrWorldCountriesData.features)
            .enter().append('path')
            .attr('d', path)
            .style('fill', d => {
                return (d.countryData === null) ? "gray" : colorScale(parseInt(d.countryData["Total"]));
                // return (d.regionData != null) ? d.regionData.color : colorForNa;
            })
            .style('stroke', 'white')
            .style('opacity', 0.8)
            .style('stroke-width', 0.3)
            // tooltips
            .on('mouseover', function(d) {
                tip.show(d);
            })
            .on('mouseout', function(d) {
                tip.hide(d);
            });


        svg.append('path')
            .datum(topojson.mesh(arrWorldCountriesData.features, (a, b) => a.id !== b.id))
            .attr('class', 'names')
            .attr('d', path);


        svg.selectAll(".stateText")
            .data(arrWorldCountriesData.features)
            .enter().append("text")
            .attr("class", "stateText")
            .attr("x", function(d) {
                return path.centroid(d)[0];
            })
            .attr("y", function(d) {
                return path.centroid(d)[1];
            })
            .attr("text-anchor", "middle")
            // .attr("font-size", "12px")
            .text(function(d) {
                if (d.countryData !== null) {
                    return (` ${parseInt(d.countryData.Total)}`);
                } else {
                    return "";
                }
            })


        createCountryDataInTable(arrWorldCountriesData.features)

    }

}

function createCountryDataInTable(oTblCountryData) {
    var html = ['<tr><th>Country</th><th>Count</th></tr>'];
    var tbl = document.getElementById("tblCountryData");
    // tbl.classList.add("table");
    // tbl.classList.add("table-striped table-hover");
    tbl.className = "table table-striped table-hover";

    oTblCountryData.forEach(d => {
        if (d.countryData !== null) {
            html.push(`<tr><td>${d.countryData.Country}</td><td>${parseInt(d.countryData.Total)}</td></tr>`);
        }
    });
    tbl.innerHTML = html.join("");
}

function filterSelected(population, d) {

    var arrFilter = population.filter(x => x.Country === d.properties.name);

    if (arrFilter.length > 0) {
        var first = arrFilter[0];
        return { isPresent: true, value: first };
    } else {
        return { isPresent: false, value: null };
    }
}