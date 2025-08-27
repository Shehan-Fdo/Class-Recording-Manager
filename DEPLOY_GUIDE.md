# How to Deploy to Vercel

This guide will walk you through deploying your YouTube Class Recording Manager to Vercel and securely configuring your Gemini API key.

## Step 1: Push to a Git Repository

Vercel deploys directly from a Git repository (like GitHub, GitLab, or Bitbucket).

1.  Create a new repository on your preferred Git provider.
2.  Initialize a git repository in your project folder, commit your files, and push them to the new repository.

    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin <YOUR_GIT_REPOSITORY_URL>
    git push -u origin main
    ```

## Step 2: Import Project on Vercel

1.  Sign up for or log in to your [Vercel account](https://vercel.com/).
2.  From your Vercel dashboard, click "**Add New...**" and select "**Project**".
3.  Find your Git repository and click "**Import**".

## Step 3: Configure Environment Variables

This is the most important step for securing your API key.

1.  In the "**Configure Project**" screen on Vercel, expand the "**Environment Variables**" section.
2.  Add a new environment variable:
    *   **Name**: `API_KEY`
    *   **Value**: Paste your actual Google Gemini API key here.
3.  Ensure the variable is available to all environments (Production, Preview, Development).
4.  Click the "**Add**" button to save the variable.

![Vercel Environment Variable Setup](https://vercel.com/docs/storage/vercel-kv/env-var.png)

## Step 4: Deploy

1.  Vercel should automatically detect that this is a static project with API routes and won't require any specific build settings.
2.  Click the "**Deploy**" button.
3.  Vercel will build and deploy your application. Once finished, you'll be given a public URL to access your live application.

That's it! Your application is now live, and your API key is securely managed by Vercel.
