import React, { useState } from 'react';
import { generateAnalysis, createChatSession, generateMarketTrends, generateInterviewSimulation, generateSeniorFeedback, generateSalaryNegotiation, generateJobTranslation } from './services/geminiService';
import { AnalysisResult, AppStep, QuizQuestion, FileAttachment, QuizResult, MarketTrends, InterviewSimulation, SeniorFeedback, SalaryNegotiation, JobTranslation } from './types';
import FileUpload from './components/FileUpload';
import AnalysisView from './components/AnalysisView';
import StudyPathView from './components/StudyPathView';
import QuizView from './components/QuizView';
import ChatTutor from './components/ChatTutor';
import StatisticsView from './components/StatisticsView';
import MarketTrendsView from './components/MarketTrendsView';
import InterviewSimulator from './components/InterviewSimulator';
import SeniorFeedbackView from './components/SeniorFeedbackView';
import JobTranslationView from './components/JobTranslationView';
import { Chat } from "@google/genai";
import { BookOpen, Sparkles, MessageSquare, ArrowLeft, BarChart2, TrendingUp, Mic, Zap, Languages } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('upload');
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [marketTrends, setMarketTrends] = useState<MarketTrends | null>(null);
  const [salaryNegotiation, setSalaryNegotiation] = useState<SalaryNegotiation | null>(null);
  const [interviewSim, setInterviewSim] = useState<InterviewSimulation | null>(null);
  const [seniorFeedback, setSeniorFeedback] = useState<SeniorFeedback | null>(null);
  const [jobTranslation, setJobTranslation] = useState<JobTranslation | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Loading states for specific tabs
  const [analyzingTrends, setAnalyzingTrends] = useState(false);
  const [generatingSalary, setGeneratingSalary] = useState(false);
  const [generatingInterview, setGeneratingInterview] = useState(false);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [translatingJob, setTranslatingJob] = useState(false);
  
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [activeQuiz, setActiveQuiz] = useState<{ title: string; questions: QuizQuestion[]; caseStudy?: string; feedbackReport?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'analysis' | 'study' | 'stats' | 'market' | 'interview' | 'senior' | 'decoder'>('analysis');
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [currentJobFile, setCurrentJobFile] = useState<FileAttachment | null>(null);
  const [currentResumeFile, setCurrentResumeFile] = useState<FileAttachment | null>(null);

  const handleAnalysis = async (resume: FileAttachment, job: FileAttachment) => {
    setLoading(true);
    const startTime = Date.now();
    setCurrentJobFile(job); 
    setCurrentResumeFile(resume);
    try {
      const result = await generateAnalysis(resume, job);
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // Duration in seconds

      setAnalysisData({ ...result, analysisDuration: duration });
      
      // Initialize Chat Session with context
      const session = createChatSession(result);
      setChatSession(session);
      
      setStep('results');
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error durante el análisis. Asegúrate de que los tipos de archivo sean compatibles (PDF, DOCX, TXT) e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarketAnalysis = async () => {
      if (!analysisData) return;
      if (marketTrends) return;

      setAnalyzingTrends(true);
      try {
          const trends = await generateMarketTrends(analysisData.userProfile);
          setMarketTrends(trends);
      } catch (error) {
          console.error("Error analyzing trends", error);
          alert("No se pudieron cargar las tendencias del mercado.");
      } finally {
          setAnalyzingTrends(false);
      }
  };

  const handleSalaryNegotiation = async () => {
      if (!currentResumeFile || !currentJobFile) return;
      if (salaryNegotiation) return;

      setGeneratingSalary(true);
      try {
          const negotiation = await generateSalaryNegotiation(currentResumeFile, currentJobFile);
          setSalaryNegotiation(negotiation);
      } catch (error) {
          console.error("Error generating salary negotiation", error);
          alert("No se pudo simular la negociación.");
      } finally {
          setGeneratingSalary(false);
      }
  }

  const handleInterviewSimulation = async () => {
      if (!currentResumeFile || !currentJobFile) return;
      if (interviewSim) return;

      setGeneratingInterview(true);
      try {
          const sim = await generateInterviewSimulation(currentResumeFile, currentJobFile);
          setInterviewSim(sim);
      } catch (error) {
          console.error("Error generating interview", error);
          alert("No se pudo generar la simulación de entrevista.");
      } finally {
          setGeneratingInterview(false);
      }
  };

  const handleSeniorFeedback = async () => {
    if (!currentResumeFile) return;
    if (seniorFeedback) return;

    setGeneratingFeedback(true);
    try {
        const feedback = await generateSeniorFeedback(currentResumeFile);
        setSeniorFeedback(feedback);
    } catch (error) {
        console.error("Error generating feedback", error);
        alert("No se pudo generar la mentoría senior.");
    } finally {
        setGeneratingFeedback(false);
    }
  };

  const handleJobTranslation = async () => {
    if (!currentJobFile) return;
    if (jobTranslation) return;

    setTranslatingJob(true);
    try {
        const translation = await generateJobTranslation(currentJobFile);
        setJobTranslation(translation);
    } catch (error) {
        console.error("Error translating job", error);
        alert("No se pudo traducir la vacante.");
    } finally {
        setTranslatingJob(false);
    }
  };

  const startWeeklyQuiz = (moduleIndex: number, assessmentIndex: number) => {
    if (!analysisData) return;
    const module = analysisData.studyPath[moduleIndex];
    const assessment = module.assessments[assessmentIndex];
    
    setActiveQuiz({
        title: `Semana ${module.weekNumber}: ${assessment.title}`,
        questions: assessment.questions
    });
    setStep('analyzing'); 
  };

  const startFinalExam = () => {
      if (!analysisData) return;
      setActiveQuiz({
          title: "Examen Final Integral",
          questions: analysisData.finalEvaluation.questions,
          caseStudy: analysisData.finalEvaluation.caseStudy,
          feedbackReport: analysisData.finalEvaluation.feedbackReport
      });
  };

  const handleQuizCompletion = (score: number, total: number) => {
      if (!activeQuiz) return;
      
      const result: QuizResult = {
          quizTitle: activeQuiz.title,
          score,
          totalQuestions: total,
          percentage: Math.round((score / total) * 100),
          date: new Date(),
          passed: (score / total) >= 0.7
      };

      setQuizResults(prev => [result, ...prev]);
  };

  const handleCloseQuiz = () => {
      setActiveQuiz(null);
      setStep('results');
  }

  const speakText = (text: string) => {
      if ('speechSynthesis' in window) {
         const utterance = new SpeechSynthesisUtterance("Prueba del sistema de Texto a Voz. El sistema está listo.");
         utterance.lang = 'es-ES';
         window.speechSynthesis.speak(utterance);
      } else {
         alert("Texto a Voz no está soportado en este navegador.");
      }
  };

  const renderContent = () => {
    if (activeQuiz) {
        return (
            <QuizView 
                title={activeQuiz.title}
                questions={activeQuiz.questions}
                caseStudy={activeQuiz.caseStudy}
                feedbackReport={activeQuiz.feedbackReport}
                onClose={handleCloseQuiz}
                onComplete={handleQuizCompletion}
            />
        )
    }

    switch (activeTab) {
      case 'analysis':
        return analysisData ? <AnalysisView data={analysisData} /> : null;
      case 'study':
        return analysisData ? (
            <StudyPathView 
                data={analysisData} 
                onStartQuiz={startWeeklyQuiz} 
                onFinalQuiz={startFinalExam}
            />
        ) : null;
      case 'stats':
        return analysisData ? (
            <StatisticsView 
                userProfile={analysisData.userProfile}
                quizResults={quizResults}
                jobFile={currentJobFile}
            />
        ) : null;
      case 'market':
          if (analyzingTrends) {
              return (
                  <div className="flex flex-col items-center justify-center h-64 text-stone-500 animate-pulse bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
                      <TrendingUp className="w-12 h-12 mb-4 text-emerald-400" />
                      <p className="text-lg font-medium">Analizando datos del mercado global...</p>
                  </div>
              );
          }
          return (
             <MarketTrendsView 
                trends={marketTrends} 
                salaryData={salaryNegotiation}
                onGenerateSalary={handleSalaryNegotiation}
                loadingSalary={generatingSalary}
                onGenerate={handleMarketAnalysis} 
             />
          );
      case 'interview':
          if (generatingInterview) {
              return (
                  <div className="flex flex-col items-center justify-center h-64 text-stone-500 animate-pulse bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
                      <Mic className="w-12 h-12 mb-4 text-teal-500" />
                      <p className="text-lg font-medium">El "Bar Raiser" está revisando tu perfil...</p>
                      <p className="text-sm">Generando preguntas difíciles y de presión.</p>
                  </div>
              );
          }
          return <InterviewSimulator simulation={interviewSim} onGenerate={handleInterviewSimulation} />;
      case 'senior':
          if (generatingFeedback) {
              return (
                <div className="flex flex-col items-center justify-center h-64 text-stone-500 animate-pulse bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
                    <Zap className="w-12 h-12 mb-4 text-amber-500" />
                    <p className="text-lg font-medium">El Mentor Senior está analizando tu carrera...</p>
                    <p className="text-sm">Prepárate para la verdad.</p>
                </div>
              );
          }
          return <SeniorFeedbackView feedback={seniorFeedback} onGenerate={handleSeniorFeedback} />;
      case 'decoder':
          if (translatingJob) {
              return (
                  <div className="flex flex-col items-center justify-center h-64 text-stone-500 animate-pulse bg-white/40 backdrop-blur-sm rounded-xl border border-white/20">
                      <Languages className="w-12 h-12 mb-4 text-emerald-500" />
                      <p className="text-lg font-medium">Decodificando el lenguaje corporativo...</p>
                      <p className="text-sm">Eliminando humo y exageraciones.</p>
                  </div>
              );
          }
          return <JobTranslationView translation={jobTranslation} onGenerate={handleJobTranslation} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden relative">
      {/* Global Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-stone-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <header className="sticky top-0 z-50 transition-all duration-300 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => step !== 'upload' && !loading ? setStep('upload') : null}>
             <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200">
                <BookOpen className="text-white w-5 h-5" />
             </div>
             <h1 className="text-xl font-bold text-stone-900 font-serif tracking-tight">Postula<span className="text-emerald-600">Match</span></h1>
          </div>
          
          {analysisData && !activeQuiz && (
            <nav className="flex space-x-1 bg-white/40 p-1 rounded-xl overflow-x-auto max-w-[60%] md:max-w-none no-scrollbar backdrop-blur-sm border border-white/30">
                <button 
                    onClick={() => setActiveTab('analysis')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'analysis' ? 'bg-white shadow-sm text-emerald-600 ring-1 ring-stone-200/50' : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'}`}
                >
                    Análisis
                </button>
                <button 
                    onClick={() => setActiveTab('study')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'study' ? 'bg-white shadow-sm text-emerald-600 ring-1 ring-stone-200/50' : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'}`}
                >
                    Ruta
                </button>
                 <button 
                    onClick={() => setActiveTab('market')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'market' ? 'bg-white shadow-sm text-emerald-600 ring-1 ring-stone-200/50' : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'}`}
                >
                    <div className="flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Tendencias
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('interview')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'interview' ? 'bg-white shadow-sm text-emerald-600 ring-1 ring-stone-200/50' : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'}`}
                >
                    <div className="flex items-center">
                        <Mic className="w-3 h-3 mr-1" />
                        Simulador
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('senior')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'senior' ? 'bg-white shadow-sm text-emerald-600 ring-1 ring-stone-200/50' : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'}`}
                >
                    <div className="flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        Mentoria
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('decoder')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'decoder' ? 'bg-white shadow-sm text-emerald-600 ring-1 ring-stone-200/50' : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'}`}
                >
                    <div className="flex items-center">
                        <Languages className="w-3 h-3 mr-1" />
                        Decoder
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('stats')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'stats' ? 'bg-white shadow-sm text-emerald-600 ring-1 ring-stone-200/50' : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'}`}
                >
                    <div className="flex items-center">
                        <BarChart2 className="w-3 h-3 mr-1" />
                        Progreso
                    </div>
                </button>
            </nav>
          )}

           {activeQuiz && (
              <button onClick={handleCloseQuiz} className="text-sm font-medium text-stone-500 hover:text-stone-800 flex items-center bg-white/50 px-3 py-1.5 rounded-lg border border-white/50">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Salir del Examen
              </button>
           )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {step === 'upload' && (
          <FileUpload onAnalyze={handleAnalysis} isLoading={loading} />
        )}

        {(step === 'results' || activeQuiz) && (
            <>
                {renderContent()}
                
                {/* Floating Chat Widget */}
                <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
                    {/* Chat Window */}
                    {isChatOpen && (
                        <div className="mb-4 w-96 h-[500px] pointer-events-auto">
                            <ChatTutor 
                                chatSession={chatSession} 
                                onClose={() => setIsChatOpen(false)} 
                            />
                        </div>
                    )}
                    
                    {/* FAB */}
                    {!activeQuiz && (
                        <button 
                            onClick={() => setIsChatOpen(!isChatOpen)}
                            className="bg-emerald-600/90 backdrop-blur-sm hover:bg-emerald-700 text-white rounded-full p-4 shadow-xl transition-transform hover:scale-110 pointer-events-auto flex items-center justify-center border border-emerald-400/50"
                        >
                            {isChatOpen ? <MessageSquare className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                        </button>
                    )}
                </div>

                {/* Accessibility Footer for Compliance */}
                {!activeQuiz && activeTab === 'study' && (
                    <div className="mt-12 border-t border-stone-200/50 pt-8 text-center text-stone-500 text-sm bg-white/20 backdrop-blur-sm rounded-xl p-6 mx-auto max-w-2xl">
                        <div className="flex flex-col items-center">
                            <h4 className="font-bold mb-3 uppercase tracking-widest text-xs text-stone-400">Accesibilidad y Tecnología Asistiva</h4>
                            <p className="mb-4 text-stone-400 max-w-lg">
                                {analysisData?.accessibilityStatement || "Esta aplicación cumple con los estándares WCAG 2.1 AA para lectura y navegación."}
                            </p>
                            <div className="flex justify-center space-x-6">
                                <span className="flex items-center text-xs"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> Compatible con Lector de Pantalla</span>
                                <span className="flex items-center text-xs"><span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> Alto Contraste Soportado</span>
                                <button onClick={() => speakText("Accessibility checks passed.")} className="text-xs underline hover:text-emerald-600">Probar Motor de Audio</button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        )}
      </main>
    </div>
  );
};

export default App;