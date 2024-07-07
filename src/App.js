import React, { useState, useRef, useEffect } from 'react';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faVideo, faCamera, faPaperclip, faPaperPlane, faStop, faVolumeUp, faBolt } from '@fortawesome/free-solid-svg-icons';
import { Switch } from '@headlessui/react';
// import ProactiveScreen from './ProactiveScreen'; // Import the new component
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faMicrophone, faStop } from '@fortawesome/free-solid-svg-icons';

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faTimes } from '@fortawesome/free-solid-svg-icons';
// const { ipcRenderer } = window.require('electron');
const ProactiveScreen = ({ setIsProactive, onMinimize, onSubmit }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setInput('');
    }
  };

  const handleSubmit = () => {
    if (input.trim() || isRecording) {
      onSubmit(isRecording ? "Audio input" : input);
      setInput('');
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 to-indigo-700 flex flex-col">
      <div className="flex items-center justify-between p-6">
        <h2 className="text-white font-bold text-2xl">Proactive Mode</h2>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">Proactive</span>
            <Switch
              checked={true}
              onChange={() => setIsProactive(false)}
              className={`${true ? 'bg-green-500' : 'bg-gray-300'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <span className={`${true ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
            </Switch>
          </div>
          {/* <button onClick={onMinimize} className="text-white hover:text-gray-200 transition-colors">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button> */}
        </div>
      </div>
      <div className="flex-grow flex items-center justify-center px-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">What's your goal?</h3>
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Enter your goal..."
              className={`w-full p-4 pr-12 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all text-lg ${isRecording ? 'opacity-0' : 'opacity-100'}`}
              rows="3"
            />
            <div className="absolute right-3 bottom-3 flex items-center space-x-2">
              {input.trim() ? (
                <button
                  onClick={handleSubmit}
                  className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faPaperPlane} size="lg" />
                </button>
              ) : (
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white transition-colors`}
                >
                  <FontAwesomeIcon icon={isRecording ? faStop : faMicrophone} size="lg" />
                </button>
              )}
            </div>
          </div>
          {isRecording && (
            <div className="text-center py-6 text-indigo-600 font-semibold animate-pulse text-xl">
              Recording... Speak your goal
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  // const [isProactive, setIsProactive] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const mediaRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const audioChunksRef = useRef([]);  // Add this line to define audioChunksRef
  const fileInputRef = useRef(null);
  const [textAreaHeight, setTextAreaHeight] = useState('auto');
  const textAreaRef = useRef(null);
  const [notification, setNotification] = useState(null);

  // const [isProactive, setIsProactive] = useState(false);
  // const [isProactive, setIsProactive] = useState(false);
  const [isProactive, setIsProactive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleMinimize = () => {
    // setIsMinimized(true);
    window.electron.minimizeApp();

  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  const showNotification = (title, body) => {
    if (window.electron) {
      // We're in Electron
      window.electron.showNotification(title, body);
    } else {
      // We're in a browser, fallback to alert
      alert(`${title}: ${body}`);
    }
  };

  const handleSubmit = (goal) => {
    console.log("Submitting goal:", goal);
    // Minimize the app
    handleMinimize();
    
    // Simulate backend response
    setTimeout(() => {
      showNotification('ELSA Response', 'This is a response from the backend');
    }, 2000);
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000); // Hide notification after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notification]);



  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      const scrollHeight = textAreaRef.current.scrollHeight;
      textAreaRef.current.style.height = scrollHeight + 'px';
      setTextAreaHeight(scrollHeight <= 100 ? 'auto' : '100px');
    }
  }, [input]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };


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


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newMessage = { text: `File uploaded: ${file.name}`, sender: 'user', fileUrl: url };
      setMessages(prevMessages => [...prevMessages, newMessage]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
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
    <div className="h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
         {isProactive ?  (
          <ProactiveScreen 
            setIsProactive={setIsProactive} 
            onMinimize={handleMinimize}
            onSubmit={handleSubmit}
          />
        
      ): (
      <div className="w-full h-full bg-white flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
          <span className="text-3xl font-bold tracking-wide">Elsa</span>
          <div className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2">
            <span className="mr-3 text-sm font-medium">Proactive mode</span>
            <Switch
              checked={isProactive}
              onChange={(checked) => {
                setIsProactive(checked);
                // Reset messages when switching modes
                setMessages([]);
              }}
              className={`${
                isProactive ? 'bg-indigo-400' : 'bg-gray-300'
              } relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <span
                className={`${
                  isProactive ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
              />
            </Switch>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl shadow-md ${
                msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.text && <p className="text-sm leading-relaxed break-words">{msg.text}</p>}
                {msg.imageUrl && <img src={msg.imageUrl} alt="Screenshot" className="mt-3 rounded-lg" />}
                {msg.videoUrl && <video controls src={msg.videoUrl} className="mt-3 rounded-lg" />}
                {msg.audioUrl && <audio controls src={msg.audioUrl} className="mt-3 w-full" />}
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-white border-t border-gray-200 flex items-end space-x-4">
          <button className="p-3 text-gray-500 hover:text-blue-500 transition-colors focus:outline-none" onClick={triggerFileInput}>
            <FontAwesomeIcon icon={faPaperclip} className="text-xl" />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <div className="flex-1 relative">
            <textarea
              ref={textAreaRef}
              className="w-full p-4 pr-12 bg-gray-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none"
              style={{ height: textAreaHeight, maxHeight: '100px', overflowY: 'auto' }}
              value={input}
              onChange={handleInputChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Chat with Elsa"
              rows={1}
            />
            <button 
              className="absolute right-3 bottom-3 p-2 text-blue-500 hover:text-blue-600 transition-colors focus:outline-none" 
              onClick={input.trim() ? handleSendMessage : isRecordingAudio ? stopAudioRecording : startAudioRecording}
            >
              <FontAwesomeIcon icon={input.trim() ? faPaperPlane : (isRecordingAudio ? faStop : faMicrophone)} className="text-xl" />
            </button>
          </div>
          <button className="p-3 text-green-500 hover:text-green-600 transition-colors focus:outline-none" onClick={captureScreenshot}>
            <FontAwesomeIcon icon={faCamera} className="text-xl" />
          </button>
          <button className="p-3 text-blue-500 hover:text-blue-600 transition-colors focus:outline-none" onClick={isRecordingVideo ? stopVideoRecording : startVideoRecording}>
            <FontAwesomeIcon icon={isRecordingVideo ? faStop : faVideo} className="text-xl" />
          </button>
        </div>
      </div>
      )}

      {notification && (
        <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
          <button 
            onClick={() => setNotification(null)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <p>{notification}</p>
        </div>
      )}
    </div>
  );
}

export default App;
