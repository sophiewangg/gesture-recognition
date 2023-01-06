import styled from 'styled-components';
import { useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from "@tensorflow-models/handpose";
import * as fp from "fingerpose";
import ReactWebcam from 'react-webcam'; 
import './App.css';
import { drawHand } from './utils/utilities';

function App() {
  const [detectedGesture, setDetectedGesture] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const webcamRef=useRef(null);
  const canvasRef=useRef(null);

  const startVideo = () => {
    setShowVideo(true);
  }

  const stopVideo = () => {
    setShowVideo(false);
  }

  const runHandpose = async () => {
    const net = await handpose.load(); //getting neural network

      //loop to detect hands
      setInterval(() => {
        detect(net);
      }, 100)
  }

  //is there a way to have videoHeight/width calculations not in here, so the function is slightly less expensive
  const detect = async (net) => {
    if (webcamRef.current && webcamRef.current.video.readyState === 4){ //The HTMLMediaElement.readyState property indicates the readiness state of the media
      const video = webcamRef.current.video;
      const videoHeight = video.videoHeight;
      const videoWidth = video.videoWidth;

      //make sure video properties are set so that detection works properly lol
      video.height = videoHeight;
      video.width = videoWidth;

      canvasRef.current.height = videoHeight;
      canvasRef.current.width = videoWidth;

      //make detections
      const hand = await net.estimateHands(video);

      /*
      hand returned in the form:
          [{
              annotations: {[], ..., []},
              bouding box: {[], []},
              handInViewConfidence: __ ,
              landmarks: [[x, y, z], ..., [x, y, z]],
          }]
      */
      //gesture detection
      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture
        ])

        const gesture = await GE.estimate(hand[0].landmarks, 8);
        console.log(gesture);

        if (gesture.gestures && gesture.gestures.length >0){
          const confidence = gesture.gestures.map((prediction) => prediction.confidence);
          const maxConfidence = confidence.indexOf(Math.max.apply(null, confidence)); //since Math.max doesn't work on an array -- if multiple gestures are detected, grab gesture of highest confidence
          setDetectedGesture(gesture.gestures[maxConfidence].name)
          console.log(detectedGesture);
        }
      }

      //draw mesh
      const ctx = canvasRef.current.getContext("2d"); //HTMLCanvasElement.getContext() method returns a drawing context on the canvas, or null
      drawHand(hand, ctx);
    }
  }

  runHandpose();
  console.log(`rerender`);

  return (
    <div className="App">
      <header className="App-header">
        {
          showVideo && <Webcam ref={webcamRef}/> 
        }
        <button onClick={startVideo}> start </button>
        <button onClick={stopVideo}> stop </button> 
        <Canvas ref={canvasRef}/>
      </header>
    </div>
  );
}

export default App;

const Webcam = styled(ReactWebcam)`
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 10;
  width: 640;
  height: 480;
`;

const Canvas = styled.canvas`
position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 10;
  width: 640;
  height: 480;
`;