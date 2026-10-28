import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import LeadUploadModal from "./LeadUploadModal";
import LeadImportMapModal from "./LeadImportMapModal";
import { bulkCreateLeads, useGetLeadFormConfig, useGetLeadStatuses } from "../api";
import {
  EXTRA_FIELDS,
  autoMapColumns,
  buildLeadFromRow,
  downloadLeadTemplate,
  getImportFields,
  parseLeadFile,
} from "../utils/leadImport";

// Rows sent per request. The API applies scoring + assignment rules per lead, so keep requests small.
const CHUNK_SIZE = 100;

const LeadImportFlow = ({
  isOpen,
  onClose,
  projects = [],
  defaultProjectId = "",
  isProjectLocked = false,
  onImported,
}) => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState("upload");
  const [projectId, setProjectId] = useState("");
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState({ headers: [], rows: [] });
  const [mapping, setMapping] = useState({});
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // Every time the flow opens it starts fresh, pre-selecting the project the user is already looking at
  useEffect(() => {
    if (!isOpen) return;
    setStep("upload");
    setProjectId(defaultProjectId || "");
    setFile(null);
    setParsed({ headers: [], rows: [] });
    setMapping({});
    setIsParsing(false);
    setIsImporting(false);
    setProgress({ done: 0, total: 0 });
  }, [isOpen, defaultProjectId]);

  // The chosen project decides which form (fields) and statuses apply
  const { data: formConfigData, isLoading: isFormLoading } = useGetLeadFormConfig(projectId || null);
  const { data: statusesData } = useGetLeadStatuses(projectId || null);

  const fields = useMemo(
    () => getImportFields(formConfigData?.data?.fields || []),
    [formConfigData]
  );
  const statuses = useMemo(() => statusesData?.data || [], [statusesData]);

  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        value: String(project._id || project.id),
        label: project.name,
      })),
    [projects]
  );
  const selectedProjectName =
    projectOptions.find((option) => option.value === projectId)?.label || "the selected project";

  const handleProjectChange = (value) => {
    setProjectId(value || "");
  };

  const handleNext = async () => {
    if (!projectId || !file) return;
    setIsParsing(true);
    try {
      const result = await parseLeadFile(file);
      if (result.headers.length === 0 || result.rows.length === 0) {
        toast.error("The file has no headers or no data rows");
        return;
      }
      setParsed(result);
      setMapping(autoMapColumns([...fields, ...EXTRA_FIELDS], result.headers));
      setStep("map");
    } catch (error) {
      console.error("Error reading lead file:", error);
      toast.error("Could not read this file. Please check the format.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleMappingChange = (key, value) => {
    setMapping((prev) => ({ ...prev, [key]: value }));
  };

  // Turn spreadsheet rows into lead payloads using the current mapping
  const { leads, skippedCount } = useMemo(() => {
    if (step !== "map") return { leads: [], skippedCount: 0 };
    const built = [];
    let skipped = 0;
    parsed.rows.forEach((row) => {
      const lead = buildLeadFromRow(row, mapping, fields, statuses);
      if (lead) built.push(lead);
      else skipped += 1;
    });
    return { leads: built, skippedCount: skipped };
  }, [step, parsed, mapping, fields, statuses]);

  const handleImport = async () => {
    if (leads.length === 0) return;
    setIsImporting(true);
    setProgress({ done: 0, total: leads.length });

    let created = 0;
    let failed = 0;
    let firstError = "";

    try {
      for (let i = 0; i < leads.length; i += CHUNK_SIZE) {
        const chunk = leads.slice(i, i + CHUNK_SIZE);
        try {
          const response = await bulkCreateLeads({ leads: chunk, project: projectId });
          const chunkCreated = response?.createdCount ?? response?.data?.length ?? 0;
          created += chunkCreated;
          failed += chunk.length - chunkCreated;
          if (!firstError && response?.errors?.length) firstError = response.errors[0].error;
        } catch (error) {
          failed += chunk.length;
          if (!firstError) firstError = error?.response?.data?.message || error.message;
        }
        setProgress({ done: Math.min(i + CHUNK_SIZE, leads.length), total: leads.length });
      }
    } finally {
      setIsImporting(false);
    }

    queryClient.invalidateQueries({ queryKey: ["leads"] });
    queryClient.invalidateQueries({ queryKey: ["leadStats"] });

    if (created > 0) {
      toast.success(
        `Imported ${created} lead${created === 1 ? "" : "s"} into ${selectedProjectName}` +
          (failed > 0 ? ` (${failed} failed)` : "")
      );
      onImported?.();
      onClose();
    } else {
      toast.error(firstError || "Failed to import leads");
    }
    if (created > 0 && failed > 0 && firstError) {
      toast.error(`Some rows failed: ${firstError}`);
    }
  };

  return (
    <>
      <LeadUploadModal
        isOpen={isOpen && step === "upload"}
        onClose={onClose}
        projectOptions={projectOptions}
        projectId={projectId}
        onProjectChange={handleProjectChange}
        isProjectLocked={isProjectLocked}
        file={file}
        onFileSelect={setFile}
        onNext={handleNext}
        isParsing={isParsing || (Boolean(projectId) && isFormLoading)}
        onDownloadTemplate={() => downloadLeadTemplate(fields)}
      />
      <LeadImportMapModal
        isOpen={isOpen && step === "map"}
        onClose={onClose}
        onBack={() => setStep("upload")}
        projectName={selectedProjectName}
        fileName={file?.name || ""}
        headers={parsed.headers}
        rows={parsed.rows}
        fields={fields}
        mapping={mapping}
        onMappingChange={handleMappingChange}
        validCount={leads.length}
        skippedCount={skippedCount}
        onImport={handleImport}
        isImporting={isImporting}
        progress={progress}
      />
    </>
  );
};

export default LeadImportFlow;
