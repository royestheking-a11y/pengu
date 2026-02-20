import {
  BookOpen,
  Search,
  Presentation,
  Code,
  Briefcase,
  FileText,
  PenTool,
  BarChart,
  Globe,
  Cpu
} from 'lucide-react';

export interface Service {
  id: string;
  icon: any;
  title: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  benefits: string[];
  process: string[];
  color: string;
  bg: string;
}

export const SERVICES: Service[] = [
  {
    id: "assignment-support",
    icon: BookOpen,
    title: "Assignment Support",
    shortDescription: "Expert guidance on complex academic assignments across 50+ subjects. From essay writing to problem sets.",
    fullDescription: "Struggling with a difficult assignment? Our Assignment Support service connects you with subject matter experts who can guide you through complex topics, help you understand key concepts, and ensure your work meets the highest academic standards. Whether it's a simple essay or a complex case study, we're here to help.",
    features: [
      "Custom research and analysis",
      "Plagiarism-free guarantee",
      "Step-by-step solutions for problem sets",
      "Formatting according to APA, MLA, Chicago, etc."
    ],
    benefits: [
      "Improve your grades with expert insights",
      "Save time and reduce stress",
      "Understand difficult concepts better"
    ],
    process: [
      "Submit your assignment details and rubric",
      "Get matched with a subject expert",
      "Receive a quote and approve it",
      "Get your completed assignment support"
    ],
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    id: "research-editing",
    icon: Search,
    title: "Research & Editing",
    shortDescription: "In-depth research assistance and professional editing to polish your dissertations and theses.",
    fullDescription: "Writing a dissertation or thesis is a monumental task. Our Research & Editing service provides you with the support you need to produce a polished, professional document. From conducting deep literature reviews to refining your arguments and correcting grammar, our editors ensure your work shines.",
    features: [
      "Comprehensive literature reviews",
      "Citation formatting and bibliography management",
      "Structure and flow improvement",
      "Grammar, punctuation, and style checks"
    ],
    benefits: [
      "Ensure your research is robust and well-supported",
      "Present a professional, error-free document",
      "Meet all academic formatting requirements"
    ],
    process: [
      "Upload your draft or research topic",
      "Discuss your needs with an editor",
      "Receive tracked changes and comments",
      "Final polish and delivery"
    ],
    color: "text-purple-600",
    bg: "bg-purple-50"
  },
  {
    id: "presentation-design",
    icon: Presentation,
    title: "Presentation Design",
    shortDescription: "Compelling PowerPoint and slide decks designed to make your arguments stand out.",
    fullDescription: "Don't let a poor presentation undermine your hard work. Our Presentation Design service transforms your data and ideas into visually stunning slides that captivate your audience. We focus on clear storytelling, professional graphics, and impactful design to help you present with confidence.",
    features: [
      "Custom slide design and layout",
      "Visual storytelling and infographics",
      "Speaker notes and script assistance",
      "Integration of charts, graphs, and media"
    ],
    benefits: [
      "Captivate your audience with professional visuals",
      "Communicate complex ideas clearly",
      "Boost your confidence during presentations"
    ],
    process: [
      "Send us your content or draft slides",
      "Choose a style or theme",
      "Review the initial design draft",
      "Receive the final editable presentation"
    ],
    color: "text-amber-600",
    bg: "bg-amber-50"
  },
  {
    id: "technical-projects",
    icon: Code,
    title: "Technical Projects",
    shortDescription: "Support for coding assignments, data analysis, and engineering projects.",
    fullDescription: "Technical projects require precision and expertise. Our Technical Projects service offers support for coding, data analysis, and engineering tasks. Whether you're stuck on a bug, need help analyzing a dataset, or are building a prototype, our technical experts are ready to assist.",
    features: [
      "Code documentation and commenting",
      "Debugging and optimization",
      "Data visualization and statistical analysis",
      "Engineering calculations and simulations"
    ],
    benefits: [
      "Overcome technical roadblocks quickly",
      "Learn best practices in coding and analysis",
      "Ensure your project functions correctly"
    ],
    process: [
      "Describe your technical challenge",
      "Share your code or data files",
      "Expert provides solution or guidance",
      "Review and verify the results"
    ],
    color: "text-cyan-600",
    bg: "bg-cyan-50"
  },
  {
    id: "career-vault",
    icon: Briefcase,
    title: "Career Vault",
    shortDescription: "Launch your career with resume reviews, cover letter writing, and interview preparation.",
    fullDescription: "Landing your dream job starts with the right tools. The Career Vault offers a suite of services to help you stand out to employers. From crafting a resume that passes ATS filters to practicing mock interviews with industry professionals, we help you put your best foot forward.",
    features: [
      "ATS-optimized resume writing",
      "Persuasive cover letter crafting",
      "LinkedIn profile optimization",
      "Mock interviews with feedback"
    ],
    benefits: [
      "Increase your chances of getting an interview",
      "Present a professional personal brand",
      "Feel prepared and confident for interviews"
    ],
    process: [
      "Upload your current resume/CV",
      "Tell us about your career goals",
      "Work with a career coach",
      "Receive your polished career documents"
    ],
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    id: "syllabus-sync",
    icon: FileText,
    title: "Syllabus Sync",
    shortDescription: "Stay ahead of your coursework by syncing your syllabus with our expert study planners.",
    fullDescription: "Overwhelmed by deadlines? Syllabus Sync helps you manage your academic workload. We turn your course syllabi into a personalized study schedule, complete with deadline reminders and curated resources, so you never miss an assignment or exam again.",
    features: [
      "Personalized semester study schedule",
      "Deadline tracking and reminders",
      "Resource curation for each topic",
      "Exam preparation milestones"
    ],
    benefits: [
      "Never miss a deadline again",
      "Reduce academic stress and anxiety",
      "Study more efficiently and effectively"
    ],
    process: [
      "Upload your course syllabi",
      "Set your availability and goals",
      "Receive your custom study plan",
      "Get weekly updates and reminders"
    ],
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
  {
    id: "creative-writing",
    icon: PenTool,
    title: "Creative Writing",
    shortDescription: "Unlock your imagination with help on stories, poems, and scripts.",
    fullDescription: "Expressing yourself creatively can be challenging. Our Creative Writing service connects you with published authors and experienced editors who can help you develop your voice, structure your narrative, and polish your prose for stories, poems, or scripts.",
    features: [
      "Plot development and character arcs",
      "Voice and tone refinement",
      "Feedback on pacing and dialogue",
      "Editing for publication"
    ],
    benefits: [
      "Develop your unique writing voice",
      "Overcome writer's block",
      "Create compelling narratives"
    ],
    process: [
      "Share your draft or idea",
      "Receive constructive critique",
      "Collaborate on revisions",
      "Finalize your creative piece"
    ],
    color: "text-pink-600",
    bg: "bg-pink-50"
  },
  {
    id: "data-analysis",
    icon: BarChart,
    title: "Data Analysis",
    shortDescription: "Statistical analysis and data visualization for your research projects.",
    fullDescription: "Data speaks volumes, but only if you know how to listen. Our Data Analysis service helps you make sense of your data. whether you're using SPSS, R, Python, or Excel, our experts can assist with statistical testing, interpretation, and visualization.",
    features: [
      "Statistical testing (t-tests, ANOVA, regression)",
      "Data cleaning and preparation",
      "Custom charts and graphs",
      "Interpretation of results"
    ],
    benefits: [
      "Derive meaningful insights from data",
      "Validate your research hypotheses",
      "Present data clearly and accurately"
    ],
    process: [
      "Provide your dataset and research questions",
      "Choose your preferred software",
      "Receive analysis and report",
      "Walkthrough of the results"
    ],
    color: "text-orange-600",
    bg: "bg-orange-50"
  }
];
