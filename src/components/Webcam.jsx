import { useState, useRef} from 'react';
import ReactWebcam from 'react-webcam'; 

function Webcam() {
    const webcamRef=useRef(null);
    const canvasRef=useRef(null);
  return (
    <div>Webcam</div>
  )
}

export default Webcam