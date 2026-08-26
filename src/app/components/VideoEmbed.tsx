type VideoEmbedProps = {
  videoUrl: string;
};

export default function VideoEmbed({ videoUrl }: VideoEmbedProps) {
  let embedUrl = "";

  // Same URL-sniffing logic as the old SpecialSetups/VideoEmbeded.jsx:
  // turn YouTube/Facebook share links into their embeddable form,
  // otherwise fall back to using the URL as-is.
  if (videoUrl.includes("youtu.be")) {
    const videoId = videoUrl.split("/").pop()?.split("?")[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (videoUrl.includes("youtube.com")) {
    const urlParams = new URLSearchParams(new URL(videoUrl).search);
    const videoId = urlParams.get("v");
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (
    videoUrl.includes("fb.watch") ||
    videoUrl.includes("facebook.com")
  ) {
    embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      videoUrl,
    )}&show_text=false&width=734`;
  } else {
    embedUrl = videoUrl;
  }

  return (
    <div className="video-container">
      <iframe
        src={embedUrl}
        width="734"
        height="413"
        style={{ border: "none", overflow: "hidden" }}
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      />
    </div>
  );
}
