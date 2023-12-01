import {formatXP} from "./index.js";

export function progressOverTime(data) {

    // Dimensions and margins for the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
    // Append the SVG object to the body of the page
    const svg = d3.select('#chart-container')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

// Add X axis and vertical grid lines
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.createdAt)))
        .range([0, width]);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%B")))
        .selectAll(".tick line")
        .clone()
        .attr('y2', -height)
        .attr('stroke-opacity', 0.1) // make the grid lines light
        .attr('stroke-dasharray', '2,2'); // optional: make the grid lines dashed


// Add Y axis and horizontal grid lines
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.cumulativeXP)])
        .range([height, 0]);

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll(".tick line")
        .clone()
        .attr('x2', width)
        .attr('stroke-opacity', 0.1) // make the grid lines light
        .attr('stroke-dasharray', '2,2'); // optional: make the grid lines dashed


    // Add the line
    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#00A67E ')
        .attr('stroke-width', 2)
        .attr('d', d3.line()
            .x(d => x(new Date(d.createdAt)))
            .y(d => y(d.cumulativeXP))
        );

    // Create a tooltip
    const tooltip = d3.select('#chart-container')
        .append('div')
        .style('opacity', 0)
        .attr('class', 'tooltip')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '2px')
        .style('border-radius', '5px')
        .style('padding', '5px');

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function(event, d) {
        tooltip.style('opacity', 1);
    };
    const mousemove = function(event, d) {
        const [x, y] = d3.pointer(event, svg.node()); // Get cursor position relative to the SVG container
        tooltip.html(`Name: ${extractNameFromPath(d.path)}<br>XP Gained: ${formatXP(d.amount)}<br>Date: ${new Date(d.createdAt).toLocaleDateString('en-GB')}`)
            .style('left', (x + 690) + 'px') // Position tooltip slightly right of the cursor
            .style('top', (y + 350) + 'px'); // Position tooltip slightly below the cursor
    };
    const mouseleave = function(event, d) {
        tooltip.style('opacity', 0);
    };

    // Add the points with the tooltips
    svg.append('g')
        .selectAll('dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => x(new Date(d.createdAt)))
        .attr('cy', d => y(d.cumulativeXP))
        .attr('r', 5)
        .attr('fill', '#66D1C1')
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave);
}


function extractNameFromPath(path) {
    const segments = path.split('/');
    return segments[segments.length - 1]; // Return the last segment
}



const auditRatioGraph = (userData) => {
    const user = userData;
    const totalUp = user.totalUp;
    const totalDown = user.totalDown;
    const auditsDone = totalUp; // Audits Done
    const auditsReceived = totalDown; // Audits Received

    const maxBarWidth = 300;
    const barHeight = 30;
    const barSpacing = 10;

    // Calculate bar lengths based on the total number of audits done and received
    const barWidthDone = (auditsDone / totalDown) * maxBarWidth;
    const barWidthReceived = (auditsReceived / totalDown) * maxBarWidth;

    // Calculate the audits ratio
    const auditRatio = auditsDone / auditsReceived;

    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', maxBarWidth + 120); // Adjust width to fit text
    svg.setAttribute('height', barHeight * 8); // Adjust height to accommodate bars and text

    // Create 'Audits Done' bar
    const barDone = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    barDone.setAttribute('x', 10); // Position the 'Audits Done' bar
    barDone.setAttribute('y', barSpacing); // Position the 'Audits Done' bar
    barDone.setAttribute('width', barWidthDone); // Width based on 'Audits Done'
    barDone.setAttribute('height', barHeight);
    barDone.setAttribute('fill', '#fca762'); // Color for 'Audits Done'

    // Create 'Audits Received' bar
    const barReceived = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    barReceived.setAttribute('x', 10); // Position the 'Audits Received' bar
    barReceived.setAttribute('y', barHeight + barSpacing * 2); // Position the 'Audits Received' bar
    barReceived.setAttribute('width', barWidthReceived); // Width based on 'Audits Received'
    barReceived.setAttribute('height', barHeight);
    barReceived.setAttribute('fill', '#117ba1'); // Color for 'Audits Received'

    // Append bars to SVG
    svg.appendChild(barDone);
    svg.appendChild(barReceived);

    // Display the audits ratio (topmost text)
    const textRatio = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textRatio.setAttribute('x', (maxBarWidth + 120) / 2); // Position text for the audits ratio in the center
    textRatio.setAttribute('y', barSpacing + 20); // Position text for the audits ratio (vertically aligned)
    textRatio.setAttribute('font-size', '20'); // Increase font size for the audits ratio
    textRatio.setAttribute('text-anchor', 'middle'); // Center align text horizontally
    textRatio.textContent = `Audits ratio: ${auditRatio.toFixed(1)}`;

    // Display text labels for 'Audits Done' and 'Audits Received' in the middle of bars
    const textDone = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textDone.setAttribute('x', 10 + barWidthDone / 2); // Position text for 'Audits Done'
    textDone.setAttribute('y', barHeight / 2 + barSpacing); // Position text for 'Audits Done' (vertically centered)
    textDone.setAttribute('font-size', '14');
    textDone.setAttribute('text-anchor', 'middle'); // Center align text horizontally
    textDone.setAttribute('dominant-baseline', 'middle'); // Center align text vertically
    textDone.textContent = `Done: ${(auditsDone/1000000).toFixed(2)} MB`;

    const textReceived = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textReceived.setAttribute('x', 10 + barWidthReceived / 2); // Position text for 'Audits Received'
    textReceived.setAttribute('y', barHeight * 1.5 + barSpacing * 2); // Position text for 'Audits Received' (vertically centered)
    textReceived.setAttribute('font-size', '14');
    textReceived.setAttribute('text-anchor', 'middle'); // Center align text horizontally
    textReceived.setAttribute('dominant-baseline', 'middle'); // Center align text vertically
    textReceived.textContent = `Received: ${(auditsReceived / 1000000).toFixed(2)} MB`;

    // Calculate the center position of the SVG element vertically
    const svgHeight = barHeight * 8; // Assuming the SVG height is 8 times the bar height
    const centerVertically = svgHeight / 2;

    // Calculate y positions to center elements vertically
    const barDoneY = centerVertically - barHeight - barSpacing;
    const barReceivedY = centerVertically + barSpacing;
    const textDoneY = barDoneY + (barHeight/2);
    const textReceivedY = barReceivedY + (barHeight/2);
    const textRatioY = barSpacing + 20;

    // Set the y positions for elements
    barDone.setAttribute('y', barDoneY);
    barReceived.setAttribute('y', barReceivedY);
    textDone.setAttribute('y', textDoneY);
    textReceived.setAttribute('y', textReceivedY);
    textRatio.setAttribute('y', textRatioY);

    // Append text elements to the Bar elements for better centering

    // Append text labels to SVG
    svg.appendChild(textDone);
    svg.appendChild(textReceived);
    svg.appendChild(textRatio);

    // Append the SVG to the 'auditsGraph' div
    const auditsGraphDiv = document.getElementById('audits-graph');
    auditsGraphDiv.innerHTML = ''; // Clear previous content
    auditsGraphDiv.appendChild(svg);
};
export {auditRatioGraph}