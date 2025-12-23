# Deploying to Render

This guide will help you deploy the Mood Sticker Y2K app to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. Your GitHub repository connected to Render
3. Your OpenAI API key (from https://platform.openai.com/api-keys)

## Deployment Steps

### 1. Connect Your Repository

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account if not already connected
4. Select the repository: `moodsticker-y2k`
5. Click "Connect"

### 2. Configure the Service

Render should auto-detect the `render.yaml` file. If not, configure manually:

- **Name**: `moodsticker-y2k`
- **Environment**: `PHP`
- **Build Command**: `composer install && php setup-database.php`
- **Start Command**: `php -S 0.0.0.0:$PORT -t public router.php`
- **Health Check Path**: `/views/landing.html`

### 3. Set Environment Variables

1. In the Render dashboard, go to your service
2. Click on "Environment" in the left sidebar
3. Click "Add Environment Variable"
4. Add the following:

   - **Key**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-`)
   - Click "Save Changes"

### 4. Deploy

1. Render will automatically start deploying
2. Wait for the build to complete (check the "Logs" tab)
3. Once deployed, your app will be available at: `https://moodsticker-y2k.onrender.com` (or your custom domain)

### 5. Verify Deployment

1. Visit your Render URL
2. Check the debug endpoint: `https://your-app.onrender.com/api/debug/env`
3. Verify that `OPENAI_API_KEY` shows as available
4. Test sticker generation

## Troubleshooting

### Environment Variables Not Working

- Make sure `OPENAI_API_KEY` is set in Render's Environment tab
- After adding variables, Render will auto-redeploy
- Check the debug endpoint to verify variables are exposed

### Build Failures

- Check the build logs in Render dashboard
- Ensure `composer.json` has all required dependencies
- Verify PHP 8.3 is available (Render should auto-detect from `render.yaml`)

### Database Issues

- The SQLite database will be created automatically during build
- If issues occur, check the `setup-database.php` logs

## Render vs Railway Differences

- **Environment Variables**: Render exposes variables via `$_SERVER` and `getenv()` - the code handles this automatically
- **URL**: Render provides `RENDER_EXTERNAL_URL` instead of `RAILWAY_STATIC_URL`
- **Deployment**: Render auto-deploys on git push (similar to Railway)

## Support

If you encounter issues:
1. Check Render's deployment logs
2. Use the `/api/debug/env` endpoint to verify environment variables
3. Check Render's documentation: https://render.com/docs

