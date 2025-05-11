import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { discService } from "../services/api";
import type { DISCResults } from "../schemas/disc_schema";

interface Props {
  onCompleted: (results: DISCResults) => void;
}

const DISCOnboardingComponent: React.FC<Props> = ({ onCompleted }) => {
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Array<{ id: number; text: string }>>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadQuestions = async () => {
      if (isAuthenticated) {
        const data = await discService.getQuestionnaire();
        setQuestions(data);
      }
    };
    loadQuestions();
  }, [isAuthenticated]);

  const handleAnswer = (questionId: number, answer: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setCurrentIndex(prev => prev + 1);
  };

  const handleSubmit = async () => {
    const formattedAnswers = Object.entries(answers).map(([id, answer]) => ({
      question_id: Number(id),
      answer
    }));
    const results = await discService.submitAssessment({ answers: formattedAnswers });
    onCompleted(results);
  };

  return (
    <div className="disc-onboarding">
      {questions[currentIndex] && (
        <div className="question-card">
          <h3>Question {currentIndex + 1}/{questions.length}</h3>
          <p>{questions[currentIndex].text}</p>
          <div className="answer-buttons">
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                onClick={() => handleAnswer(questions[currentIndex].id, value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      )}
      {currentIndex === questions.length && (
        <button onClick={handleSubmit}>Soumettre</button>
      )}
    </div>
  );
};

export default DISCOnboardingComponent;
