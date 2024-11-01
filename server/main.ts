import { Meteor } from 'meteor/meteor';
import {HTTP} from 'meteor/http'
import { KellyGameCollection, KellyPlayerCollection } from '/imports/api/kelly_pool/collections';
import { Random } from 'meteor/random';
import _ from 'lodash'
const fs = require('fs');
// import cv, { inpaint } from '@u4/opencv4nodejs'
// import { Mat, Rect, Net, Vec3, Contour, Point2 } from '@u4/opencv4nodejs';

interface PointWithIdx {
  pt: Point2;
  contourIdx: number;
}

export const drawRect = (image: Mat, rect: Rect, color: Vec3, opts = { thickness: 2 }): void =>
  image.drawRectangle(
    rect,
    color,
    opts.thickness,
    cv.LINE_8,
  );

export const classNames = [
  'background',
  'person',
  'bicycle',
  'car',
  'motorcycle',
  'airplane',
  'bus',
  'train',
  'truck',
  'boat',
  'traffic light',
  'fire hydrant',
  'stop sign',
  'parking meter',
  'bench',
  'bird',
  'cat',
  'dog',
  'horse',
  'sheep',
  'cow',
  'elephant',
  'bear',
  'zebra',
  'giraffe',
  'backpack',
  'umbrella',
  'handbag',
  'tie',
  'suitcase',
  'frisbee',
  'skis',
  'snowboard',
  'sports ball',
  'kite',
  'baseball bat',
  'baseball glove',
  'skateboard',
  'surfboard',
  'tennis racket',
  'bottle',
  'wine glass',
  'cup',
  'fork',
  'knife',
  'spoon',
  'bowl',
  'banana',
  'apple',
  'sandwich',
  'orange',
  'broccoli',
  'carrot',
  'hot dog',
  'pizza',
  'donut',
  'cake',
  'chair',
  'couch',
  'potted plant',
  'bed',
  'dining table',
  'toilet',
  'tv',
  'laptop',
  'mouse',
  'remote',
  'keyboard',
  'cell phone',
  'microwave',
  'oven',
  'toaster',
  'sink',
  'refrigerator',
  'book',
  'clock',
  'vase',
  'scissors',
  'teddy bear',
  'hair drier',
  'toothbrush',
];

const findColorOnLine = (image: Mat, targetColor, lineLength, x, y, xAdd, yAdd) => {
	let foundX = []
	let foundY = []
  console.log(lineLength)
	for(let times=0; times <= lineLength; times +=1) {
		let color = image.at(y, x)
    
		if (color.x == targetColor.x && color.y == targetColor.y && color.z == targetColor.z) {
			foundX.push(x)
			foundY.push(y)
		}
		x += xAdd
		y += yAdd
	}
  if(foundX.length > 0){
    return new cv.Point2(Math.round(foundX.reduce((v, i) => (v + i)) / foundX.length) , Math.round(foundY.reduce((v, i) => (v + i)) / foundY.length))
  }
	return new cv.Point2(0,0)
}

const averageNeighbourColor = (image: Mat, xCoordinate, yCoordinate, radius = 10) => {
	let pixelCounter = 0
	let b = 0
	let g = 0
	let r = 0
	for (let x = Math.max(xCoordinate - radius, 0); x <= Math.min(xCoordinate + radius, image.cols -1); x++) {
		for (let y = Math.max(yCoordinate - radius, 0); y <= Math.min(yCoordinate + radius, image.rows -1); y++) {
			let color = image.at(y,x)
      
			if (color) {
				b += color.x
				g += color.y
				r += color.z
				pixelCounter++
			}
		}
	}
	return pixelCounter != 0 ? [b / pixelCounter, g / pixelCounter, r / pixelCounter] : [0,0,0]
}

const findSimilarPointOnCenterSpiral = (image, diff = 20, angleSteps = 100, radiusIncrement = 0.5, xFix = 0.5, yFix = 0.5) => {
	let angleIncrement = (Math.PI * 2) / angleSteps
	let lastColor = [-diff, -diff, -diff]
	let x =0, y = 0, countSimilarLastOnes = 0
	let a = 0, radius = 10
	while (countSimilarLastOnes <= 30 || radius > (image.rows / 2)) {
		x = Math.cos(a) * radius + (image.cols * xFix)
		y = Math.sin(a) * radius + (image.rows * yFix)
		let color = averageNeighbourColor(image, x, y)
		let diffToLast = Math.abs(color[0] -lastColor[0]) + Math.abs(color[1] -lastColor[1]) + Math.abs(color[2] -lastColor[2])
		if (diffToLast <= diff)
			countSimilarLastOnes++
		lastColor = color
		a += angleIncrement
		radius += radiusIncrement
	}
	return new cv.Point2(Math.round(x), Math.round(y));
}

// segmenting by skin color (has to be adjusted)
const colourUpper = (hue: number, L, S, adj) => new cv.Vec3(hue <= 169 ? hue+10 : hue, Math.min(255, L+adj), Math.min(255,S+adj));
const colourLower = (hue: number, L, S, adj) => new cv.Vec3(hue >= 10 ? hue-10 : hue, Math.max(0,L-adj), Math.max(0,S-adj));


const makeMask = (img: Mat, point) => {
  
  // convert to HLS (whites become super green, blacks become super red)
  // however since we already filled the table with white we can skip.
  let img2 = img.cvtColor(cv.COLOR_BGR2HLS);
  
  // return img2
  let mask = new cv.Mat(img2.rows+2, img2.cols+2, cv.CV_8U)
  // img = img.adaptiveThreshold(120 ,cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 1, 0.9)
  img2 = img2.blur(new cv.Size(10, 10)) //.threshold(150,255,cv.THRESH_BINARY)
  // return img
  let col = img2.at(point.y, point.x)
  img2 = img2.inRange(colourLower(col.x, col.y, col.z, 80), colourUpper(col.x, col.y, col.z, 80));
  // return img
  // let img3 = img.cvtColor(cv.COLOR_BGR2GRAY).canny(100,180).copyMakeBorder(1, 1, 1, 1, cv.BORDER_REPLICATE)
  // return img3
  let contours = img2.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_NONE)
  // return img

  let contour = contours.sort((c0, c1) => c1.area - c0.area)[0]

  console.log(contour)
  img.drawContours([contour.getPoints()],0,new cv.Vec3(255,0,0), {thickness:5})
  
    let hull = contour.convexHull()

    hull = hull.approxPolyDPContour(10, true)
    const maxPointDist = 150;
    const hullIndices = getRoughHull(hull, maxPointDist);
    img.drawContours([hull.getPoints()],0,new cv.Vec3(0,255,0), {thickness:5})
    
    for(let a of hullIndices){
      img.drawCircle(
        a.pt, 20, new cv.Vec3(255,255,0), 4, cv.LINE_4
      )
    }
  
  return img
  // return imgHLS
  // img3.drawContours([contours[0].getPoints()],0,new cv.Vec3(0,255,0), {thickness:5})  
  let {returnValue, rect} = img.floodFill(point, new Vec3(255,255,255), img3, new cv.Vec3(5,5,5), new cv.Vec3(10,10,10))
  // console.log(rect)
  return img
  console.log(point)
  // console.log("colour is", imgHLS.at(point.y, point.x))
  // let col = imgHLS.at(point.y, point.x)
  console.log(col)

  imgHLS.drawCircle(point, 100, col, 10, cv.LINE_4)

  // return imgHLS
  // filter out only the brightest whites
  const rangeMask = imgHLS.inRange(colourLower(col.x, col.y, col.z), colourUpper(col.x, col.y, col.z));
  // return rangeMask
  // blur the image to reduce noise.
  const blurred = rangeMask.blur(new cv.Size(15, 15));
  // then make a hard threshold on the colours
  const thresholded = blurred.threshold(100, 255, cv.THRESH_BINARY);
  
  return thresholded;
};

// returns distance of two points
const ptDist = (pt1: Point2, pt2: Point2) => pt1.sub(pt2).norm();

// returns center of all points
const getCenterPt = (pts: Point2[]): Point2 => pts.reduce((sum: Point2, pt: Point2) => sum.add(pt), new cv.Point2(0, 0)).div(pts.length);

const getRoughHull = (contour: Contour, maxDist: number) => {
  // get hull indices and hull points
  const hullIndices = contour.convexHullIndices();
  const contourPoints = contour.getPoints();
  const hullPointsWithIdx: PointWithIdx[] = hullIndices.map((idx: number) => ({
    pt: contourPoints[idx],
    contourIdx: idx,
  }));
  const hullPoints: Point2[] = hullPointsWithIdx.map(ptWithIdx => ptWithIdx.pt);

  // group all points in local neighborhood
  const ptsBelongToSameCluster = (pt1: Point2, pt2: Point2): boolean => ptDist(pt1, pt2) < maxDist;
  const { labels } = cv.partition(hullPoints, ptsBelongToSameCluster);
  const pointsByLabel = new Map<number, Array<PointWithIdx>>();
  labels.forEach(l => pointsByLabel.set(l, []));
  hullPointsWithIdx.forEach((ptWithIdx: PointWithIdx, i: number) => {
    const label = labels[i];
    const slot = pointsByLabel.get(label);
    if (slot)
      slot.push(ptWithIdx);
  });

  // map points in local neighborhood to most central point
  const getMostCentralPoint = (pointGroup: PointWithIdx[]) => {
    // find center
    const center: Point2 = getCenterPt(pointGroup.map(ptWithIdx => ptWithIdx.pt));
    // sort ascending by distance to center
    console.log("center", center)
    
    let closestToCenter =  pointGroup.sort(
      (ptWithIdx1, ptWithIdx2) => ptDist(ptWithIdx1.pt, center) - ptDist(ptWithIdx2.pt, center),
    )[0];
    //rather than only return the closest actial point, lets return the center of the matching cluster
    return {pt: center, contourIdx: closestToCenter.contourIdx}
  };
  const pointGroups = Array.from(pointsByLabel.values());
  // return contour indeces of most central points
  return pointGroups.map(getMostCentralPoint).map(ptWithIdx => ptWithIdx);
};

const findCorners = (img: Mat) => {

    //first rsize to a fixed size  
    let resized = img.resizeToMax(1280)

    // starting at roughly the middle of hte image, find a point that has mostly the same colour all around it, its lkely the table
    let pointOnTable = findSimilarPointOnCenterSpiral(resized)

    // resized.drawCircle(
    //   pointOnTable, 15, new cv.Vec3(255,0,0), 4, cv.LINE_4
    // )
    // lets use white as a mask
    let white = new cv.Vec3(255, 255, 255)
    let mask = new cv.Mat(resized.rows+2, resized.cols+2, cv.CV_8U)
    // fill the image with white at the point we found, like paint bucket from MS paint, return the rectangle area bounding the fill
    // let valFill = 45
    // let {returnValue, rect} = resized.floodFill(pointOnTable, white,mask, new cv.Vec3(valFill,valFill,valFill), new cv.Vec3(valFill,valFill,valFill))
    // let leftCornerSmall = findColorOnLine(resized, white, rect.height, rect.x, rect.y, 0, 1)
    // let rightCornerSmall = findColorOnLine(resized, white, rect.height, rect.x + rect.width-1, rect.y, 0, 1)
    // let topCornerSmall = findColorOnLine(resized, white, rect.width, rect.x, rect.y, 1, 0)
    // let bottomCornerSmall = findColorOnLine(resized, white, rect.width, rect.x, rect.y + rect.height -1, 1, 0)

    //create a b/w mask
    
    console.log(pointOnTable, "pointOnTable")
    let point = new cv.Point2(resized.cols/2, resized.rows/2)
    let newMask = makeMask(resized, point)
    return newMask
    //create contours from bw mask
    let contours = newMask.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_NONE)
    // sort for the largest area contour
    let contour = contours.sort((c0, c1) => c1.area - c0.area)[0]
    //draw the contour on the image
    contour = contour.approxPolyDPContour(10, true)
    resized.drawContours([contour.getPoints()],0,new cv.Vec3(0,255,0), {thickness:5})  

    const maxPointDist = 50;
    const hullIndices = getRoughHull(contour, maxPointDist);
    console.log(hullIndices)

    // resized.drawRectangle(
    //   rect,
    //   new cv.Vec3(255,0,0),
    //   4,
    //   cv.LINE_8,
    // )

    for(let a of hullIndices){
      resized.drawCircle(
        a.pt, 20, new cv.Vec3(255,255,0), 4, cv.LINE_4
      )
    }
    
    // resized.drawCircle(
    //   leftCornerSmall, 20, new cv.Vec3(0,255,0), 4, cv.LINE_4
    // )
    // resized.drawCircle(
    //   rightCornerSmall, 20, new cv.Vec3(0,0,255), 4, cv.LINE_4
    // )
    // resized.drawCircle(
    //   topCornerSmall, 20, new cv.Vec3(0,255,0), 4, cv.LINE_4
    // )
    // resized.drawCircle(
    //   bottomCornerSmall, 20, new cv.Vec3(0,255,255), 4, cv.LINE_4
    // )

    // return img2

    // Point leftCornerSmall = VisionAlgorithms.findColorOnLine(engineState.smallMat, WHITE, boundingRect.height, boundingRect.x, boundingRect.y, 0, 1)
    // Point rightCornerSmall = VisionAlgorithms.findColorOnLine(engineState.smallMat, WHITE, boundingRect.height, boundingRect.x +boundingRect.width -1, boundingRect.y, 0, 1)
    // Point topCornerSmall = VisionAlgorithms.findColorOnLine(engineState.smallMat, WHITE, boundingRect.width, boundingRect.x, boundingRect.y, 1, 0)
    // Point bottomCornerSmall = VisionAlgorithms.findColorOnLine(engineState.smallMat, WHITE, boundingRect.width, boundingRect.x, boundingRect.y +boundingRect.height -1, 1, 0)

    // if (!engineState.isForcedCorners) {
    //   engineState.table.backLeftCornerPoint.recordPoint(transformCoordinate(bottomCornerSmall, engineState.smallMat, engineState.processMat))
    //   engineState.table.backRightCornerPoint.recordPoint(transformCoordinate(rightCornerSmall, engineState.smallMat, engineState.processMat))
    //   engineState.table.frontLeftCornerPoint.recordPoint(transformCoordinate(leftCornerSmall, engineState.smallMat, engineState.processMat))
    //   engineState.table.frontRightCornerPoint.recordPoint(transformCoordinate(topCornerSmall, engineState.smallMat, engineState.processMat))
    // }
  // }
  return resized

  
}

Meteor.publish('players', function(game_id){
  return [KellyPlayerCollection.find({game_id:game_id})]
})

Meteor.publish('games', function(){
  return KellyGameCollection.find()
})


Meteor.methods({
  "test_cv":async function (base64String){
    // console.log(cv.getBuildInformation())

    let base64data = base64String.replace('data:image/jpeg;base64','').replace('data:image/png;base64','');//Strip image type prefix
    let buffer = Buffer.from(base64data, 'base64')
    let webImage = cv.imdecode(buffer)

    let image = Assets.absoluteFilePath("pool1.jpg")
    let imageData = cv.imread(image);

    // let inputImg = imageData.copy()
    let inputImg = webImage.copy()

    // inputImg = cv.imread(Assets.absoluteFilePath("pool1.jpg"))
    let img2 = findCorners(inputImg)
    let outBase64 =  cv.imencode('.jpg', img2).toString('base64');
    let outURI = 'data:image/jpeg;base64,'+outBase64;
    // console.log(outURI)
    return outURI;
    
  },
  "new_game"(name){
    let code = Random.id(4)
    let id = KellyGameCollection.insert({name:name.toLowerCase(), code:code.toLowerCase()})
    return id
  },
  'add_player'(game_id, name, code){
    KellyPlayerCollection.insert({game_id: game_id, name:name, code:code})
  }, 
  'sink_ball'(game_id, ball_to_sink){

    // Step 1: Update the game by adding the ball to the sunk balls array
    KellyGameCollection.update({_id:game_id}, {$push:{sunk_balls:ball_to_sink}})

    // Step 2: Update the player (who has this ball) balls array so that the ball is marked as sunk
    let player = KellyPlayerCollection.findOne({game_id:game_id, balls:{$elemMatch:{ball:ball_to_sink}}})
    let player_balls = player?.balls || []

    if(player){
      player_balls = player.balls.map((ball)=>{
        if(ball.ball == ball_to_sink){
          ball.status = "sunk"
          ball.sunk_time = new Date()
        }
        return ball
      }) 
      KellyPlayerCollection.update({_id:player._id}, {$set:{balls:player_balls}})
    }
      

    // Step 3: Get the game mode of the game
    let game = KellyGameCollection.findOne({_id:game_id})
    let game_mode = game.game_mode

    // Step 4: If the game mode is "stay_alive", mark the player as finished if they have no balls left
    if(game_mode == "stay_alive" && player){
      let alive_balls = player_balls.filter((ball)=>ball.status == "alive")
      if(alive_balls.length == 0){
        KellyPlayerCollection.update({_id:player._id}, {$set:{finished_at: new Date()}})
      }
    } 

    // Step 5: If the game mode is "sink_all", mark the player as finished if all their balls are sunk
    if(game_mode == "sink_all" && player){
      let sunk_balls = player_balls.filter((ball)=>ball.status == "sunk")
      if(sunk_balls.length == player_balls.length){
        KellyPlayerCollection.update({_id:player._id}, {$set:{finished_at: new Date()}})
      }
      player = KellyPlayerCollection.findOne({_id:player._id})
    }

    // Step 6: If all but one player is finished, end the game
    let players = KellyPlayerCollection.find({game_id:game_id}).fetch()
    let finished_players = players.filter((player)=>player.finished_at)
    if(players.length - finished_players.length <= 1){
      KellyGameCollection.update({_id:game_id}, {$set:{end_time:new Date()}})
    }

    return player
  }, 
  'start_game'(game_id, game_mode){

    // Step 1: Update the game with a start time, game mode and sunk balls array
    KellyGameCollection.update({_id:game_id}, {$set:{game_mode:game_mode, start_time:new Date(), sunk_balls:[]}})

    // Step 2: Get all the players for the game
    let players = KellyPlayerCollection.find({game_id:game_id}).fetch()

    // Step 3: Find out how many balls each player gets
    let balls_per_player = Math.floor(15 / players.length)

    // Step 4: For each player, add a random ball (1-15) to their hand, no player can have the same ball
    let balls = _.shuffle(_.range(1,16))
    players.forEach((player, index)=>{
      let player_balls = balls.slice(index*balls_per_player, (index+1)*balls_per_player)
      player_balls = player_balls.sort((a, b) => a - b).map((ball) => {
        return {ball:ball, status:"alive"}
      })

      KellyPlayerCollection.update({_id:player._id}, {$set:{balls:player_balls}})
    })
    

  },
})

if (Meteor.isDevelopment) {
  const httpProxy = require('http-proxy');

  const SSL = function(key, cert, port) {
    const [, , host, targetPort] = Meteor.absoluteUrl().match(/([a-zA-Z]+):\/\/([\-\w\.]+)(?:\:(\d{0,5}))?/);
    console.log(host, targetPort)

    const proxy = httpProxy
      .createServer({
        target: {
          host,
          port: 3000,
        },
        ssl: {
          key,
          cert,
        },
        ws: true,
        xfwd: true,
        secure: true
      })
      .listen(port);

    proxy.on('error', err => {
      console.log(`HTTP-PROXY NPM MODULE ERROR: ${err}`);
    });

    // console.log('PROXY RUNNING ON', port, proxy);
    console.log("SSL Proxy running on: https://localhost:"+port+"/")

  };

  SSL(Assets.getText('localhost.key'), Assets.getText('localhost.cert'), 9000);
}