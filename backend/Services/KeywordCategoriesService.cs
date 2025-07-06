using BATS.Services.Interfaces;

namespace BATS.Services;

public class KeywordCategoriesService : IKeywordCategoriesService
{
    private readonly List<JobCategory> _categories;

    public KeywordCategoriesService()
    {
        _categories = InitializeCategories();
    }

    public List<JobCategory> GetAllCategories()
    {
        return _categories.OrderByDescending(c => c.PopularityScore).ToList();
    }

    public JobCategory GetCategoryById(string categoryId)
    {
        return _categories.FirstOrDefault(c => c.Id == categoryId);
    }

    public List<string> GetKeywordsByCategory(string categoryId)
    {
        var category = GetCategoryById(categoryId);
        return category?.Keywords ?? new List<string>();
    }

    public List<JobCategory> SearchCategories(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
            return GetAllCategories();

        var term = searchTerm.ToLower();
        return _categories
            .Where(c => c.Name.ToLower().Contains(term) || 
                       c.Description.ToLower().Contains(term) ||
                       c.Tags.Any(t => t.ToLower().Contains(term)) ||
                       c.Keywords.Any(k => k.ToLower().Contains(term)))
            .OrderByDescending(c => c.PopularityScore)
            .ToList();
    }

    public List<string> GetCombinedKeywords(List<string> categoryIds)
    {
        var combinedKeywords = new HashSet<string>();
        
        foreach (var categoryId in categoryIds)
        {
            var keywords = GetKeywordsByCategory(categoryId);
            foreach (var keyword in keywords)
            {
                combinedKeywords.Add(keyword);
            }
        }

        return combinedKeywords.ToList();
    }

    public bool CategoryExists(string categoryId)
    {
        return _categories.Any(c => c.Id == categoryId);
    }

    public List<JobCategory> GetCategoriesForJobRole(string jobRole, float confidence = 0.0f)
    {
        var recommendedCategoryIds = GetRecommendedCategoryIds(jobRole, new List<string>());
        var categories = _categories.Where(c => recommendedCategoryIds.Contains(c.Id)).ToList();
        
        // If confidence is low, return more categories
        if (confidence < 0.7f)
        {
            var additionalCategories = _categories.Where(c => !recommendedCategoryIds.Contains(c.Id))
                .OrderByDescending(c => c.PopularityScore)
                .Take(3)
                .ToList();
            categories.AddRange(additionalCategories);
        }
        
        return categories.OrderByDescending(c => c.PopularityScore).ToList();
    }

    public List<JobCategory> GetSmartCategoriesForRole(JobRoleAnalysis roleAnalysis)
    {
        var recommendedCategories = new List<JobCategory>();
        
        // Get categories based on recommended category IDs from AI analysis
        if (roleAnalysis.RecommendedCategories.Any())
        {
            var aiRecommendedCategories = _categories
                .Where(c => roleAnalysis.RecommendedCategories.Contains(c.Id))
                .ToList();
            recommendedCategories.AddRange(aiRecommendedCategories);
        }
        
        // Fall back to role-based mapping if AI didn't provide categories
        if (!recommendedCategories.Any())
        {
            var roleCategoryIds = GetRecommendedCategoryIds(roleAnalysis.PrimaryRole, roleAnalysis.SecondaryRoles);
            var roleCategories = _categories.Where(c => roleCategoryIds.Contains(c.Id)).ToList();
            recommendedCategories.AddRange(roleCategories);
        }
        
        // If confidence is low, add more popular categories
        if (roleAnalysis.Confidence < 0.7f)
        {
            var additionalCategories = _categories
                .Where(c => !recommendedCategories.Any(rc => rc.Id == c.Id))
                .OrderByDescending(c => c.PopularityScore)
                .Take(2)
                .ToList();
            recommendedCategories.AddRange(additionalCategories);
        }
        
        return recommendedCategories.OrderByDescending(c => c.PopularityScore).ToList();
    }

    public List<string> GetRecommendedCategoryIds(string primaryRole, List<string> secondaryRoles)
    {
        var categoryIds = new List<string>();
        var allRoles = new List<string> { primaryRole };
        allRoles.AddRange(secondaryRoles);
        
        foreach (var role in allRoles)
        {
            var roleKeywords = role.ToLower();
            
            // Software Development
            if (roleKeywords.Contains("software") || roleKeywords.Contains("developer") || 
                roleKeywords.Contains("engineer") || roleKeywords.Contains("programmer") ||
                roleKeywords.Contains("full stack") || roleKeywords.Contains("backend") ||
                roleKeywords.Contains("frontend") || roleKeywords.Contains("web developer"))
            {
                categoryIds.Add("software-development");
            }
            
            // QA Testing
            if (roleKeywords.Contains("qa") || roleKeywords.Contains("quality") || 
                roleKeywords.Contains("test") || roleKeywords.Contains("automation") ||
                roleKeywords.Contains("sdet") || roleKeywords.Contains("quality assurance"))
            {
                categoryIds.Add("qa-testing");
            }
            
            // Data Science
            if (roleKeywords.Contains("data") || roleKeywords.Contains("scientist") || 
                roleKeywords.Contains("analyst") || roleKeywords.Contains("machine learning") ||
                roleKeywords.Contains("ai") || roleKeywords.Contains("analytics") ||
                roleKeywords.Contains("business intelligence"))
            {
                categoryIds.Add("data-science");
            }
            
            // Digital Marketing
            if (roleKeywords.Contains("marketing") || roleKeywords.Contains("seo") || 
                roleKeywords.Contains("digital") || roleKeywords.Contains("social media") ||
                roleKeywords.Contains("campaign") || roleKeywords.Contains("content"))
            {
                categoryIds.Add("digital-marketing");
            }
            
            // UX/UI Design
            if (roleKeywords.Contains("design") || roleKeywords.Contains("ux") || 
                roleKeywords.Contains("ui") || roleKeywords.Contains("user experience") ||
                roleKeywords.Contains("product design") || roleKeywords.Contains("visual"))
            {
                categoryIds.Add("ux-ui-design");
            }
            
            // Project Management
            if (roleKeywords.Contains("project") || roleKeywords.Contains("manager") || 
                roleKeywords.Contains("scrum") || roleKeywords.Contains("agile") ||
                roleKeywords.Contains("product owner") || roleKeywords.Contains("program"))
            {
                categoryIds.Add("project-management");
            }
            
            // Sales
            if (roleKeywords.Contains("sales") || roleKeywords.Contains("business development") || 
                roleKeywords.Contains("account") || roleKeywords.Contains("revenue") ||
                roleKeywords.Contains("lead generation") || roleKeywords.Contains("b2b"))
            {
                categoryIds.Add("sales");
            }
            
            // Finance & Accounting
            if (roleKeywords.Contains("finance") || roleKeywords.Contains("accounting") || 
                roleKeywords.Contains("financial") || roleKeywords.Contains("audit") ||
                roleKeywords.Contains("cpa") || roleKeywords.Contains("budget"))
            {
                categoryIds.Add("finance-accounting");
            }
            
            // HR & Recruiting
            if (roleKeywords.Contains("hr") || roleKeywords.Contains("human resources") || 
                roleKeywords.Contains("recruiting") || roleKeywords.Contains("talent") ||
                roleKeywords.Contains("people") || roleKeywords.Contains("recruitment"))
            {
                categoryIds.Add("hr-recruiting");
            }
            
            // Cybersecurity
            if (roleKeywords.Contains("security") || roleKeywords.Contains("cyber") || 
                roleKeywords.Contains("information security") || roleKeywords.Contains("infosec") ||
                roleKeywords.Contains("penetration") || roleKeywords.Contains("vulnerability"))
            {
                categoryIds.Add("cybersecurity");
            }
        }
        
        return categoryIds.Distinct().ToList();
    }

    private List<JobCategory> InitializeCategories()
    {
        return new List<JobCategory>
        {
            new JobCategory
            {
                Id = "software-development",
                Name = "Software Development",
                Description = "Full-stack development, backend, frontend, and mobile development roles",
                Icon = "💻",
                Color = "#3B82F6",
                PopularityScore = 95,
                Tags = new List<string> { "tech", "programming", "development", "coding" },
                Keywords = new List<string>
                {
                    "JavaScript", "TypeScript", "React", "Angular", "Vue.js", "Node.js", "Python", "Java", "C#", ".NET",
                    "Spring Boot", "Django", "Flask", "Express.js", "HTML", "CSS", "SCSS", "Bootstrap", "Tailwind CSS",
                    "SQL", "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "Git", "GitHub", "GitLab", "Bitbucket",
                    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Jenkins", "REST API", "GraphQL", "Microservices",
                    "Agile", "Scrum", "TDD", "Unit Testing", "Integration Testing", "Jest", "Cypress", "Selenium",
                    "Full Stack", "Frontend", "Backend", "Mobile Development", "Web Development", "Software Engineer"
                }
            },
            new JobCategory
            {
                Id = "qa-testing",
                Name = "Quality Assurance & Testing",
                Description = "Manual testing, automation, QA analysis, and test engineering roles",
                Icon = "🔍",
                Color = "#10B981",
                PopularityScore = 85,
                Tags = new List<string> { "qa", "testing", "quality", "automation" },
                Keywords = new List<string>
                {
                    "Quality Assurance", "QA", "Test Engineer", "Manual Testing", "Automated Testing", "Test Automation",
                    "Regression Testing", "Integration Testing", "Functional Testing", "Performance Testing", "Load Testing",
                    "Selenium", "WebDriver", "Cypress", "Playwright", "TestNG", "JUnit", "Postman", "REST Assured",
                    "API Testing", "Mobile Testing", "Appium", "BDD", "TDD", "Cucumber", "SpecFlow", "Gherkin",
                    "Test Planning", "Test Cases", "Test Scripts", "Bug Tracking", "Jira", "TestRail", "Zephyr",
                    "Defect Management", "Test Documentation", "UAT", "Smoke Testing", "Sanity Testing", "Black Box Testing",
                    "White Box Testing", "Grey Box Testing", "Agile Testing", "Scrum", "Kanban", "Jenkins", "CI/CD",
                    "SQL", "Database Testing", "Cross Browser Testing", "Accessibility Testing", "Security Testing"
                }
            },
            new JobCategory
            {
                Id = "data-science",
                Name = "Data Science & Analytics",
                Description = "Data analysis, machine learning, AI, and business intelligence roles",
                Icon = "📊",
                Color = "#8B5CF6",
                PopularityScore = 90,
                Tags = new List<string> { "data", "analytics", "ml", "ai", "statistics" },
                Keywords = new List<string>
                {
                    "Data Science", "Data Analysis", "Machine Learning", "AI", "Artificial Intelligence", "Deep Learning",
                    "Python", "R", "SQL", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Keras",
                    "Jupyter", "Statistics", "Statistical Analysis", "Data Visualization", "Tableau", "Power BI", "D3.js",
                    "Big Data", "Hadoop", "Spark", "Kafka", "ETL", "Data Pipeline", "Data Warehouse", "Data Lake",
                    "Business Intelligence", "KPI", "A/B Testing", "Hypothesis Testing", "Regression Analysis",
                    "Classification", "Clustering", "NLP", "Computer Vision", "Time Series Analysis", "Forecasting",
                    "AWS", "Azure", "GCP", "Snowflake", "Databricks", "Apache Airflow", "Docker", "Kubernetes"
                }
            },
            new JobCategory
            {
                Id = "digital-marketing",
                Name = "Digital Marketing",
                Description = "SEO, SEM, social media, content marketing, and digital advertising roles",
                Icon = "📈",
                Color = "#F59E0B",
                PopularityScore = 80,
                Tags = new List<string> { "marketing", "digital", "seo", "sem", "social" },
                Keywords = new List<string>
                {
                    "Digital Marketing", "SEO", "SEM", "Google Ads", "Facebook Ads", "Social Media Marketing",
                    "Content Marketing", "Email Marketing", "Marketing Automation", "Lead Generation", "Conversion Optimization",
                    "Google Analytics", "Google Tag Manager", "HubSpot", "Salesforce", "Marketo", "Mailchimp",
                    "A/B Testing", "Landing Pages", "PPC", "CTR", "ROI", "ROAS", "CPC", "CPM", "CPA",
                    "Keyword Research", "Link Building", "Technical SEO", "On-Page SEO", "Off-Page SEO",
                    "Social Media Strategy", "Community Management", "Influencer Marketing", "Brand Management",
                    "Campaign Management", "Marketing Analytics", "Customer Segmentation", "Funnel Optimization",
                    "CRM", "Marketing Attribution", "Cross-Channel Marketing", "Retargeting", "Lookalike Audiences"
                }
            },
            new JobCategory
            {
                Id = "ux-ui-design",
                Name = "UX/UI Design",
                Description = "User experience, user interface, product design, and visual design roles",
                Icon = "🎨",
                Color = "#EF4444",
                PopularityScore = 75,
                Tags = new List<string> { "design", "ux", "ui", "product", "visual" },
                Keywords = new List<string>
                {
                    "UX Design", "UI Design", "User Experience", "User Interface", "Product Design", "Visual Design",
                    "Interaction Design", "Figma", "Sketch", "Adobe XD", "InVision", "Principle", "Framer",
                    "Wireframing", "Prototyping", "User Research", "Usability Testing", "A/B Testing", "User Journey",
                    "Information Architecture", "Design Systems", "Style Guides", "Responsive Design", "Mobile Design",
                    "Design Thinking", "Human-Centered Design", "Accessibility", "WCAG", "Material Design",
                    "Typography", "Color Theory", "Grid Systems", "Design Patterns", "Micro-interactions",
                    "Adobe Creative Suite", "Photoshop", "Illustrator", "After Effects", "HTML", "CSS", "JavaScript"
                }
            },
            new JobCategory
            {
                Id = "project-management",
                Name = "Project Management",
                Description = "Project managers, scrum masters, product owners, and program management roles",
                Icon = "📋",
                Color = "#06B6D4",
                PopularityScore = 85,
                Tags = new List<string> { "project", "management", "scrum", "agile", "product" },
                Keywords = new List<string>
                {
                    "Project Management", "Program Management", "Scrum Master", "Product Owner", "Agile", "Scrum", "Kanban",
                    "PMP", "Certified Scrum Master", "Project Planning", "Risk Management", "Stakeholder Management",
                    "Budget Management", "Resource Management", "Timeline Management", "Milestone Tracking",
                    "Jira", "Confluence", "Microsoft Project", "Asana", "Trello", "Monday.com", "Slack", "Teams",
                    "Sprint Planning", "Daily Standups", "Sprint Reviews", "Retrospectives", "Backlog Management",
                    "User Stories", "Acceptance Criteria", "Burndown Charts", "Velocity", "Story Points",
                    "Change Management", "Process Improvement", "Quality Assurance", "Delivery Management",
                    "Cross-functional Teams", "Vendor Management", "Contract Management", "Documentation"
                }
            },
            new JobCategory
            {
                Id = "sales",
                Name = "Sales & Business Development",
                Description = "Inside sales, outside sales, account management, and business development roles",
                Icon = "💼",
                Color = "#059669",
                PopularityScore = 88,
                Tags = new List<string> { "sales", "business", "account", "revenue", "crm" },
                Keywords = new List<string>
                {
                    "Sales", "Business Development", "Account Management", "Lead Generation", "Prospecting",
                    "Cold Calling", "Cold Emailing", "Sales Pipeline", "CRM", "Salesforce", "HubSpot", "Pipedrive",
                    "B2B Sales", "B2C Sales", "Inside Sales", "Outside Sales", "Field Sales", "Territory Management",
                    "Key Account Management", "Customer Relationship Management", "Sales Forecasting", "Quota Achievement",
                    "Negotiation", "Closing", "Objection Handling", "Discovery Calls", "Demo Presentations",
                    "Sales Methodology", "SPIN Selling", "Challenger Sale", "Solution Selling", "Consultative Selling",
                    "Revenue Growth", "Market Penetration", "Customer Acquisition", "Customer Retention", "Upselling",
                    "Cross-selling", "Partnership Development", "Channel Sales", "Sales Training", "Sales Analytics"
                }
            },
            new JobCategory
            {
                Id = "finance-accounting",
                Name = "Finance & Accounting",
                Description = "Financial analysis, accounting, auditing, and corporate finance roles",
                Icon = "💰",
                Color = "#7C3AED",
                PopularityScore = 70,
                Tags = new List<string> { "finance", "accounting", "audit", "financial", "cpa" },
                Keywords = new List<string>
                {
                    "Financial Analysis", "Financial Planning", "Budget Planning", "Forecasting", "Variance Analysis",
                    "Financial Reporting", "Financial Modeling", "Valuation", "Investment Analysis", "Risk Management",
                    "Accounting", "General Ledger", "Accounts Payable", "Accounts Receivable", "Month-end Close",
                    "Year-end Close", "Journal Entries", "Reconciliations", "GAAP", "IFRS", "SOX Compliance",
                    "CPA", "CFA", "FRM", "Excel", "Advanced Excel", "VBA", "Power BI", "Tableau", "SQL",
                    "SAP", "Oracle", "QuickBooks", "NetSuite", "Hyperion", "Cognos", "Bloomberg Terminal",
                    "Corporate Finance", "Treasury", "Cash Management", "Credit Analysis", "Audit", "Internal Audit",
                    "Tax Preparation", "Tax Planning", "M&A", "Due Diligence", "IPO", "Regulatory Compliance"
                }
            },
            new JobCategory
            {
                Id = "hr-recruiting",
                Name = "Human Resources & Recruiting",
                Description = "HR generalist, recruiting, talent acquisition, and people operations roles",
                Icon = "👥",
                Color = "#DB2777",
                PopularityScore = 65,
                Tags = new List<string> { "hr", "human resources", "recruiting", "talent", "people" },
                Keywords = new List<string>
                {
                    "Human Resources", "HR", "Talent Acquisition", "Recruiting", "Talent Management", "People Operations",
                    "Employee Relations", "Performance Management", "Compensation", "Benefits Administration",
                    "HRIS", "Workday", "BambooHR", "ADP", "Payroll", "Compliance", "Employment Law", "FMLA", "ADA",
                    "Onboarding", "Offboarding", "Employee Engagement", "Culture Development", "Diversity & Inclusion",
                    "Training & Development", "Learning & Development", "Succession Planning", "Career Development",
                    "Full-cycle Recruiting", "Sourcing", "Screening", "Interviewing", "Reference Checks", "Background Checks",
                    "LinkedIn Recruiter", "Indeed", "Monster", "Glassdoor", "Boolean Search", "Candidate Experience",
                    "Employer Branding", "University Recruiting", "Executive Search", "Contract Recruiting", "RPO"
                }
            },
            new JobCategory
            {
                Id = "cybersecurity",
                Name = "Cybersecurity",
                Description = "Information security, network security, and cybersecurity analysis roles",
                Icon = "🔒",
                Color = "#DC2626",
                PopularityScore = 82,
                Tags = new List<string> { "security", "cybersecurity", "infosec", "network", "compliance" },
                Keywords = new List<string>
                {
                    "Cybersecurity", "Information Security", "Network Security", "Application Security", "Cloud Security",
                    "Security Analysis", "Vulnerability Assessment", "Penetration Testing", "Ethical Hacking", "CISSP",
                    "CISM", "CISA", "CEH", "Security+", "CySA+", "GSEC", "GCIH", "GPEN", "OSCP",
                    "Incident Response", "Digital Forensics", "Malware Analysis", "Threat Intelligence", "SIEM",
                    "SOC", "Security Operations", "Risk Assessment", "Compliance", "Audit", "GRC", "ISO 27001",
                    "NIST", "PCI DSS", "HIPAA", "SOX", "GDPR", "Firewall", "IDS", "IPS", "VPN", "PKI",
                    "Encryption", "Identity Management", "Access Control", "Zero Trust", "DevSecOps", "Security Automation",
                    "Splunk", "QRadar", "ArcSight", "Wireshark", "Nessus", "Burp Suite", "Metasploit", "Kali Linux"
                }
            }
        };
    }
}