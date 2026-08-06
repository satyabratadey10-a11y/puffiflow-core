# PuffiFlow Modal GPU Worker

This package handles serverless 4K video upscaling on NVIDIA T4 GPUs via [Modal.com](https.modal.com).

## Setup & Deployment

1. Install Modal CLI:
   ```bash
   pip install modal
   modal token new
   ```

2. Set Modal secrets for Cloudflare R2:
   ```bash
   modal secret create r2-credentials \
     R2_ACCOUNT_ID="<your-account-id>" \
     R2_ACCESS_KEY_ID="<your-access-key>" \
     R2_SECRET_ACCESS_KEY="<your-secret-key>" \
     R2_BUCKET_NAME="puffiflow-videos" \
     R2_PUBLIC_DOMAIN="https://pub-xxxxxx.r2.dev"
   ```

3. Deploy Modal app:
   ```bash
   npm run deploy
   ```
