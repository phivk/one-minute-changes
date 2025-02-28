import { useEffect, useRef } from "react";
import * as d3 from "d3";

type DataPoint = {
  date: string;
  value: number;
};

interface SimNode extends d3.SimulationNodeDatum {
  x: number;
  y: number;
  data: DataPoint;
  originalX: number;
  originalY: number;
}

const useD3BeeswarmChart = (
  data: DataPoint[],
  width: number,
  height: number,
  margin = { top: 20, right: 20, bottom: 40, left: 40 }
) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear existing chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);

    // Set up scales
    const x = d3
      .scaleBand()
      .range([margin.left, width - margin.right])
      .padding(0.1)
      .domain(data.map((d) => d.date));

    const y = d3
      .scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain([0, d3.max(data, (d) => d.value) || 0])
      .nice();

    // Create nodes for the simulation
    const nodes: SimNode[] = data.map((d) => ({
      data: d,
      x: x(d.date)! + x.bandwidth() / 2,
      y: y(d.value),
      originalX: x(d.date)! + x.bandwidth() / 2,
      originalY: y(d.value),
    }));

    // Create force simulation
    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force("x", d3.forceX<SimNode>((d) => d.originalX).strength(0.2))
      .force("y", d3.forceY<SimNode>((d) => d.originalY).strength(0.2))
      .force("collide", d3.forceCollide(6).strength(0.8))
      .stop();

    // Run the simulation
    for (let i = 0; i < 120; ++i) simulation.tick();

    // Add circles using simulated positions
    svg
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 6)
      .attr("fill", "#60a5fa")
      .attr("opacity", 0.6);

    // Add axes
    const xAxis = d3
      .axisBottom(x)
      .tickFormat((d) => (data.length <= 10 ? d.toString() : ""));

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .attr("fill", "#9ca3af");

    const yAxis = d3
      .axisLeft(y)
      .ticks(5)
      .tickFormat((d) => d.toString());

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .selectAll("text")
      .attr("fill", "#9ca3af");

    // Style axes
    svg.selectAll(".domain").attr("stroke", "#4f46e5").attr("opacity", 0.3);
    svg.selectAll(".tick line").attr("stroke", "#4f46e5").attr("opacity", 0.3);
  }, [data, width, height, margin]);

  return svgRef;
};

export default useD3BeeswarmChart;
