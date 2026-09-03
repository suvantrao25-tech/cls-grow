"use client";

import { useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { supabase } from "@/lib/supabase";

export default function VideoCreator() {
  const [videoPhotos, setVideoPhotos] = useState<File[]>([]);
  const [videoCreating, setVideoCreating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videoLimitMessage, setVideoLimitMessage] = useState<string | null>(null);

  const createVideo = async () => {
    if (videoPhotos.length === 0) {
      alert("Please upload at least one photo.");
      return;
    }

    try {
      setVideoLimitMessage(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please log in to create a video.");
        return;
      }

      // LOCAL plan is stored as START in subscriptions.
      const { data: subscription, error: subscriptionError } = await supabase
        .from("subscriptions")
        .select("plan, status, current_period_end")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subscriptionError) {
        console.error("Subscription check error:", subscriptionError);
        alert("Unable to verify your subscription. Please try again.");
        return;
      }

      if (subscription?.plan === "START" && subscription?.status === "active") {
        const { data: usage, error: usageError } = await supabase
          .from("video_usage")
          .select("last_video_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (usageError) {
          console.error("Video usage check error:", usageError);
          alert("Unable to check your video limit. Please try again.");
          return;
        }

        if (usage?.last_video_at) {
          const lastVideo = new Date(usage.last_video_at);
          const nextVideo = new Date(lastVideo.getTime() + 7 * 24 * 60 * 60 * 1000);
          const now = new Date();

          if (now < nextVideo) {
            const dateText = nextVideo.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            setVideoLimitMessage(
              `Your weekly video has already been used. Your next video will be available on ${dateText}.`
            );
            return;
          }
        }
      }

      setVideoCreating(true);

      const ffmpeg = new FFmpeg();
      const baseURL = "/ffmpeg";

      const coreURL = await toBlobURL(
        `${baseURL}/ffmpeg-core.js`,
        "text/javascript"
      );

      const wasmURL = await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      );

      const classWorkerURL =
        `${window.location.origin}/ffmpeg/worker.js`;

      console.log("FFmpeg: loading started");

      await ffmpeg.load({
        coreURL,
        wasmURL,
        classWorkerURL,
      });

      console.log("FFmpeg: loading finished");

      for (let i = 0; i < videoPhotos.length; i++) {
        await ffmpeg.writeFile(
          `photo${i}.jpg`,
          await fetchFile(videoPhotos[i])
        );
      }

      await ffmpeg.writeFile(
        "music.mp3",
        await fetchFile("/audio/music.mp3")
      );

      console.log("FFmpeg: files loaded");

      const inputArgs: string[] = [];

      for (let i = 0; i < videoPhotos.length; i++) {
        inputArgs.push(
          "-loop",
          "1",
          "-t",
          "5",
          "-i",
          `photo${i}.jpg`
        );
      }

      const filter = videoPhotos
        .map(
          (_, i) =>
            `[${i}:v]scale=360:640:force_original_aspect_ratio=decrease,pad=360:640:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=10[v${i}]`
        )
        .join(";");

      const concatInputs = videoPhotos
        .map((_, i) => `[v${i}]`)
        .join("");

      const audioIndex = videoPhotos.length;

      console.log("FFmpeg: starting lightweight encode");
      ffmpeg.on("log", ({ message }) => console.log("FFmpeg:", message));
      ffmpeg.on("progress", ({ progress, time }) => console.log("FFmpeg progress:", progress, "time:", time));

      await ffmpeg.exec([
        ...inputArgs,
        "-stream_loop",
        "-1",
        "-i",
        "music.mp3",

        "-filter_complex",
        `${filter};${concatInputs}concat=n=${videoPhotos.length}:v=1:a=0[outv];[${audioIndex}:a]volume=0.15[audio]`,

        "-map",
        "[outv]",
        "-map",
        "[audio]",

        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "35",
        "-pix_fmt",
        "yuv420p",

        "-c:a",
        "aac",
        "-b:a",
        "64k",

        "-t",
        String(videoPhotos.length * 5),
        "output.mp4",
      ]);

      console.log("FFmpeg: encode finished");

      const data = await ffmpeg.readFile("output.mp4");

      const blob = new Blob(
        [data as BlobPart],
        { type: "video/mp4" }
      );

      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }

      setVideoUrl(URL.createObjectURL(blob));

      // Consume the weekly video only after successful creation.
      const {
        data: { user: completedUser },
      } = await supabase.auth.getUser();

      if (completedUser) {
        const { data: completedSubscription } = await supabase
          .from("subscriptions")
          .select("plan, status")
          .eq("user_id", completedUser.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (
          completedSubscription?.plan === "START" &&
          completedSubscription?.status === "active"
        ) {
          const { error: usageSaveError } = await supabase
            .from("video_usage")
            .upsert(
              {
                user_id: completedUser.id,
                last_video_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );

          if (usageSaveError) {
            console.error("Video usage save error:", usageSaveError);
          }
        }
      }

      console.log("Video: ready");
    } catch (error) {
      console.error("Video creation error:", error);

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      alert(`Video could not be created: ${message}`);
    } finally {
      setVideoCreating(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Create Business Video
      </h2>

      <input
        ref={videoInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          setVideoPhotos(files);
          setVideoUrl(null);
        }}
      />

      {videoPhotos.length > 0 && (
        <p className="mt-2 text-sm">
          {videoPhotos.length} photo(s) selected
        </p>
      )}

      {videoLimitMessage && (
        <p className="mt-3 text-sm text-red-600">
          {videoLimitMessage}
        </p>
      )}

      <button
        type="button"
        onClick={createVideo}
        disabled={
          videoCreating || videoPhotos.length === 0
        }
        className="mt-4 rounded-lg px-4 py-2 bg-black text-white disabled:opacity-50"
      >
        {videoCreating
          ? "Creating Video..."
          : "Create Video"}
      </button>

      {videoUrl && (
        <div className="mt-6">
          <video
            src={videoUrl}
            controls
            playsInline
            className="w-full max-w-md rounded-lg"
          />

          <a
            href={videoUrl}
            download="business-video.mp4"
            className="inline-flex mt-3 rounded-lg px-4 py-2 bg-gray-900 text-white"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}




