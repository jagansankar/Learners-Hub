import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API with latest stable model
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);

// Use the latest stable Gemini model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Model for generating course topics (with seeded history)
 */
export const GenerateTopicsAIModel = model.startChat({
  history: [
    {
      role: "user",
      parts: [
        {
          text: `Learn Python::As you are a coaching teacher
- User wants to learn about the topic
- Generate 5-7 Course titles for study (Short)
- Make sure it is related to the description
- Output should be in this exact JSON format:
{
  "Course_titles": [
    "Title 1",
    "Title 2",
    "Title 3"
  ]
}
- Do not add any plain text in output`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: `{
  "Course_titles": [
    "Python Basics: A Gentle Introduction",
    "Python: Data Structures and Algorithms",
    "Python Functions & Modules",
    "Python: File Handling & Exceptions",
    "Object-Oriented Python",
    "Python for Data Science",
    "Python Web Development with Django"
  ]
}`,
        },
      ],
    },
  ],
});

/**
 * Model for generating full courses
 * History is empty; instruction is added at request-time.
 */
export const GenerateCourseAIModel = model.startChat({
  history: [],
});
