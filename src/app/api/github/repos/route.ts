import { NextResponse } from 'next/server';

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  fork: boolean;
  topics: string[];
  homepage: string | null;
  html_url: string;
  owner: { avatar_url: string };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'GitHub username is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?type=public&sort=updated&per_page=100`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: (errorData as { message?: string }).message || 'Failed to fetch repositories from GitHub' },
        { status: response.status }
      );
    }

    const repos: GitHubRepo[] = await response.json();

    const projects = repos
      .filter((repo) => !repo.fork)
      .map((repo) => ({
        id: repo.id,
        title: repo.name,
        description: repo.description || 'No description provided.',
        descriptionEn: repo.description || 'No description provided.',
        image: repo.owner.avatar_url,
        tags: repo.topics || [],
        demoUrl: repo.homepage || repo.html_url,
        githubUrl: repo.html_url,
        featured: false,
        githubRepoName: repo.name,
      }));

    return NextResponse.json(projects);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Error fetching GitHub repositories:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
