"use client";

import { useState } from "react";
import { usePublishAnnouncementMutation } from "@/store/api/adminApi";

export function AnnouncementForm() {
  const [publish, { isLoading }] = usePublishAnnouncementMutation();
  const [headline, setHeadline] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  async function submit(action: "draft" | "publish") {
    setFeedback(null);
    try {
      const result = await publish({
        headline,
        message,
        publish: action === "publish",
      }).unwrap();
      setFeedback({
        tone: "success",
        text: result.publishedAt
          ? `Published "${result.headline}".`
          : `Saved draft "${result.headline}".`,
      });
      if (action === "publish") {
        setHeadline("");
        setMessage("");
      }
    } catch (err) {
      const text =
        err && typeof err === "object" && "data" in err
          ? ((err as { data?: { message?: string } }).data?.message ??
            "Unable to save announcement.")
          : "Unable to save announcement.";
      setFeedback({ tone: "error", text });
    }
  }

  return (
    <section className="border border-outline-variant p-8 bg-surface">
      <h2 className="font-display text-headline-md text-primary mb-6 uppercase">
        CREATE ANNOUNCEMENT
      </h2>
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit("publish");
        }}
      >
        <div className="flex flex-col gap-2">
          <label className="text-label-uppercase text-secondary uppercase">
            Headline
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Enter announcement headline"
            className="border-0 border-b border-outline-variant bg-transparent py-2 px-0 focus:outline-none focus:border-primary text-body-lg text-primary placeholder:text-outline-variant"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-label-uppercase text-secondary uppercase">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Enter full announcement details"
            className="border border-outline-variant bg-transparent p-3 focus:outline-none focus:border-primary text-body-md text-primary placeholder:text-outline-variant resize-none"
          />
        </div>
        {feedback && (
          <p
            className={`text-caption uppercase tracking-[0.1em] ${
              feedback.tone === "success" ? "text-primary" : "text-error"
            }`}
          >
            {feedback.text}
          </p>
        )}
        <div className="flex justify-end gap-4 mt-2">
          <button
            type="button"
            onClick={() => submit("draft")}
            disabled={isLoading}
            className="px-6 py-3 border border-outline-variant text-primary text-label-uppercase hover:bg-surface-container-low transition-colors uppercase disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-primary text-on-primary text-label-uppercase hover:opacity-80 transition-opacity uppercase disabled:opacity-50"
          >
            {isLoading ? "SAVING…" : "Publish"}
          </button>
        </div>
      </form>
    </section>
  );
}
