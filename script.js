document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('downloadForm');
  const resultDiv = document.getElementById('result');
  const errorDiv = document.getElementById('error');
  const downloadMp4Btn = document.getElementById('downloadMp4');
  const downloadMp3Btn = document.getElementById('downloadMp3');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const videoUrl = document.getElementById('videoUrl').value;
    const videoId = getVideoId(videoUrl);

    if (!videoId) {
      showError('Invalid YouTube URL');
      return;
    }

    try {
      const videoInfo = await fetchVideoInfo(videoId);
      displayVideoInfo(videoInfo, videoId);
    } catch (error) {
      showError('Error fetching video information');
    }
  });

  function getVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  async function fetchVideoInfo(videoId) {
    const response = await fetch(`/api/video-info?videoId=${videoId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch video information');
    }

    const data = await response.json();
    if (data) {
      return data;
    } else {
      throw new Error('No video information found');
    }
  }

  function displayVideoInfo(videoInfo, videoId) {
    document.getElementById('videoTitle').textContent = videoInfo.title;
    document.getElementById('videoThumbnail').src = videoInfo.thumbnailUrl;
    document.getElementById('viewCount').textContent = videoInfo.viewCount;
    document.getElementById('likeCount').textContent = videoInfo.likeCount;
    document.getElementById('videoDescription').textContent = videoInfo.description;

    downloadMp4Btn.onclick = () => initiateDownload(videoId, 'mp4');
    downloadMp3Btn.onclick = () => initiateDownload(videoId, 'mp3');

    resultDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');
  }

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');
  }

  async function initiateDownload(videoId, format) {
    try {
      const response = await fetch(`/api/download?videoId=${videoId}&format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `video.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        showError('Error downloading video');
      }
    } catch (error) {
      showError('Error downloading video');
    }
  }
});
