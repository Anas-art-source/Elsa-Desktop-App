import React, { useState, useRef, useEffect } from 'react';
import './index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faVideo, faCamera, faPaperclip, faPaperPlane, faStop, faVolumeUp, faBolt, faComments, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Switch } from '@headlessui/react';

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
  const [isProactive, setIsProactive] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const mediaRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const [textAreaHeight, setTextAreaHeight] = useState('auto');
  const textAreaRef = useRef(null);
  const [notification, setNotification] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:12345');

    socketRef.current.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleIncomingMessage(data);
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socketRef.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        socketRef.current = new WebSocket('ws://localhost:12345');
      }, 5000);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const handleIncomingMessage = (data) => {
    showNotification('ELSA Response', data.response);
    setMessages(prevMessages => [...prevMessages, { text: data.response, sender: 'bot' }]);
  };

  const showNotification = (title, body) => {
    if (window.electron) {
      window.electron.showNotification(title, body);
    } else {
      setNotification(`${title}: ${body}`);
    }
  };

  const handleMinimize = () => {
    window.electron.minimizeApp();
  };

  

  const handleSubmit = async (goal) => {
    console.log("Submitting goal:", goal);
    handleMinimize();
  
    try {
      const response = await fetch('http://127.0.0.1:8000/configure_proactive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({
          toggle: true,
          goal: goal,
        }),
      });
  
      if (!response.ok) {
        const errorMessage = await response.json();
        console.error("Error submitting goal:", errorMessage);
        showNotification('Error', `Failed to submit goal. ${errorMessage.detail || errorMessage.message || 'Please try again.'}`);
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("API Response:", data);
      showNotification('Success', data.message || 'Goal submitted successfully.');
    } catch (error) {
      console.error('Error submitting goal:', error);
      showNotification('Error', 'Failed to submit goal. Please try again.');
    }
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
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

  const handleSendMessage = async () => {
    if (input.trim() === '') return;
  
    const newMessage = { text: input, sender: 'user' };
    setMessages([...messages, newMessage]);
    setInput('');
  
    try {
      setMessages(prevMessages => [...prevMessages, { text: 'Thinking...', sender: 'bot', isLoading: true }]);
  
      const response = await fetch(`http://127.0.0.1:8000/generate_reactive_response/?query=${encodeURIComponent(input)}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      setMessages(prevMessages => prevMessages.filter(msg => !msg.isLoading));
  
      const receivedMessage = { text: data, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, receivedMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      setMessages(prevMessages => prevMessages.filter(msg => !msg.isLoading));
  
      const errorMessage = { text: 'Sorry, there was an error processing your request.', sender: 'bot', isError: true };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const filePath = file.path;
  
        setMessages(prevMessages => [...prevMessages, { text: 'Configuring knowledge base...', sender: 'bot', isLoading: true }]);
  
        const response = await fetch(`http://127.0.0.1:8000/configure_knowledgebase_directory/?directory=${encodeURIComponent(filePath)}`, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
  
        setMessages(prevMessages => prevMessages.filter(msg => !msg.isLoading));
  
        const newMessage = { text: `Knowledge base configured with file: ${file.name}`, sender: 'bot' };
        setMessages(prevMessages => [...prevMessages, newMessage]);
      } catch (error) {
        console.error('Error:', error);
        
        setMessages(prevMessages => prevMessages.filter(msg => !msg.isLoading));
  
        const errorMessage = { text: 'Sorry, there was an error configuring the knowledge base.', sender: 'bot', isError: true };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
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
      const source = sources[0];

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
      const source = sources[0];

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
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      alert(`Failed to capture screenshot: ${error.message}`);
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {isProactive ? (
        <ProactiveScreen 
          setIsProactive={setIsProactive} 
          onMinimize={handleMinimize}
          onSubmit={handleSubmit}
        />
      ) : (
        <div className="w-full h-full bg-white flex flex-col overflow-hidden shadow-2xl">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
            <span className="text-3xl font-bold tracking-wide">Elsa</span>
            <div className="flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2">
              <span className="mr-3 text-sm font-medium">Proactive mode</span>
              <Switch
                checked={isProactive}
                onChange={(checked) => {
                  setIsProactive(checked);
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
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              webkitdirectory="true" 
              directory="true"
            />         
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