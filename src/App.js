import styled from 'styled-components';
import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from "@tensorflow-models/handpose";
import * as fp from "fingerpose";
import ReactWebcam from 'react-webcam'; 
import './App.css';
import { drawHand } from './utils/drawHand';

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
      }, 10)
  }

  //is there a way to have videoHeight/width calculations not in here, so the function is slightly less expensive
  const detect = async (net) => {
    if (webcamRef.current && webcamRef.current.video.readyState === 4){ //The HTMLMediaElement.readyState property indicates the readiness state of the media
      const video = webcamRef.current.video;
      const videoHeight = video.videoHeight;
      const videoWidth = video.videoWidth;

      //make sure video properties are set so that detection works properly lol
      // video.height = videoHeight;
      // video.width = videoWidth;

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
        ]);

        const gesture = await GE.estimate(hand[0].landmarks, 8);
        // console.log(gesture);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0){
          const confidence = gesture.gestures.map(({score}) => score);
          const maxConfidence = confidence.indexOf(Math.max(...confidence));
          setDetectedGesture(gesture.gestures[maxConfidence].name);
          console.log(gesture.gestures[maxConfidence].name);
          console.log(`detected gesture: ${detectedGesture}`);
        }
      }

      //draw mesh
      const ctx = canvasRef.current.getContext("2d"); //HTMLCanvasElement.getContext() method returns a drawing context on the canvas, or null
      drawHand(hand, ctx);
    }
  }

  useEffect(() => {
    runHandpose();
  }, [runHandpose]);

  useEffect(()=> {
    console.log(`detected gesture 2: ${detectedGesture}`); // detectedGesture is null booooo
    if (detectedGesture === 'victory'){
      window.scrollBy(0, 1000);
    }

    if (detectedGesture === 'thumbs_up'){
      setShowVideo(false);
      console.log(`video should be off!!`)
    }
  }, [detectedGesture])


  return (
    <AppContainer className="App">
        {
          showVideo && (
            <div>
              <Webcam ref={webcamRef}/>
              <Canvas ref={canvasRef}/>
            </div> 
           )
        }
        
        <WebsiteContainer>
          <ButtonContainer>
            <Button onClick={startVideo}> start </Button>
            <Button onClick={stopVideo}> stop </Button> 
          </ButtonContainer>

          <ColorDiv> </ColorDiv>
          <ColorlessDiv> </ColorlessDiv>
          <ColorDiv> </ColorDiv>

        </WebsiteContainer>


      
    </AppContainer>
  );
}

export default App;

const AppContainer = styled.div`
  display: flex;
  // flex-direction: column;
`;

const WebsiteContainer = styled.div`
  width: 100%;
`

const ColorDiv = styled.div`
  height: 100vh;
  background-color: blue;
`

const ColorlessDiv = styled.div`
  height: 100vh;
  background-color: white;
`

const Webcam = styled(ReactWebcam)`
  position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  text-align: center;
  width: 640;
  z-index: 99;
  height: 480;
`;

const Canvas = styled.canvas`
position: absolute;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  text-align: center;
  width: 640;
  z-index: 100;
  height: 480;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: start;
`

const Button = styled.button`
  padding: 10px;
  border-radius: 10px;
`