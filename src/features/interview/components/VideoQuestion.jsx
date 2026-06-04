import { useEffect, useRef, useState } from "react";
import { supabase } from "@/shared/services/supabase";
import { uploadRecording } from "../services/video_storage_service";

const MAX_SECONDS = 180;

export default function VideoQuestion({ question, applicationStageId, onAnswer }) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MAX_SECONDS);
  const [videoUrl, setVideoUrl] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | previewing | recording | reviewing | uploading

  const videoRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const blobRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    requestCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPermissionGranted(true);
      setStatus("previewing");
    } catch {
      alert("Camera and microphone access is required to record your answer.");
    }
  };

  const startRecording = () => {
    chunksRef.current = [];
    setVideoUrl(null);
    blobRef.current = null;

    let recorder;
    try {
      recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm; codecs=vp9" });
    } catch {
      recorder = new MediaRecorder(streamRef.current);
    }

    recorder.ondataavailable = (e) => {
      if (e.data?.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      blobRef.current = blob;
      setVideoUrl(URL.createObjectURL(blob));
      setStatus("reviewing");
    };

    recorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
    setStatus("recording");
    setTimeLeft(MAX_SECONDS);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (recorderRef.current?.state !== "inactive") recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const handleSubmit = async () => {
    if (!blobRef.current || !question?.id) return;
    setStatus("uploading");

    try {
      // 1. Upload recording to storage
      const { fileName } = await uploadRecording(blobRef.current, applicationStageId, question.id);

      // 2. Call whisper-api synchronously — wait for transcript
      const { data: whisperData, error: whisperErr } = await supabase.functions.invoke("whisper-api", {
        body: { audioPath: fileName, questionId: question.id },
      });

      if (whisperErr) throw whisperErr;

      const transcript = whisperData?.text ?? "";
      onAnswer(transcript || "[No transcript available]");
    } catch (err) {
      console.error("Upload/transcription failed:", err);
      // Still advance with empty transcript so the interview doesn't get stuck
      onAnswer("[Transcription failed]");
    }
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (!permissionGranted) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-12">
        <div className="size-16 rounded-full bg-[--stage-interview]/10 flex items-center justify-center">
          <svg className="size-8 text-[--stage-interview]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 9.75v9A2.25 2.25 0 004.5 18.75z" />
          </svg>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground">Camera access required</p>
          <p className="text-xs text-muted-foreground">Please allow access to record your answer</p>
        </div>
        <button onClick={requestCamera} className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
          Enable Camera &amp; Microphone
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Video preview / review */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0a0f1a] aspect-video flex items-center justify-center border border-border">
        {videoUrl && status === "reviewing" ? (
          <video src={videoUrl} controls autoPlay className="w-full h-full object-cover" />
        ) : (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur rounded-full px-3 py-1.5">
            <span className="size-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-white text-xs font-medium">{fmt(timeLeft)}</span>
          </div>
        )}

        {status === "uploading" && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
            <div className="size-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-white text-sm font-medium">Transcribing your answer…</p>
            <p className="text-white/60 text-xs">This may take a few seconds</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-2">
        {status === "previewing" && (
          <button
            onClick={startRecording}
            className="w-full bg-destructive text-destructive-foreground rounded-lg py-3 text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <span className="size-2 rounded-full bg-white animate-pulse" />
            Start Recording (max 3 min)
          </button>
        )}

        {status === "recording" && (
          <button
            onClick={stopRecording}
            className="w-full bg-foreground text-background rounded-lg py-3 text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
            Stop Recording
          </button>
        )}

        {status === "reviewing" && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={startRecording}
              className="border bg-background text-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
            >
              Re-record
            </button>
            <button
              onClick={handleSubmit}
              className="bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Submit Answer →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
