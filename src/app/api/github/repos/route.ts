import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'GitHub username is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?type=public&sort=updated&per_page=100`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
      // You might need to add an Authorization header with a GitHub Personal Access Token
      // for higher rate limits or private repositories.
      // 'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || 'Failed to fetch repositories from GitHub' }, { status: response.status });
    }

    const repos = await response.json();

    // Filter out forks and map to a simplified project structure
    const projects = repos
      .filter((repo: any) => !repo.fork)
      .map((repo: any) => ({
        id: repo.id,
        title: repo.name,
        description: repo.description || 'No description provided.',
        descriptionEn: repo.description || 'No description provided.', // For now, use same for English
        image: repo.owner.avatar_url, // Using avatar as a placeholder for image
        tags: repo.topics || [],
        demoUrl: repo.homepage || repo.html_url, // Use homepage if available, otherwise repo URL
        githubUrl: repo.html_url,
        featured: false, // Default to false, can be updated manually
        githubRepoName: repo.name,
      }));

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Error fetching GitHub repositories:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
