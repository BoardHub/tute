
plotters['algo'] = 'plotAlgo';
plotters['algo.ds'] = 'plotDS';
plotters['algo.ds.array'] = 'plotArray';

plotters['step'] = 'plotStep';
plotters['step.traverse'] = 'plotTraverse';
plotters['step.traverse.array'] = 'plotArrayTraversal';
plotters['step.match'] = 'plotMatch';


var svg;
var statusText;
var resultText;

function plotAlgo(algo) {
    
    svg = d3.select("#nav-content").append("svg")
        .attr("height", barHeight * 5);
    statusText = svg.append('text')
        .attr('id', 'status')
        .attr("class", "node-info")
        .attr("x", 10)
        .attr("y", 2.5 * barHeight)
        .attr("dy", ".35em")
        .text('Status : Not Found');
    resultText = svg.append('text')
        .attr('id', 'result')
        .attr("class", "node-info")
        .attr("x", 10)
        .attr("y", 3 * barHeight)
        .attr("dy", ".35em")
        .text('Result :');

    var data = algo.data.split(',');
    
    plotDS(algo, data);
    
    var stepCount = algo['stepcount'];
    for(var i=0; i < stepCount; i++) {
        var step = algo['step'+(i+1)];
        plotStep(algo, data, widgets[step]);
    }
    
}

function plotDS(algo, data) {
    eval(plotters['algo.ds.'+algo.ds])(algo, data);
}

function plotArray(algo, data) {

    console.log('ploting array of size: ' + data.length + ' data : ' + algo.data);
    
    svg.attr("width", 2 * barHeight * data.length);
//    svg.attr("height", barHeight * data.length);

    svg.append('text')
        .attr('id', 'ds')
        .attr("class", "node-info")
        .attr("x", 10)
        .attr("y", barHeight)
        .attr("dy", ".35em")
        .text(algo.info);

    var bar = svg.selectAll("g")
        .data(data)
        .enter().append("g")
            .attr("transform", function(d, i) { return "translate(" + ((data.length * barHeight) + (i * barHeight)) + ",0)"; } );
//        .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; } );
        
    bar.append("rect")
        .attr("class", "node")
        .attr("width", barHeight - 5 )
        .attr("height", barHeight - 5);

    bar.append("text")
        .attr("class", "node-info")
        .attr("x", 10)
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function(d) { return d; });
}

function plotStep(algo, data, step) {
    eval(plotters['step.'+step.operation])(algo, data, step)
}

function plotTraverse(algo, data, step) {
    var operand = [ 0, data.length-1 ];
    console.log('running loop from :  ' + operand[0] + ' to ' + operand[1]);
    eval(plotters['step.traverse.'+algo.ds])(algo, data, step)
}


var barHeight = 50;

var arc = d3.arc()
        .innerRadius(barHeight / 2)
        .outerRadius(barHeight / 2)
        .startAngle(-Math.PI / 2);


var symbolTriangle = d3.symbol().size(10).type(d3.symbolTriangle);

function plotArrayTraversal(algo, data, step) {

    var nextStep = widgets[step.step1];

    var pathGs = 
        svg.selectAll('path')
            .data(data).enter()
            .append('g')
            .attr("transform", function(d, i) { return "translate(" + ((data.length * barHeight) + (i * barHeight)) + "," + barHeight + ")"; } );

    var paths = pathGs
        .append('path')
            .datum({endAngle: -Math.PI / 2})
            .attr('class', 'traversal')
            .attr('d', arc)

    svg.append('text')
        .attr('id', 'step.'+step.id)
        .attr("class", "node-info")
        .attr("x", 10)
        .attr("y", 1.5 * barHeight)
        .attr("dy", ".35em")
        .text(step.info);
    
    svg.append('text')
        .attr('id', 'step.'+nextStep.id)
        .attr("class", "node-info")
        .attr("x", 10)
        .attr("y", 2 * barHeight)
        .attr("dy", ".35em")
        .text(nextStep.info);

    pathGs
        .append('text')
            .attr("class", "node-info")
            .attr("x", 10)
            .attr("y", barHeight)
            .attr("dy", ".35em")
            .text(function(d, i){ return i});
    
    d3.select(paths.nodes()[0]).transition().call(arcTween, (-Math.PI / 2) - Math.PI);

    var tri = svg.append('path')
        .attr('d', symbolTriangle)
        .attr('class', 'traversal')
        .attr("transform", "translate(" + ((data.length * barHeight) + (barHeight/2))  + "," + barHeight  + ")");
    
    for(var i = 1; i < data.length; i++) {
        
        for(var j=0; j < Math.PI ;  j += 0.1) {
            d3.select(paths.nodes()[i])
                .transition().delay(i * 1000)
                .call(arcTween, (-Math.PI / 2) - j);
        }
        
        tri.transition().duration(0).delay(i * 1000)
        .call(function(s) {
            s.attr("transform", function() { return "translate(" + ((data.length * barHeight) + (i * barHeight) + (barHeight/2))  + "," + barHeight  + ")"; } )
        })
        .on('start', function() {
            console.log('starting : ' + index);
            if(eval(plotters['step.'+nextStep.operation])(data, nextStep.operand)) {
                tri.interrupt();
                paths.interrupt();
            }
        }).on('end', function() {
            console.log('ending : ' + (index-1));
        });
     
    }
}

function arcTween(transition, newAngle) {
    transition.attrTween("d", function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        return function(t) {
            d.endAngle = interpolate(t);
            return arc(d);
        };
    });
}

var index = 0;
function plotMatch(data, operand) {
    if(data[index++] == operand) {
        statusText.text('Status : Found');
        console.log('Status : Found');
        resultText.text('Result : ' + (index -1));
        return true;
    } else {
        statusText.text('Status : Not Found');
        console.log('Status : Not Found');
        return false;
    }
}