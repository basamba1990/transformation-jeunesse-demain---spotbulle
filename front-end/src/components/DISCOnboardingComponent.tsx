import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { discService, type DISCQuestion, type DISCAssessmentRequest } from "../services/api";
import type { DISCResults } from "../schemas/disc_schema";

interface Props {
  onCompleted: (results: DISCResults) => void;
}

const DISCOnboardingComponent: React.FC<Props> = ({ onCompleted }) => {
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<DISCQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      if (isAuthenticated) {
        try {
          const data = await discService.getQuestionnaire();
          setQuestions(data);
        } catch (error) {
          console.error("Error loading DISC questions:", error);
        }
      }
    };
    loadQuestions();
  }, [isAuthenticated]);

  const handleAnswer = (questionId: number, answer: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setCurrentIndex(prev => (prev < questions.length - 1 ? prev + 1 : prev));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formattedAnswers: DISCAssessmentRequest['answers'] = 
        Object.entries(answers).map(([id, answer]) => ({
          question_id: Number(id),
          answer
        }));
      
      const { results } = await discService.submitAssessment({ answers: formattedAnswers });
      onCompleted(results);
    } catch (error) {
      console.error("Assessment submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="disc-onboarding p-4 bg-white rounded-lg shadow-md">
      {questions[currentIndex] ? (
        <div className="question-card space-y-4">
          <div className="progress text-sm text-gray-600">
            Question {currentIndex + 1} sur {questions.length}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            {questions[currentIndex].text}
          </h3>
          <div className="answer-buttons grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                onClick={() => handleAnswer(questions[currentIndex].id, value)}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md transition-colors"
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="loading text-center text-gray-600">
          Chargement du questionnaire...
        </div>
      )}

      {currentIndex === questions.length - 1 && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`mt-6 w-full py-2 px-4 rounded-md text-white font-medium ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Envoi en cours...' : 'Terminer le questionnaire'}
        </button>
      )}
    </div>
  );
};

export default DISCOnboardingComponent;
