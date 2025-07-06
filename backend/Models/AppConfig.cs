namespace BATS.Models;

public class AppConfig
{
    public string PdfDirectory { get; set; } = Path.Combine(Path.GetTempPath(), "BATS");
    public int MaxFileSizeMB { get; set; } = 10;
    public string[] AllowedFileTypes { get; set; } = { "application/pdf" };
    public int ProcessingTimeoutSeconds { get; set; } = 30;
    
    // Legacy single keywords for backward compatibility
    public string Keywords { get; set; } = 
        "Quality Assurance QA Analyst Test Engineer Manual Testing Automated Testing " +
        "Regression Testing Integration Testing Functional Testing Selenium WebDriver " +
        "Cypress Playwright SpecFlow Cucumber BDD TDD API Testing Postman RestAssured " +
        "SQL Queries Database Testing Mobile Testing Appium Jira Jenkins Azure DevOps " +
        "Git CI/CD Pipelines Agile Scrum Kanban Defect Management Test Planning Documentation";
    
    // Multi-role keywords dictionary
    public Dictionary<string, RoleKeywords> RoleKeywords { get; set; } = new()
    {
        ["qa"] = new RoleKeywords
        {
            DisplayName = "Quality Assurance",
            Description = "QA Engineers, Test Analysts, and Quality Specialists",
            PrimaryKeywords = new[]
            {
                "Quality Assurance", "QA", "Test Engineer", "Test Analyst", "Manual Testing",
                "Automated Testing", "Regression Testing", "Integration Testing", "Functional Testing",
                "Unit Testing", "System Testing", "User Acceptance Testing", "Performance Testing",
                "Load Testing", "Security Testing", "API Testing", "Database Testing", "Mobile Testing"
            },
            TechnicalKeywords = new[]
            {
                "Selenium", "WebDriver", "Cypress", "Playwright", "TestComplete", "Appium",
                "Postman", "RestAssured", "JMeter", "LoadRunner", "SOAPUI", "Charles Proxy",
                "Burp Suite", "SQL", "MySQL", "PostgreSQL", "MongoDB", "TestRail", "Zephyr"
            },
            ProcessKeywords = new[]
            {
                "Test Planning", "Test Cases", "Test Scenarios", "Test Data", "Defect Management",
                "Bug Tracking", "Test Automation", "CI/CD", "Agile", "Scrum", "Kanban",
                "BDD", "TDD", "ATDD", "Risk Assessment", "Test Strategy", "Test Design"
            },
            ToolsKeywords = new[]
            {
                "Jira", "Jenkins", "Azure DevOps", "Git", "GitHub", "GitLab", "Confluence",
                "SpecFlow", "Cucumber", "Robot Framework", "TestNG", "JUnit", "NUnit",
                "Docker", "Kubernetes", "AWS", "Azure", "GCP"
            }
        },
        ["developer"] = new RoleKeywords
        {
            DisplayName = "Software Developer",
            Description = "Full-stack, Frontend, Backend, and Mobile Developers",
            PrimaryKeywords = new[]
            {
                "Software Developer", "Full Stack Developer", "Frontend Developer", "Backend Developer",
                "Web Developer", "Mobile Developer", "Software Engineer", "Programmer",
                "Application Developer", "Systems Developer", "DevOps Engineer"
            },
            TechnicalKeywords = new[]
            {
                "JavaScript", "TypeScript", "React", "Vue", "Angular", "Node.js", "Express",
                "Python", "Django", "Flask", "Java", "Spring", "C#", ".NET", "ASP.NET",
                "PHP", "Laravel", "Ruby", "Rails", "Go", "Rust", "Swift", "Kotlin",
                "HTML", "CSS", "SCSS", "Tailwind", "Bootstrap", "REST API", "GraphQL"
            },
            ProcessKeywords = new[]
            {
                "Software Development", "Code Review", "Version Control", "Debugging",
                "Testing", "Documentation", "Agile", "Scrum", "CI/CD", "DevOps",
                "Microservices", "API Design", "Database Design", "System Architecture"
            },
            ToolsKeywords = new[]
            {
                "Git", "GitHub", "GitLab", "Docker", "Kubernetes", "Jenkins", "AWS",
                "Azure", "GCP", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch",
                "Visual Studio", "VS Code", "IntelliJ", "Eclipse", "Jira", "Confluence"
            }
        },
        ["marketing"] = new RoleKeywords
        {
            DisplayName = "Marketing Professional",
            Description = "Digital Marketing, Content Marketing, and Growth Specialists",
            PrimaryKeywords = new[]
            {
                "Marketing Manager", "Digital Marketing", "Content Marketing", "Marketing Specialist",
                "Growth Marketing", "Brand Manager", "Marketing Coordinator", "Campaign Manager",
                "Marketing Analyst", "Product Marketing", "Performance Marketing", "Email Marketing"
            },
            TechnicalKeywords = new[]
            {
                "Google Analytics", "Google Ads", "Facebook Ads", "LinkedIn Ads", "SEO",
                "SEM", "PPC", "CRO", "A/B Testing", "Marketing Automation", "CRM",
                "Email Marketing", "Social Media Marketing", "Content Management", "WordPress"
            },
            ProcessKeywords = new[]
            {
                "Campaign Management", "Lead Generation", "Customer Acquisition", "Brand Strategy",
                "Market Research", "Competitor Analysis", "ROI Analysis", "Marketing Strategy",
                "Content Strategy", "Social Media Strategy", "Conversion Optimization"
            },
            ToolsKeywords = new[]
            {
                "HubSpot", "Salesforce", "Mailchimp", "Hootsuite", "Buffer", "Canva",
                "Adobe Creative Suite", "Photoshop", "Illustrator", "Figma", "Tableau",
                "Google Tag Manager", "Hotjar", "Mixpanel", "Amplitude", "Zapier"
            }
        },
        ["sales"] = new RoleKeywords
        {
            DisplayName = "Sales Professional",
            Description = "Sales Representatives, Account Managers, and Business Development",
            PrimaryKeywords = new[]
            {
                "Sales Representative", "Account Manager", "Business Development", "Sales Manager",
                "Sales Specialist", "Account Executive", "Sales Coordinator", "Inside Sales",
                "Outside Sales", "Territory Manager", "Key Account Manager", "Sales Consultant"
            },
            TechnicalKeywords = new[]
            {
                "CRM", "Salesforce", "HubSpot", "Pipedrive", "Sales Pipeline", "Lead Management",
                "Sales Funnel", "Sales Analytics", "Revenue Management", "Forecasting",
                "Quote Management", "Contract Management", "Sales Automation"
            },
            ProcessKeywords = new[]
            {
                "Lead Generation", "Cold Calling", "Cold Outreach", "Prospecting", "Qualification",
                "Needs Assessment", "Solution Selling", "Consultative Selling", "Closing",
                "Follow-up", "Customer Retention", "Upselling", "Cross-selling", "Negotiation"
            },
            ToolsKeywords = new[]
            {
                "Microsoft Office", "Excel", "PowerPoint", "LinkedIn Sales Navigator",
                "Zoom", "Teams", "Slack", "Calendly", "DocuSign", "Proposal Software",
                "Email Marketing", "Social Selling", "Sales Intelligence", "Lead Scoring"
            }
        },
        ["finance"] = new RoleKeywords
        {
            DisplayName = "Finance Professional",
            Description = "Financial Analysts, Accountants, and Finance Managers",
            PrimaryKeywords = new[]
            {
                "Financial Analyst", "Accountant", "Finance Manager", "Financial Advisor",
                "Budget Analyst", "Investment Analyst", "Credit Analyst", "Tax Specialist",
                "Auditor", "Controller", "CFO", "Finance Specialist", "Financial Planner"
            },
            TechnicalKeywords = new[]
            {
                "Financial Modeling", "Excel", "VBA", "SQL", "Python", "R", "Tableau",
                "Power BI", "QuickBooks", "SAP", "Oracle", "Financial Analysis",
                "Budgeting", "Forecasting", "Variance Analysis", "Cost Analysis"
            },
            ProcessKeywords = new[]
            {
                "Financial Planning", "Risk Management", "Compliance", "Audit", "Taxation",
                "Investment Management", "Portfolio Management", "Financial Reporting",
                "Cash Flow Management", "Working Capital", "Capital Budgeting", "Valuation"
            },
            ToolsKeywords = new[]
            {
                "Bloomberg", "Reuters", "FactSet", "Morningstar", "Refinitiv", "Xero",
                "Sage", "NetSuite", "Hyperion", "Cognos", "GAAP", "IFRS", "SOX",
                "FP&A", "ERP", "CPA", "CFA", "FRM", "CIA"
            }
        },
        ["hr"] = new RoleKeywords
        {
            DisplayName = "Human Resources",
            Description = "HR Generalists, Recruiters, and People Operations",
            PrimaryKeywords = new[]
            {
                "Human Resources", "HR Generalist", "Recruiter", "Talent Acquisition",
                "HR Manager", "People Operations", "HR Specialist", "Compensation Analyst",
                "Training Coordinator", "Employee Relations", "HRBP", "Talent Manager"
            },
            TechnicalKeywords = new[]
            {
                "Workday", "BambooHR", "ADP", "Greenhouse", "Lever", "LinkedIn Recruiter",
                "Indeed", "ZipRecruiter", "Glassdoor", "HRIS", "Payroll", "Benefits Administration",
                "Performance Management", "Learning Management", "Succession Planning"
            },
            ProcessKeywords = new[]
            {
                "Recruitment", "Onboarding", "Employee Engagement", "Performance Review",
                "Compensation Planning", "Benefits Management", "Policy Development",
                "Compliance", "Training Development", "Organizational Development", "Change Management"
            },
            ToolsKeywords = new[]
            {
                "Microsoft Office", "Excel", "PowerPoint", "Survey Tools", "Analytics",
                "Reporting", "Database Management", "Project Management", "Communication",
                "Presentation", "Interview", "Assessment", "Background Check"
            }
        },
        ["design"] = new RoleKeywords
        {
            DisplayName = "Design Professional",
            Description = "UI/UX Designers, Graphic Designers, and Creative Professionals",
            PrimaryKeywords = new[]
            {
                "UI Designer", "UX Designer", "Product Designer", "Graphic Designer",
                "Web Designer", "Visual Designer", "Creative Designer", "Design Lead",
                "Art Director", "Brand Designer", "Motion Designer", "Design Researcher"
            },
            TechnicalKeywords = new[]
            {
                "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", "InDesign",
                "After Effects", "Premiere Pro", "Canva", "InVision", "Miro", "Framer",
                "Principle", "Zeplin", "Abstract", "Marvel", "Axure", "Balsamiq"
            },
            ProcessKeywords = new[]
            {
                "User Research", "Usability Testing", "Information Architecture", "Wireframing",
                "Prototyping", "User Journey", "Design System", "Brand Guidelines",
                "Visual Identity", "Typography", "Color Theory", "Layout Design", "Responsive Design"
            },
            ToolsKeywords = new[]
            {
                "HTML", "CSS", "JavaScript", "React", "Vue", "Angular", "Git", "GitHub",
                "Jira", "Confluence", "Slack", "Zoom", "Google Workspace", "Microsoft Office",
                "Presentation", "Communication", "Collaboration", "Project Management"
            }
        },
        ["operations"] = new RoleKeywords
        {
            DisplayName = "Operations Professional",
            Description = "Operations Managers, Process Analysts, and Operations Specialists",
            PrimaryKeywords = new[]
            {
                "Operations Manager", "Operations Analyst", "Process Analyst", "Operations Specialist",
                "Business Operations", "Operations Coordinator", "Supply Chain", "Logistics",
                "Operations Lead", "Process Improvement", "Operational Excellence", "Operations Director"
            },
            TechnicalKeywords = new[]
            {
                "Excel", "SQL", "Tableau", "Power BI", "Process Mapping", "Lean Six Sigma",
                "ERP", "SAP", "Oracle", "Salesforce", "Project Management", "Data Analysis",
                "Reporting", "Dashboard", "KPI", "Metrics", "Analytics"
            },
            ProcessKeywords = new[]
            {
                "Process Optimization", "Workflow Design", "Standard Operating Procedures",
                "Quality Management", "Risk Management", "Vendor Management", "Cost Control",
                "Efficiency Improvement", "Change Management", "Training", "Documentation"
            },
            ToolsKeywords = new[]
            {
                "Microsoft Office", "Visio", "SharePoint", "Jira", "Asana", "Monday.com",
                "Trello", "Slack", "Teams", "Zoom", "Google Workspace", "Confluence",
                "Notion", "Airtable", "Zapier", "Automation", "API", "Integration"
            }
        }
    };
    
    // Google Gemini AI Configuration
    public string? GoogleGeminiApiKey { get; set; }
    public bool EnableAIKeywordExtraction { get; set; } = true;
    public int AIRequestTimeoutSeconds { get; set; } = 30;
    public int MaxAIKeywords { get; set; } = 50;
    
    public AppConfig()
    {
        // Ensure the PDF directory exists
        Directory.CreateDirectory(PdfDirectory);
    }
    
    // Helper method to get all keywords for a role
    public List<string> GetAllKeywordsForRole(string roleKey)
    {
        if (!RoleKeywords.ContainsKey(roleKey))
            return new List<string>();
            
        var roleKeywords = RoleKeywords[roleKey];
        return roleKeywords.PrimaryKeywords
            .Concat(roleKeywords.TechnicalKeywords)
            .Concat(roleKeywords.ProcessKeywords)
            .Concat(roleKeywords.ToolsKeywords)
            .ToList();
    }
    
    // Helper method to get available roles
    public List<RoleOption> GetAvailableRoles()
    {
        return RoleKeywords.Select(kvp => new RoleOption
        {
            Key = kvp.Key,
            DisplayName = kvp.Value.DisplayName,
            Description = kvp.Value.Description
        }).ToList();
    }
}

public class RoleKeywords
{
    public string DisplayName { get; set; } = "";
    public string Description { get; set; } = "";
    public string[] PrimaryKeywords { get; set; } = Array.Empty<string>();
    public string[] TechnicalKeywords { get; set; } = Array.Empty<string>();
    public string[] ProcessKeywords { get; set; } = Array.Empty<string>();
    public string[] ToolsKeywords { get; set; } = Array.Empty<string>();
}

public class RoleOption
{
    public string Key { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string Description { get; set; } = "";
}