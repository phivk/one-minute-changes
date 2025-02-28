import { useEffect, useRef } from "react";
import * as d3 from "d3";

type DataPoint = {
  date: string;
  value: number;
};

const useD3ScatterPlot = (
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

    // Add crosses
    const crossSize = 6; // size of the cross in pixels

    // Create group for each data point
    const points = svg
      .selectAll("g.point")
      .data(data)
      .join("g")
      .attr("class", "point")
      .attr(
        "transform",
        (d) => `translate(${x(d.date)! + x.bandwidth() / 2}, ${y(d.value)})`
      );

    // Add the crosses (using two lines for each point)
    points.each(function () {
      const point = d3.select(this);
      // Diagonal line from top-left to bottom-right
      point
        .append("line")
        .attr("x1", -crossSize)
        .attr("y1", -crossSize)
        .attr("x2", crossSize)
        .attr("y2", crossSize)
        .attr("stroke", "#60a5fa")
        .attr("stroke-width", 2);

      // Diagonal line from top-right to bottom-left
      point
        .append("line")
        .attr("x1", crossSize)
        .attr("y1", -crossSize)
        .attr("x2", -crossSize)
        .attr("y2", crossSize)
        .attr("stroke", "#60a5fa")
        .attr("stroke-width", 2);
    });

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

export default useD3ScatterPlot;
