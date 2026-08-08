"use client";

import { useState, useRef } from "react";
import * as tus from "tus-js-client";
import { Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface VideoUploaderProps {
  onSuccess: (videoId: string) => void;
}

export function VideoUploader({ onSuccess }: VideoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const uploadRef = useRef<tus.Upload | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(false);
      setProgress(0);
    }
  };

  const startUpload = () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const upload = new tus.Upload(file, {
      endpoint: "/api/upload-video",
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      onError: (err) => {
        setIsUploading(false);
        setError("Erro no upload: " + err.message);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = (bytesUploaded / bytesTotal) * 100;
        setProgress(percentage);
      },
      onSuccess: () => {
        setIsUploading(false);
        setSuccess(true);
        // A URL do Cloudflare Stream gerada via TUS tem o ID do vídeo no final
        // Ex: https://api.cloudflare.com/.../stream/1234abcd5678
        const urlSegments = upload.url?.split("/") || [];
        const videoId = urlSegments[urlSegments.length - 1];
        if (videoId) {
          onSuccess(videoId);
        } else {
          setError("Upload concluiu mas não foi possível identificar o ID do vídeo.");
        }
      },
    });

    uploadRef.current = upload;
    upload.start();
  };

  const cancelUpload = () => {
    if (uploadRef.current) {
      uploadRef.current.abort();
    }
    setIsUploading(false);
    setProgress(0);
  };

  return (
    <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 bg-white/[0.02] transition-colors hover:border-primary/50 group">
      {!file && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Upload de Vídeo</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Selecione o arquivo da aula (.mp4, .mov). Limite de 5GB.
          </p>
          <label className="cursor-pointer">
            <span className="bg-primary text-black font-bold px-6 py-2 rounded-full hover:bg-primary/90 transition-colors">
              Selecionar Arquivo
            </span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}

      {file && !isUploading && !success && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="flex items-center gap-4 bg-black/40 px-6 py-4 rounded-xl border border-white/5 mb-6">
            <Upload className="w-6 h-6 text-primary" />
            <div className="text-left">
              <p className="text-sm font-bold text-white max-w-[200px] truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button onClick={() => setFile(null)} className="ml-4 text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <Button onClick={startUpload} className="w-full sm:w-auto bg-primary text-black font-bold hover:bg-primary/90">
            Iniciar Upload
          </Button>
          {error && (
            <div className="flex items-center gap-2 mt-4 text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      )}

      {isUploading && (
        <div className="py-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 animate-bounce text-primary" />
              Enviando...
            </span>
            <span className="text-sm text-primary font-mono">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/10 mb-4" />
          <p className="text-xs text-muted-foreground text-center mb-6">
            Por favor, não feche esta janela durante o upload.
          </p>
          <div className="flex justify-center">
            <Button variant="outline" size="sm" onClick={cancelUpload} className="border-red-500/50 text-red-400 hover:bg-red-500/10">
              Cancelar Upload
            </Button>
          </div>
        </div>
      )}

      {success && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Upload Concluído!</h3>
          <p className="text-sm text-muted-foreground">
            O vídeo foi processado pelo Cloudflare Stream com sucesso.
          </p>
        </div>
      )}
    </div>
  );
}
