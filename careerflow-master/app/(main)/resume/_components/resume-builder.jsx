// "use client";

// import { calculateATSScore } from "@/actions/ats";
// import { suggestKeywords } from "@/actions/keywords";
// import { useState, useEffect } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   AlertTriangle,
//   Download,
//   Edit,
//   Loader2,
//   Monitor,
//   Save,
// } from "lucide-react";
// import { jsPDF } from "jspdf";
// import { toast } from "sonner";
// import MDEditor from "@uiw/react-md-editor";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { saveResume } from "@/actions/resume";
// import { EntryForm } from "./entry-form";
// import useFetch from "@/hooks/use-fetch";
// import { useUser } from "@clerk/nextjs";
// import { resumeSchema } from "@/app/lib/schema";

// export default function ResumeBuilder({ initialContent }) {
//   const [activeTab, setActiveTab] = useState("edit");
//   const [previewContent, setPreviewContent] = useState(initialContent);
//   const { user, isLoaded } = useUser();
//   const [resumeMode, setResumeMode] = useState("preview");
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [suggestedKeywords, setSuggestedKeywords] = useState("");
//   const [atsScore, setAtsScore] = useState(null);
//   const [atsFeedback, setAtsFeedback] = useState("");

//   const {
//     control,
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(resumeSchema),
//     defaultValues: {
//       contactInfo: {
//         professionalTitle: "",
//         email: "",
//         mobile: "",
//         city: "",
//         state: "",
//         linkedin: "",
//       },
//       summary: "",
//       skills: "",
//       experience: [],
//       education: [],
//       projects: [],
//       jobDescription: "",
//     },
//   });

//   const {
//     loading: isSaving,
//     fn: saveResumeFn,
//     data: saveResult,
//     error: saveError,
//   } = useFetch(saveResume);

//   const {
//     loading: isSuggesting,
//     fn: suggestKeywordsFn,
//     data: keywordsData,
//     error: keywordsError,
//   } = useFetch(suggestKeywords);

//   const {
//     loading: isCalculatingATS,
//     fn: calculateATSScoreFn,
//     data: atsData,
//     error: atsError,
//   } = useFetch(calculateATSScore);

//   const formValues = watch();

//   useEffect(() => {
//     if (keywordsData && !isSuggesting) {
//       setSuggestedKeywords(keywordsData);
//       toast.success("Keywords suggested successfully!");
//     }
//     if (keywordsError) {
//       toast.error(keywordsError.message || "Failed to suggest keywords");
//     }
//   }, [keywordsData, keywordsError, isSuggesting]);

//   useEffect(() => {
//     if (atsData && !isCalculatingATS) {
//       setAtsScore(atsData.score);
//       setAtsFeedback(atsData.feedback);
//       toast.success("ATS score calculated successfully!");
//     }
//     if (atsError) {
//       toast.error(atsError.message || "Failed to calculate ATS score");
//     }
//   }, [atsData, atsError, isCalculatingATS]);

//   useEffect(() => {
//     if (activeTab === "edit") {
//       const newContent = getCombinedContent();
//       setPreviewContent(newContent ? newContent : initialContent);
//     }
//   }, [formValues, activeTab, initialContent]);

//   useEffect(() => {
//     if (saveResult && !isSaving) {
//       toast.success("Resume saved successfully!");
//     }
//     if (saveError) {
//       toast.error(saveError.message || "Failed to save resume");
//     }
//   }, [saveResult, saveError, isSaving]);

//   const handleCalculateATSScore = async () => {
//     const jobDescription = formValues.jobDescription;
//     if (!jobDescription) {
//       toast.error("Please enter a job description first");
//       return;
//     }
//     const content = getCombinedContent();
//     await calculateATSScoreFn({ content, jobDescription });
//   };

//   const handleSuggestKeywords = async () => {
//     const jobDescription = formValues.jobDescription;
//     if (!jobDescription) {
//       toast.error("Please enter a job description first");
//       return;
//     }
//     await suggestKeywordsFn({ jobDescription });
//   };

//   const getCombinedContent = () => {
//     const { summary, skills, experience, education, projects, contactInfo } = formValues;
//     const fullName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Your Name";

//     const header = [
//       fullName,
//       contactInfo.professionalTitle || "PROFESSIONAL TITLE",
//       `${contactInfo.city || "City"}, ${contactInfo.state || "State"} | ${contactInfo.mobile || "Phone"} | ${contactInfo.email || "Email"}`,
//     ].join("\n");

//     const objective = summary ? `## Professional Summary\n\n${summary}\n\n---` : "";

//     const experienceSection = experience.length
//       ? `## Experience\n\n${experience
//           .map(
//             (exp) =>
//               `${exp.organization || "Organization Name"} | ${exp.title || "Job Title"}\n${exp.startDate || "20XX"} - ${
//                 exp.endDate || "20XX"
//               }\n${exp.description
//                 .split("\n")
//                 .map((line) => `- ${line.trim()}`)
//                 .join("\n")}`
//           )
//           .join("\n\n")}\n\n---`
//       : "";

//     const educationSection = education.length
//       ? `## Education\n\n${education
//           .map(
//             (edu) =>
//               `${edu.organization || "University Name"}, ${edu.title || "Degree"}\n${edu.startDate || "20XX"} - ${edu.endDate || "20XX"}`
//           )
//           .join("\n\n")}\n\n---`
//       : "";

//     const projectsSection = projects.length
//       ? `## Projects\n\n${projects
//           .map(
//             (proj) =>
//               `${proj.title || "Project Title"}\n${proj.startDate || "20XX"} - ${proj.endDate || "20XX"}\n${proj.description
//                 .split("\n")
//                 .map((line) => `- ${line.trim()}`)
//                 .join("\n")}`
//           )
//           .join("\n\n")}\n\n---`
//       : "";

//     const skillsSection = skills
//       ? `## Skills & Abilities\n\n${skills
//           .split("\n")
//           .map((skill) => `- ${skill.trim()}`)
//           .join("\n")}\n\n---`
//       : "";

//     return [header, objective, experienceSection, educationSection, projectsSection, skillsSection]
//       .filter(Boolean)
//       .join("\n\n");
//   };

//   const onSubmit = async () => {
//     try {
//       const formattedContent = previewContent
//         .replace(/\n/g, "\n")
//         .replace(/\n\s*\n/g, "\n\n")
//         .trim();
//       await saveResumeFn(formattedContent);
//     } catch (error) {
//       console.error("Save error:", error);
//     }
//   };

//   const generatePDF = async () => {
//     setIsGenerating(true);
//     try {
//       const doc = new jsPDF("p", "mm", "a4");
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const margin = 15;
//       const maxWidth = pageWidth - 2 * margin;
//       let yPosition = margin;

//       doc.setFont("helvetica", "normal");
//       doc.setFontSize(12);

//       const content = getCombinedContent();
//       const lines = content.split("\n");
//       let isSectionEnd = false;

//       for (let line of lines) {
//         line = line.trim();
//         if (!line) {
//           yPosition += 4;
//           continue;
//         }

//         if (yPosition === margin) {
//           doc.setFont("helvetica", "bold");
//           doc.setFontSize(16);
//           doc.text(line, margin, yPosition);
//           yPosition += 6;
//           line = lines.shift();
//           doc.setFont("helvetica", "normal");
//           doc.setFontSize(12);
//           doc.text(line, margin, yPosition);
//           yPosition += 5;
//           line = lines.shift();
//           doc.setFontSize(10);
//           doc.text(line, margin, yPosition);
//           yPosition += 8;
//           continue;
//         }

//         if (line === "---") {
//           isSectionEnd = true;
//           doc.setDrawColor(150, 150, 150);
//           doc.line(margin, yPosition, pageWidth - margin, yPosition);
//           yPosition += 6;
//           continue;
//         }

//         if (line.startsWith("## ")) {
//           if (yPosition !== margin + 19 && isSectionEnd) {
//             yPosition += 4;
//           }
//           doc.setFont("helvetica", "bold");
//           doc.setFontSize(14);
//           const headingText = line.replace("## ", "");
//           doc.text(headingText, margin, yPosition);
//           yPosition += 8;
//           doc.setFont("helvetica", "normal");
//           doc.setFontSize(12);
//           isSectionEnd = false;
//         } else if (line.includes(" | ") && !line.startsWith("-")) {
//           doc.setFont("helvetica", "bold");
//           doc.setFontSize(12);
//           const splitText = doc.splitTextToSize(line, maxWidth);
//           doc.text(splitText, margin, yPosition);
//           yPosition += splitText.length * 5 + 2;
//           doc.setFont("helvetica", "normal");
//         } else if (/^\d{4}\s*-\s*\d{4}$/.test(line)) {
//           doc.setFontSize(10);
//           doc.text(line, margin, yPosition);
//           yPosition += 5;
//         } else if (line.startsWith("- ")) {
//           const bulletText = line.replace("- ", "");
//           const splitText = doc.splitTextToSize(bulletText, maxWidth - 5);
//           doc.text("•", margin, yPosition);
//           doc.text(splitText, margin + 5, yPosition);
//           yPosition += splitText.length * 5 + 2;
//         } else {
//           const splitText = doc.splitTextToSize(line, maxWidth);
//           doc.text(splitText, margin, yPosition);
//           yPosition += splitText.length * 5 + 2;
//         }

//         if (yPosition > doc.internal.pageSize.getHeight() - margin) {
//           doc.addPage();
//           yPosition = margin;
//         }
//       }

//       doc.save("resume.pdf");
//     } catch (error) {
//       console.error("PDF generation error:", error);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   if (!isLoaded) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <div data-color-mode="light" className="max-w-4xl mx-auto space-y-4">
//       <div className="flex flex-col md:flex-row justify-between items-center gap-2">
//         <h1 className="font-bold gradient-title text-5xl md:text-6xl">
//           Resume Builder
//         </h1>
//         <div className="space-x-2">
//           <Button
//             variant="destructive"
//             onClick={handleSubmit(onSubmit)}
//             disabled={isSaving}
//           >
//             {isSaving ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Saving...
//               </>
//             ) : (
//               <>
//                 <Save className="h-4 w-4" />
//                 Save
//               </>
//             )}
//           </Button>
//           <Button onClick={generatePDF} disabled={isGenerating}>
//             {isGenerating ? (
//               <>
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 Generating PDF...
//               </>
//             ) : (
//               <>
//                 <Download className="h-4 w-4" />
//                 Download PDF
//               </>
//             )}
//           </Button>
//         </div>
//       </div>

//       <Tabs value={activeTab} onValueChange={setActiveTab}>
//         <TabsList>
//           <TabsTrigger value="edit">Form</TabsTrigger>
//           <TabsTrigger value="preview">Markdown</TabsTrigger>
//         </TabsList>

//         <TabsContent value="edit">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Job Description (Optional)</h3>
//               <Controller
//                 name="jobDescription"
//                 control={control}
//                 render={({ field }) => (
//                   <Textarea
//                     {...field}
//                     className="h-32"
//                     placeholder="Paste the job description here to get keyword suggestions..."
//                   />
//                 )}
//               />
//               {errors.jobDescription && (
//                 <p className="text-sm text-red-500">{errors.jobDescription.message}</p>
//               )}
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={handleSuggestKeywords}
//                 disabled={isSuggesting}
//               >
//                 {isSuggesting ? (
//                   <>
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     Suggesting...
//                   </>
//                 ) : (
//                   "Suggest Keywords"
//                 )}
//               </Button>
//               {suggestedKeywords && (
//                 <div className="p-4 border rounded-lg bg-muted/50">
//                   <h4 className="text-sm font-medium">Suggested Keywords:</h4>
//                   <p className="text-sm">{suggestedKeywords}</p>
//                   <p className="text-sm text-muted-foreground mt-2">
//                     Add these keywords to your skills, summary, or experience sections to improve ATS compatibility.
//                   </p>
//                 </div>
//               )}
//             </div>

//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Contact Information</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Professional Title</label>
//                   <Input
//                     {...register("contactInfo.professionalTitle")}
//                     placeholder="e.g., Data Scientist"
//                   />
//                   {errors.contactInfo?.professionalTitle && (
//                     <p className="text-sm text-red-500">
//                       {errors.contactInfo.professionalTitle.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Email</label>
//                   <Input
//                     {...register("contactInfo.email")}
//                     type="email"
//                     placeholder="you@example.com"
//                   />
//                   {errors.contactInfo?.email && (
//                     <p className="text-sm text-red-500">
//                       {errors.contactInfo.email.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Mobile Number</label>
//                   <Input
//                     {...register("contactInfo.mobile")}
//                     type="tel"
//                     placeholder="+1 234 567 8900"
//                   />
//                   {errors.contactInfo?.mobile && (
//                     <p className="text-sm text-red-500">
//                       {errors.contactInfo.mobile.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">City</label>
//                   <Input
//                     {...register("contactInfo.city")}
//                     placeholder="e.g., Philadelphia"
//                   />
//                   {errors.contactInfo?.city && (
//                     <p className="text-sm text-red-500">
//                       {errors.contactInfo.city.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">State</label>
//                   <Input {...register("contactInfo.state")} placeholder="e.g., PA" />
//                   {errors.contactInfo?.state && (
//                     <p className="text-sm text-red-500">
//                       {errors.contactInfo.state.message}
//                     </p>
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">LinkedIn URL (Optional)</label>
//                   <Input
//                     {...register("contactInfo.linkedin")}
//                     type="url"
//                     placeholder="https://linkedin.com/in/your-profile"
//                   />
//                   {errors.contactInfo?.linkedin && (
//                     <p className="text-sm text-red-500">
//                       {errors.contactInfo.linkedin.message}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Objective</h3>
//               <Controller
//                 name="summary"
//                 control={control}
//                 render={({ field }) => (
//                   <Textarea
//                     {...field}
//                     className="h-32"
//                     placeholder="Write a compelling objective..."
//                   />
//                 )}
//               />
//               {errors.summary && (
//                 <p className="text-sm text-red-500">{errors.summary.message}</p>
//               )}
//             </div>

//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Skills & Abilities</h3>
//               <Controller
//                 name="skills"
//                 control={control}
//                 render={({ field }) => (
//                   <Textarea
//                     {...field}
//                     className="h-32"
//                     placeholder="List your key skills (one per line)..."
//                   />
//                 )}
//               />
//               {errors.skills && (
//                 <p className="text-sm text-red-500">{errors.skills.message}</p>
//               )}
//             </div>

//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Experience</h3>
//               <Controller
//                 name="experience"
//                 control={control}
//                 render={({ field }) => (
//                   <EntryForm
//                     type="Experience"
//                     entries={field.value}
//                     onChange={field.onChange}
//                   />
//                 )}
//               />
//               {errors.experience && (
//                 <p className="text-sm text-red-500">{errors.experience.message}</p>
//               )}
//             </div>

//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Education</h3>
//               <Controller
//                 name="education"
//                 control={control}
//                 render={({ field }) => (
//                   <EntryForm
//                     type="Education"
//                     entries={field.value}
//                     onChange={field.onChange}
//                   />
//                 )}
//               />
//               {errors.education && (
//                 <p className="text-sm text-red-500">{errors.education.message}</p>
//               )}
//             </div>

//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Projects (Optional)</h3>
//               <Controller
//                 name="projects"
//                 control={control}
//                 render={({ field }) => (
//                   <EntryForm
//                     type="Project"
//                     entries={field.value}
//                     onChange={field.onChange}
//                   />
//                 )}
//               />
//               {errors.projects && (
//                 <p className="text-sm text-red-500">{errors.projects.message}</p>
//               )}
//             </div>
//           </form>
//         </TabsContent>

//         <TabsContent value="preview">
//           {activeTab === "preview" && (
//             <Button
//               variant="link"
//               type="button"
//               className="mb-2"
//               onClick={() =>
//                 setResumeMode(resumeMode === "preview" ? "edit" : "preview")
//               }
//             >
//               {resumeMode === "preview" ? (
//                 <>
//                   <Edit className="h-4 w-4" />
//                   Edit Resume
//                 </>
//               ) : (
//                 <>
//                   <Monitor className="h-4 w-4" />
//                   Show Preview
//                 </>
//               )}
//             </Button>
//           )}

//           {activeTab === "preview" && resumeMode !== "preview" && (
//             <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
//               <AlertTriangle className="h-5 w-5" />
//               <span className="text-sm">
//                 You will lose edited markdown if you update the form data.
//               </span>
//             </div>
//           )}

//           <div className="border rounded-lg mb-4">
//             <MDEditor
//               value={previewContent}
//               onChange={setPreviewContent}
//               height={800}
//               preview={resumeMode}
//             />
//           </div>
//         </TabsContent>
//       </Tabs>

//       <div
//         id="resume-pdf"
//         style={{
//           position: "absolute",
//           top: 0,
//           left: "-9999px",
//           backgroundColor: "#ffffff",
//           color: "#000000",
//           padding: "1rem",
//           width: "794px",
//         }}
//       >
//         <MDEditor.Markdown
//           source={previewContent}
//           style={{ backgroundColor: "#ffffff", color: "#000000" }}
//         />
//       </div>
//     </div>
//   );
// }


"use client";

import { calculateATSScore } from "@/actions/ats";
import { suggestKeywords } from "@/actions/keywords";
import { improveWithAI } from "@/actions/resume"; // Import improveWithAI
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
  Sparkles,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { resumeSchema } from "@/app/lib/schema";

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user, isLoaded } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedKeywords, setSuggestedKeywords] = useState("");
  const [atsScore, setAtsScore] = useState(null);
  const [atsFeedback, setAtsFeedback] = useState("");

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {
        professionalTitle: "",
        email: "",
        mobile: "",
        city: "",
        state: "",
        linkedin: "",
      },
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
      jobDescription: "",
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const {
    loading: isSuggesting,
    fn: suggestKeywordsFn,
    data: keywordsData,
    error: keywordsError,
  } = useFetch(suggestKeywords);

  const {
    loading: isCalculatingATS,
    fn: calculateATSScoreFn,
    data: atsData,
    error: atsError,
  } = useFetch(calculateATSScore);

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
    error: improveError,
  } = useFetch(improveWithAI);

  const formValues = watch();

  useEffect(() => {
    if (keywordsData && !isSuggesting) {
      setSuggestedKeywords(keywordsData);
      toast.success("Keywords suggested successfully!");
    }
    if (keywordsError) {
      toast.error(keywordsError.message || "Failed to suggest keywords");
    }
  }, [keywordsData, keywordsError, isSuggesting]);

  useEffect(() => {
    if (atsData && !isCalculatingATS) {
      setAtsScore(atsData.score);
      setAtsFeedback(atsData.feedback);
      toast.success("ATS score calculated successfully!");
    }
    if (atsError) {
      toast.error(atsError.message || "Failed to calculate ATS score");
    }
  }, [atsData, atsError, isCalculatingATS]);

  useEffect(() => {
    if (improvedContent && !isImproving) {
      setValue("summary", improvedContent);
      toast.success("Professional Summary improved successfully!");
    }
    if (improveError) {
      toast.error(improveError.message || "Failed to improve summary");
    }
  }, [improvedContent, improveError, isImproving, setValue]);

  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab, initialContent]);

  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const handleCalculateATSScore = async () => {
    const jobDescription = formValues.jobDescription;
    if (!jobDescription) {
      toast.error("Please enter a job description first");
      return;
    }
    const content = getCombinedContent();
    await calculateATSScoreFn({ content, jobDescription });
  };

  const handleSuggestKeywords = async () => {
    const jobDescription = formValues.jobDescription;
    if (!jobDescription) {
      toast.error("Please enter a job description first");
      return;
    }
    await suggestKeywordsFn({ jobDescription });
  };

  const handleImproveSummary = async () => {
    const currentSummary = formValues.summary;
    if (!currentSummary && !suggestedKeywords) {
      toast.error("Please enter a summary or generate keywords first");
      return;
    }

    const contentToImprove = suggestedKeywords
      ? `${currentSummary}\n\nIncorporate these keywords: ${suggestedKeywords}`
      : currentSummary;

    await improveWithAIFn({
      current: contentToImprove,
      type: "summary",
    });
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects, contactInfo } = formValues;
    const fullName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Your Name";

    const header = [
      fullName,
      contactInfo.professionalTitle || "PROFESSIONAL TITLE",
      `${contactInfo.city || "City"}, ${contactInfo.state || "State"} | ${contactInfo.mobile || "Phone"} | ${contactInfo.email || "Email"}`,
    ].join("\n");

    const objective = summary ? `## Professional Summary\n\n${summary}\n\n---` : "";

    const experienceSection = experience.length
      ? `## Experience\n\n${experience
          .map(
            (exp) =>
              `${exp.organization || "Organization Name"} | ${exp.title || "Job Title"}\n${exp.startDate || "20XX"} - ${
                exp.endDate || "20XX"
              }\n${exp.description
                .split("\n")
                .map((line) => `- ${line.trim()}`)
                .join("\n")}`
          )
          .join("\n\n")}\n\n---`
      : "";

    const educationSection = education.length
      ? `## Education\n\n${education
          .map(
            (edu) =>
              `${edu.organization || "University Name"}, ${edu.title || "Degree"}\n${edu.startDate || "20XX"} - ${edu.endDate || "20XX"}`
          )
          .join("\n\n")}\n\n---`
      : "";

    const projectsSection = projects.length
      ? `## Projects\n\n${projects
          .map(
            (proj) =>
              `${proj.title || "Project Title"}\n${proj.startDate || "20XX"} - ${proj.endDate || "20XX"}\n${proj.description
                .split("\n")
                .map((line) => `- ${line.trim()}`)
                .join("\n")}`
          )
          .join("\n\n")}\n\n---`
      : "";

    const skillsSection = skills
      ? `## Skills & Abilities\n\n${skills
          .split("\n")
          .map((skill) => `- ${skill.trim()}`)
          .join("\n")}\n\n---`
      : "";

    return [header, objective, experienceSection, educationSection, projectsSection, skillsSection]
      .filter(Boolean)
      .join("\n\n");
  };

  const onSubmit = async () => {
    try {
      const formattedContent = previewContent
        .replace(/\n/g, "\n")
        .replace(/\n\s*\n/g, "\n\n")
        .trim();
      await saveResumeFn(formattedContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // Use the updated generatePDF function from above
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;
  
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
  
      const content = getCombinedContent();
      const lines = content.split("\n");
      let isSectionEnd = false;
      let headerProcessed = false;
  
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) {
          yPosition += 4;
          continue;
        }
  
        // Process header only once
        if (!headerProcessed && yPosition === margin) {
          // Name
          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.text(line, margin, yPosition);
          yPosition += 6;
  
          // Professional Title
          i++;
          line = lines[i]?.trim() || "";
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          doc.text(line, margin, yPosition);
          yPosition += 5;
  
          // Contact Info
          i++;
          line = lines[i]?.trim() || "";
          doc.setFontSize(10);
          doc.text(line, margin, yPosition);
          yPosition += 8;
  
          headerProcessed = true;
          continue;
        }
  
        if (line === "---") {
          isSectionEnd = true;
          doc.setDrawColor(150, 150, 150);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 6;
          continue;
        }
  
        if (line.startsWith("## ")) {
          if (yPosition !== margin + 19 && isSectionEnd) {
            yPosition += 4;
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          const headingText = line.replace("## ", "");
          doc.text(headingText, margin, yPosition);
          yPosition += 8;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          isSectionEnd = false;
        } else if (line.includes(" | ") && !line.startsWith("-")) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          const splitText = doc.splitTextToSize(line, maxWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 5 + 2;
          doc.setFont("helvetica", "normal");
        } else if (/^\d{4}\s*-\s*\d{4}$/.test(line)) {
          doc.setFontSize(10);
          doc.text(line, margin, yPosition);
          yPosition += 5;
        } else if (line.startsWith("- ")) {
          const bulletText = line.replace("- ", "");
          const splitText = doc.splitTextToSize(bulletText, maxWidth - 5);
          doc.text("•", margin, yPosition);
          doc.text(splitText, margin + 5, yPosition);
          yPosition += splitText.length * 5 + 2;
        } else {
          const splitText = doc.splitTextToSize(line, maxWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 5 + 2;
        }
  
        if (yPosition > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPosition = margin;
        }
      }
  
      doc.save("resume.pdf");
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div data-color-mode="light" className="max-w-4xl mx-auto space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">
          Resume Builder
        </h1>
        <div className="space-x-2">
          <Button
            variant="destructive"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Job Description (Optional)</h3>
              <Controller
                name="jobDescription"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Paste the job description here to get keyword suggestions..."
                  />
                )}
              />
              {errors.jobDescription && (
                <p className="text-sm text-red-500">{errors.jobDescription.message}</p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleSuggestKeywords}
                disabled={isSuggesting}
              >
                {isSuggesting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Suggesting...
                  </>
                ) : (
                  "Suggest Keywords"
                )}
              </Button>
              {suggestedKeywords && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium">Suggested Keywords:</h4>
                  <p className="text-sm">{suggestedKeywords}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add these keywords to your skills, summary, or experience sections to improve ATS compatibility.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Professional Title</label>
                  <Input
                    {...register("contactInfo.professionalTitle")}
                    placeholder="e.g., Data Scientist"
                  />
                  {errors.contactInfo?.professionalTitle && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.professionalTitle.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="you@example.com"
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+1 234 567 8900"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input
                    {...register("contactInfo.city")}
                    placeholder="e.g., Philadelphia"
                  />
                  {errors.contactInfo?.city && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.city.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Input {...register("contactInfo.state")} placeholder="e.g., PA" />
                  {errors.contactInfo?.state && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.state.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn URL (Optional)</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Summary</h3>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Write a compelling professional summary..."
                  />
                )}
              />
              {errors.summary && (
                <p className="text-sm text-red-500">{errors.summary.message}</p>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleImproveSummary}
                disabled={isImproving || (!formValues.summary && !suggestedKeywords)}
              >
                {isImproving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Improving...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Improve with AI
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills & Abilities</h3>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="List your key skills (one per line)..."
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">{errors.experience.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-red-500">{errors.education.message}</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects (Optional)</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.projects && (
                <p className="text-sm text-red-500">{errors.projects.message}</p>
              )}
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          {activeTab === "preview" && (
            <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() =>
                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === "preview" && resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose edited markdown if you update the form data.
              </span>
            </div>
          )}

          <div className="border rounded-lg mb-4">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div
        id="resume-pdf"
        style={{
          position: "absolute",
          top: 0,
          left: "-9999px",
          backgroundColor: "#ffffff",
          color: "#000000",
          padding: "1rem",
          width: "794px",
        }}
      >
        <MDEditor.Markdown
          source={previewContent}
          style={{ backgroundColor: "#ffffff", color: "#000000" }}
        />
      </div>
    </div>
  );
}