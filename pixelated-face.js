
//select the video elements
const video = document.querySelector('video.webcam');

const canvas = document.querySelector('.video');
const ctx = canvas.getContext('2d');

const faceCanvas = document.querySelector('.face');
const faceCtx = faceCanvas.getContext('2d');

//get a facedetector object
const faceDetector = new FaceDetector();
console.log(video, canvas, faceCanvas, faceDetector);

const SIZE = 10;
const SCALE = 1.1;

//this functon will populate the users webcam
async function populateVideo(){
	//get the stream from the webcam
	const stream = await navigator.mediaDevices.getUserMedia({
		//can choose and set audio or video. video can be true or a size.
		video: {witdth: 1280, height: 720},
	});

	video.srcObject = stream;
	await video.play();

	//size the canvas to be the same size as the video
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;
	faceCanvas.width = video.videoWidth;
	faceCanvas.height = video.videoHeight;

}

async function detect() {

	const faces = await faceDetector.detect(video);
	console.log(faces);

	faces.forEach(drawFace);
	//creates a recursion in a performant way.
	requestAnimationFrame(detect);

}

function drawFace(face){
	const {width, height, top, left} = face.boundingBox;

	ctx.clearRect(0,0, (canvas.width * SCALE), (canvas.height * SCALE));
	ctx.strokeStyle = '#ffc600';
	ctx.lineWidth = 2;
	ctx.strokeRect(left, top, width, height);
	censor(face);
}

function censor({ boundingBox: face}){
	faceCtx.imageSmothingEnabled = false;
	faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
	//draw the small face
	faceCtx.drawImage(
		//5 source args
		video, //where does the src come from
		face.x,//where do we start the source pull from
		face.y,
		face.width,
		face.height,
		//4 draw args
		face.x,//where should we start drawing?
		face.y,
		SIZE,
		SIZE,
	);

	const width = face.width * SCALE;
	const height = face.height * SCALE;
	//take face back out and draw it back at normal size
	faceCtx.drawImage(
		faceCanvas,
		face.x,
		face.y,
		SIZE,
		SIZE,
		face.x - (width - face.height) / 2,
		face.y - (width - face.width) / 2,
		width,
		height
	);
}


populateVideo().then(detect);