
plotters['algo'] = 'plotAlgo';
plotters['algo.ds'] = 'plotDS';
plotters['algo.ds.array'] = 'plotArray';

plotters['step'] = 'plotStep';
plotters['step.traverse'] = 'plotTraverse';
plotters['step.traverse.array'] = 'plotArrayTraversal';
plotters['step.match'] = 'plotMatch';

plotters['step.compare'] = 'plotCompare';
plotters['step.split'] = 'plotSplit';


var svg;
var nodeG;

var statusText;
var resultText;

var stepIndex = 0;
var index = 0;

var barHeight = 50;

function plotAlgo(algo) {

    var data = algo.data.split(',');
    
    svg = d3.select("#nav-content").append("svg")
        .attr("height", barHeight * 3)
        .attr("width", 2 * barHeight * data.length);
//         .attr("height", barHeight * data.length);

    // Algo Info
    svg.append('text')
        .attr('id', 'algo.info').attr("class", "node-info").attr("x", barHeight).attr("y", barHeight)
        .text(algo.info);

    statusText = svg.append('text')
        .attr('id', 'status').attr("class", "node-info").attr("x", barHeight).attr("y", 4 * barHeight)
        .text('Status :');
        
    resultText = svg.append('text')
        .attr('id', 'result').attr("class", "node-info").attr("x", barHeight).attr("y", 5 * barHeight)
        .text('Result :');

    
    plotDS(algo, data);
    plotStep(algo, data, algo.nextstep);
    
}

function plotDS(algo, data) {
    eval(plotters['algo.ds.'+algo.ds])(algo, data);
}

function plotArray(algo, data) {

    if(typeof data == 'string') {
        data = data.split(',');
    }

    console.log('ploting array of size: ' + data.length + ' data : ' + data);
    
    // Container
    nodeG = svg.append('g')
                .attr('id', stepIndex)
            .selectAll("g")
                .data(data).enter()
            .append("g")
                .attr("transform", function(d, i) {
                    return "translate(" + ((data.length * barHeight) + (i * barHeight)) + "," + ((stepIndex + 1) * barHeight) +")"; 
                });
//                 .attr("transform", function(d, i) { 
//                     return "translate(0," + i * barHeight + ")"; 
//                 });
    
    nodeG.append('text')
        .attr("class", "index node-info").attr("x", 15).attr("y", -15)
        .text(function(d, i) { return i; });

    // Data Node
    nodeG.append("rect")
        .attr("class", "node").attr("width", barHeight - 5 ).attr("height", barHeight - 5);
    
    // Data Node Info
    nodeG.append("text")
        .attr("class", "data node-info").attr("x", 15).attr("y", 30)
        .text(function(d) { return d; });

    stepIndex += 1;
}

function plotStepInfo(step) {

    svg.attr("height", (stepIndex + 5) * barHeight);

    statusText.attr("y", (stepIndex + 2) * barHeight);
    resultText.attr("y", (stepIndex + 3) * barHeight);

    svg.append('text')
        .attr('id', 'step.'+step.id).attr("class", "node-info").attr("x", barHeight).attr("y", (stepIndex + 1) * barHeight)
        .text(step.info);    
}

function plotOutput(step) {
    statusText.text('Status : ' + (step.status || ''));
    resultText.text('Result :' + (step.result || ''));
}


function plotStep(algo, data, step) {

    step = widgets[step];

    stepIndex++;

    svg.transition().delay(2000)
        .on('start', function() {
    
            plotStepInfo(step);

            eval(plotters['step.'+step.operation])(algo, data, step);

        })
        .on('end', function() {

            plotOutput(step);

            if(step.nextstep) {
                plotStep(algo, data, step.nextstep);
            } 
        });
    
}

function plotTraverse(algo, data, step) {
    var operand = [ 0, data.length-1 ];
    console.log('running loop from :  ' + operand[0] + ' to ' + operand[1]);
    eval(plotters['step.traverse.'+algo.ds])(algo, data, step)
}

var arc = d3.arc()
        .innerRadius(barHeight / 2)
        .outerRadius(barHeight / 2)
        .startAngle(-Math.PI / 2);


var symbolTriangle = d3.symbol().size(10).type(d3.symbolTriangle);

function plotArrayTraversal(algo, data, step) {

    var pathGs = svg
                .append('g')
                    .attr('id', stepIndex)
                .selectAll('path .arc')
                    .data(data).enter()
                    .append('g')
                    .attr("transform", function(d, i) { return "translate(" + ((data.length * barHeight) + (i * barHeight)) + "," + (2 * barHeight) + ")"; } );

    var paths = pathGs.append('path')
        .datum({endAngle: -Math.PI / 2})
        .attr('class', 'arc traversal')
        .attr('d', arc)
    
    d3.select(paths.nodes()[0]).transition().duration(0).call(arcTween, (-Math.PI / 2) - Math.PI);

    var tri = svg.append('path')
        .attr('d', symbolTriangle)
        .attr('class', 'pointer traversal')
        .attr("transform", "translate(" + ((data.length * barHeight) + (barHeight/2))  + "," + (2 * barHeight)  + ")");

    var nextStep = widgets[step.nextstep];
    delete step.nextstep;
    stepIndex++;
    plotStepInfo(nextStep);

    for(var i = 1; i < data.length; i++) {
        
        for(var j = 0; j < Math.PI ;  j += 0.1) {
            d3.select(paths.nodes()[i]).transition().delay(i * 1000).call(arcTween, (-Math.PI / 2) - j);
        }
        
        tri.transition().duration(0).delay(i * 1000)
        .call(function(s) {
            s.attr("transform", function() { return "translate(" + ((data.length * barHeight) + (i * barHeight) + (barHeight/2))  + "," + (2 * barHeight)  + ")"; } )
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


function plotCompare(algo, data, step) {
    console.log(step.info);    
}

function plotSplit(algo, data, step) {
    plotDS(algo, step.data);
    d3.select(nodeG.nodes()[step.operand]).select('.node')
        .transition().delay(1000)
        .attr('class', 'node selected');
}