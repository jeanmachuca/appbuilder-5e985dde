const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');

let audioContext;
let mediaRecorder;
let isRecording = false;

function init() {
    canvas.width = 400;
    canvas.height = 100;
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        
        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 2048;
        source.connect(analyzer);
        
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = handleDataAvailable;
        
        mediaRecorder.start();
        isRecording = true;
        
        startBtn.disabled = true;
        stopBtn.disabled = false;
        status.textContent = 'Recording...';
        
        drawWaveform(analyzer);
    } catch (err) {
        console.error('Error accessing microphone:', err);
    }
}

function stopRecording() {
    mediaRecorder.stop();
    isRecording = false;
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
    status.textContent = 'Not recording';
}

function handleDataAvailable(event) {
    // Handle audio data if needed
}

function drawWaveform(analyzer) {
    if (!isRecording) return;
    
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzer.getByteFrequencyData(dataArray);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
    
    requestAnimationFrame(() => drawWaveform(analyzer));
}

startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);

init();