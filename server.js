const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/api/video-info', async (req, res) => {
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    const videoInfo = await ytdl.getInfo(videoId);
    res.json({
      title: videoInfo.videoDetails.title,
      thumbnailUrl: videoInfo.videoDetails.thumbnails[0].url,
      viewCount: videoInfo.videoDetails.viewCount,
      likeCount: videoInfo.videoDetails.likes,
      description: videoInfo.videoDetails.description
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching video information' });
  }
});

app.get('/api/download', async (req, res) => {
  const { videoId, format } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    const videoInfo = await ytdl.getInfo(videoId);
    const videoTitle = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, '');

    if (format === 'mp4') {
      res.header('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);
      ytdl(videoId, { quality: 'highest' }).pipe(res);
    } else if (format === 'mp3') {
      res.header('Content-Disposition', `attachment; filename="${videoTitle}.mp3"`);
      const stream = ytdl(videoId, { quality: 'highestaudio' });
      ffmpeg(stream)
        .audioCodec('libmp3lame')
        .toFormat('mp3')
        .pipe(res);
    } else {
      res.status(400).json({ error: 'Invalid format' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while downloading the video' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
