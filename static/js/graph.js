/**
 * Created by Irene on 30/01/2017.
 */

//queue() function utilises the queue library for asynchronous loading.
//Useful to get data from multiple API's for a single analysis.
//This function processes the data and inserts it into the apiData Variable
queue()
    .defer(d3.json, "static/json/marvel-avengers.json") // Get the data from MongoDB
    .await(makeGraphs);


function makeGraphs(error, avengersJson){
    console.log(avengersJson)
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
        return d["Current?"];
    });
    var genderDim = ndx.dimension(function(d){
        return d["Gender"];
    });
    var yearDim = ndx.dimension(function (d) {
        return d["Year"]
    });
    var honoraryDim = ndx.dimension(function (d) {
        return d["Honorary"]
    })

    //Calculate metrics and groups for grouping and counting our data
    var numAvengersByCurrent = currentDim.group();
    var numAvengersByGender = genderDim.group();
    var numAvengersByHonorary = honoraryDim.group();
    var numAvengersByYear = yearDim.group();
    var totalAppearancesByGender = genderDim.group().reduceSum(function (d){
        return d["Appearances"];
    });
    var genderGroup = genderDim.group();

    var all=ndx.groupAll();
    var totalAppearances = ndx.groupAll().reduceSum(function (d){
        return d["Appearances"];
    });

    //Define values (to be used in charts)
//Define values (to be used in charts)
    var minYear = yearDim.bottom(1)[0]["Year"];
    var maxYear = yearDim.top(1)[0]["Year"];

    //We define the chart types objects using DC.js library.
    //We also bind the charts to the div ID's in index.html
    //Charts
    var yearChart = dc.barChart("#year-chart");
    //var hairChart = dc.rowChart("#hair-chart");
    var honoraryChart = dc.pieChart("#honorary-chart");
    //var totalSavingsND = dc.numberDisplay("#total-savings-nd");
    //var heightChart = dc.barChart("#height-chart");


        //We assign properties and values to our charts.
    //We also include a select menu to choose between any of all US states for a particular date


    // Select State Menu. When used it overwrites the US map
   /* selectField = dc.selectMenu('#menu-select')
        .dimension(genderDim)
        .group(genderGroup);

    // Metric Total Savings
    totalSavingsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d){
            return d;
        })
        .group(totalSavings);

*/
   // Pie Chart Funding Status
    honoraryChart
        .height(220)
        .radius(90)
        .innerRadius(40)
        .transitionDuration(1500)
        .dimension(honoraryDim)
        .group(numAvengersByHonorary)
       // .colors(d3.scale.ordinal().range([ '#85C1E9', '#6E2C00', '#52BE80']))
        ;

    //Time-line in Years
    yearChart
        .width(800)
        .height(200)
        .margins({top:20, right:50, bottom:30, left:50})
        .dimension(yearDim)
        .group(numAvengersByYear)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minYear, maxYear]))
        .elasticY(true)
        .xAxisLabel("Year")
        .yAxis().ticks(8);

    // Row Chart Resource Type
   /* hairChart
        .width(300)
        .height(250)
        .dimension(hairDim)
        .group(numChildrenByHair)
        .colors(d3.scale.ordinal().range([ '#000000', '#D4AC0D', '#6E2C00']))
        .xAxis().ticks(4);

    //Bar Chart Height
    heightChart
        .width(600)
        .height(200)
        .margins({top:10, right:10, bottom:50, left:50})
        .dimension(heightDim)
        .group(numChildrenByHeight)
        .transitionDuration(500)
        .x(d3.scale.ordinal().domain(minHeight, maxHeight))
        .y(d3.scale.linear().domain([0,3]))
        .xUnits(dc.units.ordinal)// Tell dc.js that we're using an ordinal x-axis;
        //.elasticY(true)
        .xAxisLabel("Height")
        .gap(10)
        .yAxis().ticks(3);


*/

     dc.renderAll();
}