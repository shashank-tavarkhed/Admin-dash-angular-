import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
// import { DimensionsType, ScaleType, AccessorType } from '../utils/types';
// import male from '../../assets/male.svg'


import { Subject } from 'rxjs';
import details from "../../assets/data.json"
import { DataService } from '../data.service';

export interface ScaleType {
(d: object): any,
range: Function,
domain: Function,
ticks: Function,
}


interface AccessorType {
(value: any): any
}

export interface DimensionsType {
marginTop: number
marginRight: number
marginBottom: number
marginLeft: number
height: number
width: number
boundedHeight?: number
boundedWidth?: number
}


@Component({
selector: 'app-one',
templateUrl: './one.component.html',
styleUrls: ['./one.component.css']
})
export class OneComponent implements OnInit, AfterViewInit {
@ViewChild('ageChart') ageChart: ElementRef | undefined;
@ViewChild('MFRchart') MFRChart:ElementRef;
@ViewChild('performanceChart') performanceChart:ElementRef;

dimensionsAGE:DimensionsType;
dimensionsMFR:DimensionsType;
dimensionsPER:DimensionsType;

data:Array<object>

employees:number
deptData=[];

constructor( private dataService:DataService) {
}

drawHist(){

  const ageAccessor: AccessorType = d => d.age;
  const yAccessor = d => d.length;

  //canvas
  const wrapper = d3.select("#hist-age")
      .append("svg")
        .attr("width",this.dimensionsAGE.width)
        .attr("height",this.dimensionsAGE.height);

  const bounds = wrapper.append("g")
        .style("transform",`translate(${this.dimensionsAGE.marginLeft}px,${this.dimensionsAGE.marginTop}px)`).attr("class", "bins")

  //scales
  const xScale:any = d3.scaleLinear()
    .domain(d3.extent(this.data, ageAccessor))
    .range([0,this.dimensionsAGE.boundedWidth])
    .nice();


  //bins
  const binsGenerator = d3.bin()
    .domain([0,d3.max(this.data,(d:any)=>d.age)])
    .value(d=>d)
    .thresholds(15);

  const bins =binsGenerator(this.data.map((d:any)=>d.age))

  const yScale:any = d3.scaleLinear()
    .domain([0,d3.max(bins, yAccessor)])
    .range([this.dimensionsAGE.boundedHeight,0])
    .nice()

    const updateTransition = d3.transition().duration(500)


  // const binGroup = bounds.append('g')
  const binGroups = bounds.selectAll('.bin')
    .data(bins)
    .enter()
    .append("g")

  const barPadding = 1;


  const barRects = binGroups.append('rect')
    .transition(updateTransition)
      .attr("x",d=>xScale(d.x0)+barPadding/2)
      .attr("width",d=>d3.max([0,xScale(d.x1)-xScale(d.x0)-barPadding]))
      .attr("y",this.dimensionsAGE.boundedHeight)
      .attr("height",0)
      .transition().duration(600)
      .attr("y",d=>yScale(yAccessor(d)))
      .attr("height", d=> this.dimensionsAGE.boundedHeight - yScale(yAccessor(d)))
      .attr("fill", "#66c0ff")



  const barTexts = binGroups.filter(yAccessor).append('text')
      .attr("x", d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
      .text(yAccessor)
      .style("text-anchor", "middle")
      .attr("fill", "#006c96af")
      .style("font-size", "12px")
      .style("opacity",0)
      .attr("y", this.dimensionsAGE.boundedHeight)
      .transition().duration(1500)
      .style("opacity",1)
      .attr("y", d => yScale(yAccessor(d)) - 5)

  const xAxisGenerator = d3.axisBottom(xScale)

  const xAxis = bounds.append('g')
    .call(xAxisGenerator)
    .style("transform", `translateY(${this.dimensionsAGE.boundedHeight}px)`)
    .attr("color","#006c96")

  const mean = d3.mean(this.data,(d:any)=>d.age)
  const meanLine = bounds.append('line')
    .attr("x1",0)
    .attr("x2",0)
    .attr("y1",-15)
    .attr("stroke-dasharray", "4px 4px")
    .attr("stroke","#ed6d64")
    .attr("y2",this.dimensionsAGE.boundedHeight)
    .transition().duration(2000)
    .attr("x1",xScale(mean))
    .attr("x2",xScale(mean))

  const meanLabel = bounds.append('text')
  .attr("x",xScale(mean))
  .style('text-anchor',"middle")
  .style("font-size","12px")
  .style("fill","#ed6d64")
  .text(`MEAN AGE: ${Math.round(mean)}`)
  .attr("y",-300)
  .transition().duration(2000)
  .attr("y",-20)

  const chartLabel = bounds.append("text")
  .attr("x",(this.dimensionsAGE.width/2)-20)
  .style("font-size","16px")
  .style("font-weight","bold")
  .style("fill","#6495ED")
  .text(`AGE CHART`)
  .style("text-anchor", "middle")
  .attr("y",this.dimensionsAGE.height+20)
  .transition().duration(1000)
  .attr("y",this.dimensionsAGE.boundedHeight + 40 )

}


MFRchart(){
  let xAccessor = d => d.gender;
  let yAccessor = d=>d.length;

  let Mpercent = Math.round(((this.data.map(d=>d).filter((d:any)=>d.gender =="male").length)/(this.data.length))*100);
  let Fpercent = Math.round(((this.data.map(d=>d).filter((d:any)=>d.gender =="female").length)/(this.data.length))*100);


  let wrapper = d3.select("#MFRchart").append("svg")
    .attr("height",this.dimensionsMFR.height)
    .attr("width",this.dimensionsMFR.width)

  const height = 200;
  const width =200;
  const buffer = 15;

  let yScale = d3.scaleLinear()
    .domain([0,100])
    .range([height-buffer,buffer])

  let bg = wrapper.append("svg")
    .attr("x",this.dimensionsMFR.width/2 - (width/2))
    .attr("y",this.dimensionsMFR.height/2 - (height/2))
    .html(`<svg viewBox="0 0 24 24" ><path d="M5.5 22v-7.5H4V9c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v5.5H9.5V22h-4zM18 22v-6h3l-2.54-7.63C18.18 7.55 17.42 7 16.56 7h-.12c-.86 0-1.63.55-1.9 1.37L12 16h3v6h3zM7.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm9 0c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2z"/></svg>`)
    .attr("fill","lightgrey")
    .attr("height",height)
    .attr("width",width)

  let iconF = wrapper.append("svg")
  .attr("x",this.dimensionsMFR.width/2 - (width/2))
  .attr("y",this.dimensionsMFR.height/2 - (height/2))
  .attr("mask", "url(#wxyz)")
  .html(`<svg viewBox="0 0 24 24" ><path d="M5.5 22v-7.5H4V9c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v5.5H9.5V22h-4zM18 22v-6h3l-2.54-7.63C18.18 7.55 17.42 7 16.56 7h-.12c-.86 0-1.63.55-1.9 1.37L12 16h3v6h3zM7.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm9 0c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2z"/></svg>`)
  .attr("fill","#F5B5C4")
  .attr("height",height)
  .attr("width",width)

  let iconM = wrapper.append("svg")
  .attr("x",this.dimensionsMFR.width/2 - (width/2))
  .attr("y",this.dimensionsMFR.height/2 - (height/2))
  .attr("mask", "url(#abcd)")
  .html(`<svg viewBox="0 0 24 24" ><path d="M5.5 22v-7.5H4V9c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v5.5H9.5V22h-4zM18 22v-6h3l-2.54-7.63C18.18 7.55 17.42 7 16.56 7h-.12c-.86 0-1.63.55-1.9 1.37L12 16h3v6h3zM7.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm9 0c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2z"/></svg>`)
  .attr("fill","#A59FE6")
  .attr("height",height)
  .attr("width",width)

  const rect = iconM.append('mask').attr("id","abcd")
  .append("rect")
    .attr("x",0)
    .attr("y",height)
    .attr('height',0)
    .attr("width",width/2 -3)
    .attr("fill", "#ffffff")
    .transition().duration(2000)
    .attr("y",yScale(Mpercent))
    .attr("height",height-yScale(Mpercent)-buffer)

  const rect2 = iconF.append('mask').attr("id","wxyz").append("rect")
    .attr("x",width/2)
    .attr("y",height)
    .attr('height',0)
    .attr("width",width/2 +2 )
    .attr("fill", "#ffffff")
    .transition().duration(2000)
    .attr("y",yScale(Fpercent))
    .attr("height",height-yScale(Fpercent)-buffer)

  const Mlabel = wrapper.append('text')
    .attr("x",50)
    .style('text-anchor',"middle")
    .attr("y",height/2+20)
    .style("font-size","24px")
    .style("fill","#062b9b")
    .transition().duration(2000)
    .text(`${Mpercent}%`)

    const Flabel = wrapper.append('text')
      .attr("x",this.dimensionsMFR.width-50)
      .style('text-anchor',"middle")
      .attr("y",height/2+20)
      .style("font-size","24px")
      .style("fill","#E86F87")
      .text(`${Fpercent}%`)

    const chartLabel = wrapper.append('text')
    .attr("text-anchor","middle")
    .attr("y",this.dimensionsMFR.height-5)
    .attr("x",this.dimensionsMFR.width/2)
    .attr("font-size","14px")
    .attr("font-weight","bold")
    .attr("fill","#6495ED")
    .text("GENDER RATIO")
  }


perChart(){
  const depts = [...new Set( this.data.map((d:any)=>d.dept))];
  const color = ["#675ee6","#69a0ff","#00E8C0","#8eff3d","#ff3dff","#FF5983"]
  const colors = ["#675ee660","#69a0ff60","#00E8C060","#8eff3d60","#ff3dff50","#FF598360"]

  const trans = d3.transition().duration(1500)
  const newtrans = trans.delay(2000).duration(1000)

  const wrapper = d3.select('#performanceChart').append("svg")
    .attr("height",this.dimensionsPER.height)
    .attr("width",this.dimensionsPER.width)

  const bounds = wrapper.append("g")
    .style("transform",`translate(${this.dimensionsPER.marginLeft}px,${this.dimensionsPER.marginTop}px)`)

  const deptgroup = bounds.append('g')

  const deptGroups = deptgroup.selectAll('g')
    .data(depts)
    .enter()
    .append('g')

  const circleRadiusBuffer = 7

  const xScaleTop = d3.scaleLinear()
    .domain([0,depts.length])
    .range([0,this.dimensionsPER.boundedWidth])

  const xScaleBase = d3.scaleLinear()
    .domain(d3.extent(this.data,(d:any)=>d.salary))
    .range([circleRadiusBuffer,xScaleTop(1)-circleRadiusBuffer])


  const yScale =d3.scaleLinear()
    .domain([0,10])
    .range([this.dimensionsPER.boundedHeight-circleRadiusBuffer-1,circleRadiusBuffer+1])

  const rects = deptGroups.append("rect")
    .attr("x",(d,i)=>xScaleTop(i))
    .attr("y",0)
    .attr("height",this.dimensionsPER.boundedHeight)
    .attr("width",this.dimensionsPER.boundedWidth /depts.length)
    .attr("fill",(d,i)=> colors[i])


  const circleGroup = bounds.append("g")

  const circleGroups = circleGroup.selectAll('g')
    .data(this.data)
    .enter()
    .append('g')

  const circs = circleGroups.append("circle")
    .style("opacity",0)
    .attr("cx",(d:any)=>{
      const j = depts.indexOf(d.dept);
      return xScaleTop(j)+xScaleBase(d.salary)
    })
    .attr("cy",(d:any)=> yScale(d.performance))
    .attr("r",circleRadiusBuffer)
    .attr("fill",(d:any)=>{
      const j = depts.indexOf(d.dept);
      return color[j]
    })
    .attr("stroke","#00000060")
    .attr("stroke-width","0.8px")
    .transition().delay((d,i)=> i*20)
    // .transition().duration(2000)
    .style("opacity",1)

    const yScaleAxisGenerator = d3.axisLeft(yScale)
    const yScaleAxis = bounds.append('g')
    .transition().duration(1000)
    .call(yScaleAxisGenerator)
      .attr('color',"#6495ED")

    const yLabel = wrapper.append("text")
    .attr("x",-this.dimensionsPER.height/2)
    .attr("y",25)
    .attr("text-anchor","middle")
    .attr("font-size","12px")
    .text("PERFORMANCE RATES")
    .style('transform',`rotate(-90deg)`)
    .attr('fill',"#6495ED")
    .style("opacity",0)
    .transition().delay(500).duration(1000)
    .style("opacity",1)


    const xTopLabels = bounds.append('g').selectAll('g')
      .data(depts)
      .enter()
      .append('text')
        .attr("text-anchor","middle")
          .attr("font-weight","bold")
        .attr("x",(d,i)=> xScaleTop(i)+50)
        .attr("font-size","12px") //////////////////////////////////////////////changeee font
        .attr("fill",(d,i)=>color[i])
        .text((d,i)=>depts[i])
        .attr("y",-300)
        .transition().duration(300)
        .attr("y",-10)

    const boundary =[d3.min(this.data,(d:any)=>d.salary),d3.max(this.data,(d:any)=>d.salary)]

    const xBaseLabels = bounds.append('g').selectAll('g')
      .data(depts)
      .enter()
      .append('g')
        .append('svg')

    xBaseLabels.append('line')
      .attr('y1', this.dimensionsPER.boundedHeight +10)
      .attr('y2',this.dimensionsPER.boundedHeight +10  )
      .attr("x1",(d,i)=> xScaleTop(i)+xScaleBase(boundary[0]))
      .attr("x2",(d,i)=> xScaleTop(i)+xScaleBase(boundary[0]))
      .style("stroke","#6495ED")
      .transition().duration(1500)
      .attr("x2",(d,i)=> xScaleTop(i)+xScaleBase(boundary[1]))

    xBaseLabels.append("circle")
      .attr("cx",(d,i)=> xScaleTop(i)+xScaleBase(boundary[0]))
      .attr("cy",this.dimensionsPER.boundedHeight +10)
      .attr("r",5)
      .attr("fill","#ff4053")
      .attr("stroke","#00000060")
      .attr("stroke-width","0.8px")
      .transition().duration(1500)
      .attr("cx",(d,i)=> xScaleTop(i)+xScaleBase(boundary[1]))



    xBaseLabels.append("circle")
      .attr("cx",(d,i)=> xScaleTop(i)+xScaleBase(boundary[0]))
      .attr("r",5)
      .attr("fill","#40ff5c")
      .attr("stroke","#00000060")
      .attr("stroke-width","0.8px")
      .attr("cy",this.dimensionsPER.boundedHeight +10)


    const xLabel=wrapper.append('svg')

    xLabel.append('line')
    .attr('y1', this.dimensionsPER.height -35)
    .attr('y2',this.dimensionsPER.height -35)
    .attr("x1", this.dimensionsPER.marginLeft+20)
    .attr("x2", this.dimensionsPER.marginLeft+20)
    .style("stroke","#6495ED")
    .transition().duration(1500)
    .attr("x2",this.dimensionsPER.width-this.dimensionsPER.marginRight-20)
    xLabel.append("circle")
    .attr("cx",this.dimensionsPER.marginLeft+20)
    .attr("cy",this.dimensionsPER.height -35)
    .attr("r",8)
    .attr("fill","#40ff5c")
    .attr("stroke","#00000060")
    .attr("stroke-width","0.8px")
    xLabel.append("circle")
    .attr("cy",this.dimensionsPER.height -35)
    .attr("cx",this.dimensionsPER.marginLeft+20)
    .attr("r",8)
    .attr("fill","#ff4053")
    .attr("stroke","#00000060")
    .attr("stroke-width","0.8px")
    .transition().duration(1500)
    .attr("cx",this.dimensionsPER.width-this.dimensionsPER.marginRight-20)

  xLabel.append("text")
    .attr("text-anchor","middle")
    .attr("x",this.dimensionsPER.width-this.dimensionsPER.marginRight-50)
    .attr("y",this.dimensionsPER.height -5)
    .attr("font-size","12px") //////////////////////////////////////////////changeee font
    .attr("fill","#ff4053")
    .text("HIGH SALARY")


  xLabel.append("text")
    .attr("text-anchor","middle")
    .attr("x",this.dimensionsPER.marginLeft+50)
    .attr("y",this.dimensionsPER.height-5)
    .attr("font-size","12px") //////////////////////////////////////////////changeee font
    .attr("fill",(d,i)=>color[i])
    .attr('fill',"#40ff5c")
    .text("LOW SALARY")

  const chartLabel = wrapper.append("text")
    .attr("text-anchor","middle")
    .attr("y",this.dimensionsPER.height-10)
    .attr("x",this.dimensionsPER.width/2)
    .attr("font-weight","bold")
    .attr("fill","#6495ED")
    .text("PERFORMANCE CHART")



}

ngAfterViewInit() {
  //Age histogram chart
  this.dimensionsAGE={
    width: this.ageChart?.nativeElement.clientWidth,
    height: this.ageChart?.nativeElement.clientHeight,
    marginTop:40,
    marginBottom:50,
    marginLeft:20,
    marginRight:20,
    }

  this.dimensionsAGE = {
    ...this.dimensionsAGE,
    boundedHeight: Math.max(this.dimensionsAGE.height - this.dimensionsAGE.marginTop - this.dimensionsAGE.marginBottom, 0),
    boundedWidth: Math.max(this.dimensionsAGE.width - this.dimensionsAGE.marginLeft - this.dimensionsAGE.marginRight, 0),
  }

  this.drawHist();

  //MFR chart

  this.dimensionsMFR={
    width: this.MFRChart.nativeElement.clientWidth,
    height: this.MFRChart.nativeElement.clientHeight,
    marginTop:20,
    marginBottom:50,
    marginLeft:0,
    marginRight:0,
    }

  this.dimensionsMFR = {
    ...this.dimensionsMFR,
    boundedHeight: Math.max(this.dimensionsMFR.height - this.dimensionsMFR.marginTop - this.dimensionsMFR.marginBottom, 0),
    boundedWidth: Math.max(this.dimensionsMFR.width - this.dimensionsMFR.marginLeft - this.dimensionsMFR.marginRight, 0),
  }

  this.MFRchart();


  //performanceChart
  this.dimensionsPER ={
    height: this.performanceChart.nativeElement.clientHeight,
    width:this.performanceChart.nativeElement.clientWidth,
    marginTop: 50,
    marginBottom: 80,
    marginLeft:50,
    marginRight:5

  }
  this.dimensionsPER = {
    ...this.dimensionsPER,
    boundedHeight: Math.max(this.dimensionsPER.height - this.dimensionsPER.marginTop - this.dimensionsPER.marginBottom, 0),
    boundedWidth: Math.max(this.dimensionsPER.width - this.dimensionsPER.marginLeft - this.dimensionsPER.marginRight, 0),
  }
  this.perChart();
}

ngOnInit(): void {
  this.data = details;
  this.employees = this.data.length;


  const depts = [...new Set( this.data.map((d:any)=>d.dept))];
  const color = ["#675ee6","#69a0ff","#00E8C0","#8eff3d","#ff3dff","#FF5983"]
  const colors = ["#675ee660","#69a0ff60","#00E8C060","#8eff3d60","#ff3dff50","#FF598360"]

  for(let el of depts){
    const val = this.data.filter((d:any)=>d.dept==el).reduce((c:any,el:any)=>1+c,0)
    this.deptData.push({name:el,total:val})
  }



}

}
