/**
 * Created by Irene on 30/01/2017.
 */

//queue() function utilises the queue library for asynchronous loading.
//Useful to get data from multiple API's for a single analysis.
//This function processes the data and inserts it into the apiData Variable
queue()
    .defer(d3.json, "/marvel/avengers-clean") // Get the data from MongoDB
    .await(makeGraphs);


function makeGraphs(error, avengersJson){
    //Clean projectJson data
    var avengers = avengersJson; // Pass the data inside the avengersJson variable into our dataSet variable
    var dateFormat = d3.time.format("%Y"); // Parse the date data type to suit our charting needs. It

    avengers.forEach(function(d){
        d["Year"]  = d["Year"].toFixed() // Convert Year to string to be parsed
        d["Year"] = dateFormat.parse(d["Year"]); // It needs to be a date to use a time scale in the bar chart.
        d["Appearances"] = +d["Appearances"]
    });


    //Create a Crossfilter instance
    var ndx = crossfilter(avengers);

    //Define Dimensions
    var currentDim = ndx.dimension(function(d){
        return d["Current"];
    });
    var genderDim = ndx.dimension(function(d){
        return d["Gender"];
    });
    var yearDim = ndx.dimension(function (d) {
        return d["Year"]
    });
    var honoraryDim = ndx.dimension(function (d) {
        return d["Honorary"]
    });
    var death1Dim = ndx.dimension(function (d) {
        return d["Death1"]
    });
    var avengersDim = ndx.dimension(function (d) {
        return d["Name-Alias"]
    });

    //Calculate metrics and groups for grouping and counting our data
    var currentGroup = currentDim.group();
    var numAvengersByCurrent = currentDim.group();
    var numAvengersByGender = genderDim.group();
    var numAvengersByHonorary = honoraryDim.group();
    var numAvengersByYear = yearDim.group();
    var avengersGroup = avengersDim.group();
    var numAvengersByDeath1 = death1Dim.group();
    var all=ndx.groupAll();


    //Define values (to be used in charts)
    var minYear = yearDim.bottom(1)[0]["Year"];
    var maxYear = yearDim.top(1)[0]["Year"];

    //Charts using DC.js library
    var yearChart = dc.barChart("#year-bar-chart");
    var honoraryChart = dc.pieChart("#honorary-pie-chart");
    var genderChart = dc.pieChart("#gender-pie-chart");
    var numberAvengers = dc.numberDisplay("#number-avengers");
    var currentChart = dc.pieChart("#current-chart");
    var death1RowChart = dc.rowChart("#death1-row-chart")


    //We assign properties and values to our charts.
    // Menu to select Avenger
    selectFieldName = dc.selectMenu('#menu-select-avenger')
     .dimension(avengersDim)
     .group(avengersGroup);

    // Menu to select avengers currently in the team
   // selectField = dc.selectMenu('#menu-select-current')
   //     .dimension(currentDim)
   //     .group(currentGroup);

    // Metric Num Avengers
    numberAvengers
        .formatNumber(d3.format("d"))
        .valueAccessor(function(d){
            return d;
        })
        .group(all);

    //Time-line in Years (when the avengers joined the team)
    yearChart
        .width(800)
        .height(220)
        .margins({top:20, right:50, bottom:30, left:50})
        .dimension(yearDim)
        .group(numAvengersByYear)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minYear, maxYear]))
        .colors(d3.scale.ordinal().range(['#098BDC']))
        .elasticY(true)
        .xAxisLabel("Year")
        .yAxis().ticks(8);

    // Pie Chart Current
    currentChart
        .height(220)
        .radius(90)
        .innerRadius(20)
        .transitionDuration(1500)
        .dimension(currentDim)
        .group(numAvengersByCurrent)
        .colors(d3.scale.ordinal().range(['#20B2AA', '#098bdc', '#ceebfd', '#B0C4DE']))
        ;


   // Pie Chart Honorary
    honoraryChart
        .height(220)
        .radius(90)
        .width(300)
        .innerRadius(40)
        .dimension(honoraryDim)
        .group(numAvengersByHonorary)
        .colors(d3.scale.ordinal().range(['#20B2AA', '#098bdc', '#ceebfd', '#B0C4DE']))
        .legend(dc.legend().x(0).y(10))
        .minAngleForLabel(0.5)
        .externalLabels(0.05)
        .slicesCap(5)
        .renderLabel(true)
        .transitionDuration(500);


     // Pie Chart Gender
    genderChart
        .height(220)
        .radius(90)
        .innerRadius(0)
        .transitionDuration(1500)
        .dimension(genderDim)
        .group(numAvengersByGender)
       .colors(d3.scale.ordinal().range(['#20B2AA', '#098bdc', '#ceebfd', '#B0C4DE']));


    // Row Chart Death1
    death1RowChart
        .width(300)
        .height(220)
        .dimension(death1Dim)
        .group(numAvengersByDeath1)
        .colors(d3.scale.ordinal().range(['#20B2AA', '#098bdc', '#ceebfd', '#B0C4DE']))
        .xAxis().ticks(4);








    dc.renderAll();
}