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
    var avengers = avengersJson; //Pass the data inside the projectsJson variable into our dataSet variable

    avengers.forEach(function(d){
        d["Appearances"] = +d["Appearances"]
        d["Year"] = +d["Year"]
    });

    //Ingesting the data into a crossfilter instance and creating dimensions based on the crossfilter instance
    //Crossfilter acts as a two way data binding pipeline.
    //Whenever you make a selection on the data, it is automatically applied to other charts,
    // as well enabling our drill down functionality.

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
    var yearGroup = yearDim.group();
    var currentGroup = currentDim.group();
    var genderGroup = genderDim.group();
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

    //We define the chart types objects using DC.js library.
    //We also bind the charts to the div ID's in index.html
    //Charts
    var yearChart = dc.barChart("#year-bar-chart");
    var honoraryChart = dc.pieChart("#honorary-pie-chart");
    var genderChart = dc.pieChart("#gender-pie-chart");
    var numberAvengers = dc.numberDisplay("#number-avengers");
    var currentChart = dc.pieChart("#current-chart");
    var death1RowChart = dc.rowChart("#death1-row-chart")



    //We assign properties and values to our charts.
    //We also include a select menu to choose between any of all US states for a particular date
    selectField = dc.selectMenu('#menu-select-current')
        .dimension(currentDim)
        .group(currentGroup);


    selectFieldName = dc.selectMenu('#menu-select-avenger')
     .dimension(avengersDim)
     .group(avengersGroup);

    // Metric Num Avengers
    numberAvengers
        .formatNumber(d3.format("d"))
        .valueAccessor(function(d){
            return d;
        })
        .group(all);

    //Time-line in Years
    yearChart
        .width(800)
        .height(220)
        .margins({top:20, right:50, bottom:30, left:50})
        .dimension(yearDim)
        .group(numAvengersByYear)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minYear, maxYear]))
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
        .colors(d3.scale.ordinal().range(['#FF8000', '#3399FF', '#66CC00', '#FFFF33']))
        ;


   // Pie Chart Honorary
    honoraryChart
        .height(220)
        .radius(90)
        .width(300)
        .innerRadius(40)
        .dimension(honoraryDim)
        .group(numAvengersByHonorary)
        .colors(d3.scale.ordinal().range(['#FF8000', '#3399FF', '#66CC00', '#FFFF33']))
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
       .colors(d3.scale.ordinal().range(['#FF8000', '#3399FF', '#66CC00', '#FFFF33']));


    // Row Chart Death1
    death1RowChart
        .width(300)
        .height(220)
        .dimension(death1Dim)
        .group(numAvengersByDeath1)
        .colors(d3.scale.ordinal().range([ '#FF8000', '#3399FF', '#66CC00', '#FFFF33']))
        .xAxis().ticks(4);








    dc.renderAll();
}