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
    //Clean projectJson data
    var avengers = avengersJson; //Pass the data inside the projectsJson variable into our dataSet variable

    avengers.forEach(function(d){
        d["Appearances"] = +d["Appearances"]
        d["Year"] = +d["Year"]
        console.log(d["Current"])
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
    var appearancesDim = ndx.dimension(function (d) {
        return d["Appearances"]
    })

    //Calculate metrics and groups for grouping and counting our data
    var yearGroup = yearDim.group();
    var currentGroup = currentDim.group();
    var genderGroup = genderDim.group();
    var numAvengersByCurrent = currentDim.group();
    var numAvengersByGender = genderDim.group();
    var numAvengersByHonorary = honoraryDim.group();
    var numAvengersByYear = yearDim.group();
    var numAvengersByAppearances = appearancesDim.group();
    var totalAppearancesByGender = genderDim.group().reduceSum(function (d){
        return d["Appearances"];
    });


    var all=ndx.groupAll();



    //Define values (to be used in charts)
//Define values (to be used in charts)
    var minYear = yearDim.bottom(1)[0]["Year"];
    var maxYear = yearDim.top(1)[0]["Year"];

    //We define the chart types objects using DC.js library.
    //We also bind the charts to the div ID's in index.html
    //Charts
    var yearChart = dc.barChart("#year-bar-chart");
    var appearancesChart = dc.barChart("#appearances-bar-chart");
    var honoraryRowChart = dc.rowChart("#honorary-row-chart");
    var honoraryChart = dc.pieChart("#honorary-pie-chart");
    var genderChart = dc.pieChart("#gender-pie-chart");
    var numberAvengers = dc.numberDisplay("#number-avengers");
    //var currentChart = dc.pieChart("#current-chart");




        //We assign properties and values to our charts.
    //We also include a select menu to choose between any of all US states for a particular date
 selectField = dc.selectMenu('#menu-select-current')
        .dimension(currentDim)
        .group(currentGroup);

    // Select State Menu. When used it overwrites the US map
   /* selectField = dc.selectMenu('#menu-select')
        .dimension(genderDim)
        .group(genderGroup);
*/
    // Metric Num Avengers
    numberAvengers
        .formatNumber(d3.format("d"))
        .valueAccessor(function(d){
            return d;
        })
        .group(all);

   // Pie Chart Honorary
    honoraryChart
        .height(220)
        .radius(90)
        .innerRadius(40)
        .transitionDuration(1500)
        .dimension(honoraryDim)
        .group(numAvengersByHonorary)
       // .colors(d3.scale.ordinal().range([ '#85C1E9', '#6E2C00', '#52BE80']))
        ;

     // Pie Chart Gender
    genderChart
        .height(220)
        .radius(90)
        .innerRadius(0)
        .transitionDuration(1500)
        .dimension(genderDim)
        .group(numAvengersByGender)
        ;

    // Row Chart Resource Type
    honoraryRowChart
        .width(300)
        .height(250)
        .dimension(honoraryDim)
        .group(numAvengersByHonorary)
        //.colors(d3.scale.ordinal().range([ '#000000', '#D4AC0D', '#6E2C00']))
        .xAxis().ticks(4);

     // Pie Chart Current
    /*currentChart
        .height(220)
        .radius(90)
        .innerRadius(20)
        .transitionDuration(1500)
        .dimension(currentDim)
        .group(numAvengersByCurrent)
       // .colors(d3.scale.ordinal().range([ '#85C1E9', '#6E2C00', '#52BE80']))
        ;*/

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



    //Bar Chart Appearances
    appearancesChart
        .width(600)
        .height(200)
        .margins({top:10, right:10, bottom:50, left:50})
        .dimension(appearancesDim)
        .group(numAvengersByAppearances)
        .transitionDuration(500)
        .x(d3.scale.ordinal().domain(1, 4050))
        .y(d3.scale.linear().domain([0,20]))
        .xUnits(dc.units.ordinal)// Tell dc.js that we're using an ordinal x-axis;
        .elasticY(true)
        .xAxisLabel("Appearances")
        .gap(10)
        .yAxis().ticks(3);




     dc.renderAll();
}