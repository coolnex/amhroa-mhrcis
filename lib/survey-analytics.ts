// lib/survey-analytics.ts

export const calculateSurveyStats = (responses: any[], questions: any[]) => {
  // Calculate response statistics
  const stats = {
    totalResponses: responses.length,
    completionRate: 0,
    averageTime: 0,
    questionStats: {} as any,
  };

  // Helper to extract all questions from the survey structure
  const extractAllQuestions = (obj: any): any[] => {
    const result: any[] = [];
    if (!obj) return result;

    if (Array.isArray(obj)) {
      obj.forEach(item => {
        result.push(...extractAllQuestions(item));
      });
      return result;
    }

    if (typeof obj === 'object') {
      // Check if this is a question object
      if (obj.id && (obj.label || obj.text || obj.question) && obj.visible !== false) {
        result.push(obj);
      }

      // Check for nested questions
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value && typeof value === 'object') {
          // If this is a questions array or sections
          if (key === 'questions' || key === 'fields' || key === 'items' || key === 'sections') {
            result.push(...extractAllQuestions(value));
          } else if (key !== 'id' && key !== 'label' && key !== 'type' &&
                     key !== 'required' && key !== 'options' && key !== 'placeholder' &&
                     key !== 'helpText' && key !== 'min' && key !== 'max' && key !== 'rows' &&
                     key !== 'visible' && key !== 'conditional') {
            // Only recurse into non-question properties that might contain questions
            result.push(...extractAllQuestions(value));
          }
        }
      });
    }

    return result;
  };

  // Extract all questions from the survey structure
  const allQuestions = extractAllQuestions(questions);
  console.log("📊 Extracted questions for stats:", allQuestions);

  // Process each question
  allQuestions.forEach((question: any) => {
    const questionId = question.id;
    if (!questionId) return;

    // Get all responses for this question
    const responsesForQuestion = responses
      .map(r => r.responses?.[questionId])
      .filter(v => v !== undefined && v !== null && v !== "");

    const questionStat: any = {
      questionLabel: question.label || question.text || question.question || questionId,
      responseCount: responsesForQuestion.length,
    };

    // Calculate distribution based on question type
    if (question.type === "textarea" || question.type === "text") {
      questionStat.distribution = {
        type: "text",
        responses: responsesForQuestion.map(v => String(v)),
      };
    } else if (question.type === "select" || question.type === "boolean" || question.type === "dropdown") {
      const distribution: { [key: string]: number } = {};
      responsesForQuestion.forEach(val => {
        const key = String(val);
        distribution[key] = (distribution[key] || 0) + 1;
      });

      questionStat.distribution = {
        type: "distribution",
        values: Object.entries(distribution).map(([value, count]) => ({
          value,
          count,
          percentage: (count / responsesForQuestion.length) * 100,
        })),
      };
    } else if (question.type === "rating" || question.type === "number") {
      const numericValues = responsesForQuestion.filter(v => typeof v === "number" || !isNaN(parseFloat(v)));
      if (numericValues.length > 0) {
        const nums = numericValues.map(v => typeof v === "number" ? v : parseFloat(v));
        const sorted = [...nums].sort((a, b) => a - b);
        
        questionStat.average = nums.reduce((a, b) => a + b, 0) / nums.length;
        questionStat.median = sorted[Math.floor(sorted.length / 2)];
        questionStat.min = sorted[0];
        questionStat.max = sorted[sorted.length - 1];

        // Also create distribution for numeric values
        const distribution: { [key: string]: number } = {};
        nums.forEach(val => {
          const key = String(Math.round(val * 10) / 10);
          distribution[key] = (distribution[key] || 0) + 1;
        });

        questionStat.distribution = {
          type: "distribution",
          values: Object.entries(distribution).map(([value, count]) => ({
            value,
            count,
            percentage: (count / nums.length) * 100,
          })),
        };
      } else {
        questionStat.distribution = {
          type: "distribution",
          values: [],
        };
      }
    } else {
      // Default: treat as text
      questionStat.distribution = {
        type: "text",
        responses: responsesForQuestion.map(v => String(v)),
      };
    }

    stats.questionStats[questionId] = questionStat;
  });

  // Calculate completion rate
  if (responses.length > 0 && allQuestions.length > 0) {
    const completedResponses = responses.filter(r => {
      const resp = r.responses || {};
      const answeredQuestions = Object.keys(resp).filter(
        k => resp[k] !== undefined && resp[k] !== null && resp[k] !== ""
      ).length;
      return answeredQuestions >= allQuestions.length * 0.8;
    });
    stats.completionRate = (completedResponses.length / responses.length) * 100;
  }

  console.log("📊 Final stats:", stats);
  return stats;
};