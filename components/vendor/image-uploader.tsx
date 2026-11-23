"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ImagePlusIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { Thumb } from "@/components/vendor/shared";
import {
  IMAGE_ACCEPT,
  IMAGE_MAX_BYTES,
  LIMITS,
  uploadImage,
  validateImageFile,
} from "@/lib/vendor-api";

export type UploadItem = {
  key: string;
  name: string;
  /** What to show: the existing URL, or a local object URL for a new file. */
  preview: string;
  /** The hosted (ImgBB) URL, once known. This is what the menu item stores. */
  url?: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
  file?: File;
};

let counter = 0;
const nextKey = () => `img-${++counter}`;

/**
 * State for the images of one menu item. New files are validated in the
 * browser, then uploaded one at a time through the backend's ImgBB endpoint
 * (the ImgBB key never reaches the browser). Existing images start as "done".
 */
export function useImageUploads(initialUrls: string[]) {
  const [items, setItems] = useState<UploadItem[]>(() =>
    initialUrls.map((url) => ({
      key: nextKey(),
      name: url.split("/").pop() ?? "image",
      preview: url,
      url,
      progress: 100,
      status: "done" as const,
    }))
  );
  const [notices, setNotices] = useState<string[]>([]);

  const queue = useRef<Promise<void>>(Promise.resolve());
  const controllers = useRef(new Map<string, AbortController>());
  const blobUrls = useRef(new Set<string>());

  useEffect(() => {
    const pending = controllers.current;
    const blobs = blobUrls.current;
    return () => {
      for (const controller of pending.values()) controller.abort();
      for (const url of blobs) URL.revokeObjectURL(url);
    };
  }, []);

  function patch(key: string, changes: Partial<UploadItem>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...changes } : item)));
  }

  function startUpload(key: string, file: File) {
    const controller = new AbortController();
    controllers.current.set(key, controller);
    queue.current = queue.current.then(async () => {
      if (controller.signal.aborted) return;
      patch(key, { status: "uploading", progress: 0, error: undefined });
      const result = await uploadImage(file, (progress) => patch(key, { progress }), controller.signal);
      controllers.current.delete(key);
      if (controller.signal.aborted) return;
      if (result.ok) patch(key, { status: "done", progress: 100, url: result.data.url, file: undefined });
      else patch(key, { status: "error", error: result.message });
    });
  }

  async function addFiles(files: File[]) {
    const messages: string[] = [];
    const room = LIMITS.maxImages - items.length;
    if (files.length > room) {
      messages.push(
        room > 0
          ? `Only ${room} more image${room === 1 ? "" : "s"} can be added (maximum ${LIMITS.maxImages}).`
          : `A menu item can have at most ${LIMITS.maxImages} images.`
      );
    }
    const accepted: UploadItem[] = [];
    for (const file of files.slice(0, Math.max(room, 0))) {
      const problem = await validateImageFile(file);
      if (problem) {
        messages.push(`${file.name}: ${problem}`);
        continue;
      }
      const preview = URL.createObjectURL(file);
      blobUrls.current.add(preview);
      accepted.push({ key: nextKey(), name: file.name, preview, progress: 0, status: "uploading", file });
    }
    setNotices(messages);
    if (accepted.length === 0) return;
    setItems((current) => [...current, ...accepted]);
    for (const item of accepted) startUpload(item.key, item.file as File);
  }

  function remove(key: string) {
    controllers.current.get(key)?.abort();
    controllers.current.delete(key);
    setItems((current) => {
      const target = current.find((item) => item.key === key);
      if (target && blobUrls.current.delete(target.preview)) URL.revokeObjectURL(target.preview);
      return current.filter((item) => item.key !== key);
    });
  }

  function retry(key: string) {
    const item = items.find((entry) => entry.key === key);
    if (item?.file) startUpload(key, item.file);
  }

  return {
    items,
    notices,
    addFiles,
    remove,
    retry,
    urls: items.flatMap((item) => (item.status === "done" && item.url ? [item.url] : [])),
    uploading: items.some((item) => item.status === "uploading"),
    failed: items.some((item) => item.status === "error"),
  };
}

export function ImageUploader({
  uploads,
  invalid,
}: {
  uploads: ReturnType<typeof useImageUploads>;
  invalid?: string;
}) {
  const { items, notices, addFiles, remove, retry } = uploads;
  const inputRef = useRef<HTMLInputElement>(null);
  const full = items.length >= LIMITS.maxImages;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length > 0) void addFiles(files);
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item, index) => (
          <figure key={item.key} className="relative rounded-xl border border-crust bg-surface p-2">
            <Thumb src={item.preview} alt={`Preview of ${item.name}`} className="aspect-square w-full" />
            {index === 0 && (
              <span className="absolute top-3.5 left-3.5 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold text-page">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(item.key)}
              aria-label={`Remove ${item.name}`}
              className="absolute top-3.5 right-3.5 inline-flex size-6 items-center justify-center rounded-full bg-surface/90 text-ink shadow outline-none hover:text-tomato focus-visible:ring-2 focus-visible:ring-tomato"
            >
              <XIcon aria-hidden="true" className="size-3.5" />
            </button>

            <figcaption className="mt-2 min-h-8 text-xs">
              {item.status === "uploading" && (
                <div>
                  <div
                    role="progressbar"
                    aria-label={`Uploading ${item.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={item.progress}
                    className="h-1.5 overflow-hidden rounded-full bg-crust"
                  >
                    <div
                      className="h-full rounded-full bg-tomato transition-[width] duration-150"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-ink/60">{item.progress === 0 ? "Waiting..." : `Uploading ${item.progress}%`}</p>
                </div>
              )}
              {item.status === "done" && <p className="truncate text-emerald-700">Uploaded</p>}
              {item.status === "error" && (
                <div role="alert">
                  <p className="text-tomato">{item.error}</p>
                  {item.file && (
                    <button
                      type="button"
                      onClick={() => retry(item.key)}
                      className="mt-1 inline-flex items-center gap-1 font-semibold text-ink underline"
                    >
                      <RotateCcwIcon aria-hidden="true" className="size-3" /> Retry
                    </button>
                  )}
                </div>
              )}
            </figcaption>
          </figure>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-crust bg-surface/60 p-3 text-center text-xs font-medium text-ink/65 outline-none transition-colors hover:border-tomato hover:text-tomato focus-visible:ring-2 focus-visible:ring-tomato"
          >
            <ImagePlusIcon aria-hidden="true" className="size-6" />
            Add images
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={IMAGE_ACCEPT}
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      <p className="mt-2 text-xs text-ink/60">
        JPEG, PNG or WEBP, up to {IMAGE_MAX_BYTES / 1024 / 1024} MB each, at most {LIMITS.maxImages} images. The first
        image is the cover.
      </p>
      {invalid && (
        <p role="alert" className="mt-2 text-sm text-tomato">
          {invalid}
        </p>
      )}
      {notices.length > 0 && (
        <ul role="alert" className="mt-2 space-y-1 text-sm text-tomato">
          {notices.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
