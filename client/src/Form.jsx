import React, { useEffect, useState } from 'react';
import useSpeechToText from 'react-hook-speech-to-text';
import { useSpeech } from "react-text-to-speech";
import axios from 'axios';

const Form = () => {
  const [formData, setFormData] = useState({
    query: '',
  });

  const [text, setText] = useState("");
  const [res, setRes] = useState("");

  const voices = [
    { name: "Google UK English Female"},
    { name: "Google UK English Male"}
  ];

  const [selectedVoice, setSelectedVoice] = useState(voices[0].name);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleVoiceChange = (e) => {
    setSelectedVoice(e.target.value);
  };

  const { speechStatus, start, pause, stop } = useSpeech({ 
    text: text, 
    pitch: 1, 
    rate: 1, 
    volume: 1, 
    lang: "", 
    voiceURI: selectedVoice, 
    autoPlay: true, 
    highlightText: false, 
    showOnlyHighlightedText: false, 
    highlightMode: "word" 
  });

  const handleSubmit = async () => {
    if (!formData.query.trim()) return; 
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/tutor/query?question=${encodeURIComponent(formData.query)}`
      );
      setText(response.data);
      setRes(response.data);
      start(); 
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form');
    }
  };

  const {
    error,
    interimResult,
    isRecording,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    if (interimResult) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        query: interimResult,
      }));
    }
  }, [interimResult]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleButtonClick = () => {
    if (isRecording) {
      stopSpeechToText(); 
      handleSubmit(); 
    } else if (formData.query.trim()) {
      handleSubmit(); 
    } else {
      startSpeechToText(); 
    }
  };

  if (error) return <p>Web Speech API is not available in this browser 🤷‍</p>;

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <div>
          <label>Ques:</label>
          <input
            type="text"
            name="query"
            value={formData.query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            required
          />
          <button type="button" onClick={handleButtonClick}>
            {isRecording ? 'Stop & Submit' : formData.query ? 'Submit' : 'Start Recording'}
          </button>
        </div>

        <div>
          <label>Select Voice:</label>
          <select value={selectedVoice} onChange={handleVoiceChange}>
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
      </form>

      <div>
        <h1>Recording: {isRecording.toString()}</h1>
        <p>{res}</p>
      </div>

      {text && (
        <div style={{ margin: "1rem", whiteSpace: "pre-wrap" }}>
          <div style={{ display: "flex", columnGap: "1rem", marginBottom: "1rem" }}>
            <button disabled={speechStatus === "started"} onClick={start}>
              Start
            </button>
            <button disabled={speechStatus === "paused"} onClick={pause}>
              Pause
            </button>
            <button disabled={speechStatus === "stopped"} onClick={stop}>
              Stop
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Form;
