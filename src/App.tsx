import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import jsPDF from "jspdf";




type IconName =
  | "home"
  | "history"
  | "user"
  | "search"
  | "bell"
  | "upload"
  | "file"
  | "shield"
  | "warning"
  | "sparkle"
  | "trash"
  | "eye"
  | "download"
  | "check"
  | "arrow"
  | "lightbulb"
  | "close";

function Icon({
  name,
  size = 22,
  strokeWidth = 1.8,
  className,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5.5 9.5V21h13V9.5" />
          <path d="M9 21v-6h6v6" />
        </svg>
      );

    case "history":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="7" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
      );


    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M5 20h14" />
        </svg>
      );

    case "file":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8M8 17h6" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "warning":
      return (
        <svg {...common}>
          <path d="M10.3 3.8 2.5 17.5A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.5L13.7 3.8a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "sparkle":
      return (
        <svg {...common}>
          <path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4z" />
          <path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7z" />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M10 11v6M14 11v6" />
          <path d="M6 7l1 14h10l1-14" />
          <path d="M9 7V4h6v3" />
        </svg>
      );

    case "eye":
      return (
        <svg {...common}>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );

    case "download":
      return (
        <svg {...common}>
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    case "lightbulb":
      return (
        <svg {...common}>
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.8.7-1.5 1.7-1.5 2.5h-4c0-.8-.7-1.8-1.5-2.5Z" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
  }
}

function App() {

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  // Navigation
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history
  useEffect(() => {
    const savedHistory = localStorage.getItem("veritext_history");

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        localStorage.removeItem("veritext_history");
      }
    }
  }, []);

  // ---------------- FILE SELECTION ----------------

  const selectFile = (selectedFile: File | null) => {
    if (!selectedFile) return;

    const allowedTypes = [".pdf", ".docx", ".txt"];

    const extension =
      "." + selectedFile.name.split(".").pop()?.toLowerCase();

    if (!allowedTypes.includes(extension)) {
      setError("Only PDF, DOCX, and TXT files are allowed.");
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError("");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectFile(event.target.files?.[0] || null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);

    selectFile(event.dataTransfer.files?.[0] || null);
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ---------------- HISTORY ----------------

  const deleteHistoryItem = (id: number) => {
    const updatedHistory = history.filter(
      (item) => item.id !== id
    );

    setHistory(updatedHistory);

    localStorage.setItem(
      "veritext_history",
      JSON.stringify(updatedHistory)
    );
  };

  const viewHistoryReport = (item: any) => {
    setResult({
      filename: item.filename,
      plagiarism_percentage: item.plagiarism_percentage,
      results: item.results || [],
      text: item.text || "",
    });

    setShowHistory(false);
    setShowProfile(false);
  };

  // ---------------- UPLOAD ----------------

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a document first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
       "https://veritext-ai-backend.onrender.com/upload/",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setResult(data);

      const historyItem = {
        id: Date.now(),
        filename: data.filename,
        plagiarism_percentage: data.plagiarism_percentage,
        original_percentage:
          100 -
          Math.min(
            data.plagiarism_percentage,
            100
          ),
        sentence_count: data.results?.length || 0,
        results: data.results || [],
        text: data.text || "",
        date: new Date().toLocaleString(),
      };

      const updatedHistory = [
        historyItem,
        ...history,
      ];

      setHistory(updatedHistory);

      localStorage.setItem(
        "veritext_history",
        JSON.stringify(updatedHistory)
      );
    } catch (err: any) {
      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------- PDF REPORT ----------------

  const generatePDF = () => {
    if (!result) return;

    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(22);
    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "VeriText AI",
      20,
      y
    );

    y += 10;

    doc.setFontSize(12);
    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      "Plagiarism Detection Report",
      20,
      y
    );

    y += 15;

    doc.setFontSize(11);

    doc.text(
      `Document: ${result.filename}`,
      20,
      y
    );

    y += 8;

    doc.text(
      `Plagiarism: ${result.plagiarism_percentage}%`,
      20,
      y
    );

    y += 8;

    doc.text(
      `Original Content: ${
        100 -
        Math.min(
          result.plagiarism_percentage,
          100
        )
      }%`,
      20,
      y
    );

    y += 15;

    doc.setFontSize(14);
    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      "Sentence-wise Analysis",
      20,
      y
    );

    y += 10;

    doc.setFontSize(10);
    doc.setFont(
      "helvetica",
      "normal"
    );

    result.results?.forEach(
      (
        item: any,
        index: number
      ) => {
        const sentence =
          `${index + 1}. ${item.sentence}`;

        const status = item.copied
          ? "Possible Copy"
          : "Original";

        const similarity =
          `Similarity: ${item.similarity}%`;

        const lines =
          doc.splitTextToSize(
            sentence,
            170
          );

        if (
          y +
            lines.length * 5 +
            20 >
          280
        ) {
          doc.addPage();
          y = 20;
        }

        doc.text(
          lines,
          20,
          y
        );

        y +=
          lines.length * 5 +
          4;

        doc.text(
          `${status} | ${similarity}`,
          20,
          y
        );

        y += 8;

        if (item.source) {
          const sourceLines =
            doc.splitTextToSize(
              `Source: ${item.source}`,
              170
            );

          doc.text(
            sourceLines,
            20,
            y
          );

          y +=
            sourceLines.length *
              5 +
            8;
        } else {
          y += 4;
        }
      }
    );

    doc.save(
      `VeriText_Report_${result.filename}.pdf`
    );
  };

  // ---------------- CALCULATED DASHBOARD DATA ----------------

  const totalChecks = history.length;

  const totalSentences = history.reduce(
    (total, item) =>
      total + (item.sentence_count || 0),
    0
  );

  const averagePlagiarism =
    history.length > 0
      ? Math.round(
          history.reduce(
            (total, item) =>
              total +
              Number(
                item.plagiarism_percentage || 0
              ),
            0
          ) / history.length
        )
      : 0;

  const averageOriginal =
    100 - averagePlagiarism;

  const currentPlagiarism = result
    ? Number(
        result.plagiarism_percentage || 0
      )
    : averagePlagiarism;

  // ---------------- SIDEBAR ----------------

  const goDashboard = () => {
    setShowHistory(false);
    setShowProfile(false);
  };

  const goHistory = () => {
    setShowHistory(true);
    setShowProfile(false);
  };

  const goProfile = () => {
    setShowHistory(false);
    setShowProfile(true);
  };

  // ---------------- DASHBOARD ----------------

  const Dashboard = () => (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <section className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-5">

        <div className="relative overflow-hidden rounded-2xl border border-[#ead1d8] bg-gradient-to-r from-[#fff6f8] to-[#fdf1f4] p-7">

          <div className="relative z-10 max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9d2d51]">
              Welcome back
            </p>

            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-[#4b1025]">
              Welcome to VeriText AI 👋
            </h2>

            <p className="mt-3 max-w-xl text-sm md:text-base leading-7 text-[#725965]">
              Upload your document and let VeriText AI
              analyze it for possible plagiarism and
              sentence-level similarity.
            </p>

          </div>

          <div className="absolute right-8 bottom-0 hidden md:flex items-end opacity-80">

            <div className="w-32 h-32 rounded-full bg-[#f5dce4] flex items-center justify-center">

              <Icon
                name="file"
                size={58}
              />

            </div>

          </div>

        </div>

        {/* Info Card */}
        <div className="rounded-2xl border border-[#ead9dd] bg-white p-6 shadow-[0_8px_30px_rgba(80,20,40,0.05)]">

          <div className="flex items-start gap-4">

            <div className="w-11 h-11 shrink-0 rounded-full bg-[#f7e5ea] text-[#8e2347] flex items-center justify-center">

              <Icon
                name="lightbulb"
                size={23}
              />

            </div>

            <div>

              <h3 className="font-bold text-[#4b1025]">
                Did you know?
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#76636b]">
                VeriText AI uses Gemini to analyze
                uploaded text and estimate similarity
                sentence by sentence.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* Total */}
        <div className="rounded-2xl border border-[#ead5db] bg-[#fff8fa] p-5">

          <div className="w-11 h-11 rounded-full bg-[#f1d9e1] text-[#7e1e3f] flex items-center justify-center">
            <Icon name="file" />
          </div>

          <p className="mt-4 text-sm font-medium text-[#694b57]">
            Total Checks
          </p>

          <p className="mt-1 text-3xl font-bold text-[#4b1025]">
            {totalChecks}
          </p>

          <p className="mt-1 text-xs text-[#987983]">
            Documents analyzed
          </p>

        </div>

        {/* Original */}
        <div className="rounded-2xl border border-[#dce8d9] bg-[#f8fbf6] p-5">

          <div className="w-11 h-11 rounded-full bg-[#e2efdf] text-[#527247] flex items-center justify-center">
            <Icon name="shield" />
          </div>

          <p className="mt-4 text-sm font-medium text-[#53644d]">
            Original Content
          </p>

          <p className="mt-1 text-3xl font-bold text-[#31462c]">
            {averageOriginal}%
          </p>

          <p className="mt-1 text-xs text-[#778771]">
            Average across reports
          </p>

        </div>

        {/* Plagiarism */}
        <div className="rounded-2xl border border-[#f0dfd4] bg-[#fffaf6] p-5">

          <div className="w-11 h-11 rounded-full bg-[#f8e4d8] text-[#ad542d] flex items-center justify-center">
            <Icon name="warning" />
          </div>

          <p className="mt-4 text-sm font-medium text-[#74594c]">
            Potential Matches
          </p>

          <p className="mt-1 text-3xl font-bold text-[#8d3d24]">
            {averagePlagiarism}%
          </p>

          <p className="mt-1 text-xs text-[#96796d]">
            Average similarity
          </p>

        </div>

        {/* Sentences */}
        <div className="rounded-2xl border border-[#e6dce9] bg-[#faf8fc] p-5">

          <div className="w-11 h-11 rounded-full bg-[#eee3f1] text-[#7a4a83] flex items-center justify-center">
            <Icon name="sparkle" />
          </div>

          <p className="mt-4 text-sm font-medium text-[#66526b]">
            Sentences Analyzed
          </p>

          <p className="mt-1 text-3xl font-bold text-[#52355b]">
            {totalSentences}
          </p>

          <p className="mt-1 text-xs text-[#88778d]">
            Across saved reports
          </p>

        </div>

      </section>

      {/* Main Workspace */}
      <section className="grid grid-cols-1 xl:grid-cols-[1fr_370px] gap-6">

        {/* Upload */}
        <div className="rounded-2xl border border-[#e8d9de] bg-white p-5 md:p-7 shadow-[0_8px_30px_rgba(80,20,40,0.04)]">

          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={handleDrop}
            onClick={() =>
              fileInputRef.current?.click()
            }
            className={`
              min-h-[370px]
              rounded-2xl
              border-2
              border-dashed
              flex
              flex-col
              items-center
              justify-center
              text-center
              px-6
              transition
              cursor-pointer
              ${
                dragActive
                  ? "border-[#8d2347] bg-[#fff0f4]"
                  : "border-[#e2c5cf] bg-[#fffdfd] hover:bg-[#fff8fa]"
              }
            `}
          >

            <div className="w-16 h-16 rounded-full bg-[#f2dce4] text-[#8c2447] flex items-center justify-center">

              <Icon
                name="upload"
                size={32}
                strokeWidth={2}
              />

            </div>

            <h3 className="mt-6 text-2xl font-bold text-[#4b1025]">
              Upload your document
            </h3>

            <p className="mt-2 text-sm text-[#79656d]">
              Drag & drop your file here or click to browse
            </p>

            <p className="mt-4 text-xs text-[#9a858d]">
              Supported formats: PDF, DOCX, TXT
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#731938] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5c122c]"
            >
              <Icon
                name="file"
                size={18}
              />
              Choose File
            </button>

            {!file && (
              <p className="mt-3 text-xs text-[#aa969d]">
                No file chosen
              </p>
            )}

          </div>

          {/* Selected File */}
          {file && (
            <div className="mt-5 rounded-xl border border-[#eadbe0] bg-[#fff8fa] p-4">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="w-11 h-11 rounded-lg bg-[#f1dce3] text-[#8c2447] flex items-center justify-center">
                    <Icon name="file" size={21} />
                  </div>

                  <div className="min-w-0">

                    <p className="font-semibold text-[#4b1025] truncate">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-[#8c777f]">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#a42d4e] hover:text-[#7e1e3c]"
                >
                  <Icon name="close" size={17} />
                  Remove
                </button>

              </div>

            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-center">

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              disabled={loading || !file}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#731938] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#5c122c] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyzing Document...
                </>
              ) : (
                <>
                  <Icon name="shield" size={18} />
                  Check Plagiarism
                </>
              )}
            </button>

          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* How it works */}
          <div className="rounded-2xl border border-[#e7d9de] bg-white p-6">

            <h3 className="text-xl font-bold text-[#4b1025]">
              How it works
            </h3>

            <div className="mt-6 space-y-6">

              {[
                {
                  number: "1",
                  title: "Upload your document",
                  text: "Supports PDF, DOCX and TXT files.",
                },
                {
                  number: "2",
                  title: "Analyze the content",
                  text: "Text is extracted and analyzed using Gemini.",
                },
                {
                  number: "3",
                  title: "Get detailed report",
                  text: "See similarity percentage and sentence-wise results.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="flex gap-4"
                >

                  <div className="relative">

                    <div className="w-10 h-10 rounded-full bg-[#f5e2e8] text-[#7f2141] flex items-center justify-center font-bold">
                      {step.number}
                    </div>

                  </div>

                  <div>

                    <p className="font-semibold text-[#4b1025]">
                      {step.title}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-[#816e76]">
                      {step.text}
                    </p>

                  </div>

                </div>
              ))}

            </div>

          </div>

          {/* Recent Files */}
          <div className="rounded-2xl border border-[#e7d9de] bg-white p-6">

            <div className="flex items-center justify-between">

              <h3 className="text-lg font-bold text-[#4b1025]">
                Recent Files
              </h3>

              {history.length > 0 && (
                <button
                  type="button"
                  onClick={goHistory}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#8b2446] hover:text-[#64142f]"
                >
                  View All
                  <Icon name="arrow" size={14} />
                </button>
              )}

            </div>

            <div className="mt-5">

              {history.length === 0 ? (

                <div className="rounded-xl bg-[#fff9fa] border border-[#f0e1e5] p-5 text-center">

                  <div className="mx-auto w-11 h-11 rounded-full bg-[#f2dce4] text-[#8b2446] flex items-center justify-center">
                    <Icon name="file" size={20} />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-[#5a3b47]">
                    No recent files
                  </p>

                  <p className="mt-1 text-xs text-[#98838b]">
                    Your analyzed documents will appear here.
                  </p>

                </div>

              ) : (

                <div className="space-y-2">

                  {history
                    .slice(0, 4)
                    .map((item) => {

                      const percentage =
                        Number(
                          item.plagiarism_percentage || 0
                        );

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-xl p-3 hover:bg-[#fff7f9] transition"
                        >

                          <div className="w-10 h-10 shrink-0 rounded-lg bg-[#f3dfe5] text-[#8c2447] flex items-center justify-center">
                            <Icon
                              name="file"
                              size={19}
                            />
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold text-[#51313e]">
                              {item.filename}
                            </p>

                            <p className="mt-1 text-[11px] text-[#9a858d]">
                              {item.date}
                            </p>

                          </div>

                          <span
                            className={`
                              shrink-0
                              rounded-full
                              px-2.5
                              py-1
                              text-[11px]
                              font-bold
                              ${
                                percentage >= 70
                                  ? "bg-red-100 text-red-700"
                                  : percentage >= 40
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-green-100 text-green-700"
                              }
                            `}
                          >
                            {percentage}%
                          </span>

                        </div>
                      );
                    })}

                </div>

              )}

            </div>

          </div>

        </div>

      </section>

      {/* Credibility Banner */}
      <div className="rounded-2xl border border-[#ead8de] bg-gradient-to-r from-[#fff3f6] to-[#fff9fa] p-5">

        <div className="flex flex-col md:flex-row md:items-center gap-4">

          <div className="w-12 h-12 shrink-0 rounded-full bg-[#ead0da] text-[#7c1d3c] flex items-center justify-center">
            <Icon name="shield" size={25} />
          </div>

          <div className="flex-1">

            <h3 className="font-bold text-[#4b1025]">
              Ensure originality, build credibility.
            </h3>

            <p className="mt-1 text-sm text-[#806b73]">
              VeriText AI helps you review document
              similarity and understand potentially
              copied content.
            </p>

          </div>

          <button
            type="button"
            onClick={() => {
              if (result) {
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                });
              }
            }}
            className="self-start md:self-center text-[#7f2141]"
          >
            <Icon name="arrow" />
          </button>

        </div>

      </div>

      {/* RESULTS */}
      {result && (
        <section className="space-y-6 pt-4">

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-[#9d2d51]">
                Analysis complete
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#4b1025]">
                Plagiarism Report
              </h2>

            </div>

            <button
              type="button"
              onClick={generatePDF}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#731938] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5c122c] transition"
            >
              <Icon name="download" size={18} />
              Download PDF Report
            </button>

          </div>

          {/* Result Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="rounded-2xl border border-[#e7d9de] bg-white p-6">

              <p className="text-sm text-[#8a747d]">
                Document
              </p>

              <p className="mt-2 truncate text-lg font-bold text-[#4b1025]">
                {result.filename}
              </p>

              <p className="mt-1 text-xs text-[#a08b92]">
                Uploaded document
              </p>

            </div>

            <div className="rounded-2xl border border-[#edd1d9] bg-[#fff8fa] p-6">

              <p className="text-sm text-[#8a747d]">
                Plagiarism
              </p>

              <p className="mt-2 text-3xl font-bold text-[#a32a4d]">
                {result.plagiarism_percentage}%
              </p>

              <p className="mt-1 text-xs text-[#a07d88]">
                Possible copied content
              </p>

            </div>

            <div className="rounded-2xl border border-[#dbe8d8] bg-[#f8fbf7] p-6">

              <p className="text-sm text-[#72806d]">
                Original Content
              </p>

              <p className="mt-2 text-3xl font-bold text-[#4d7244]">
                {
                  100 -
                  Math.min(
                    result.plagiarism_percentage,
                    100
                  )
                }%
              </p>

              <p className="mt-1 text-xs text-[#82917d]">
                Content not flagged
              </p>

            </div>

          </div>

          {/* Overview */}
          <div className="rounded-2xl border border-[#e7d9de] bg-white p-7">

            <h3 className="text-xl font-bold text-[#4b1025]">
              Plagiarism Overview
            </h3>

            <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-12">

              <div className="relative w-56 h-56">

                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background: `conic-gradient(
                      #8b2447 0% ${Math.min(
                        currentPlagiarism,
                        100
                      )}%,
                      #dcebd8 ${Math.min(
                        currentPlagiarism,
                        100
                      )}% 100%
                    )`,
                  }}
                />

                <div className="absolute inset-5 rounded-full bg-white flex flex-col items-center justify-center">

                  <span className="text-4xl font-bold text-[#4b1025]">
                    {result.plagiarism_percentage}%
                  </span>

                  <span className="mt-1 text-sm text-[#8a747d]">
                    Plagiarism
                  </span>

                </div>

              </div>

              <div className="space-y-5">

                <div className="flex items-center gap-3">

                  <div className="w-4 h-4 rounded-full bg-[#8b2447]" />

                  <div>

                    <p className="font-semibold text-[#4b1025]">
                      Plagiarism
                    </p>

                    <p className="text-sm text-[#8a747d]">
                      {result.plagiarism_percentage}%
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <div className="w-4 h-4 rounded-full bg-[#79a36d]" />

                  <div>

                    <p className="font-semibold text-[#4b1025]">
                      Original Content
                    </p>

                    <p className="text-sm text-[#8a747d]">
                      {
                        100 -
                        Math.min(
                          result.plagiarism_percentage,
                          100
                        )
                      }%
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Sentence Analysis */}
          <div className="rounded-2xl border border-[#e7d9de] bg-white p-7">

            <div className="flex items-center justify-between gap-4">

              <div>

                <h3 className="text-xl font-bold text-[#4b1025]">
                  Sentence-wise Analysis
                </h3>

                <p className="mt-1 text-sm text-[#8b757d]">
                  Review each sentence identified by the analysis.
                </p>

              </div>

              <div className="hidden sm:block rounded-full bg-[#f7e7ec] px-3 py-1 text-xs font-semibold text-[#7d2140]">
                {result.results?.length || 0} sentences
              </div>

            </div>

            <div className="mt-6 space-y-4">

              {result.results?.map(
                (
                  item: any,
                  index: number
                ) => {

                  const similarity =
                    Number(
                      item.similarity
                    ) || 0;

                  let similarityClass =
                    "bg-green-100 text-green-700";

                  let borderClass =
                    "border-green-200";

                  let backgroundClass =
                    "bg-green-50";

                  if (similarity >= 70) {

                    similarityClass =
                      "bg-red-100 text-red-700";

                    borderClass =
                      "border-red-200";

                    backgroundClass =
                      "bg-red-50";

                  } else if (
                    similarity >= 40
                  ) {

                    similarityClass =
                      "bg-orange-100 text-orange-700";

                    borderClass =
                      "border-orange-200";

                    backgroundClass =
                      "bg-orange-50";
                  }

                  return (
                    <div
                      key={index}
                      className={`rounded-xl border ${borderClass} ${backgroundClass} p-5`}
                    >

                      <div className="flex gap-4">

                        <div className="shrink-0 w-8 h-8 rounded-full bg-white text-[#7e2140] flex items-center justify-center text-xs font-bold shadow-sm">
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">

                          <p className="text-sm leading-7 text-[#59444d]">
                            {item.sentence}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-2">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.copied
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {item.copied
                                ? "⚠ Possible Copy"
                                : "✓ Original"}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${similarityClass}`}
                            >
                              Similarity: {similarity}%
                            </span>

                            {item.source && (
                              <a
                                href={item.source}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#7d2140] hover:underline"
                              >
                                View Source
                                <Icon
                                  name="arrow"
                                  size={13}
                                />
                              </a>
                            )}

                          </div>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </section>
      )}

    </div>
  );

  // ---------------- HISTORY PAGE ----------------

  const HistoryPage = () => (
    <div className="space-y-6">

      <div>

        <p className="text-sm font-semibold uppercase tracking-wider text-[#9d2d51]">
          Your documents
        </p>

        <h2 className="mt-1 text-3xl font-bold text-[#4b1025]">
          History
        </h2>

        <p className="mt-2 text-[#806b73]">
          View your previously analyzed documents.
        </p>

        <div className="mt-6 relative">
          <Icon
          name="search"
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#927d85]"
          />
          
          <input
    type="text"
    placeholder="Search documents..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full rounded-xl border border-[#eee1e5] bg-[#fcf7f8] py-3 pl-11 pr-4 text-sm text-[#4b1025] outline-none placeholder:text-[#aa969d] focus:border-[#c17b91] focus:ring-2 focus:ring-[#f3dce3]"
  />
</div>

      </div>

      {history.length === 0 ? (

        <div className="rounded-2xl border border-[#ead9de] bg-white p-12 text-center">

          <div className="mx-auto w-16 h-16 rounded-full bg-[#f4e0e7] text-[#8c2447] flex items-center justify-center">
            <Icon name="file" size={30} />
          </div>

          <h3 className="mt-5 text-xl font-bold text-[#4b1025]">
            No History Yet
          </h3>

          <p className="mt-2 text-sm text-[#88747c]">
            Your analyzed documents will appear here.
          </p>

          <button
            type="button"
            onClick={goDashboard}
            className="mt-6 rounded-xl bg-[#731938] px-6 py-3 text-sm font-semibold text-white hover:bg-[#5c122c]"
          >
            Analyze a Document
          </button>

        </div>

      ) : (

        <div className="space-y-4">
          
          {history
          .filter((item) =>
            item.filename
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
         )
         .map((item) => (

            <div
              key={item.id}
              className="rounded-2xl border border-[#e7d9de] bg-white p-5 shadow-[0_5px_20px_rgba(80,20,40,0.03)]"
            >

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                <div className="flex items-center gap-4 min-w-0">

                  <div className="w-12 h-12 shrink-0 rounded-xl bg-[#f3dfe5] text-[#8b2447] flex items-center justify-center">
                    <Icon name="file" size={23} />
                  </div>

                  <div className="min-w-0">

                    <p className="truncate font-bold text-[#4b1025]">
                      {item.filename}
                    </p>

                    <p className="mt-1 text-xs text-[#927d85]">
                      Checked on {item.date}
                    </p>

                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-5">

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-[#927d85]">
                      Plagiarism
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#a22c4d]">
                      {item.plagiarism_percentage}%
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-[#927d85]">
                      Original
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#507444]">
                      {item.original_percentage}%
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-[#927d85]">
                      Sentences
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#68406f]">
                      {item.sentence_count}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      viewHistoryReport(item)
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-[#f6e6eb] px-4 py-2.5 text-sm font-semibold text-[#7d2140] hover:bg-[#efd8e0]"
                  >
                    <Icon name="eye" size={17} />
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteHistoryItem(item.id)
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
                  >
                    <Icon name="trash" size={17} />
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );

  // ---------------- PROFILE PAGE ----------------

  const ProfilePage = () => (
    <div className="space-y-6">

      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#9d2d51]">
          About the platform
        </p>

        <h2 className="mt-1 text-3xl font-bold text-[#4b1025]">
          VeriText AI
        </h2>

        <p className="mt-2 text-[#806b73]">
          AI-powered document similarity and plagiarism analysis.
        </p>
      </div>

      <div className="rounded-2xl border border-[#e7d9de] bg-white p-7">

        <div className="flex items-center gap-5 pb-7 border-b border-[#eee2e6]">

          <div className="w-20 h-20 rounded-full bg-[#731938] text-white flex items-center justify-center">
            <Icon name="shield" size={32} />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-[#4b1025]">
              VeriText AI
            </h3>

            <p className="mt-1 text-[#88747c]">
              Document analysis platform
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">

          <div className="rounded-xl border border-[#ead9de] bg-[#fff8fa] p-5">
            <p className="text-sm text-[#846f77]">
              Total Reports
            </p>

            <p className="mt-2 text-3xl font-bold text-[#7d2140]">
              {history.length}
            </p>

            <p className="mt-1 text-xs text-[#99858d]">
              Documents analyzed
            </p>
          </div>

          <div className="rounded-xl border border-[#dce8d9] bg-[#f8fbf7] p-5">
            <p className="text-sm text-[#74816f]">
              Sentences Analyzed
            </p>

            <p className="mt-2 text-3xl font-bold text-[#4f7046]">
              {totalSentences}
            </p>

            <p className="mt-1 text-xs text-[#879480]">
              Across saved reports
            </p>
          </div>

        </div>

        <div className="mt-7 space-y-0">

          <div className="py-4 border-b border-[#eee2e6]">
            <p className="text-sm text-[#88747c]">
              Access
            </p>

            <p className="mt-1 font-semibold text-[#4b1025]">
              Open access — no login required
            </p>
          </div>

          <div className="py-4 border-b border-[#eee2e6]">
            <p className="text-sm text-[#88747c]">
              Supported Documents
            </p>

            <p className="mt-1 font-semibold text-[#4b1025]">
              PDF, DOCX and TXT
            </p>
          </div>

          <div className="py-4">
            <p className="text-sm text-[#88747c]">
              Analysis Engine
            </p>

            <p className="mt-1 font-semibold text-[#4b1025]">
              Gemini AI
            </p>
          </div>

        </div>

      </div>

    </div>
  );

  // ---------------- MAIN UI ----------------

  return (
    <div className="min-h-screen bg-[#fbf8f8] text-[#4b1025]">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 overflow-hidden bg-gradient-to-b from-[#4b0b24] via-[#5c0e2b] to-[#3d071d] text-white md:block">

        <div className="flex h-full flex-col">

          {/* Logo */}
          <div className="px-7 pt-7">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">

                <Icon
                  name="shield"
                  size={27}
                  strokeWidth={1.7}
                />

              </div>

              <div>

                <h1 className="text-xl font-bold tracking-tight">
                  VeriText AI
                </h1>

                <p className="mt-1 text-[10px] text-white/60">
                  Detect. Analyze. Ensure Originality.
                </p>

              </div>

            </div>

          </div>

          {/* Navigation */}
          <nav className="mt-12 px-4 space-y-2">

            <button
              type="button"
              onClick={goDashboard}
              className={`
                w-full flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition
                ${
                  !showHistory && !showProfile
                    ? "bg-[#9c3659] shadow-lg shadow-black/10"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Icon name="home" size={21} />
              Dashboard
            </button>

            <button
              type="button"
              onClick={goHistory}
              className={`
                w-full flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition
                ${
                  showHistory
                    ? "bg-[#9c3659] shadow-lg shadow-black/10"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Icon name="history" size={21} />
              History
            </button>

            <button
              type="button"
              onClick={goProfile}
              className={`
                w-full flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-semibold transition
                ${
                  showProfile
                    ? "bg-[#9c3659] shadow-lg shadow-black/10"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Icon name="user" size={21} />
              Profile
            </button>

          </nav>

          {/* Bottom Branding */}
          <div className="mt-auto px-7 pb-8">

            <div className="border-t border-white/10 pt-8 text-center">

              <div className="mx-auto w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Icon name="shield" size={23} />
              </div>

              <p className="mt-4 text-sm font-medium text-white/90">
                Better content,
              </p>

              <p className="text-sm font-medium text-white/90">
                Greater trust.
              </p>

              <div className="mx-auto mt-5 h-0.5 w-14 bg-[#d98ca5]" />

            </div>

          </div>

        </div>

      </aside>

      {/* Main Area */}
      <div className="md:ml-64 min-h-screen">

        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-[#eee3e6] bg-white/90 backdrop-blur">

          <div className="flex h-20 items-center justify-between px-5 md:px-8">

            {/* Mobile Logo */}
            <div className="flex items-center gap-3 md:hidden">

              <div className="w-10 h-10 rounded-xl bg-[#731938] text-white flex items-center justify-center">
                <Icon name="shield" size={22} />
              </div>

              <span className="font-bold text-[#4b1025]">
                VeriText AI
              </span>

            </div>

            {/* Search */}
            <div className="relative hidden sm:block w-full max-w-xl">

              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a858d]">
                <Icon name="search" size={19} />
              </div>

             <input
  type="text"
  placeholder="Search documents..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="w-full rounded-xl border border-[#eee1e5] bg-[#fcf7f8] py-3 pl-11 pr-4 text-sm text-[#4b1025] outline-none placeholder:text-[#aa969d] focus:border-[#c17b91] focus:ring-2 focus:ring-[#f3dce3]"
/>

            </div>

            {/* Header Actions */}
            <div className="ml-4 flex items-center gap-3">

              <div className="hidden sm:flex items-center gap-2 rounded-xl bg-[#fff5f7] px-3 py-2 text-xs font-semibold text-[#7d2140]">
                <Icon name="shield" size={16} />
                No login required
              </div>

            </div>

          </div>

        </header>

        {/* Mobile Navigation */}
        <div className="md:hidden border-b border-[#eee3e6] bg-white px-4 py-3">

          <div className="grid grid-cols-3 gap-2">

            <button
              type="button"
              onClick={goDashboard}
              className={`rounded-lg py-2 text-xs font-semibold ${
                !showHistory && !showProfile
                  ? "bg-[#731938] text-white"
                  : "bg-[#faf0f3] text-[#7d2140]"
              }`}
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={goHistory}
              className={`rounded-lg py-2 text-xs font-semibold ${
                showHistory
                  ? "bg-[#731938] text-white"
                  : "bg-[#faf0f3] text-[#7d2140]"
              }`}
            >
              History
            </button>

            <button
              type="button"
              onClick={goProfile}
              className={`rounded-lg py-2 text-xs font-semibold ${
                showProfile
                  ? "bg-[#731938] text-white"
                  : "bg-[#faf0f3] text-[#7d2140]"
              }`}
            >
              Profile
            </button>

          </div>

        </div>

        {/* Content */}
        <main className="mx-auto max-w-[1500px] px-4 py-6 md:px-8 md:py-8">

          {showHistory ? (
            <HistoryPage />
          ) : showProfile ? (
            <ProfilePage />
          ) : (
            <Dashboard />
          )}

        </main>

      </div>

    </div>
  );
}

export default App;