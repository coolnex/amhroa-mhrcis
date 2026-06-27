// lib/survey_templates/internal-templates.ts

export const INTERNAL_SURVEY_TEMPLATES = {
    // Workplace Polls
    POLL: {
      id: "workplace_poll",
      title: "Workplace Poll",
      description: "Quick team polls on various topics",
      category: "Internal",
      type: "poll",
      sections: [
        {
          id: "poll_question",
          title: "Poll Question",
          fields: [
            {
              id: "question",
              label: "Question",
              type: "text",
              required: true,
              helpText: "What would you like to ask the team?"
            },
            {
              id: "question_type",
              label: "Question Type",
              type: "select",
              options: ["Multiple Choice", "Yes/No", "Rating Scale", "Open Ended"],
              required: true
            },
            {
              id: "options",
              label: "Options (comma separated)",
              type: "text",
              required: false,
              helpText: "Only needed for multiple choice questions",
              conditional: {
                field: "question_type",
                value: "Multiple Choice"
              }
            }
          ]
        }
      ]
    },
  
    // Team Feedback
    TEAM_FEEDBACK: {
      id: "team_feedback",
      title: "Team Feedback",
      description: "Collect feedback from team members",
      category: "Internal",
      type: "feedback",
      sections: [
        {
          id: "feedback_general",
          title: "General Feedback",
          fields: [
            {
              id: "topic",
              label: "Feedback Topic",
              type: "select",
              options: ["Team Collaboration", "Work Environment", "Project Management", "Communication", "Resources", "Training", "Other"],
              required: true
            },
            {
              id: "rating",
              label: "Overall Rating",
              type: "rating",
              min: 1,
              max: 5,
              required: true
            },
            {
              id: "feedback_text",
              label: "Feedback Details",
              type: "textarea",
              required: true,
              rows: 4,
              placeholder: "Please share your detailed feedback..."
            },
            {
              id: "suggestions",
              label: "Suggestions for Improvement",
              type: "textarea",
              required: false,
              rows: 3,
              placeholder: "What would make things better?"
            }
          ]
        }
      ]
    },
  
    // Activity Feedback
    ACTIVITY_FEEDBACK: {
      id: "activity_feedback",
      title: "Activity Feedback",
      description: "Feedback on planned activities and events",
      category: "Internal",
      type: "activity",
      sections: [
        {
          id: "activity_info",
          title: "Activity Information",
          fields: [
            {
              id: "activity_name",
              label: "Activity Name",
              type: "text",
              required: true
            },
            {
              id: "activity_date",
              label: "Activity Date",
              type: "date",
              required: true
            }
          ]
        },
        {
          id: "activity_rating",
          title: "Activity Evaluation",
          fields: [
            {
              id: "overall_rating",
              label: "Overall Rating",
              type: "rating",
              min: 1,
              max: 5,
              required: true
            },
            {
              id: "relevance",
              label: "Relevance to Work",
              type: "rating",
              min: 1,
              max: 5,
              required: true
            },
            {
              id: "engagement",
              label: "Engagement Level",
              type: "rating",
              min: 1,
              max: 5,
              required: true
            },
            {
              id: "improvements",
              label: "Suggestions for Improvement",
              type: "textarea",
              required: false,
              rows: 3
            }
          ]
        }
      ]
    },
  
    // Suggestions Box
    SUGGESTIONS: {
      id: "suggestions_box",
      title: "Suggestions Box",
      description: "Share your ideas and suggestions",
      category: "Internal",
      type: "suggestions",
      sections: [
        {
          id: "suggestion_details",
          title: "Your Suggestion",
          fields: [
            {
              id: "category",
              label: "Category",
              type: "select",
              options: ["Workflow", "Culture", "Benefits", "Tools", "Processes", "Team Activities", "Other"],
              required: true
            },
            {
              id: "title",
              label: "Title",
              type: "text",
              required: true,
              placeholder: "Brief title for your suggestion"
            },
            {
              id: "description",
              label: "Description",
              type: "textarea",
              required: true,
              rows: 4,
              placeholder: "Describe your suggestion in detail..."
            },
            {
              id: "impact",
              label: "Expected Impact",
              type: "select",
              options: ["High - Transformative", "Medium - Significant Improvement", "Low - Minor Enhancement"],
              required: true
            },
            {
              id: "implementation_ideas",
              label: "Implementation Ideas",
              type: "textarea",
              required: false,
              rows: 2,
              placeholder: "Any ideas on how this could be implemented?"
            }
          ]
        }
      ]
    },
  
    // Check-in / Pulse Survey
    PULSE: {
      id: "team_pulse",
      title: "Team Pulse Check",
      description: "Quick check-in on team morale and well-being",
      category: "Internal",
      type: "pulse",
      sections: [
        {
          id: "wellbeing",
          title: "Well-being Check",
          fields: [
            {
              id: "mood_rating",
              label: "How are you feeling today?",
              type: "rating",
              min: 1,
              max: 5,
              required: true
            },
            {
              id: "stress_level",
              label: "Stress Level",
              type: "select",
              options: ["Very Low", "Low", "Moderate", "High", "Very High"],
              required: true
            },
            {
              id: "workload",
              label: "Workload Management",
              type: "select",
              options: ["Good", "Manageable", "Heavy", "Overwhelming"],
              required: true
            }
          ]
        },
        {
          id: "team_check",
          title: "Team Check",
          fields: [
            {
              id: "team_support",
              label: "Do you feel supported by your team?",
              type: "select",
              options: ["Very Supported", "Supported", "Neutral", "Unsure", "Not Supported"],
              required: true
            },
            {
              id: "communication",
              label: "Team Communication",
              type: "select",
              options: ["Excellent", "Good", "Fair", "Poor"],
              required: true
            },
            {
              id: "improvement_areas",
              label: "Areas Needing Improvement",
              type: "textarea",
              required: false,
              rows: 3,
              placeholder: "What would help you work better?"
            }
          ]
        }
      ]
    }
  };
  
  // Helper to get internal survey options
  export const getInternalSurveyOptions = () => {
    return Object.entries(INTERNAL_SURVEY_TEMPLATES).map(([key, template]) => ({
      id: key,
      label: template.title,
      description: template.description,
      type: template.type,
      sections: template.sections
    }));
  };
  
  // Get a specific internal survey template
  export const getInternalSurveyTemplate = (templateId: string) => {
    const key = Object.keys(INTERNAL_SURVEY_TEMPLATES).find(
      k => k === templateId || INTERNAL_SURVEY_TEMPLATES[k as keyof typeof INTERNAL_SURVEY_TEMPLATES].id === templateId
    );
    return key ? INTERNAL_SURVEY_TEMPLATES[key as keyof typeof INTERNAL_SURVEY_TEMPLATES] : null;
  };