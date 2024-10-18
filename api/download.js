// api/download.js
import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // Get the file name from query parameters (?file=filename)
  const { file } = req.query;

  if (!file) {
    return res.status(400).json({ message: "File name is required" });
  }

  try {
    // Get the file path from the 'public' directory
    const filePath = path.join(process.cwd(), 'public', file);
    const fileContent = await fs.readFile(filePath);

    // Set the headers to download the file
    res.setHeader('Content-Disposition', `attachment; filename=${file}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send the file
    res.status(200).send(fileContent);
  } catch (error) {
    res.status(404).json({ message: 'File not found' });
  }
}
