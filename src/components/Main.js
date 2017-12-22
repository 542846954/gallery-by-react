require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';

import ReactDOM, {findDOMNode} from 'react-dom';

let imageDatas = require('../data/imageDatas.json');

function getImageURL(imageDataArr){
	for (var i = 0; i < imageDataArr.length; i++) {
		var singleImageData = imageDataArr[i];
		
		singleImageData.imageURL = require('../images/'+singleImageData.fileName);
		
		imageDataArr[i] = singleImageData;
	}
	return imageDataArr;
}
//获取区间内的一个随机值
function getRangeRandom(low,high){
	return Math.ceil(Math.random() * (high-low)+low);
}
// 获取0~30度 之间的任意一个正负值
function get30DegRandom(){
	return ((Math.random()>0.5?'':'-') + Math.ceil(Math.random() * 30));
}

imageDatas = getImageURL(imageDatas);

class ImgFigure extends React.Component{

	/*
		ImgFigure的点击事件处理函数
	*/
	handleClick = (e) => {
		console.log("enter");
		if(this.props.arrange.isCenter){
			this.props.inverse();
		}else{
			this.props.center();
		}
		// this.props.inverse();
		e.stopPropagation();
		e.preventDefault();
	}

	render(){
		var styleObj = {};

		if(this.props.arrange.pos){
			styleObj = this.props.arrange.pos;
			console.log(styleObj);
		}

		if(this.props.arrange.rotate){
			(['MozTransform',"msTransform","WebkitTransform",'transform']).forEach(
				function(value){
					styleObj[value] = 'rotate(' + 
					this.props.arrange.rotate + 'deg)';
				}.bind(this)			
			);
		}

		if(this.props.arrange.isCenter){
			styleObj.zIndex = 11;
		}

		let imgFigureClassName = "img-figure";
			imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse':'';
		
		// 如果props属性中制定了这张图片的位置，则使用
		return(
			<figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick}>
				<img src={this.props.data.imageURL}  alt = {this.props.data.title}
					style={{width:240,height:240}} />
				<figcaption>
					<h2 className="img-title">{this.props.data.title}</h2>
					<div className="img-back" onClick={this.handleClick}>
						<p>
							{this.props.data.desc}
						</p>
					</div>
				</figcaption>
			</figure>
		);
	}
}

// 控制组件
class ControllerUnit extends React.Component{
	handleClick = (e)=>{
		if(this.props.arrange.isCenter){
			this.props.inverse();
		}else{
			this.props.center();
		}
		
		e.stopPropagation();
		e.preventDefault();
	}
	render(){
		let controllerUnitClassName = "controller-unit";

		//如果对应的是居中的图片，显示控制按钮的居中态
		if(this.props.arrange.isCenter){
			controllerUnitClassName += " is-center";
			//如果对应的是图片的旋转态则显示
			if(this.props.arrange.isInverse){
				controllerUnitClassName += " is-inverse";
			}
		}
		return (
			<span className = {controllerUnitClassName} onClick = {this.handleClick}></span>);
	}
}


class AppComponent extends React.Component {
	constructor(props) {
    	super(props);
		this.rearrange = this.rearrange.bind(this);
		// this.inverse = this.inverse.bind(this);
    	this.Constant = {
    		centerPos : {
    			left : 0,
    			right : 0
    		},
    		hPosRange : {
				leftSecX : [0,0],
				rightSecX : [0,0],
				y : [0,0]
    		},
    		vPosRange : {
    			x : [0,0],
    			topY : [0,0]                  
    		}
    	};
    	this.state = {
    		imgsArrangeArr:[
				// {
				// 	pos:{
				// 		left : 0,
				// 		top : 0
				// 	},
				// 	rotate : 0,//旋转角度
				// 	isInverse : false //图片正反面
				//  isCenter : false // 图片是否居中
				// }		
    		]
    	};         
  	}
  	/*
	 * 翻转图片
	 * @index 输入当前被执行inverse操作的图片对应的图片信息数组
	 * 的index值
	 * @return {Function} 这是一个闭包函数，其内return一个真正待
	 * 被执行的函数 
	 */
	inverse(index){
		return function(){
			var imgsArrangeArr = this.state.imgsArrangeArr;
			imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;

			this.setState({
				imgsArrangeArr : imgsArrangeArr
			});
		}.bind(this);
	} 
	/*
     * 利用 rearrange函数，居中对应index的图片
	 */
	 center(index){
	 	return function(){
	 		this.rearrange(index);
	 	}.bind(this);
	 }
  	/**
  	 * 重新布局所有图片
  	 * centerIndex 指定居中哪个图片
  	 */
	rearrange(centerIndex){

		let imgsArrangeArr = this.state.imgsArrangeArr,
			Constant = this.Constant,
			centerPos = Constant.centerPos,
			hPosRange = Constant.hPosRange,
			vPosRange = Constant.vPosRange,
			hPosRangeLeftSecX = hPosRange.leftSecX,
			hPosRangeRightSecX = hPosRange.rightSecX,
			hPosRangeY = hPosRange.y,
			vPosRangeTopY = vPosRange.topY,
			vPosRangeX = vPosRange.x,

			imgsArrangeTopArr = [],
			
			topImgNum = Math.floor(Math.random() * 2),
			
			//取一个或者不限 
			topImgSpliceIndex = 0,

			// 取出当前索引的图片
			imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);

			//首先居中 centerIndex 的图片 , 居中的图片不需要旋转
			imgsArrangeCenterArr[0] = {
				pos : centerPos,
				rotate : 0 ,
				isInverse : false,
				isCenter : true
			}

			//取出要布局上侧的图片信息
			topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
	
			imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

			// 布局上侧的图片 
			imgsArrangeTopArr.forEach(function(value,index)
			{
				imgsArrangeTopArr[index] = {
					pos :
					{
						top : getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
						left : getRangeRandom(vPosRangeX[0],vPosRangeX[1])
					},
					rotate :get30DegRandom(),
					isCenter : false
				}
			});

			// 布局左右两侧的图片 
			for(var i=0 , j = imgsArrangeArr.length,k=j/2;i<j;i++){
				var hPosRangeLORX = null;

				if (i<k) {
					hPosRangeLORX = hPosRangeLeftSecX;
				}else{
					hPosRangeLORX = hPosRangeRightSecX;
				}
				imgsArrangeArr[i] = {

					pos : {
						top:getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
						left:getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
					},
					rotate : get30DegRandom(),
					isCenter : false
				};
			}

			if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
				imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
			}

			imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);

			this.setState({
				imgsArrangeArr : imgsArrangeArr
			});

			// getRangeRandom = (low,high) => {
			// 	Math.ceil(Math.random()*(high-low)+low);
			// }
	}
	componentDidMount(){
		// 首先拿到舞台的大小ReactDOM.findDOMNode(component)
		var stageDOM = findDOMNode(this.refs.stage),
			stageW = stageDOM.scrollWidth,
			stageH = stageDOM.scrollHeight,
			halfStageW = Math.ceil(stageW / 2),
			halfStageH = Math.ceil(stageH / 2);
		//拿到一个imageFigure的大小
		var imgFigureDOM = findDOMNode(this.refs.imgFigure0),
			imgW = imgFigureDOM.scrollWidth,
			imgH = imgFigureDOM.scrollHeight,
			halfImgW = Math.ceil(imgW / 2),
			halfImgH = Math.ceil(imgH / 2);

		// 计算图片的位置点
		this.Constant.centerPos = {
			left : halfStageW - halfImgW,
			top : halfStageH - halfImgH
		}

		this.Constant.hPosRange.leftSecX[0] = -halfImgW;
		this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
		this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
		this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
		this.Constant.hPosRange.y[0] = -halfImgH;
		this.Constant.hPosRange.y[1] = stageH - halfImgH;

		this.Constant.vPosRange.topY[0] = -halfImgH;
		this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
		this.Constant.vPosRange.x[0] = halfStageW - imgW;
		this.Constant.vPosRange.x[1] = halfStageW;

		this.rearrange(0);

	}
	render() {
		var controllerUnits =  [];
		var imgFigures = [];

		imageDatas.forEach(function(value,index)
		{
			if (!this.state.imgsArrangeArr[index]) 
			{
				this.state.imgsArrangeArr[index] = 
				{
					pos:{
						left:0,
						top:0
					},
					rotate:0,
					isInverse : false,
					isCenter : false
				}
			}
			imgFigures.push(<ImgFigure data={value} key={index}
				ref={'imgFigure'+index} inverse={this.inverse(index)}
				arrange={this.state.imgsArrangeArr[index]}
				center = {this.center(index)}/>);

			controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArrangeArr[index]} 
				inverse={this.inverse(index)} center={this.center(index)}/>);
		}.bind(this));
		return (
			<section className="stage" ref="stage">
				<section className="img-sec">
					{imgFigures}
				</section>				
				<nav className="controller-nav">
					{controllerUnits}
				</nav>
			</section>
		);
	}
}
AppComponent.defaultProps = {
};

export default AppComponent;
