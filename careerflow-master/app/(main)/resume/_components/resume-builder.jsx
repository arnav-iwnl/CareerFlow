// "use client";
// import useFetch from "@/hooks/use-fetch";
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
// import "jspdf-autotable";
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
// import { entriesToMarkdown } from "@/app/lib/helper";
// import { resumeSchema } from "@/app/lib/schema";
// import html2canvas from "html2canvas-pro";
// import { jsPDF } from "jspdf";

// export default function ResumeBuilder({ initialContent }) {
//   const [activeTab, setActiveTab] = useState("edit");
//   const [previewContent, setPreviewContent] = useState(initialContent);
//   const { user } = useUser();
//   const [resumeMode, setResumeMode] = useState("preview");
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [suggestedKeywords, setSuggestedKeywords] = useState("");
//   const [atsScore, setAtsScore] = useState(null); // New state
//   const [atsFeedback, setAtsFeedback] = useState(""); // New state

//   const {
//     control,
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(resumeSchema),
//     defaultValues: {
//       contactInfo: {},
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
// // edited  here
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
 
//   // Watch form fields for preview updates
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

// //edited here appy

//   // Rebuild the preview content whenever form values change in "edit" mode
//   useEffect(() => {
//     if (activeTab === "edit") {
//       const newContent = getCombinedContent();
//       setPreviewContent(newContent ? newContent : initialContent);
//     }
//   }, [formValues, activeTab, initialContent]);

//   // Show toast notifications for saving
//   useEffect(() => {
//     if (saveResult && !isSaving) {
//       toast.success("Resume saved successfully!");
//     }
//     if (saveError) {
//       toast.error(saveError.message || "Failed to save resume");
//     }
//   }, [saveResult, saveError, isSaving]);

//   // Build contact info markdown
//   const getContactMarkdown = () => {
//     const { contactInfo } = formValues;
//     const parts = [];
//     if (contactInfo.email) parts.push(`Email: ${contactInfo.email}`);
//     if (contactInfo.mobile) parts.push(`Contact: ${contactInfo.mobile}`);
//     if (contactInfo.linkedin)
//       parts.push(`LinkedIn(${contactInfo.linkedin})`);
//     if (contactInfo.twitter) parts.push(`Twitter(${contactInfo.twitter})`);

//     return parts.length > 0
//       ? `${user.fullName}</div>
      
// <div align="center">
// ${parts.join(" | ")}
// </div>`
//       : "";
//   };

//   // Combine all markdown sections
//   const getCombinedContent = () => {
//     const { summary, skills, experience, education, projects } = formValues;
//     return [
//       getContactMarkdown(),
//       summary && `## PROFESSIONAL SUMMARY\n\n${summary}`,
//       skills && `## SKILLS\n\n${skills}`,
//       entriesToMarkdown(experience, "WORK EXPERIENCE"),
//       entriesToMarkdown(education, "EDUCATION"),
//       entriesToMarkdown(projects, "PROJECTS"),
//     ]
//       .filter(Boolean)
//       .join("\n\n");
//   };

//   // Save the resume data
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
  

//   // Generate single-page PDF with aspect ratio logic
//   //EDITED HERE TO RENDER RESUME USING JSPDF
//   /*const generatePDF = async () => {
//     setIsGenerating(true);
//     try {
//       const element = document.getElementById("resume-pdf");
//       if (!element) {
//         console.error("PDF container element not found.");
//         setIsGenerating(false);
//         return;
//       }
//       // Wait for the element to render completely before capturing
//       const canvas = await html2canvas(element, { scale: 2 });
//       const imgData = canvas.toDataURL("image/jpeg", 0.98);

//       const canvasWidth = canvas.width;
//       const canvasHeight = canvas.height;
//       const aspectRatio = canvasHeight / canvasWidth;

//       // Create jsPDF (A4, portrait)
//       const pdf = new jsPDF("p", "mm", "a4");
//       const pageWidth = pdf.internal.pageSize.getWidth();
//       const pageHeight = pdf.internal.pageSize.getHeight();

//       let pdfWidth = pageWidth;
//       let pdfHeight = pdfWidth * aspectRatio;

//       // Scale down if height exceeds page height
//       if (pdfHeight > pageHeight) {
//         const scaleFactor = pageHeight / pdfHeight;
//         pdfHeight = pageHeight;
//         pdfWidth *= scaleFactor;
//       }

//       pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
//       pdf.save("resume.pdf");
//     } catch (error) {
//       console.error("PDF generation error:", error);
//     } finally {
//       setIsGenerating(false);
//     }
//   };*/

  
//   const generatePDF = async () => {
//     setIsGenerating(true);
//     try {
//       const doc = new jsPDF("p", "mm", "a4");
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const pageHeight = doc.internal.pageSize.getHeight();
//       const margin = 15; // 15mm margins
//       const maxWidth = pageWidth - 2 * margin;
//       let yPosition = margin;
  
//       // Set font and size
//       doc.setFont("helvetica", "normal");
//       doc.setFontSize(12);
  
//       // Split the content into lines
//       const content = getCombinedContent();
//       const lines = content.split("\n");
  
//       // Process each line
//       for (let line of lines) {
//         line = line.trim();
//         if (!line) {
//           yPosition += 4; // Add spacing for empty lines
//           continue;
//         }
  
//         // Handle headings
//         if (line.startsWith("## ")) 
//           {
//             if (yPosition !== margin) {
//               // Add a line separator before the heading (except for the first section)
//               doc.setDrawColor(200, 200, 200);
//               doc.line(margin, yPosition, pageWidth - margin, yPosition);
//               yPosition += 4;
//             }
//           doc.setFont("helvetica", "bold");
//           doc.setFontSize(14);
//           const headingText = line.replace("## ", "");
//           const splitText = doc.splitTextToSize(headingText, maxWidth);
//           doc.text(splitText, margin, yPosition);
//           yPosition += splitText.length * 6 + 4; // Adjust spacing
//           doc.setFont("helvetica", "normal");
//           doc.setFontSize(12);
//         }
//         // Handle subheadings (e.g., job titles)
//         else if (
//           line.includes(" @ ") &&
//           !line.startsWith("-") &&
//           !line.toLowerCase().startsWith("email:") &&
//           !line.toLowerCase().startsWith("phone:") &&
//           !line.toLowerCase().startsWith("linkedin:") &&
//           !line.toLowerCase().startsWith("twitter:")
//         ) {
//           doc.setFont("helvetica", "bold");
//           doc.setFontSize(12);
//           const splitText = doc.splitTextToSize(line, maxWidth);
//           doc.text(splitText, margin, yPosition);
//           yPosition += splitText.length * 5 + 2;
//           doc.setFont("helvetica", "normal");
//         }
//         // Handle contact info and name
//         else if (
//           yPosition === margin ||
//           line.toLowerCase().startsWith("email:") ||
//           line.toLowerCase().startsWith("phone:") ||
//           line.toLowerCase().startsWith("linkedin:") ||
//           line.toLowerCase().startsWith("twitter:")
//         ) {
//           if (yPosition === margin) {
//             // Name at the top
//             doc.setFont("helvetica", "bold");
//             doc.setFontSize(16);
//             doc.text(line, margin, yPosition);
//             yPosition += 8;
//             doc.setFont("helvetica", "normal");
//             doc.setFontSize(10);
//           } else {
//             // Contact info
//             doc.setFontSize(10);
//             const splitText = doc.splitTextToSize(line, maxWidth);
//             doc.text(splitText, margin, yPosition);
//             yPosition += splitText.length * 4 + 2;
//           }
//         }
//         // Handle bullet points
//         else if (line.startsWith("- ")) {
//           const bulletText = line.replace("- ", "");
//           const splitText = doc.splitTextToSize(bulletText, maxWidth - 5);
//           doc.text("•", margin, yPosition); // Add bullet
//           doc.text(splitText, margin + 5, yPosition);
//           yPosition += splitText.length * 5 + 2;
//         }
//         // Handle regular text (e.g., dates, summary, skills)
//         else {
//           const splitText = doc.splitTextToSize(line, maxWidth);
//           doc.text(splitText, margin, yPosition);
//           yPosition += splitText.length * 5 + 2;
//         }
  
//         // Check for page overflow
//         if (yPosition > pageHeight - margin) {
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

// //edited here to render text using jsPDF
//   return (
//     <div data-color-mode="light" className="space-y-4">
//       <div className="flex flex-col md:flex-row justify-between items-center gap-2">
//         <h1 className="font-bold gradient-title text-5xl md:text-6xl">
//           Resume Builder
//         </h1>
//         <Button
//             variant="outline"
//             onClick={handleCalculateATSScore}
//             disabled={isCalculatingATS}
//           >
//             {isCalculatingATS ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Calculating...
//               </>
//             ) : (
//               "Calculate ATS Score"
//             )}
//           </Button>
//         <div className="space-x-2">
//           {/* Save button */}
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
//           {/* PDF generation button */}
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

//         {/* EDIT TAB */}
//         <TabsContent value="edit">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//             {/* Job Description */}
//     <div className="space-y-4">
//       <h3 className="text-lg font-medium">Job Description (Optional)</h3>
//       <Controller
//         name="jobDescription"
//         control={control}
//         render={({ field }) => (
//           <Textarea
//             {...field}
//             className="h-32"
//             placeholder="Paste the job description here to get keyword suggestions..."
//           />
//         )}
//       />
//       {errors.jobDescription && (
//         <p className="text-sm text-red-500">{errors.jobDescription.message}</p>
//       )}

//     {/*edited here*/}
//          <Button
//               type="button"
//               variant="outline"
//               onClick={handleSuggestKeywords}
//               disabled={isSuggesting}
//             >
//               {isSuggesting ? (
//                 <>
//                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   Suggesting...
//                 </>
//               ) : (
//                 "Suggest Keywords"
//               )}
//             </Button>
//             {suggestedKeywords && (
//               <div className="p-4 border rounded-lg bg-muted/50">
//                 <h4 className="text-sm font-medium">Suggested Keywords:</h4>
//                 <p className="text-sm">{suggestedKeywords}</p>
//                 <p className="text-sm text-muted-foreground mt-2">
//                   Add these keywords to your skills, summary, or experience sections to improve ATS compatibility.
//                 </p>
//               </div>
//             )}
//            </div>
// {/*edit ends here*/}
//             {/* Contact Information */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Contact Information</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
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
//                   <label className="text-sm font-medium">LinkedIn URL</label>
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
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Twitter/X Profile</label>
//                   <Input
//                     {...register("contactInfo.twitter")}
//                     type="url"
//                     placeholder="https://twitter.com/your-handle"
//                   />
//                   {errors.contactInfo?.twitter && (
//                     <p className="text-sm text-red-500">
//                       {errors.contactInfo.twitter.message}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Summary */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Professional Summary</h3>
//               <Controller
//                 name="summary"
//                 control={control}
//                 render={({ field }) => (
//                   <Textarea
//                     {...field}
//                     className="h-32"
//                     placeholder="Write a compelling professional summary..."
//                   />
//                 )}
//               />
//               {errors.summary && (
//                 <p className="text-sm text-red-500">{errors.summary.message}</p>
//               )}
//             </div>

//             {/* Skills */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Skills</h3>
//               <Controller
//                 name="skills"
//                 control={control}
//                 render={({ field }) => (
//                   <Textarea
//                     {...field}
//                     className="h-32"
//                     placeholder="List your key skills..."
//                   />
//                 )}
//               />
//               {errors.skills && (
//                 <p className="text-sm text-red-500">{errors.skills.message}</p>
//               )}
//             </div>

//             {/* Experience */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Work Experience</h3>
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
//                 <p className="text-sm text-red-500">
//                   {errors.experience.message}
//                 </p>
//               )}
//             </div>

//             {/* Education */}
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
//                 <p className="text-sm text-red-500">
//                   {errors.education.message}
//                 </p>
//               )}
//             </div>

//             {/* Projects */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-medium">Projects</h3>
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
//                 <p className="text-sm text-red-500">
//                   {errors.projects.message}
//                 </p>
//               )}
//             </div>
//           </form>
//         </TabsContent>

//         {/* PREVIEW TAB */}
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

//       {/* Offscreen container used for generating the PDF 
//       removed mecoz we arent using the pdf genertor*/}
//       <div
//         id="resume-pdf"
//         style={{
//           position: "absolute",
//           top: 0,
//           left: "-9999px", // Moves it offscreen
//           backgroundColor: "#ffffff",
//           color: "#000000",
//           padding: "1rem",
//           // Optionally, set a width (e.g., matching A4 dimensions in pixels)
//           width: "794px", // Approximately A4 width at 96 DPI
//         }}
//       >
//         <MDEditor.Markdown
//           source={previewContent}
//           style={{ backgroundColor: "#ffffff", color: "#000000" }}


"use client";

import { calculateATSScore } from "@/actions/ats";
import { suggestKeywords } from "@/actions/keywords";
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
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";


export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedKeywords, setSuggestedKeywords] = useState("");
  const [atsScore, setAtsScore] = useState(null); // New state
  const [atsFeedback, setAtsFeedback] = useState(""); // New state

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
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
// edited  here
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
 
  // Watch form fields for preview updates
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

//edited here appy

  // Rebuild the preview content whenever form values change in "edit" mode
  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab, initialContent]);

  // Show toast notifications for saving
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  // Build contact info markdown
  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`Email: ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`Contact: ${contactInfo.mobile}`);
    if (contactInfo.linkedin)
      parts.push(`LinkedIn(${contactInfo.linkedin})`);
    if (contactInfo.twitter) parts.push(`Twitter(${contactInfo.twitter})`);

    return parts.length > 0
      ? `${user.fullName}</div>
      
<div align="center">
${parts.join(" | ")}
</div>`
      : "";
  };

  // Combine all markdown sections
  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## PROFESSIONAL SUMMARY\n\n${summary}`,
      skills && `## SKILLS\n\n${skills}`,
      entriesToMarkdown(experience, "WORK EXPERIENCE"),
      entriesToMarkdown(education, "EDUCATION"),
      entriesToMarkdown(projects, "PROJECTS"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  // Save the resume data
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
  

  // Generate single-page PDF with aspect ratio logic
  //EDITED HERE TO RENDER RESUME USING JSPDF
  /*const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("resume-pdf");
      if (!element) {
        console.error("PDF container element not found.");
        setIsGenerating(false);
        return;
      }
      // Wait for the element to render completely before capturing
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const aspectRatio = canvasHeight / canvasWidth;

      // Create jsPDF (A4, portrait)
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      let pdfWidth = pageWidth;
      let pdfHeight = pdfWidth * aspectRatio;

      // Scale down if height exceeds page height
      if (pdfHeight > pageHeight) {
        const scaleFactor = pageHeight / pdfHeight;
        pdfHeight = pageHeight;
        pdfWidth *= scaleFactor;
      }

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("resume.pdf");
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };*/

  
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15; // 15mm margins
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;
  
      // Set font and size
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
  
      // Split the content into lines
      const content = getCombinedContent();
      const lines = content.split("\n");
  
      // Process each line
      for (let line of lines) {
        line = line.trim();
        if (!line) {
          yPosition += 4; // Add spacing for empty lines
          continue;
        }
  
        // Handle headings
        if (line.startsWith("## ")) 
          {
            if (yPosition !== margin) {
              // Add a line separator before the heading (except for the first section)
              doc.setDrawColor(200, 200, 200);
              doc.line(margin, yPosition, pageWidth - margin, yPosition);
              yPosition += 4;
            }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          const headingText = line.replace("## ", "");
          const splitText = doc.splitTextToSize(headingText, maxWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 6 + 4; // Adjust spacing
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
        }
        // Handle subheadings (e.g., job titles)
        else if (
          line.includes(" @ ") &&
          !line.startsWith("-") &&
          !line.toLowerCase().startsWith("email:") &&
          !line.toLowerCase().startsWith("phone:") &&
          !line.toLowerCase().startsWith("linkedin:") &&
          !line.toLowerCase().startsWith("twitter:")
        ) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          const splitText = doc.splitTextToSize(line, maxWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 5 + 2;
          doc.setFont("helvetica", "normal");
        }
        // Handle contact info and name
        else if (
          yPosition === margin ||
          line.toLowerCase().startsWith("email:") ||
          line.toLowerCase().startsWith("phone:") ||
          line.toLowerCase().startsWith("linkedin:") ||
          line.toLowerCase().startsWith("twitter:")
        ) {
          if (yPosition === margin) {
            // Name at the top
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text(line, margin, yPosition);
            yPosition += 8;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
          } else {
            // Contact info
            doc.setFontSize(10);
            const splitText = doc.splitTextToSize(line, maxWidth);
            doc.text(splitText, margin, yPosition);
            yPosition += splitText.length * 4 + 2;
          }
        }
        // Handle bullet points
        else if (line.startsWith("- ")) {
          const bulletText = line.replace("- ", "");
          const splitText = doc.splitTextToSize(bulletText, maxWidth - 5);
          doc.text("•", margin, yPosition); // Add bullet
          doc.text(splitText, margin + 5, yPosition);
          yPosition += splitText.length * 5 + 2;
        }
        // Handle regular text (e.g., dates, summary, skills)
        else {
          const splitText = doc.splitTextToSize(line, maxWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 5 + 2;
        }
  
        // Check for page overflow
        if (yPosition > pageHeight - margin) {
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

//edited here to render text using jsPDF
  return (
    <div data-color-mode="light" className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">
          Resume Builder
        </h1>
        {/* <Button
            variant="outline"
            onClick={handleCalculateATSScore}
            disabled={isCalculatingATS}
          >
            {isCalculatingATS ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              "Calculate ATS Score"
            )}
          </Button> */}
        <div className="space-x-2">
          {/* Save button */}
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
          {/* PDF generation button */}
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

        {/* EDIT TAB */}
        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Job Description */}
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

    {/*edited here*/}
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
{/*edit ends here*/}
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
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
                  <label className="text-sm font-medium">LinkedIn URL</label>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Twitter/X Profile</label>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="https://twitter.com/your-handle"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
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
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="List your key skills..."
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
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
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Education */}
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
                <p className="text-sm text-red-500">
                  {errors.education.message}
                </p>
              )}
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
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
                <p className="text-sm text-red-500">
                  {errors.projects.message}
                </p>
              )}
            </div>
          </form>
        </TabsContent>

        {/* PREVIEW TAB */}
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

      {/* Offscreen container used for generating the PDF 
      removed mecoz we arent using the pdf genertor*/}
      <div
        id="resume-pdf"
        style={{
          position: "absolute",
          top: 0,
          left: "-9999px", // Moves it offscreen
          backgroundColor: "#ffffff",
          color: "#000000",
          padding: "1rem",
          // Optionally, set a width (e.g., matching A4 dimensions in pixels)
          width: "794px", // Approximately A4 width at 96 DPI
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



//         />
//       </div>
//     </div>
//   );
// }
