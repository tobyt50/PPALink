export const careerArchetypes = [
  {
    name: "Software Developer",
    fieldsOfStudy: [
      "Computer Science",
      "Software Engineering",
      "Information Technology",
      "Electrical Engineering",
    ],
    jobTitles: [
      "Backend Developer",
      "Full Stack Engineer",
      "Java Developer",
      "Software Engineer",
    ],
    skills: [
      "Software Development",
      "Backend Development",
      "Frontend Development",
      "Data Analysis",
      "Project Management",
    ],
    summaryTemplate: (name: string, exp: number, job: string, skill: string) =>
      `A highly skilled and motivated ${job} with ${exp} years of experience in designing, developing, and deploying robust software solutions. Proficient in ${skill} and modern development methodologies. Eager to contribute to a challenging and innovative team.`,
  },
  {
    name: "Frontend Developer",
    fieldsOfStudy: [
      "Computer Science",
      "Information Technology",
      "Web Design & Development",
    ],
    jobTitles: [
      "Frontend Developer",
      "UI Engineer",
      "React Developer",
      "Web Developer",
    ],
    skills: [
      "Frontend Development",
      "UI/UX Design",
      "Software Development",
      "Project Management",
    ],
    summaryTemplate: (name: string, exp: number, job: string, skill: string) =>
      `A creative and detail-oriented ${job} with ${exp} years of experience building responsive and user-friendly web applications. Expertise in ${skill} and a strong passion for creating seamless user experiences. Proven ability to collaborate with designers and backend teams.`,
  },
  {
    name: "Digital Marketer",
    fieldsOfStudy: [
      "Marketing",
      "Mass Communication",
      "Business Administration",
      "Economics",
    ],
    jobTitles: [
      "Digital Marketing Specialist",
      "SEO Analyst",
      "Content Marketing Manager",
      "Social Media Manager",
    ],
    skills: [
      "Digital Marketing",
      "Sales",
      "Project Management",
      "Data Analysis",
      "Search Engine Optimization (SEO)",
    ],
    summaryTemplate: (name: string, exp: number, job: string, skill: string) =>
      `A results-driven ${job} with over ${exp} years of experience in developing and executing successful online marketing campaigns. Specializes in ${skill} and leveraging data analytics to optimize performance and drive growth. Adept at managing budgets and leading marketing initiatives.`,
  },
  {
    name: "Accountant",
    fieldsOfStudy: [
      "Accounting",
      "Finance",
      "Banking and Finance",
      "Economics",
    ],
    jobTitles: [
      "Accountant",
      "Financial Analyst",
      "Auditor",
      "Finance Officer",
    ],
    skills: [
      "Accounting",
      "Data Analysis",
      "Business Analysis",
      "Financial Analysis",
      "Auditing",
    ],
    summaryTemplate: (name: string, exp: number, job: string, skill: string) =>
      `A meticulous and certified ${job} with ${exp} years of comprehensive experience in financial reporting, auditing, and compliance. Proficient in ${skill} and various accounting software. Possesses strong analytical skills and a commitment to accuracy and integrity.`,
  },
  {
    name: "HR Specialist",
    fieldsOfStudy: [
      "Human Resources Management",
      "Industrial Relations",
      "Business Administration",
      "Psychology",
    ],
    jobTitles: [
      "Human Resources Generalist",
      "Recruitment Specialist",
      "Talent Acquisition Manager",
      "HR Business Partner",
    ],
    skills: [
      "Human Resources",
      "Customer Service",
      "Project Management",
      "Recruitment",
    ],
    summaryTemplate: (name: string, exp: number, job: string, skill: string) =>
      `An empathetic and professional ${job} with ${exp} years of experience in talent management, employee relations, and HR operations. Expertise in ${skill} and developing strategies to foster a positive and productive work environment. Excellent communication and interpersonal skills.`,
  },
  {
    name: "Project Manager",
    fieldsOfStudy: [
      "Project Management",
      "Business Administration",
      "Engineering",
      "Information Technology",
    ],
    jobTitles: [
      "Project Manager",
      "IT Project Coordinator",
      "Product Manager",
      "Scrum Master",
    ],
    skills: [
      "Project Management",
      "Business Analysis",
      "Product Management",
      "Customer Service",
      "Team Management",
    ],
    summaryTemplate: (name: string, exp: number, job: string, skill: string) =>
      `A certified ${job} (PMP) with ${exp} years of success leading cross-functional teams to deliver projects on time and within budget. A strong leader with expertise in ${skill}, risk management, and stakeholder communication. Dedicated to driving efficiency and achieving strategic goals.`,
  },
  {
    name: "Data Analyst",
    fieldsOfStudy: [
      "Statistics",
      "Mathematics",
      "Computer Science",
      "Economics",
    ],
    jobTitles: [
      "Data Analyst",
      "Business Intelligence Analyst",
      "Data Scientist",
      "Quantitative Analyst",
    ],
    skills: [
      "Data Analysis",
      "Business Analysis",
      "Software Development",
      "Database Management (SQL/NoSQL)",
    ],
    summaryTemplate: (name: string, exp: number, job: string, skill: string) =>
      `An analytical and detail-oriented ${job} with ${exp} years of experience in interpreting complex datasets and generating actionable insights. Proficient in SQL, Python, and visualization tools like Tableau. Specializes in ${skill} to help businesses make data-driven decisions.`,
  },
];
