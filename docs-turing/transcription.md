---
sidebar_position: 10
title: Transcription
description: Speech-to-text in Viglet Turing ES — a config-selectable, chunk-capable transcription backend (cloud OpenAI, self-hosted OpenAI-compatible, or in-process) that powers persona-from-audio, AUDIO chat slots, and async jobs for long recordings.
---

# Transcription (Speech-to-Text)

**Transcription** turns an audio recording into text inside Viglet Turing ES. It is the engine behind three product surfaces: [drafting a persona from a voice recording](./personas.md#persona-from-audio-authoring), filling an **AUDIO chat slot** from an uploaded clip, and the standalone **async transcription jobs** API for long recordings.

You'd reach for this page when you want to point transcription at a specific backend (a cloud provider, a self-hosted server, or an air-gapped in-process engine), when a recording is **larger than the provider's per-request upload limit**, or when you need to transcribe multi-hour audio without tying up a request thread.

The design goal is that everything here is **opt-in**: with no `turing.transcription.*` configuration set, transcription behaves exactly as it did before — a single cloud OpenAI-compatible call using your default [LLM instance](./llm-instances.md)'s connection.

---

## The transcription seam

Transcription rides a single pluggable seam (`TurTranscriptionProvider`) so every caller — persona-from-audio, AUDIO slots, async jobs — inherits the same backend choice, chunking, and metrics for free. You choose the backend once; the rest of the platform follows.

```
Audio ──► Chunker (splits past the per-request limit) ──► Provider ──► Transcript
                                                            │
                                        OPENAI · OPENAI_COMPATIBLE · LOCAL_ONNX · NONE
```

---

## From zero: turn on transcription

1. Open **Administration → Settings → Global Settings**, **Transcription (Speech-to-Text)** section (Generative AI tab).
2. Pick a **Strategy** (start with `OPENAI` — it reuses your default LLM instance's OpenAI-compatible connection, no extra setup).
3. Optionally set a dedicated **Endpoint**, **Model**, **API key** (write-only, encrypted) and **Max upload bytes** for the backend.
4. Save, then use any transcription surface (upload to an AUDIO slot, derive a persona from audio, or submit an async job).

Headless / Viglet Cloud deployments can pin the backend per container with the `turing.transcription.*` properties instead of the UI — a non-blank property **wins** over the DB Global Settings value, so the container is authoritative.

---

## Backends

Transcription is a **selectable strategy** so you can match cost, privacy, and infrastructure to your deployment.

| Strategy | What it is | Setup | Best for |
|---|---|---|---|
| **`OPENAI`** *(default)* | Cloud OpenAI-compatible `/audio/transcriptions` (`whisper-1`). With no dedicated config it reuses your default LLM instance's base URL + key. | Zero-config if you already run OpenAI | Managed cloud stacks |
| **`OPENAI_COMPATIBLE`** | The **recommended local path** — a self-hosted server speaking the OpenAI transcription contract (e.g. [`faster-whisper-server`](https://github.com/fedirz/faster-whisper-server)). | Run the server, set a dedicated **Endpoint** | Cost-sensitive, on-prem, GPU-capable |
| **`LOCAL_ONNX`** | An air-gapped, no-sidecar path that runs Whisper **in-process**. The seam and model-size contract ship today; the in-process inference runtime is **not yet bundled** — selecting it fails safely with an actionable message and **never sends audio anywhere**. | — (see note) | Fully offline (once bundled) |
| **`NONE`** | Transcription disabled. Callers fail soft with a clear message. | — | Turning the feature off |

:::note `LOCAL_ONNX` is a validated seam, not yet a runtime
Selecting `LOCAL_ONNX` today returns a clear "not bundled in this build" message and points you to the supported local path (`OPENAI_COMPATIBLE` with a self-hosted server). Crucially, it **never falls back to a cloud backend** — an air-gapped selection can't leak audio off-box. The in-process runtime is deliberately deferred until the engine choice is settled. For a fully local backend now, use `OPENAI_COMPATIBLE`.
:::

### Self-hosted OpenAI-compatible server

`OPENAI_COMPATIBLE` points the same REST path at your own server. Any server implementing OpenAI's `POST {baseUrl}/audio/transcriptions` works — a common choice is `faster-whisper-server`:

```yaml
# docker-compose snippet
services:
  faster-whisper:
    image: fedirz/faster-whisper-server:latest-cpu   # or -cuda for GPU
    ports:
      - "8000:8000"
```

Then set the transcription **Endpoint** to `http://faster-whisper:8000/v1` (leave the API key blank — self-hosted servers usually need none; Turing omits the `Authorization` header when the key is blank). Only the URL differs from the cloud path, so it scales horizontally and can be GPU-backed.

---

## Chunking: transcribing past the upload limit

Every transcription backend has a per-request upload ceiling (cloud OpenAI caps at **25 MiB**). A recording over that limit used to fail outright. Turing now **chunks transparently**:

- Audio **at or under** the limit is sent as-is (no processing overhead).
- Audio **over** the limit is split with `ffmpeg` into segments that each stay under the limit, re-encoded to compact 16 kHz mono, with cut points **snapped to silence** and a small **overlap** carried between chunks. Chunks transcribe in parallel (bounded) and the transcripts are stitched back together, de-duplicating the overlap window.

Chunking requires **`ffmpeg`** (and `ffprobe`) on the host. If they're absent, small clips still work; a large recording fails with a clear "install ffmpeg" message. Use the **Check ffmpeg** button in the Transcription settings section to verify the binaries are reachable.

---

## Async transcription jobs

Long recordings shouldn't block an HTTP request. Submit them as **jobs** and poll or stream for the result.

| Endpoint | Purpose |
|---|---|
| `POST /api/genai/transcription/jobs` | Multipart upload (`file` + optional `language`) → returns a `jobId` with state `QUEUED`. |
| `GET /api/genai/transcription/jobs/{jobId}` | Poll the current status/result. |
| `GET /api/genai/transcription/jobs/{jobId}/stream` | Server-Sent Events of state changes; the stream completes on the terminal event. |

```bash
# Submit
curl -X POST https://your-turing/api/genai/transcription/jobs \
  -F "file=@meeting.mp3" -F "language=en"
# → {"jobId":"…","state":"QUEUED", …}

# Poll
curl https://your-turing/api/genai/transcription/jobs/{jobId}
# → {"state":"SUCCEEDED","transcript":"…","language":"en", …}
```

A job moves `QUEUED → RUNNING → SUCCEEDED | FAILED`. Work runs on a **bounded worker pool** with a bounded queue: when both are saturated, a submission is rejected with **HTTP 429** (back-pressure) rather than growing memory without limit — retry shortly. Terminal results are retained for a configurable window, then evicted. Each job reuses the same chunk-aware pipeline, so multi-hour audio just works.

---

## AUDIO chat slots

When an [AI Agent](./ai-agents.md) has an **AUDIO** multi-modal slot, uploading a clip to it now **transcribes** the audio (through the configured backend, chunked if large) and writes the transcript into the agent's first target **text** slot — so a spoken answer becomes a filled slot value. If no transcription backend is configured, the upload falls back to Gemini native understanding (when the agent's LLM is a Gemini instance). A **VIDEO** slot continues to use Gemini understanding, which also describes the visual track.

## Persona from audio

Drafting a persona from a voice recording (`POST /api/persona/derive-from-audio`) transcribes the clip through this same seam before the LLM analyses it — so it, too, benefits from chunking and your chosen backend. See [Personas → Persona-from-audio authoring](./personas.md#persona-from-audio-authoring).

---

## Per-backend metrics

`GET /api/genai/transcription/metrics` returns one row per backend that has served a transcription — **count, error rate, latency percentiles (avg / p50 / p95 / max), and total bytes** — so you can see whether the local path is fast enough or the cloud fallback is carrying the load. It's the same "which backend is the p95 outlier?" view as [tool-latency analytics](./chat-analytics.md), applied to transcription.

## Confidence fallback (local → cloud)

An **optional** escalation: run a local backend first and fall back to a cloud backend only when the local result **fails** or comes back **below a confidence threshold**. Enable it with `turing.transcription.confidence-fallback-enabled=true` and set `confidence-fallback-type` (default cloud `OPENAI`). Confidence is derived from an OpenAI-compatible `verbose_json` response's segment log-probabilities; a backend that reports none never triggers the threshold (only outright failure does). Default off = a single backend, no retry.

---

## Configuration reference

All keys live under `turing.transcription.*`. A non-blank value **wins** over the DB Global Settings row (so a container can pin the backend); anything unset falls back to the UI value, then the default.

| Key | Default | Purpose |
|---|---|---|
| `type` | `OPENAI` | Backend: `OPENAI` · `OPENAI_COMPATIBLE` · `LOCAL_ONNX` · `NONE`. |
| `endpoint` | — | Dedicated OpenAI-compatible base URL (e.g. `http://faster-whisper:8000/v1`). |
| `model` | `whisper-1` | Transcription model name. |
| `api-key` | — | API key for the endpoint (blank = no `Authorization` header). |
| `max-upload-bytes` | `26214400` | Per-request upload limit (25 MiB); the chunker splits above this. |
| `onnx-model-size` | `base` | `LOCAL_ONNX` Whisper size: `tiny` · `base` · `small`. |
| `ffmpeg-path` | `ffmpeg` | `ffmpeg` executable used to split/re-encode large audio. |
| `ffprobe-path` | `ffprobe` | `ffprobe` executable used to probe duration. |
| `chunk-overlap-seconds` | `2.0` | Overlap carried between chunks so the stitch drops no words. |
| `ffmpeg-timeout-seconds` | `120` | Timeout for a single ffmpeg/ffprobe call. |
| `chunk-concurrency` | `3` | Max chunks transcribed concurrently per recording. |
| `async-workers` | `2` | Worker threads in the async job pool. |
| `async-queue-capacity` | `8` | Bounded queue depth before submissions are rejected (429). |
| `async-job-retention-seconds` | `3600` | How long a terminal job's result is retained for polling. |
| `confidence-fallback-enabled` | `false` | Enable the local→cloud confidence fallback. |
| `confidence-fallback-type` | `OPENAI` | Backend the fallback escalates to. |
| `confidence-threshold` | `0.5` | Minimum 0–1 confidence before the fallback escalates. |

See the [Configuration Reference](./configuration-reference.md) for how these sit alongside the rest of `turing.*`.
