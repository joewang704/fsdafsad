function deleteGraph() {
  $("#graph_svg").empty()
}

function createGraph(data) {
  let group = 0
  data = Object.values(data)
  /*const data = {
    id: "-01XupAWZEXbdNbxNg5mEg",
    name: "18 Degrees Neighborhood Grill",
    showLabel: true,
    group: 0
  }*/
  data = data.map(entry => Object.assign(entry, { group }))

  const graph = {
    nodes: data,
    links: [],
  }

  let nodes = graph.nodes
  let links = graph.links

  const svg = d3.select("svg")
  const width = +svg.attr("width")
  const height = +svg.attr("height")

  const simulationLinks = d3
    .forceLink()
    .id(d => d.id)
    .distance(d => d.source.group === d.target.group ? 50 : 100)

  const simulation = d3.forceSimulation()
    .force("link", simulationLinks)
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))

  const linkGroup = svg.append("g")
    .attr("class", "links")
  const nodeGroup = svg.append("g")
    .attr("class", "nodes")
  const textGroup = svg.append("g")
    .attr("class", "texts")

  let linkElements, nodeElements, textElements

  //getNeighbors("-01XupAWZEXbdNbxNg5mEg")
  /*console.log(data)
  console.log(graph)
  console.log(graph.nodes)
  console.log(graph.nodes[0])
  console.log(graph.nodes[0].id)
  console.log(graph.nodes)
  console.log('wtf')
  console.log(graph.nodes[0].group)*/
  const ids = graph.nodes.map(({ id }) => id)
  getNeighbors(ids)

  function getNeighbors(ids) {
    const colors = ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026']
    const sources = ids.map(id => ({ id }))
    const exclude = nodes.map(({ id }) => ({ id }))
    console.log(exclude)
    $.ajax("/recommendation", {
      data: JSON.stringify({ sources, exclude }),
      contentType: 'application/json',
      type: 'POST',
      success: res => {
        group++
        const data = res.slice(1)
        const color = d3.scaleLinear().domain([0,group])
          .interpolate(d3.interpolateHcl)
          .range([d3.rgb("#FF5F5F"), d3.rgb('#FFF400')]);
        data.forEach(restaurant => {
          links.push({ source: ids[ids.length - 1], target: restaurant.id })
          if (ids.length > 1) {
            for (let i = 0; i < ids.length; i++) {
              const secondIndex = (i+1) % (ids.length)
              links.push({ source: ids[i], target: ids[secondIndex] })
            }
          }
          nodes.push(Object.assign(restaurant, { group }))
          console.log(nodes)
        })

        nodes.forEach(node => {
          if (ids.includes(node.id)) {
            node.showLabel = true
          }
        })

        linkElements = linkGroup.selectAll("line").data(links, link => {
          return link.target.id + link.source.id
        })

        linkElements.exit().remove()

        const linkEnter = linkElements.enter().append("line")
          .attr("stroke-width", d => 2)
          .attr("fill", function(d) { return 'blue'; })

        linkElements = linkEnter.merge(linkElements)
        
        nodeElements = nodeGroup.selectAll("circle").data(nodes, node => node.id)
          .attr("fill", d => color(d.group))

        nodeElements.exit().remove()

        const nodeEnter = nodeElements.enter().append("circle")
            .attr("r", d => {
              const distance = 20 - d.group * 2
              return distance > 10 ? distance : 10
            })
            .attr("fill", d => color(d.group))
            .on("click", d => d.showLabel || getNeighbors([d.id]))
            .on("mouseover", function(d) {
              d3.select(this).style('stroke', '#788FFF')
              d3.select(this).style('stroke-width', 5)
              showInfo(d)
            })
            .on("mouseout", function(d) {
              d3.select(this).style('stroke', undefined)
              d3.select(this).style('stroke-width', undefined)
            })

        nodeElements = nodeEnter.merge(nodeElements)

        const labelNodes = nodes.filter(node => node.showLabel)
        textElements = textGroup.selectAll("text").data(labelNodes, node => node.id)

        textElements.exit().remove()

        const textEnter = textElements.enter()
          .append('text')
          .text(function (node) { return node.name })
          .attr('font-size', 15)
          .attr('dx', 22)
          .attr('dy', 4)

        textElements = textEnter.merge(textElements)

        simulation
          .nodes(nodes)
          .on("tick", ticked);

        simulation.force("link")
          .links(links)

        simulation.alpha(1).restart()
        
        function ticked() {
          linkElements
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
          nodeElements.attr('cx', node => node.x).attr('cy', node => node.y)
          textElements
            .attr('x', function (node) { return node.x })
            .attr('y', function (node) { return node.y })
        }
      }
    })
  }

  function showInfo(data) {
    const { name, stars, address, neighborhood, city, state, postal_code, latitude, longitude } = data
    console.log(data)
    $("#right-panel").html(`
      <div id="info-title">${name}</div>
      <select class="rating" data-current-rating="${stars}" autocomplete="off">
        <option value></option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <div id="map">
        <img id="mapimg" src="https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=14&size=250x250&key=AIzaSyBkBxZG3I2hhzRd3lOH3B7i8rvfOjXqUUQ"/>
      </div>
      <div id="address">
        ${address}</br>
        ${neighborhood}${neighborhood && '</br>'}
        ${city}, ${state} ${postal_code}</br>
      </div>
    `).promise().done(function(){
      $('.rating').each(function() {
        var rating = $(this).data('current-rating')
        $(this).barrating({
          theme: 'fontawesome-stars-o',
          initialRating: rating,
          readonly: true,
        })
      })
      $("#mapimg").attr('src', )
    })
  }
  /*function redrawGraph() {
    // Apply the general update pattern to the nodes.
    node = node.data(graph.nodes, function(d) { return d })
    node.exit().remove()
    node = node
      .enter()
      .merge(node)
      .append(g)
      .attr("class", "node")
    
    node.append("circle")
        .attr("fill", function(d) { return "blue"; })
        .attr("r", 5)

    node.append("text")
        .attr("dx", 5)
        .attr("dy", 5)
        .text(function(d) { return d.restaurant; })
    node.on("click", d => getNeighbors(d.id))

    // Apply the general update pattern to the links.
    if (graph.links) {
      link = link.data(graph.links, function(d) { return d.source.id + "-" + d.target.id; });
      link.exit().remove();
      link = link.enter().append("line").merge(link);
    }

    // Update and restart the simulation.
    simulation.nodes(graph.nodes);
    simulation.force("link").links(graph.links);
    simulation.alpha(1).restart();
  }*/
}
