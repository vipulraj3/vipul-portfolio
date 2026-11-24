
export const PROFILE = {
  name: "Vipul Raj",
  title: "Salesforce Developer",
  roles: [
    "Salesforce Developer",
    "Salesforce Certified Administrator",
    "Apex & LWC Developer",
    "CRM Automation Builder"
  ],
  tagline:
    "I design and build Salesforce CRM solutions using Apex, Lightning Web Components, Flows, and automation.",
  about:
    "I'm a Computer Science graduate from D.Y. Patil College of Engineering and Technology, Kolhapur. I'm a Salesforce Certified Administrator with hands-on development experience in Apex, LWC, SOQL/SOSL, and Salesforce automation. I enjoy solving business problems by building scalable, maintainable applications.",
  email: "rajvipul74@gmail.com",
  github: "https://github.com/vipulraj3",
  linkedin: "https://www.linkedin.com/in/vipulraj3",
  location: "India",
  resume: "/Vipul_Raj_Resume.pdf"
};

export const SKILLS = [
  { Name: "Apex", Category__c: "Salesforce", Level__c: 75 },
  { Name: "Triggers", Category__c: "Salesforce", Level__c: 75 },
  { Name: "SOQL", Category__c: "Salesforce", Level__c: 80 },
  { Name: "SOSL", Category__c: "Salesforce", Level__c: 65 },
  { Name: "Lightning Web Components", Category__c: "Salesforce", Level__c: 70 },
  { Name: "Record-Triggered Flows", Category__c: "Salesforce", Level__c: 80 },
  { Name: "Asynchronous Apex", Category__c: "Salesforce", Level__c: 65 },
  { Name: "Validation Rules", Category__c: "Salesforce", Level__c: 85 },
  { Name: "Security & Sharing", Category__c: "Salesforce", Level__c: 75 },
  { Name: "Java", Category__c: "Programming", Level__c: 75 },
  { Name: "JavaScript", Category__c: "Programming", Level__c: 75 },
  { Name: "SQL", Category__c: "Programming", Level__c: 75 },
  { Name: "React", Category__c: "Web", Level__c: 70 },
  { Name: "Express.js", Category__c: "Web", Level__c: 65 },
  { Name: "Git & GitHub", Category__c: "Tools", Level__c: 80 },
  { Name: "REST APIs", Category__c: "Tools", Level__c: 65 }
];

// Level__c values are illustrative data for the SOQL Playground,
// not independently verified proficiency scores.

export const PROJECTS = [
  {
    Name: "Real Estate Agency",
    Type__c: "Salesforce",
    Status__c: "Completed",
    Stack__c: "Apex, Triggers, LWC, Flows, SOQL, Security",
    Description__c:
      "An end-to-end Salesforce CRM application for property management, sales offices, regional operations, agent commissions, manager approvals, and role-based data access.",
    Highlights: [
      "Designed custom objects and relationships for real estate operations",
      "Developed Apex logic for agent commission calculations",
      "Automated business processes using Salesforce Flows",
      "Implemented Salesforce security and record sharing",
      "Built an LWC dashboard for property and commission information"
    ],
    Github__c: "",
    Live__c: "",
    featured: true
  },
  {
    Name: "PocketShop",
    Type__c: "Web",
    Status__c: "Completed",
    Stack__c: "React, Express.js, Supabase, REST APIs",
    Description__c:
      "A full-stack inventory and vendor management application designed to help small businesses track products and inventory.",
    Highlights: [
      "Developed responsive React frontend components",
      "Implemented backend REST APIs with Express.js",
      "Integrated Supabase for authentication and database management"
    ],
    Github__c: "",
    Live__c: "https://pocketshop.pages.dev",
    featured: false
  },
  {
    Name: "Contact Manager",
    Type__c: "Salesforce",
    Status__c: "Completed",
    Stack__c: "LWC, Apex, SOQL, JavaScript",
    Description__c:
      "A Salesforce Lightning Web Component for contact management with create, read, update, and delete operations.",
    Highlights: [
      "Created interactive Lightning datatables",
      "Developed editable modal forms",
      "Connected LWC components to Apex methods",
      "Implemented record updates and data refresh"
    ],
    Github__c: "",
    Live__c: "",
    featured: false
  }
];

export const CERTIFICATIONS = [
  {
    Name: "Salesforce Certified Administrator",
    Status__c: "Certified",
    Year__c: "April 2026",
    Description: "Salesforce administration, configuration, and security"
  },
  {
    Name: "Salesforce Platform Developer I",
    Status__c: "In Progress",
    Year__c: "Target: December 2026",
    Description: "Preparing for the Salesforce developer certification"
  }
];

export const EXPERIENCE = [
  {
    role: "Salesforce Developer Trainee",
    company: "CloudIntellact",
    period: "Apr 2026 – Present",
    description:
      "Practising Apex triggers, asynchronous Apex, Lightning Web Components, SOQL/SOSL, and Salesforce debugging."
  },
  {
    role: "PostLLM Trainer",
    company: "Ethara.ai",
    period: "Jan 2026 – Apr 2026",
    description:
      "Evaluated technical accuracy, reasoning, and reliability of AI-generated responses across STEM domains."
  },
  {
    role: "Software Engineer Intern",
    company: "IIT Bombay (Internship Program)",
    period: "Jun 2025 – Sep 2025",
    description:
      "Built frontend components for a collaborative learning platform and collaborated using Git-based workflows."
  },
  {
    role: "AI Contributor",
    company: "Outlier",
    period: "Jan 2025 – Apr 2025",
    description:
      "Performed analytical reasoning and technical evaluation of AI-generated outputs."
  }
];
