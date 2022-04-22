import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import rawData from "../../assets/data.json";
import * as d3 from "d3";

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
  selector: 'app-two',
  templateUrl: './two.component.html',
  styleUrls: ['./two.component.css']
})
export class TwoComponent implements OnInit,AfterViewInit {
  @ViewChild('chart') element:ElementRef
  @ViewChild('donut') donutEl:ElementRef;
  data:any;

  chartdim:DimensionsType;
  donutdim:DimensionsType;
  EOM:any;
  nationality:any;
  salary:any;
  TOM:any;

  constructor() { }

  sunburst(){
    const depts = [...new Set(this.data.map(d=>d.dept))]
    let deptData = [];
    let teamData =[]

    for(let el of depts){
      const deptVal = this.data.filter(d=>d.dept==el);
      const teamA = deptVal.filter(d=>d.team == "A").length
      const teamB = deptVal.filter(d=>d.team == "B").length
      const teamC = deptVal.filter(d=>d.team == "C").length
      teamData.push(teamA)
      teamData.push(teamB)
      teamData.push(teamC)
      deptData.push({
        name: el,
        count: deptVal.length,
        team: [teamA,teamB,teamC]
      })
    }
    // console.log('DD',teamData);

    const color = ["#675ee6","#69a0ff","#00E8C0","#8eff3d","#ff3dff","#FF5983"];
    const colors = ["#675ee660","#69a0ff60","#00E8C060","#8eff3d60","#ff3dff50","#FF598360"]


    const xScaleA = d3.scaleLinear()
      .domain([0,this.data.length])
      .range([0,Math.PI*2])

    const getContData=(num)=>{
      let x = 0;
      for(let z = 0; z< num;z++){
        x+= xScaleA(deptData[z].count)
      }
      return x
    }

    // console.log('xzczxczxcz',deptData[1]["count"]);

    const getContDataTeam=(num)=>{
      if (num<0) return 0
      let x = 0;
      for(let z = (num>=3?num-(num % 3):0);z<=num;z++){
        x+= xScaleA(teamData[z])
      }
      return x
    }


    const wrapper = d3.select('.wrapper').append('svg')
      .attr('height',this.chartdim.height)
      .attr('width',this.chartdim.width)

    const bounds = wrapper.append('g')
      .style('transform',`translate(${(this.chartdim.boundedWidth/2)+this.chartdim.marginLeft -100}px,${(this.chartdim.boundedHeight/2)+this.chartdim.marginTop}px)`)

    const maxradius = Math.min(this.chartdim.boundedHeight,this.chartdim.boundedWidth)/2;

    const minradius = 60;

    let arc = d3.arc()
      .startAngle((d,i)=>getContData(i))
      .endAngle((d,i)=>getContData(i+1))
      .innerRadius(minradius)
      .outerRadius(((maxradius-minradius)/2) +minradius)
      .padAngle(0.01)

    let arca = d3.arc()
      .startAngle((d,i)=>{
        return getContDataTeam(i-1)+getContData(Math.floor((i-1+0)/3))
      })
      .endAngle((d,i)=>getContData(Math.floor((i+0)/3))+getContDataTeam(i)) //(d,i)=> getContData(Math.floor(i+1/3)) + getContDataTeam(i)+getContDataTeam(i+1)
      .innerRadius(((maxradius-minradius)/2) +minradius)
      .outerRadius((((maxradius-minradius)/2)*2) +minradius)
      .padAngle(0.01)


    const arcBin = bounds.append('g')
      .selectAll('g')
      .data(deptData)
      .enter()

    const abc = arcBin.append('path')
      .attr("fill",(d,i)=>color[i])
      .attr('id',(d,i)=>`arcA${i}`)
      .transition().delay((d,i)=>i*100)
      .attr("d",arc)

    bounds.append("g").selectAll('g')
      .data(teamData)
      .enter()
      .append('path')
      .attr("fill",(d,i)=>colors[Math.floor(i/3)])
      .transition().delay(800).delay((d,i)=>i*100)
      .attr("d",arca)


    const arcLabels = arcBin.append('g')

      arcLabels.append("text")
      .attr("font-size","14px")
      .attr("fill","#6495ED")
      .attr("x",350)
      .attr("opacity",0)
      .attr('y',(d,i)=>(i*30)-60)
      .text(d=>d.name)
      .transition().delay((d,i)=>i*150)
      .attr("opacity",1)

      arcLabels.append('circle')
        .attr("opacity",0)
        .attr("cx",335)
        .attr("cy",(d,i)=>(i*30)-65)
        .attr("r",5)
        .attr("fill",(d,i)=>color[i])
        .transition().delay((d,i)=>i*150)
        .attr("opacity",1)


    const chartLabel = wrapper.append('text')
    .attr("text-anchor","middle")
      .attr("x",this.chartdim.width/2)
      .attr("font-weight","bold")
      .attr("font-size","16px")
      .attr("fill","#6495ED")
      .text("TEAM STRUCTURE")
      .attr("y",this.chartdim.height+100)
      .transition().delay(1000)
      .attr("y",this.chartdim.height)
  }


  renderDonut(){
    const depts = [...new Set(this.data.map(d=>d.dept))]
    const salData =[];
    const color = ["#675ee6","#69a0ff","#00E8C0","#8eff3d","#ff3dff","#FF5983"]
    for(let el of depts){
      const val = this.data.filter(d=>d.dept==el).reduce((c:any,el:any)=>el.salary+c,0)
      salData.push({name:el,total:val})
    }
    const radius = Math.min(this.donutdim.boundedHeight,this.donutdim.boundedWidth)/2;

    const xScale= d3.scaleLinear()
    // .domain(d3.extent(salData,d=>d.total))
    .domain([0,salData.reduce((c,el)=>el.total+c,0)])
    .range([0,Math.PI*2])

    const yScale = d3.scaleLinear()
      .range([100,radius])

    const wrapper = d3.select('.donut').append("svg")
      .attr("height",this.donutdim.height)
      .attr("width",this.donutdim.width)

    const bounds = wrapper.append("g")
      .attr('height',this.donutdim.boundedHeight)
      .attr('width',this.donutdim.boundedWidth)
      .style("transform",`translate(${this.donutdim.width/2 -80}px,${this.donutdim.height/2 -30}px)`)

    const getContData=(num)=>{
      let x = 0;
      for(let z = 0; z< num;z++){
        x+= xScale(salData[z].total)
      }
      return x
    }

      const arc = d3.arc()
      .startAngle((d:any,i)=>getContData(i))
      .outerRadius(radius)
      .innerRadius(radius-60)
      .padAngle(0.01)
      .endAngle((d:any,i)=>xScale(d.total)+getContData(i))

    const arcbin = bounds.selectAll('g')
    .data(salData)
    .enter()

    const arcbins = arcbin.append("path")
      .attr('fill',(d,i)=>color[i])
      .transition()
      .delay(function(d, i) {
        return i * 100;
    })
      .attr('d',arc)

    const arcLabels = arcbin.append('g')

    arcLabels.append("text")
    .attr("font-size","14px")
    .attr("fill","#6495ED")
    .attr("x",220)
    .attr('y',(d,i)=>(i*30)-60)
    .attr("opacity",0)
    .text(d=>d.name).transition().delay((d,i)=>i*150)
    .attr("opacity",1)

    arcLabels.append('circle')
    .attr("cx",205)
    .attr("cy",(d,i)=>(i*30)-65)
    .attr("r",5)
    .attr("opacity",0)
    .attr("fill",(d,i)=>color[i]).transition().delay((d,i)=>i*150)
    .attr("opacity",1)

    const chartLabel = wrapper.append('text')
      .attr("text-anchor","middle")
      .attr("x",this.donutdim.width/2)
      .attr("font-weight","bold")
      .attr("font-size","16px")
      .attr("fill","#6495ED")
      .text("SALARY ALLOTMENT PER DEPARTMENT")
      .attr("y",this.donutdim.height+100)
      .transition().delay(1000)
      .attr("y",this.donutdim.height-10)

 }


 ngAfterViewInit(): void {
    this.chartdim ={
      width : this.element?.nativeElement.clientWidth,
      height : this.element?.nativeElement.clientHeight,
      marginTop:30,
      marginLeft:30,
      marginRight:30,
      marginBottom:30,
    }

    this.chartdim={
      ...this.chartdim,
      boundedHeight: Math.max(this.chartdim.height - this.chartdim.marginTop - this.chartdim.marginBottom, 0),
      boundedWidth: Math.max(this.chartdim.width - this.chartdim.marginLeft- this.chartdim.marginRight, 0),
    }

    this.sunburst();

    this.donutdim ={
      height: this.donutEl.nativeElement.clientHeight,
      width: this.donutEl.nativeElement.clientWidth,
      marginTop:20,
      marginLeft:20,
      marginRight:20,
      marginBottom:40,
    }

    this.donutdim={
      ...this.donutdim,
      boundedHeight: Math.max(this.donutdim.height - this.donutdim.marginTop - this.donutdim.marginBottom, 0),
      boundedWidth: Math.max(this.donutdim.width - this.donutdim.marginLeft- this.donutdim.marginRight, 0),
    }


    this.renderDonut()
  }

  cumulativeperformance(){
    let depts =[... new Set(this.data.map(d=>d.dept))]
    let data=[];

    for(let el of depts){
      let pArr = this.data.filter(d=>d.dept==el).map(d=>d.performance);
      data.push({
        name:el,
        performance: d3.mean(pArr),
      })
    }
    let [el] = data.filter(d=>d.performance == d3.max(data,(d)=>d.performance))

    return el
  }

  ngOnInit(): void {
    this.data = rawData;
    [this.EOM]  = this.data.filter(d=>d.performance == d3.max(this.data, (d:any)=>d.performance));

    this.nationality = {
      indians: this.data.filter(d=>d.nationality=="indian").length,
      foriegn: this.data.filter(d=>d.nationality=="foriegn").length,
    }

    this.salary = d3.extent(this.data, (d:any)=>d.salary)
    this.salary.push(d3.mean(this.data,(d:any)=>d.salary))

    this.TOM = this.cumulativeperformance()

  }

}
