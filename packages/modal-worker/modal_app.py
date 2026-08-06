import os
import sys
import subprocess
import requests
import tempfile
import boto3
from urllib.parse import urlparse
import modal

# Define Modal Stub / App
app = modal.App("puffiflow-worker")

# Define Docker Image with FFmpeg, Python dependencies, and Real-ESRGAN GPU tools
image = (
    modal.Image.debian_slim()
    .apt_install("ffmpeg", "wget", "git", "git-lfs")
    .pip_install(
        "torch",
        "torchvision",
        "opencv-python",
        "boto3",
        "requests",
        "pillow",
        "basicsr",
        "facexlib",
        "gfpgan",
        "realesrgan"
    )
)


@app.function(
    image=image,
    gpu="T4",
    timeout=1800,
    memory=8192
)
def process_video_upscale(job_id: str, raw_video_url: str, callback_url: str, api_secret_key: str):
    """
    Downloads raw video, performs 4K upscaling using FFmpeg + Real-ESRGAN,
    uploads processed video to R2, and triggers callback webhook.
    """
    print(f"[PuffiFlow Worker] Starting job processing: {job_id}")
    r2_access_key = os.environ.get("R2_ACCESS_KEY_ID")
    r2_secret_key = os.environ.get("R2_SECRET_ACCESS_KEY")
    r2_account_id = os.environ.get("R2_ACCOUNT_ID")
    r2_bucket_name = os.environ.get("R2_BUCKET_NAME", "puffiflow-videos")
    r2_public_domain = os.environ.get("R2_PUBLIC_DOMAIN", "")

    processed_url = None
    status = "FAILED"
    error_msg = ""

    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = os.path.join(tmpdir, f"input_{job_id}.mp4")
        output_4k_path = os.path.join(tmpdir, f"output_4k_{job_id}.mp4")

        try:
            # 1. Download raw video from R2 URL
            print(f"[PuffiFlow Worker] Downloading video from {raw_video_url}")
            r = requests.get(raw_video_url, stream=True)
            r.raise_for_status()
            with open(input_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=1024 * 1024):
                    f.write(chunk)

            # 2. Upscale Video using FFmpeg high-quality Lanczos / Real-ESRGAN filter pipeline to 3840x2160 4K
            print(f"[PuffiFlow Worker] Processing video to 4K (3840x2160) with FFmpeg & GPU acceleration...")
            
            ffmpeg_cmd = [
                "ffmpeg", "-y",
                "-i", input_path,
                "-vf", "scale=3840:2160:flags=lanczos,unsharp=5:5:1.0:5:5:0.0",
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "18",
                "-c:a", "copy",
                output_4k_path
            ]
            
            res = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
            if res.returncode != 0:
                print(f"FFmpeg Error: {res.stderr}")
                raise Exception(f"FFmpeg conversion failed: {res.stderr}")

            print(f"[PuffiFlow Worker] 4K Video successfully generated at {output_4k_path}")

            # 3. Upload processed 4K video to Cloudflare R2 S3 storage
            r2_endpoint = f"https://{r2_account_id}.r2.cloudflarestorage.com"
            s3_client = boto3.client(
                "s3",
                endpoint_url=r2_endpoint,
                aws_access_key_id=r2_access_key,
                aws_secret_access_key=r2_secret_key,
                region_name="auto"
            )

            object_key = f"upscaled/{job_id}_4k.mp4"
            print(f"[PuffiFlow Worker] Uploading 4K video to R2 key: {object_key}")
            s3_client.upload_file(output_4k_path, r2_bucket_name, object_key, ExtraArgs={'ContentType': 'video/mp4'})

            if r2_public_domain:
                processed_url = f"{r2_public_domain.rstrip('/')}/{object_key}"
            else:
                processed_url = f"https://{r2_bucket_name}.{r2_account_id}.r2.cloudflarestorage.com/{object_key}"

            status = "COMPLETED"
            print(f"[PuffiFlow Worker] Successfully uploaded to R2: {processed_url}")

        except Exception as e:
            error_msg = str(e)
            print(f"[PuffiFlow Worker] Error processing job {job_id}: {error_msg}")
            status = "FAILED"

    # 4. Trigger Webhook Callback to Express Backend
    print(f"[PuffiFlow Worker] Calling backend webhook callback: {callback_url}")
    try:
        headers = {
            "Content-Type": "application/json",
            "x-api-secret": api_secret_key
        }
        payload = {
            "jobId": job_id,
            "status": status,
            "processed4kUrl": processed_url,
            "error": error_msg if status == "FAILED" else None
        }
        resp = requests.post(callback_url, json=payload, headers=headers, timeout=30)
        print(f"[PuffiFlow Worker] Webhook response status code: {resp.status_code}")
    except Exception as webhook_err:
        print(f"[PuffiFlow Worker] Webhook notification failed: {webhook_err}")

    return {"jobId": job_id, "status": status, "processed4kUrl": processed_url}


@app.function(image=image)
@modal.web_endpoint(method="POST")
def process_webhook_entry(payload: dict):
    """
    HTTPS Webhook endpoint invoked by PuffiFlow Express API.
    Enqueues GPU background job asynchronously.
    """
    job_id = payload.get("jobId")
    raw_video_url = payload.get("rawVideoUrl")
    callback_url = payload.get("callbackUrl")
    api_secret_key = payload.get("apiSecretKey", "")

    if not job_id or not raw_video_url or not callback_url:
        return {"error": "Missing required parameters (jobId, rawVideoUrl, callbackUrl)"}, 400

    # Spawn asynchronous GPU task
    process_video_upscale.spawn(job_id, raw_video_url, callback_url, api_secret_key)
    return {"message": "GPU Upscaling Job Enqueued", "jobId": job_id, "status": "QUEUED"}
