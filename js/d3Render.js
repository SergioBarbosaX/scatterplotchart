const margin = 80;
const width  = 1000 - (2 * margin);
const height =  600 - (2 * margin);

const legendInfo = [
  ["red", "Dopping allegations"],
  ["lightgreen", "No dopping allegations"]
];

const svg = d3.select("svg");

const chart = svg.append("g")
                 .attr("transform", `translate(${margin}, ${margin})`);

const tooltip = d3.select("#container")
                  .append("div")
                  .attr("id", "tooltip")
                  .style("opacity", 0);


drawScatterPlotChart = (rawYear, dateObjTime, jsonData) => {

    const formatInteger = d3.format("d");
    const formatMinuteSecond = d3.timeFormat("%M:%S");

    const xScale = d3.scaleLinear()
                     .range([0, width])
                     .domain([d3.min(rawYear) - 1, d3.max(rawYear) + 1]);

    chart.append('g')
         .attr('id', 'x-axis')
         .attr('transform', `translate(0, ${height})`)
         .call(d3.axisBottom(xScale).tickFormat(formatInteger));


    const yScale = d3.scaleTime()
                     .range([height, 0])
                     .domain([d3.min(dateObjTime), d3.max(dateObjTime)]);

    chart.append('g')
         .attr('id', 'y-axis')
         .call(d3.axisLeft(yScale).tickFormat(formatMinuteSecond));

    chart.selectAll()
         .data(dateObjTime)
         .enter()
         .append('circle')
         .attr('class', 'dot')
         .attr('r', 6)
         .attr('cx', (d, i) => {
           return xScale(rawYear[i]);
         })
         .attr('data-xvalue', (d, i) => {
          return rawYear[i];
         })
         .attr('cy', (d, i) => {
           return yScale(d);
         })
         .attr('data-yvalue', (d, i) => {
          return d.toISOString();
         })
         .attr('fill', (d, i) => {
           if (jsonData[i].Doping != "")
            return "red";
           return "lightgreen";
          })
         .on("mouseover", function (d, i) {
          tooltip.transition()
                 .duration(300)
                 .style("opacity", 0.90);
          tooltip.html("<p>"+jsonData[i].Name+"<span>, </span>"+jsonData[i].Nationality+"<br/>"+
                       "<span>Year: "+jsonData[i].Year+". </span>"+"<span>Time: "+jsonData[i].Time+"</span></p>"+
                       "<p>"+jsonData[i].Doping+"</p>")
                 .style("left", (d3.event.pageX) + "px")
                 .style("top", (d3.event.pageY - 28) + "px");
          tooltip.attr('data-year', rawYear[i]);
         })
         .on("mouseout", function() {
          tooltip.transition()
                 .duration(300)
                 .style("opacity", 0);
         });

    svg.append("text")
         .attr("id", "yAxisText")
         .attr("x", -(height / 2) - margin )
         .attr("y", margin / 2.4 )
         .attr("transform", "rotate(-90)")
         .style("text-anchor", "middle")
         .text("Time in minutes");
  
    svg.append("text")
         .attr("id", "xAxisText")
         .attr("x", (width / 2) + margin)
         .attr("y", height + (1.5 * margin))
         .style("text-anchor", "middle")
         .text("Years");

  
    const legend = svg.selectAll()
                      .data(legendInfo)
                      .enter()
                      .append("g")
                      .attr('id', 'legend')
                      .attr("transform", (d, i) => {
                        return "translate(0," + (height - i * 20) + ")";
                       });
                      
          legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", (d, i) => {
                  return legendInfo[i][0];
                });

          legend.append("text")
                .attr("x", width + 5)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "start")
                .text((d, i) => { 
                  return legendInfo[i][1];
                });
}

// main program
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json").then( (jsonData) => {

    const rawTime = jsonData.map((element) => {
        return element.Time;
    });

    const rawYear = jsonData.map((element) => {
        return element.Year;
    });

    const dateObjTime = jsonData.map((element) => {
      return new Date(element.Seconds * 1000);
    });

    const dateObjYear = jsonData.map((element) => {
        return new Date(element.Year, 1, 1);
    });

    drawScatterPlotChart(rawYear, dateObjTime, jsonData);
});