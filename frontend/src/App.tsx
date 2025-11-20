import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import './App.css';
import AudioPlayer from './components/AudioPlayer';

function App() {
  const [recording, setRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [isSocketOpen, setIsSocketOpen] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);

    const audioChunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => audioChunks.push(event.data);

    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      setAudioBlob(audioBlob);
      setRecording(false);
      if (timerInterval) clearInterval(timerInterval);
      setRecordingTime(0);
    };

    recorder.start();
    setRecording(true);

    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleToggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const sendAudio = (audioBlob: Blob) => {
    if (socket && isSocketOpen) {
      const reader = new FileReader();
      reader.onload = () => {
        socket.emit('audio', reader.result);
      };
      reader.readAsArrayBuffer(audioBlob);
      removeAudio();
    } else {
      console.error('Websocket is not open or audioBlob is missing');
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    if (timerInterval) clearInterval(timerInterval);
  };

  useEffect(() => {
    const newSocket = io('http://localhost:8080');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsSocketOpen(true);
    });

    newSocket.on('disconnect', () => {
      setIsSocketOpen(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {!audioBlob && (
        <button
          onClick={handleToggleRecording}
          className={`p-8 transition-all duration-300 ${recording && 'pulsating'}`}
        >
          {recording ? 'Stop Recording' : 'Start Recording'}
        </button>
      )}
      {recording && (
        <div className="flex items-center justify-center">{recordingTime}s</div>
      )}
      {audioBlob && (
        <AudioPlayer
          onSendAudio={sendAudio}
          onRemoveAudio={removeAudio}
          audioBlob={audioBlob}
          isSocketOpen={isSocketOpen}
        />
      )}
    </div>
  );
}

export default App;
