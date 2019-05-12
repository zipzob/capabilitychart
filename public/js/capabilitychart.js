function capabilityChart() {
  var width = 1000, // default width
      height = 1000, // default height
      groupNames = [],
      groupRanges = [],
      surveys = {},
      schemeGroupColours_0_3 = [
        // Strategy: 81, 189, 195
        "rgb(180, 225, 227)",
        // culture: 204, 51, 153
        "rgb(224, 157, 199)",
        // Implementation: 51, 102, 204
        "rgb(151, 179, 204)",
        // Skill Development: 153, 51, 153
        "rgb(200, 157, 198)",
      ],
      // schemeGroupColours_0_3 = ["#b5ccd2","#b082b3","#b675a2","#7a8aa4"],
      schemeDataColours_0_3 = [
        "#fff",
        // "red"
        // rgb(229, 243, 228);
        // "#eee",
        // "#bfbfbf",
        // "rgb(29, 223, 163)"
        // "rgb(104, 234, 194)"
        // "#e5f3e4",
        // rgb(218, 235, 216)
        // "#daebd8",
        // rgb(193, 203, 194);
        // "#c1cbc2",
        // rgb(184, 214, 206);
        // "#b8d6ce",
        // "rgb(156, 191, 161)"
        "rgb(168, 217, 177)"
        // "#9cbfa1",
      ],
      margin = {top: 20, right: 20, bottom: 20, left: 20};

  function chart(selection) {
    var outerRadius = Math.min(width, height) / 2,
        innerRadius = outerRadius / 10,
        groupHeight = outerRadius / 15,
        textHeight = outerRadius / 8,
        dataHeight = outerRadius - innerRadius - groupHeight - textHeight,
        totalSegments = selection.size();

    var dataColours = d3.scaleLinear([0,3],schemeDataColours_0_3),
        groupColours = d3.scaleOrdinal([0,1,2,3], schemeGroupColours_0_3),
        totalLayers = 0;

    var segmentNames = [];
    var segmentHeights = [];
    var PI_2 = (Math.PI) / 2;
    var segmentAngle = (2 * Math.PI) / totalSegments;

    var svg = d3.select(selection.node());
    var g = svg
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    selection.each(function(entry, index, array) {
      totalLayers = entry.data.capabilities.length + 1;
      if (entry.data.capabilities) {
        _createDataArc(entry.data, index);
        segmentNames.push(entry.data.label);
        segmentHeights.push(dataHeight / entry.data.capabilities.length);
      }
    });

    _createGroupArcs();

    _createLabels(selection);

    var surveydata = Object.keys(surveys).map(function(survey) {
      return segmentNames.map(function(name) { return surveys[survey][name] });
    }).forEach(_createSurveyPath);

    function _createSurveyPath(data,index,array) {
      function surveyLine(data) {

        function _radius(d,i) { return (d-1) * segmentHeights[index] + innerRadius; };
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
        .attr("style", "stroke-width: 3px; stroke: black; fill: none;")
        .attr("d", path);
    };

    function _createLabels(selection) {
      var PI_2 = (Math.PI - segmentAngle) / 2;
      g.selectAll(null)
        .data(selection.nodes().map(function(d) { return d.__data__.data.label; }))
        .enter().append("text")
        .attr("y", function(d, i) { return Math.sin(i * segmentAngle - PI_2) * (outerRadius - (textHeight / 2)); })
        .attr("x", function(d, i) { return Math.cos(i * segmentAngle - PI_2) * (outerRadius - (textHeight / 2)); })
        .style("text-anchor", "middle")
        .text(function(d) { return d; } );
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
          // .attr("style", "stroke: #759081;")
          .attr("style", "stroke-width: 1px; stroke: rgb(118, 139, 127);")
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
