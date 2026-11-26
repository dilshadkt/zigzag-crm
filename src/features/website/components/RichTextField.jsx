import React, { useMemo, useRef, useState } from "react";
import JoditEditor from "jodit-react";
import DOMPurify from "dompurify";
import { toast } from "react-hot-toast";
import { useWebsite } from "../context";
import { errorMessage } from "../../accounts/utils/format";
import { IMAGE_ACCEPT, uploadImage } from "../api/websiteApi";
import "./richTextField.css";

// Stored articles are shown inside the CRM, so nothing in them may run here
const forEditor = (html) =>
  DOMPurify.sanitize(html || "", {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target"],
  });

const pickFile = () =>
  new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = IMAGE_ACCEPT;
    input.onchange = () => resolve(input.files?.[0]);
    input.click();
  });

const RichTextField = ({ siteId, value, onChange, disabled }) => {
  const { uploadsReady } = useWebsite();
  // The editor tidies HTML as it loads it. Only real edits are passed on, so
  // opening an entry never counts as changing it.
  const touched = useRef(false);
  const [initial] = useState(() => forEditor(value));
  const latestChange = useRef(onChange);
  latestChange.current = onChange;

  const config = useMemo(
    () => ({
      readonly: Boolean(disabled),
      minHeight: 360,
      maxHeight: 640,
      theme: document.documentElement.dataset.theme === "dark" ? "dark" : "default",
      toolbarAdaptive: false,
      toolbarSticky: false,
      enableDragAndDropFileToEditor: false,
      disablePlugins: ["about", "speech-recognize", "ai-assistant"],
      removeButtons: ["file", "about", "ai-assistant", "ai-commands", "speechRecognize"],
      cleanHTML: { denyTags: "script,object,embed", removeEventAttributes: true, safeJavaScriptLink: true },
      extraButtons: uploadsReady
        ? [
            {
              name: "crmUpload",
              text: "Upload image",
              tooltip: "Upload an image and place it here",
              exec: async (editor) => {
                editor.s.save();
                const file = await pickFile();
                if (!file) return;
                const waiting = toast.loading("Uploading image…");
                try {
                  const url = await uploadImage(siteId, file);
                  editor.s.restore();
                  await editor.s.insertImage(url);
                  touched.current = true;
                  editor.synchronizeValues();
                } catch (error) {
                  toast.error(errorMessage(error));
                } finally {
                  toast.dismiss(waiting);
                }
              },
            },
          ]
        : [],
    }),
    [disabled, siteId, uploadsReady]
  );

  const markTouched = () => {
    touched.current = true;
  };

  return (
    <div
      className="website-editor text-slate-800"
      onKeyDownCapture={markTouched}
      onPointerDownCapture={markTouched}
      onPasteCapture={markTouched}
      onDropCapture={markTouched}
    >
      <JoditEditor value={initial} config={config} onChange={(html) => touched.current && latestChange.current(html)} />
    </div>
  );
};

export default RichTextField;
