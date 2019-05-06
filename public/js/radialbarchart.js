function radialBarChart() {
  var width = 1000, // default width
      height = 1000, // default height
      groupNames = [],
      groupRanges = [],
      totalLayers = 0,
      totalSegments = 0,
      margin = {top: 20, right: 20, bottom: 20, left: 20};

  function chart(selection) {
    var outerRadius = Math.min(width, height) / 2,
        innerRadius = outerRadius / 10,
        groupHeight = outerRadius / 10,
        textHeight = outerRadius / 10,
        dataHeight = outerRadius - innerRadius - groupHeight - textHeight;

    var schemeDataColour = ["#daebd8", "#c1cbc2", "#b8d6ce", "#9cbfa1"],
        schemeGroupColour = ["#b5ccd2","#b082b3","#b675a2","#7a8aa4"],
        dataColours = d3.scaleLinear([1,3], schemeDataColour),
        // groupColours = d3.scaleOrdinal([0,3], schemeGroupColour),
        groupColours = d3.scaleOrdinal(d3.schemeCategory10),
        testColours = d3.scaleLinear().domain(d3.extent([0,3], function(d) { return d; })).range(["white", "red"]);

    var segmentAngle = (2 * Math.PI) / totalSegments;

    var svg = d3.select("#capabilitychart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    var g = svg
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    selection.each(function(entry, index, array) {
      totalLayers = entry.data.data.length + 1;
      if (entry.data.data) {
        _createDataArc(entry.data, index);
      }
    })

    _createGroupArcs();


    function createDataArcs(entry, index) {
      var segmentHeight = dataHeight / entry.data.length;

      var arc = d3.arc()
        .startAngle(index * segmentAngle)
        .endAngle((index + 1)* segmentAngle)
        .outerRadius(function(d, i) {return (i + 1) * segmentHeight + innerRadius;})
        .innerRadius(function(d, i) {return i * segmentHeight + innerRadius;});

      g.selectAll(null)
        .data(entry.data)
        .enter().append("path")
        .attr("fill", function(d, i) { return dataColours(d); })
        .attr("style", "stroke: #759081;")
        .attr("d", arc)
    }

    function _createGroupArcs() {

      var arc = d3.arc()
        .innerRadius(outerRadius - groupHeight - textHeight)
        .outerRadius(outerRadius - textHeight)
        .startAngle(function(d) { return (d[0]) * segmentAngle;})
        .endAngle(function(d) { return (d[1] + 1) * segmentAngle;})

      g.selectAll(null)
        .data(groupRanges)
        .enter().append("path")
        .attr("fill", function(d, i) {
          return groupColours(i);
        })
        .attr("d", arc)
    }
  }

  // function groupIndex(index) {
  //   return groupRanges.findIndex(function(range) { return range[0] <= index && index <= range[1]; });
  // }

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.totalSegments = function(_) {
    if (!arguments.length) return totalSegments;
    totalSegments = _;
    return chart;
  };

  chart.groupRanges = function(_) {
    if (!arguments.length) return groupRanges;
    groupRanges = _;
    return chart;
  };

  chart.groupNames = function(_) {
    if (!arguments.length) return groupNames;
    groupNames = _;
    return chart;
  };

  return chart;
};
