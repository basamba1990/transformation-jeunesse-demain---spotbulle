// frontend/src/components/DISCOnboardingComponent.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { discService } from '../services/api';
import type { DISCQuestion, DISCResults } from '../schemas/disc_schema';

interface DISCOnboardingProps {
  onCompleted: (results: DISCResults) => void;
}

const DISCOnboardingComponent: React.FC<DISCOnboardingProps> = ({ onCompleted }) => {
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<DISCQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!isAuthenticated) return;
      
      try {
        const data = await discService.getQuestionnaire();
        setQuestions(data);
      } catch (err) {
        setError("Failed to load DISC questions");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [isAuthenticated]);

  const handleAnswer = (questionId: number, answer: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: Number(questionId),
        answer
      }));
      
      const results = await discService.submitAssessment({ answers: formattedAnswers });
      onCompleted(results);
    } catch (err) {
      setError("Failed to submit DISC assessment");
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return <div>Please login to complete the DISC assessment</div>;
  }

  if (isLoading) {
    return <div>Loading questions...</div>;
  }

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  if (questions.length === 0) {
    return <div>No questions available</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="disc-assessment">
      <h3>Question {currentQuestionIndex + 1}/{questions.length}</h3>
      <p>{currentQuestion.text}</p>
      
      <div className="answer-options">
        {[1, 2, 3, 4, 5].map(option => (
          <button
            key={option}
            onClick={() => handleAnswer(currentQuestion.id, option)}
            className={`answer-btn ${answers[currentQuestion.id] === option ? 'selected' : ''}`}
          >
            {option}
          </button>
        ))}
      </div>

      {currentQuestionIndex === questions.length - 1 && (
        <button 
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== questions.length}
          className="submit-btn"
        >
          Submit Assessment
        </button>
      )}
    </div>
  );
};

export default DISCOnboardingComponent;
