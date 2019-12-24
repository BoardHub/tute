
plotters['algo'] = 'plotAlgo';
plotters['algo.ds'] = 'plotDS';
plotters['algo.ds.array'] = 'plotArray';

plotters['step'] = 'plotStep';

plotters['step.traverse'] = 'plotTraverse';
plotters['step.traverse.array'] = 'plotArrayTraversal';

plotters['step.match'] = 'plotMatch';
plotters['step.compare'] = 'plotCompare';
plotters['step.split'] = 'plotSplit';
plotters['step.discard'] = 'plotDiscard';
plotters['step.swap'] = 'plotSwap';
plotters['step.select'] = 'plotSelect';


var play = urlParams.get('play') || 'loop';

var playB, nextB;
var svg, nodeG, nodeIndx, nodes, nodeData;
var statusText, resultText;

var stepIndex = 0, index = 0;
var barHeight = 50, transformFactor = 1;

var cAlgo, cData, nextstep;

function plotAlgo(algo) {

    var data = algo.data.split(',');
    
    var svgWidth = barHeight * data.length;

    if((svgWidth * 2) < window.innerWidth  ){
        svgWidth = svgWidth * 2;
        transformFactor = data.length;
    }

//     playB = d3.select("#nav-content").append('button').text( play == 'loop' ?  '||' : '|>' ).on('click', function() {
//         if(play == 'loop') {
//             play = 'tick';
//             playB.text('|>');
//         } else {
//             play = 'loop';
//             playB.text('||');
//             plotNextStep();
//         }
//     });

//     nextB = d3.select("#nav-content").append('button').text('>').on('click', function() {
//         plotNextStep();
//     });

    svg = d3.select("#nav-content").append("svg")
        .attr("height", barHeight * 3)
        .attr("width", svgWidth);
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

function plotTraverse(algo, data, step) {
    eval(plotters['step.traverse.'+algo.ds])(algo, data, step)
}

function plotNextStep() {
    plotStep(cAlgo, cData, nextstep);
}

function plotArray(algo, data) {

    if(transformFactor == 1) {
        stepIndex++;
    }

    if(typeof data == 'string') {
        data = data.split(',');
    }

    console.log('ploting array of size: ' + data.length + ' data : ' + data);
    
    // Container
    nodeG = svg.append('g').attr('id', stepIndex)
                .selectAll("g").data(data).enter().append("g")
                .attr("transform", function(d, i) {
                        return "translate(" + ((transformFactor * barHeight) + (i * barHeight)) + "," + ((stepIndex + 1) * barHeight) +")"; 
                    });
//             .attr("transform", function(d, i) { 
//                 return "translate(0," + i * barHeight + ")"; 
//             });
    
    // Index Info
    nodeIndx = nodeG.append('text')
                .attr("class", "index node-info").attr("x", 15).attr("y", -15)
                .text(function(d, i) { return i; });
    
    // Node
    nodes = nodeG.append("rect")
                .attr("class", "node").attr("width", barHeight - 5 ).attr("height", barHeight - 5);
 
    // Data Info
    nodeData = nodeG.append("text")
                .attr("class", "data node-info").attr("x", 15).attr("y", 30)

    plotArrayData();

    stepIndex++;
}

function plotArrayData(delay) {
    nodeData.transition().duration(10000).delay(delay || 0).text(function(d, i) {
        return d; 
    });
}

function plotStepInfo(step) {

    svg.attr("height", (stepIndex + 5) * barHeight);

    $(window).scrollTop($(document).height());

    statusText.attr("y", (stepIndex + 4) * barHeight);
    resultText.attr("y", (stepIndex + 5) * barHeight);

    svg.append('text')
        .attr('id', 'step.'+step.id).attr("class", "node-info").attr("x", barHeight).attr("y", (stepIndex + 1) * barHeight)
        .text(step.info);    
}

function plotOutput(step) {
    statusText.text('Status : ' + (step.status || ''));
    resultText.text('Result : ' + (step.result || ''));
}


function plotStep(algo, data, step) {

    step = widgets[step];
    console.info('step.info : ' + step.info);

    stepIndex++;

    svg.transition().delay(2000)
        .on('start', function() {
    
            if(step.info) {
                plotStepInfo(step);    
            }
            
            if(step.data) {
                plotDS(algo, step.data);
            } else {
                stepIndex--;
            }

            if(step.operation) {
                var plotter = plotters['step.'+step.operation];
                if(!plotter) {
                    console.error('No Plotter defined for Step :' + step.id + ', Operation : ' + 'step.' + step.operation);
                    return;
                }
                eval(plotter)(algo, data, step);
            }
        })
        .on('end', function() {

            plotOutput(step);

            if(play == 'loop' && step.nextstep) {
                plotStep(algo, data, step.nextstep);
            } else {
                cAlgo = algo;
                cData = data;
                nextstep = step.nextstep;
            }
        });
    
}

var arc = d3.arc()
        .innerRadius(barHeight / 2)
        .outerRadius(barHeight / 2)
        .startAngle(-Math.PI / 2);


var symbolTriangle = d3.symbol().size(10).type(d3.symbolTriangle);

function plotArrayTraversal(algo, data, step) {

    stepIndex++;
    
    var operand = [ 0, data.length - 1 ];
    console.log('running loop from :  ' + operand[0] + ' to ' + operand[1]);
    
    var pathGs = svg
                .append('g')
                    .attr('id', stepIndex)
                .selectAll('path .arc')
                    .data(data).enter()
                    .append('g')
                    .attr("transform", function(d, i) { return "translate(" + ((transformFactor * barHeight) + (i * barHeight)) + "," + (stepIndex * barHeight) + ")"; } );

    var paths = pathGs.append('path')
        .datum({endAngle: -Math.PI / 2})
        .attr('class', 'arc traversal')
        .attr('d', arc)
    
    d3.select(paths.nodes()[0]).transition().duration(0).call(arcTween, (-Math.PI / 2) - Math.PI);

    var tri = svg.append('path')
        .attr('d', symbolTriangle)
        .attr('class', 'pointer traversal')
        .attr("transform", "translate(" + ((transformFactor * barHeight) + (barHeight/2))  + "," + (stepIndex * barHeight)  + ")");

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
            s.attr("transform", function() { return "translate(" + ((transformFactor * barHeight) + (i * barHeight) + (barHeight/2))  + "," + ((stepIndex - 1) * barHeight)  + ")"; } )
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
    plotSelectArray(step.operand, 'active')
}

function plotSplit(algo, data, step) {
    plotSelectArray(step.operand, 'processed')
}

function plotDiscard(algo, data, step) {
    step.operand.split(',').forEach(function(range){
        var indxs = range.split('-')
        for(var indx = indxs[0]; indx <= indxs[1]; indx++) {
            plotSelectNode(indx, 'deactive');
        }
    })
}

function plotSwap(algo, data, step) {
    
    stepIndex++;
    
    data = nodeData.data();
    plotArray(algo, data);

    var indxs = step.operand.split(',');
    var s = data[indxs[0]];
    var t = data[indxs[1]];
    data[indxs[0]] = t;
    data[indxs[1]] = s;
    
    nodeData.data(data);
    plotArrayData(1000);

}

function plotSelect(algo, data, step) {
    plotSelectArray(step.operand, 'processed')
}

function plotSelectArray(indxs, cls) {
    if(!indxs) return;
    indxs.split(',').forEach(function(i) {
        plotSelectNode(i, cls);
    })
}

function plotSelectNode(i, cls) {
    d3.select(nodeG.nodes()[i]).select('.node')
            .transition()
            //.delay(1000)
            .attr('class', 'node ' + cls);
}