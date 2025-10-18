// app/addCourse/index.jsx
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { useContext, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Button from "../../components/Shared/Button";
import { GenerateCourseAIModel, GenerateTopicsAIModel } from "../../config/AiModel";
import { db } from "../../config/firebaseConfig";
import Colors from "../../constant/Colors";
import Prompt from "../../constant/Prompt";
import { UserDetailContext } from "../../context/UserDetailContext";

/**
 * Robustly extract JSON from an AI text blob:
 * - removes triple-backticks and leading "json" label
 * - normalizes smart quotes
 * - finds JSON start ({ or [), matches closers while ignoring string content
 * - auto-closes unmatched braces/brackets if truncated
 * - removes trailing commas as a repair step
 *
 * Returns parsed object or null if cannot parse.
 */
function extractJsonFromText(text) {
  if (!text || typeof text !== "string") return null;
  const original = text;

  // 1) Basic cleaning: remove backticks, normalize smart quotes, strip leading "json" labels
  let cleaned = text.replace(/`+/g, ""); // remove any backticks
  cleaned = cleaned.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  // remove leading 'json', 'JSON', 'json:' or 'json -' etc
  cleaned = cleaned.replace(/^\s*json\s*[:\-–—]?\s*/i, "").trim();

  // 2) Find the first JSON-like opening char: { or [
  const firstBraceIdx = (() => {
    const i1 = cleaned.indexOf("{");
    const i2 = cleaned.indexOf("[");
    if (i1 === -1) return i2;
    if (i2 === -1) return i1;
    return Math.min(i1, i2);
  })();

  if (firstBraceIdx === -1) {
    console.warn("extractJsonFromText: no JSON start found in cleaned text.");
    return null;
  }

  // 3) Walk the string from the first brace/bracket, track depth, ignore braces inside strings
  const openingChar = cleaned[firstBraceIdx];
  const closingChar = openingChar === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let stringQuote = null;
  let escaped = false;
  let endIndex = -1;

  for (let i = firstBraceIdx; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"' || ch === "'") {
      if (!inString) {
        inString = true;
        stringQuote = ch;
      } else if (stringQuote === ch) {
        inString = false;
        stringQuote = null;
      }
      continue;
    }
    if (inString) continue;

    if (ch === openingChar) depth++;
    else if (ch === closingChar) {
      depth--;
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
  }

  // Extract candidate substring. If we never found a closing bracket, take to the end and remember depth.
  const candidate = cleaned.slice(firstBraceIdx, endIndex === -1 ? cleaned.length : endIndex + 1);
  const remainingDepth = depth;

  // 4) If truncated (unclosed), attempt to auto-close by appending the required closers
  let candidateAttempt = candidate;
  if (endIndex === -1 && remainingDepth > 0) {
    const closer = openingChar === "{" ? "}" : "]";
    candidateAttempt = candidate + closer.repeat(remainingDepth);
  }

  // 5) Try parsing, then try simple repairs (remove trailing commas) if parse fails
  try {
    return JSON.parse(candidateAttempt);
  } catch (err1) {
    // small repairs:
    let repaired = candidateAttempt.replace(/,\s*(?=[}\]])/g, "");
    repaired = repaired.replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // strip control chars

    try {
      return JSON.parse(repaired);
    } catch (err2) {
      // Log debug info
      console.error("extractJsonFromText: Failed to parse JSON. Original text:", original);
      console.error("extractJsonFromText: Candidate:", candidateAttempt);
      console.error("extractJsonFromText: Repaired candidate:", repaired);
      console.error("extractJsonFromText: Parse errors:", err1, err2);
      return null;
    }
  }
}

export default function AddCourse() {
  const [loading, setLoading] = useState(false);
  const { userDetail } = useContext(UserDetailContext);
  const [userInput, setUserInput] = useState("");
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const router = useRouter();

  // Generate Topics
  const onGenerateTopic = async () => {
    if (!userInput || userInput.trim().length === 0) {
      Alert.alert("Input required", "Please enter what you want to learn before generating topics.");
      return;
    }

    setLoading(true);
    try {
      // Force AI to return ONLY JSON array as described
      const PROMPT = `
Return ONLY a valid JSON object and nothing else (no explanations, no markdown).
Format exactly:
{
  "Course_titles": ["Title 1", "Title 2", "Title 3"]
}

User input: ${userInput}
${Prompt.IDEA}
`;

      const aiResp = await GenerateTopicsAIModel.sendMessage(PROMPT);
      const aiText = await aiResp.response.text();
      console.log("Raw Topic Response:", aiText);

      const parsed = extractJsonFromText(aiText);
      if (parsed && Array.isArray(parsed.Course_titles)) {
        setTopics(parsed.Course_titles);
        console.log("Parsed Course_titles:", parsed.Course_titles);
      } else {
        console.error("AI did not return valid JSON for topics. Raw:", aiText);
        Alert.alert("Generation failed", "The AI did not return usable topics. Try again.");
        setTopics([]);
      }
    } catch (error) {
      console.error("Failed to parse AI response for topics:", error);
      Alert.alert("Error", "Failed to generate topics. Check your connection.");
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  // Select/Deselect Topics
  const onTopicSelect = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const isTopicSelected = (topic) => selectedTopics.includes(topic);

  // Generate Full Course
  const onGenerateCourse = async () => {
    if (!selectedTopics || selectedTopics.length === 0) {
      Alert.alert("No topics selected", "Please select at least one topic to generate a course.");
      return;
    }

    setLoading(true);
    try {
      // Force the model to return ONLY JSON with the "courses" structure
      const PROMPT = `
Return ONLY a valid JSON object and nothing else. Use the following format exactly:
{
  "courses": [
    {
      "courseTitle": "Course Title",
      "description": "Course description",
      "banner_image": "/banner1.png",
      "category": "Tech & Coding",
      "chapters": [
        {
          "chapterName": "Chapter 1",
          "content": [
            {
              "topic": "Topic name",
              "explain": "Detailed explanation",
              "code": null,
              "example": null
            }
          ]
        }
      ],
      "quiz": [],
      "flashcards": [],
      "qa": []
    }
  ]
}

Selected topics: ${selectedTopics.join(", ")}

${Prompt.COURSE}
`;

      const aiResp = await GenerateCourseAIModel.sendMessage(PROMPT);
      const aiText = await aiResp.response.text();
      console.log("Raw Course Response:", aiText);

      const parsed = extractJsonFromText(aiText);

      if (parsed?.courses && Array.isArray(parsed.courses)) {
        for (const course of parsed.courses) {
          const docID= Date.now().toString()
          await setDoc(doc(db, "Courses",docID), {
            ...course,
            createdOn: new Date(),
            createdBy: userDetail?.email || "unknown",
            docId:docID
          });
        }
        console.log("Courses saved to Firestore successfully!");
        router.push("/(tabs)/home");
      } else {
        console.error("Failed to parse courses. Raw response:", aiText);
        Alert.alert("Generation failed", "The AI did not return a valid course structure. Try again.");
      }
    } catch (error) {
      console.error("Failed to generate course:", error);
      Alert.alert("Error", "Failed to generate the course. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{
        padding: 25,
        backgroundColor: Colors.WHITE,
        flex: 1,
      }}
    >
      <Text style={{ fontFamily: "outfit-bold", fontSize: 30 }}>New Course</Text>

      <Text style={{ fontFamily: "outfit", fontSize: 30 }}>
        What do you want to learn today?
      </Text>

      <Text
        style={{
          fontFamily: "outfit",
          fontSize: 20,
          marginTop: 8,
          color: Colors.GRAY,
        }}
      >
        Which type of course do you want? (e.g., Learn Python, Digital Marketing, AI, etc...)
      </Text>

      <TextInput
        placeholder="(Ex. Learn Python, Learn Digital Marketing)"
        style={styles.textInput}
        numberOfLines={3}
        multiline
        value={userInput}
        onChangeText={setUserInput}
      />

      <Button text="Generate Topic" type="outline" onPress={onGenerateTopic} loading={loading} />

      <View style={{ marginTop: 15, marginBottom: 15 }}>
        <Text style={{ fontFamily: "outfit", fontSize: 20 }}>
          Select all topics you want to add to the course
        </Text>

        {topics.length > 0 && (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 6,
            }}
          >
            {topics.map((item, index) => (
              <Pressable key={index} onPress={() => onTopicSelect(item)}>
                <Text
                  style={{
                    padding: 7,
                    borderWidth: 0.4,
                    borderRadius: 99,
                    paddingHorizontal: 15,
                    backgroundColor: isTopicSelected(item) ? Colors.PRIMARY : null,
                    color: isTopicSelected(item) ? Colors.WHITE : Colors.PRIMARY,
                  }}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {selectedTopics.length > 0 && (
        <Button text="Generate Course" onPress={onGenerateCourse} loading={loading} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  textInput: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 15,
    height: 100,
    marginTop: 10,
    alignItems: "flex-start",
    fontSize: 18,
  },
});
