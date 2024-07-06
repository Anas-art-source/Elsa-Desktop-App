import React, { useState, useRef } from 'react';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faVideo, faCamera, faPaperclip, faPaperPlane, faStop, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import { Switch } from '@headlessui/react';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isProactive, setIsProactive] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const mediaRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const audioChunksRef = useRef([]);  // Add this line to define audioChunksRef

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    const newMessage = { text: input, sender: 'user' };
    setMessages([...messages, newMessage]);
    setInput('');

    setTimeout(() => {
      const receivedMessage = { text: 'This is a placeholder response', sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, receivedMessage]);
    }, 1000);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];
        const arrayBuffer = await blob.arrayBuffer();
        const filePath = await window.electron.saveAudio(arrayBuffer);
        const newMessage = { text: `Audio recorded and saved at ${filePath}`, sender: 'user', audioUrl: URL.createObjectURL(blob) };
        setMessages(prevMessages => [...prevMessages, newMessage]);
      };

      mediaRecorderRef.current.start();
      setIsRecordingAudio(true);
    } catch (error) {
      alert('Audio recording is not supported or permission denied.');
      console.error('Error accessing audio devices:', error);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingAudio(false);
  };

  const startVideoRecording = async () => {
    try {
      const sources = await window.electron.getSources({ types: ['window', 'screen'] });
      const source = sources[0]; // Use the first available source or provide a selection UI for users

      window.electron.minimizeApp();

      const screenStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id,
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720
          }
        }
      });

      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const combinedStream = new MediaStream([
        ...screenStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);

      mediaRecorderRef.current = new MediaRecorder(combinedStream);

      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        videoChunksRef.current = [];
        const arrayBuffer = await blob.arrayBuffer();
        const filePath = await window.electron.saveVideo(arrayBuffer);
        const newMessage = { text: `Video recorded and saved at ${filePath}`, sender: 'user', videoUrl: URL.createObjectURL(blob) };
        setMessages(prevMessages => [...prevMessages, newMessage]);
      };

      mediaRecorderRef.current.start();
      setIsRecordingVideo(true);
    } catch (error) {
      console.error('Error starting video recording:', error);
      alert(`Failed to start video recording: ${error.message}`);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVideo(false);
  };

  const captureScreenshot = async () => {
    try {
      window.electron.minimizeApp();
      const sources = await window.electron.getSources({ types: ['window', 'screen'] });
      const source = sources[0]; // Use the first available source or provide a selection UI for users

      const screenStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: source.id,
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720
          }
        }
      });

      const track = screenStream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      track.stop();

      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);

      const blob = await new Promise(resolve => canvas.toBlob(resolve));
      const arrayBuffer = await blob.arrayBuffer();
      const filePath = await window.electron.saveScreenshot(arrayBuffer);
      const newMessage = { text: `Screenshot captured and saved at ${filePath}`, sender: 'user', imageUrl: URL.createObjectURL(blob) };
      setMessages(prevMessages => [...prevMessages, newMessage]);

      // // Play the capture sound
      // const audio = new Audio('/capture.mp3'); // Assuming capture.mp3 is in the public directory
      // audio.play();
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      alert(`Failed to capture screenshot: ${error.message}`);
    }
  };

  
  return (
    <div className="h-screen w-screen bg-gray-100 flex">
      <div className="w-full h-full bg-white shadow-lg flex flex-col">
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
          <span>Chat Application</span>
          <div className="flex items-center">
            <span className="mr-2">Proactive mode</span>
            <Switch
              checked={isProactive}
              onChange={setIsProactive}
              className={`${
                isProactive ? 'bg-blue-400' : 'bg-gray-200'
              } relative inline-flex items-center h-6 rounded-full w-11`}
            >
              <span
                className={`${
                  isProactive ? 'translate-x-5' : 'translate-x-0'
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
              />
            </Switch>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-2 p-2 ${msg.sender === 'user' ? 'bg-blue-200 text-right' : 'bg-gray-200'}`}>
              {msg.text && <p>{msg.text}</p>}
              {msg.imageUrl && <img src={msg.imageUrl} alt="Screenshot" className="w-full mt-2" />}
              {msg.videoUrl && (
                <div className="mt-2">
                  <video controls src={msg.videoUrl} className="w-full" />
                </div>
              )}
              {msg.audioUrl && (
                <div className="mt-2">
                  <audio controls src={msg.audioUrl} className="w-full" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-200 flex items-center">
          <button
            className={`p-2 rounded-full ${isRecordingAudio ? 'bg-red-600' : 'bg-red-400'} text-white`}
            onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
            disabled={isRecordingVideo}
          >
            <FontAwesomeIcon icon={faMicrophone} />
          </button>
          <button
            className={`p-2 rounded-full ${isRecordingVideo ? 'bg-red-600' : 'bg-red-400'} text-white ml-2`}
            onClick={isRecordingVideo ? stopVideoRecording : startVideoRecording}
            disabled={isRecordingAudio}
          >
            <FontAwesomeIcon icon={faVideo} />
          </button>
          <button
            className="p-2 rounded-full bg-green-500 text-white ml-2"
            onClick={captureScreenshot}
          >
            <FontAwesomeIcon icon={faCamera} />
          </button>
          <input
            className="flex-1 ml-2 p-2 border border-gray-300 rounded"
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <button
            className="p-2 rounded-full bg-blue-500 text-white ml-2"
            onClick={handleSendMessage}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
