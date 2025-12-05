import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Plus,
  Save,
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Mail,
  Printer,
} from "lucide-react";

// --- TypeScript Interfaces ---

interface ScoreMap {
  [category: string]: {
    [subIndex: string]: number;
  };
}

interface Session {
  date: string;
  surah: string;
  ayahRange: string;
  scores: ScoreMap;
  totalScore: number;
  notes: string;
  reviewLevel: "basic" | "advanced";
  timestamp: string;
}

interface Student {
  id: number;
  name: string;
  sessions: Session[];
  totalScore: number;
  averageScore: number;
}

interface CriterionSub {
  name: string;
  points: number;
  hint: string;
}

interface CriterionCategory {
  title: string;
  maxPoints: number;
  subcriteria: CriterionSub[];
}

interface Criteria {
  [key: string]: CriterionCategory;
}

// --- Helper Components ---

interface SessionScoringProps {
  student: Student;
  onClose: () => void;
  reviewLevel: "basic" | "advanced";
  setReviewLevel: (level: "basic" | "advanced") => void;
  criteria: Criteria;
  onSave: (studentId: number, sessionData: Session) => void;
}

const SessionScoring: React.FC<SessionScoringProps> = ({
  student,
  onClose,
  reviewLevel,
  setReviewLevel,
  criteria,
  onSave,
}) => {
  const [scores, setScores] = useState<ScoreMap>({});
  const [notes, setNotes] = useState<string>("");
  const [currentSession, setCurrentSession] = useState({
    date: new Date().toISOString().split("T")[0],
    surah: "",
    ayahRange: "",
  });

  const updateScore = (category: string, subIndex: number, value: string) => {
    const numericValue = parseInt(value) || 0;
    const maxPoints = criteria[category].subcriteria[subIndex].points;

    setScores((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subIndex]: Math.min(Math.max(0, numericValue), maxPoints),
      },
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    Object.keys(criteria).forEach((category) => {
      if (scores[category]) {
        Object.values(scores[category]).forEach((val) => (total += val));
      }
    });
    return total;
  };

  const handleSave = () => {
    const sessionData: Session = {
      ...currentSession,
      scores,
      totalScore: calculateTotal(),
      notes,
      reviewLevel,
      timestamp: new Date().toISOString(),
    };
    onSave(student.id, sessionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto z-50">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Score: {student.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <div className="mb-8 flex gap-4 flex-wrap">
          <button
            onClick={() => setReviewLevel("basic")}
            className={`flex-1 min-w-[200px] py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all ${
              reviewLevel === "basic"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <BookOpen size={24} />
            <span>Basic</span>
          </button>
          <button
            onClick={() => setReviewLevel("advanced")}
            className={`flex-1 min-w-[200px] py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all ${
              reviewLevel === "advanced"
                ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <GraduationCap size={24} />
            <span>Advanced</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Date
            </label>
            <input
              type="date"
              value={currentSession.date}
              onChange={(e) =>
                setCurrentSession({ ...currentSession, date: e.target.value })
              }
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Surah
            </label>
            <input
              type="text"
              value={currentSession.surah}
              onChange={(e) =>
                setCurrentSession({ ...currentSession, surah: e.target.value })
              }
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="Al-Fatiha"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Ayah Range
            </label>
            <input
              type="text"
              value={currentSession.ayahRange}
              onChange={(e) =>
                setCurrentSession({
                  ...currentSession,
                  ayahRange: e.target.value,
                })
              }
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
              placeholder="1-7"
            />
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(criteria).map(([key, category]) => (
            <div
              key={key}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-100"
            >
              <h3 className="font-bold text-xl mb-5 text-gray-800 flex items-center justify-between flex-wrap gap-2">
                <span>{category.title}</span>
                <span className="text-emerald-600">
                  Max: {category.maxPoints}
                </span>
              </h3>
              <div className="grid gap-4">
                {category.subcriteria.map((sub, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-semibold block mb-1 text-gray-800">
                          {sub.name}
                        </label>
                        <p className="text-xs text-gray-500 italic">
                          {sub.hint}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          max={sub.points}
                          value={scores[key]?.[idx] || 0}
                          onChange={(e) =>
                            updateScore(key, idx, e.target.value)
                          }
                          className="w-20 p-3 border-2 border-gray-200 rounded-xl text-center font-bold focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                        <span className="text-sm text-gray-500 font-medium">
                          / {sub.points}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-4 border-2 border-gray-200 rounded-xl h-32 focus:border-emerald-500 focus:outline-none transition-colors"
            placeholder="Strengths, areas for improvement, observations..."
          />
        </div>

        <div className="mt-8 flex flex-wrap justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total Score</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {calculateTotal()}/100
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={onClose}
              className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Save size={20} />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StudentDetailsProps {
  student: Student;
  onBack: () => void;
  onAddSession: () => void;
  printReportCard: (s: Student) => void;
  sendEmailToParent: (s: Student) => void;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({
  student,
  onBack,
  onAddSession,
  printReportCard,
  sendEmailToParent,
}) => {
  const [activeTab, setActiveTab] = useState<"score" | "history" | "actions">(
    "score"
  );

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-medium px-4 py-2 hover:bg-emerald-50 rounded-xl transition-all"
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div className="flex items-center justify-between mb-8 flex-wrap gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{student.name}</h2>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <BookOpen size={16} />
              {student.sessions.length} sessions
            </p>
          </div>
        </div>
        <div className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 px-8 py-6 rounded-2xl border border-emerald-100">
          <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {student.averageScore ? student.averageScore.toFixed(1) : 0}%
          </div>
          <div className="text-sm text-gray-600 mt-2 font-medium">Average</div>
        </div>
      </div>

      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => setActiveTab("score")}
          className={`flex-1 min-w-[100px] py-4 rounded-xl font-semibold transition-all ${
            activeTab === "score"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Score
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 min-w-[100px] py-4 rounded-xl font-semibold transition-all ${
            activeTab === "history"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab("actions")}
          className={`flex-1 min-w-[100px] py-4 rounded-xl font-semibold transition-all ${
            activeTab === "actions"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Actions
        </button>
      </div>

      {activeTab === "score" && (
        <button
          onClick={onAddSession}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all text-lg"
        >
          <Plus size={24} />
          Add New Session
        </button>
      )}

      {activeTab === "history" && (
        <div>
          <h3 className="text-xl font-bold mb-6 text-gray-800">
            Session History
          </h3>
          <div className="space-y-4">
            {student.sessions.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No sessions recorded yet</p>
              </div>
            ) : (
              student.sessions
                .slice()
                .reverse()
                .map((session, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg text-gray-800">
                          {new Date(session.date).toLocaleDateString()}
                        </div>
                        <div className="text-emerald-600 font-medium">
                          {session.surah}{" "}
                          <span className="text-gray-400">|</span>{" "}
                          {session.ayahRange}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {session.totalScore}%
                      </div>
                    </div>
                    {session.notes && (
                      <div className="text-gray-500 bg-yellow-50 p-3 rounded-lg text-sm mt-2">
                        {session.notes}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {activeTab === "actions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => printReportCard(student)}
            className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center gap-3"
          >
            <Printer size={32} className="text-emerald-600" />
            <span className="font-bold text-gray-700">Print Report</span>
          </button>
          <button
            onClick={() => sendEmailToParent(student)}
            className="p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-3"
          >
            <Mail size={32} className="text-blue-600" />
            <span className="font-bold text-gray-700">Email Parent</span>
          </button>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [showScoring, setShowScoring] = useState(false);
  const [reviewLevel, setReviewLevel] = useState<"basic" | "advanced">("basic");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const result = localStorage.getItem("quran-tracker-students");
      if (result) {
        setStudents(JSON.parse(result));
      }
    } catch (error) {
      console.log("No existing data found");
    }
  };

  const saveData = (updatedStudents: Student[]) => {
    try {
      localStorage.setItem(
        "quran-tracker-students",
        JSON.stringify(updatedStudents)
      );
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Error saving data. Please try again.");
    }
  };

  const basicCriteria: Criteria = {
    pronunciation: {
      title: "Letter Pronunciation",
      maxPoints: 30,
      subcriteria: [
        {
          name: "Can the student pronounce throat sounds clearly?",
          points: 8,
          hint: "Listen for sounds from throat",
        },
        {
          name: "Are tongue movements correct?",
          points: 10,
          hint: "Watch tongue position",
        },
        {
          name: "Are lip and teeth sounds clear?",
          points: 7,
          hint: "Check lip closure",
        },
        {
          name: "Is nasal sound present when needed?",
          points: 5,
          hint: "Humming through nose",
        },
      ],
    },
    basicRules: {
      title: "Basic Tajweed Rules",
      maxPoints: 30,
      subcriteria: [
        {
          name: "Does student hold vowels long enough?",
          points: 8,
          hint: "Count 2 beats",
        },
        {
          name: "Are thick sounds correct?",
          points: 8,
          hint: "Fuller, heavier",
        },
        { name: "Are light sounds clear?", points: 7, hint: "Lighter, softer" },
        {
          name: "Does student apply noon rules?",
          points: 7,
          hint: "Watch noon transitions",
        },
      ],
    },
    fluency: {
      title: "Reading Flow",
      maxPoints: 25,
      subcriteria: [
        {
          name: "Smooth reading without stops?",
          points: 8,
          hint: "Natural rhythm",
        },
        {
          name: "Vowel marks correct?",
          points: 8,
          hint: "Fatha, kasra, damma",
        },
        {
          name: "Recognizes doubled letters?",
          points: 5,
          hint: "Pronounced twice",
        },
        {
          name: "Stops at right places?",
          points: 4,
          hint: "Meaning preserved",
        },
      ],
    },
    mistakes: {
      title: "Error Check",
      maxPoints: 15,
      subcriteria: [
        {
          name: "Major errors avoided",
          points: 8,
          hint: "Wrong letters, vowels",
        },
        { name: "Minor errors minimized", points: 7, hint: "Subtle mistakes" },
      ],
    },
  };

  const advancedCriteria: Criteria = {
    makhraj: {
      title: "Articulation Points",
      maxPoints: 25,
      subcriteria: [
        {
          name: "Throat letters correct",
          points: 4,
          hint: "Lower, middle, upper throat",
        },
        {
          name: "Tongue points accurate",
          points: 8,
          hint: "Back, center, sides, tip",
        },
        {
          name: "Labial and dental correct",
          points: 8,
          hint: "Lips, teeth positions",
        },
        { name: "Nasal sound present", points: 3, hint: "Al-Khayshum" },
        { name: "Madd letters extended", points: 2, hint: "Waw, yaa, alif" },
      ],
    },
    sifatLazimah: {
      title: "Permanent Characteristics",
      maxPoints: 20,
      subcriteria: [
        { name: "Whispered vs voiced", points: 3, hint: "Hams vs Jahr" },
        { name: "Strong vs soft", points: 4, hint: "Shiddah vs Rikhwah" },
        { name: "Elevated vs lowered", points: 4, hint: "Istila vs Istifal" },
        { name: "Covered vs open", points: 3, hint: "Itbaq vs Infitah" },
        {
          name: "Special characteristics",
          points: 6,
          hint: "Safir, Qalqalah, etc",
        },
      ],
    },
    sifatAridah: {
      title: "Temporary Characteristics",
      maxPoints: 25,
      subcriteria: [
        {
          name: "Noon and tanween rules",
          points: 7,
          hint: "Ithhar, Idgham, Iqlab, Ikhfa",
        },
        { name: "Meem sakinah rules", points: 4, hint: "Three rules applied" },
        { name: "Thick vs thin", points: 5, hint: "Tafkhim vs Tarqiq" },
        { name: "All madd types", points: 7, hint: "Six types recognized" },
        { name: "Stopping rules", points: 2, hint: "Waqf and Ibtida" },
      ],
    },
    fluency: {
      title: "Fluency and Tarteel",
      maxPoints: 15,
      subcriteria: [
        {
          name: "Smooth flow maintained",
          points: 5,
          hint: "Beautiful recitation",
        },
        { name: "Harakaat correct", points: 4, hint: "All vowel movements" },
        { name: "Sukun applied", points: 3, hint: "Silent letters" },
        { name: "Tashdid recognized", points: 3, hint: "Doubled letters" },
      ],
    },
    mistakes: {
      title: "Error Classification",
      maxPoints: 15,
      subcriteria: [
        { name: "Clear errors avoided", points: 8, hint: "Lahn Jaliy" },
        { name: "Hidden errors minimized", points: 7, hint: "Lahn Khafiy" },
      ],
    },
  };

  const addStudent = async () => {
    if (newStudentName.trim()) {
      const newStudent: Student = {
        id: Date.now(),
        name: newStudentName.trim(),
        sessions: [],
        totalScore: 0,
        averageScore: 0,
      };
      const updatedStudents = [...students, newStudent];
      setStudents(updatedStudents);
      saveData(updatedStudents);
      setNewStudentName("");
      setShowAddStudent(false);
    }
  };

  const addSession = (studentId: number, sessionData: Session) => {
    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        const newSessions = [...s.sessions, sessionData];
        const total = newSessions.reduce(
          (acc, sess) => acc + sess.totalScore,
          0
        );
        return {
          ...s,
          sessions: newSessions,
          totalScore: total,
          averageScore: total / newSessions.length,
        };
      }
      return s;
    });
    setStudents(updatedStudents);
    saveData(updatedStudents);
    // Update the currently selected student view as well
    const updatedSelected =
      updatedStudents.find((s) => s.id === studentId) || null;
    setSelectedStudent(updatedSelected);
  };

  const printReportCard = (student: Student) => {
    alert(`Generating report for ${student.name}... (Implement print logic)`);
  };

  const sendEmailToParent = (student: Student) => {
    alert(`Opening email client for ${student.name}...`);
  };

  // --- Main Dashboard Render ---
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Quran Tracker
            </h1>
            <p className="text-gray-500 mt-2">Manage recitation progress</p>
          </div>
          <button
            onClick={() => setShowAddStudent(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg flex items-center gap-2"
          >
            <Plus size={20} /> Add Student
          </button>
        </header>

        {/* Add Student Modal */}
        {showAddStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Add New Student</h3>
              <input
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Student Name"
                className="w-full p-3 border rounded-xl mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowAddStudent(false)}
                  className="px-4 py-2 text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={addStudent}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student List Grid */}
        {!selectedStudent ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{student.name}</h3>
                    <div className="text-sm text-gray-500">
                      {student.sessions.length} sessions
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-sm text-gray-400">Avg Score</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {student.averageScore.toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-400">
                No students yet. Add one to get started!
              </div>
            )}
          </div>
        ) : (
          /* Detailed Student View */
          <>
            <StudentDetails
              student={selectedStudent}
              onBack={() => setSelectedStudent(null)}
              onAddSession={() => setShowScoring(true)}
              printReportCard={printReportCard}
              sendEmailToParent={sendEmailToParent}
            />

            {showScoring && (
              <SessionScoring
                student={selectedStudent}
                onClose={() => setShowScoring(false)}
                reviewLevel={reviewLevel}
                setReviewLevel={setReviewLevel}
                criteria={
                  reviewLevel === "basic" ? basicCriteria : advancedCriteria
                }
                onSave={addSession}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
