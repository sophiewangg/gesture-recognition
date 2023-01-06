//define which points correspond to which fingers
const fingerJoints = {
    thumb: [0,1,2,3,4],
    index: [0,5,6,7,8],
    middle: [0,9,10,11,12],
    ring: [0,13,14,15,16],
    pinky: [0,17,18,19,20],
}

/*
predictions returned in the form:
    [{
        annotations: {[], ..., []},
        bouding box: {[], []},
        handInViewConfidence: __ ,
        landmarks: [[x, y, z], ..., [x, y, z]],
    }]
 */
export const drawHand = (predictions, ctx) => {
    if (predictions.length > 0) {
        predictions.forEach((prediction) => {
            const landmarks = prediction.landmarks; 

            //loop through fingers
            for (let j=0; j<Object.keys(fingerJoints).length; j++) {
                let finger = Object.keys(fingerJoints)[j];
                //loop through pairs of joints
                for (let k=0; k<fingerJoints[finger].length-1; k++) {
                    const firstJointIndex = fingerJoints[finger][k];
                    const secondJointIndex = fingerJoints[finger][k+1];

                    //draw path between joints 
                    ctx.beginPath();
                    ctx.moveTo(
                        landmarks[firstJointIndex][0],
                        landmarks[firstJointIndex][1],
                    );
                    ctx.lineTo( // .lineTo() connects the sub-path's last point to the specified (x, y) coordinates.
                        landmarks[secondJointIndex][0],
                        landmarks[secondJointIndex][1],
                    );
                    ctx.stokeStyle="plum";
                    ctx.lineWidth=4;
                    ctx.stroke(); 

                }
            }

            for (let i=0; i<landmarks.length; i++) {
                const x = landmarks[i][0];
                const y = landmarks[i][1];

                //drawing circles on joints using HTML canvas
                ctx.beginPath(); 
                ctx.arc(x, y, 5, 0, 3*Math.PI); //(x,y,r,startAngle,endAngle,counterclockwise)
                ctx.fillStyle = "indigo";
                ctx.fill();

            }
        })
    }
}
