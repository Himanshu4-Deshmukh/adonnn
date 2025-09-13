import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function uploadImageToGitHub(imageBuffer: Buffer, filename: string): Promise<string> {
  try {
    const base64Content = imageBuffer.toString('base64');
    
    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_USERNAME!,
      repo: process.env.GITHUB_REPO!,
      path: `images/${filename}`,
      message: `Upload image ${filename}`,
      content: base64Content,
      branch: process.env.GITHUB_BRANCH,
    });

    return response.data.content.download_url;
  } catch (error) {
    console.error('Error uploading to GitHub:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteImageFromGitHub(filename: string): Promise<void> {
  try {
    // First get the file to get its SHA
    const fileResponse = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_USERNAME!,
      repo: process.env.GITHUB_REPO!,
      path: `images/${filename}`,
      ref: process.env.GITHUB_BRANCH,
    });

    if ('sha' in fileResponse.data) {
      await octokit.rest.repos.deleteFile({
        owner: process.env.GITHUB_USERNAME!,
        repo: process.env.GITHUB_REPO!,
        path: `images/${filename}`,
        message: `Delete image ${filename}`,
        sha: fileResponse.data.sha,
        branch: process.env.GITHUB_BRANCH,
      });
    }
  } catch (error) {
    console.error('Error deleting from GitHub:', error);
    throw new Error('Failed to delete image');
  }
}