function capabilityChart() {
  var width = 1000, // default width
      height = 1000, // default height
      groupNames = [],
      groupRanges = [],
      surveys = {},
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
        totalLayers = 0,
        groupColours = d3.scaleOrdinal(d3.schemeCategory10),
        testColours = d3.scaleLinear().domain(d3.extent([0,3], function(d) { return d; })).range(["white", "red"]);

    var segmentAngle = (2 * Math.PI) / totalSegments;

    var svg = d3.select("#capabilitychart")
      .append("svg")
      .attr("id", "svg")
      .attr("width", width)
      .attr("height", height);

    var g = svg
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var segmentNames = [];
    var segmentHeights = [];

    selection.each(function(entry, index, array) {
      totalLayers = entry.data.capabilities.length + 1;
      if (entry.data.capabilities) {
        _createDataArc(entry.data, index);
        segmentNames.push(entry.data.label);
        segmentHeights.push(dataHeight / entry.data.capabilities.length);
      }
    });

    var surveydata = Object.keys(surveys).map(function(survey) {
      return segmentNames.map(function(name) { return surveys[survey][name] });
    }).forEach(function(data,index,array) {
      // var radius = surveys[key][entry.label] * segmentHeight + innerRadius;
      console.log(data);
      var surveyArc = d3.arc()
        .startAngle(function(d,i) { return i * segmentAngle;})
        .endAngle(function(d,i) { return (i + 1) * segmentAngle;})
        .outerRadius(function(d,i) { return d * segmentHeights[index] + innerRadius; })
        .innerRadius(function(d,i) { return d * segmentHeights[index] + innerRadius; });

      function surveyLine(data) {

        var PI_2 = (Math.PI) / 2;
        function _radius(d,i) { return d * segmentHeights[index] + innerRadius; };
        function _y(d, i) { return Math.sin(i * segmentAngle - PI_2) * _radius(d,i); };
        function _x(d, i) { return Math.cos(i * segmentAngle - PI_2) * _radius(d,i); };
        function _startAngle(d,i) { return i * segmentAngle - PI_2;};
        function _endAngle(d,i) { return (i + 1) * segmentAngle - PI_2;};

        var path = d3.path();

        data.forEach(internal);

        function internal(d,i,a) {
          console.log(d,i);

          if (i == 0) {
            // console.log(_x(d,i),_y(d,i));
            console.log("start");
            path.moveTo(_x(d,i),_y(d,i));
            path.arc(0,0, _radius(d, i), _startAngle(d, i), _endAngle(d, i));
          }
          else if (i == a.length - 1) {
            path.lineTo(_x(d,i),_y(d,i));
            path.arc(0,0, _radius(d, i), _startAngle(d, i), _endAngle(d, i));
            path.closePath();
          }
          else {
            path.lineTo(_x(d,i),_y(d,i));
            path.arc(0,0, _radius(d, i), _startAngle(d, i), _endAngle(d, i));
            console.log("data");
          }
        }

        return path._;
      }

      var path = surveyLine(data);
      console.log("path", path);
      g.append("path")
        .attr("style", "stroke-width:3px; stroke: black; fill: none;")
        .attr("d", path);

      // g.selectAll(null)
      //   .data(data)
      //   .enter()
      //   .append("path")
      //   .attr("style", "stroke-width:3px; stroke: black; fill: black;")
      //   .attr("d", surveyArc);

    });


    _createGroupArcs();

    _createLabels(selection);

    function _createLabels(selection) {
      var PI_2 = (Math.PI - segmentAngle) / 2;
      g.selectAll(null)
        .data(selection.nodes().map(function(d) { return d.__data__.data.label; }))
        .enter().append("text")
        .attr("y", function(d, i) { return Math.sin(i * segmentAngle - PI_2) * (outerRadius - (textHeight / 2)); })
        .attr("x", function(d, i) { return Math.cos(i * segmentAngle - PI_2) * (outerRadius - (textHeight / 2)); })
        .style("text-anchor", "middle")
        .text(function(d) { return d;} );
    }

    function _createDataArc(entry, index) {
      var segmentHeight = dataHeight / entry.capabilities.length;
      var arc = d3.arc()
        .startAngle(index * segmentAngle)
        .endAngle((index + 1)* segmentAngle)
        .outerRadius(function(d, i) {return (i + 1) * segmentHeight + innerRadius;})
        .innerRadius(function(d, i) {return i * segmentHeight + innerRadius;});

      g.selectAll(null)
        .data(entry.capabilities)
        .enter()
          .append("path")
          .attr("fill", function(d, i) { return dataColours(d); })
          .attr("style", "stroke: #759081;")
          .attr("d", arc);
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

  chart.surveys = function(_) {
    if (!arguments.length) return surveys;
    surveys = _;
    return chart;
  };

  return chart;
};
