import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  audioBlob: Blob | null;
  isSocketOpen: boolean;
  onSendAudio: (audioBlob: Blob) => void;
  onRemoveAudio: () => void;
}
const AudioPlayer = ({
  audioBlob,
  isSocketOpen,
  onSendAudio,
  onRemoveAudio,
}: AudioPlayerProps) => {
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      try {
        if (audioRef.current) audioRef.current.currentTime = 0;
        await audioRef.current?.play();
        setIsPlaying(true);
        setPlaybackTime(0);
      } catch (error) {
        console.error('Error playing audio: ', error);
      }
    }
  };

  useEffect(() => {
    if (audioBlob && audioRef.current) {
      const audioElement = audioRef.current;
      audioElement.src = URL.createObjectURL(audioBlob);

      const handleEnded = () => {
        setPlaybackTime(0);
      };

      audioElement.addEventListener('ended', handleEnded);

      return () => {
        audioElement.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioBlob]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      const audioElement = audioRef.current;

      const updatePlaybackTime = () => {
        setPlaybackTime(Math.floor(audioElement.currentTime));
      };

      audioElement.addEventListener('timeupdate', updatePlaybackTime);

      return () => {
        audioElement.removeEventListener('timeupdate', updatePlaybackTime);
      };
    }
  }, [isPlaying]);

  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <audio ref={audioRef}>
        Your browser does not support the audio element.
      </audio>
      <span>Playback Time: {playbackTime}s</span>
      <div className="flex flex-col gap-4 items-center justify-center">
        <button
          onClick={handlePlayPause}
        >{`${isPlaying ? 'Pause' : 'Play'}`}</button>
        <div className="flex gap-4 items-center justify-center">
          <button
            onClick={() => {
              onSendAudio(audioBlob!);
            }}
            className="p-4"
            disabled={!isSocketOpen}
          >
            Send Audio
          </button>
          <button
            onClick={onRemoveAudio}
            className="p-4 bg-red-700"
            disabled={!isSocketOpen}
          >
            Remove Audio
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
