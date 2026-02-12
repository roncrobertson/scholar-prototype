/**
 * Study Flow Recommendations
 * 
 * Analyzes study session results and recommends next actions across features.
 */

import { getDueForReview } from '../services/spacedReview';
import { getFlaggedForReview, getConfusedConcepts } from '../data/smartNotesReviewFlags';

/**
 * Get recommended next actions after a study session
 * @param {object} params - Session details
 * @returns {Array} Array of recommendation objects
 */
export function getStudyFlowRecommendations({
  sessionType,        // 'practice' | 'flashcards' | 'smart-notes' | 'tutor'
  courseId,
  weakConcepts = [],  // Concepts where user struggled
  completedConcepts = [],
  score = null
}) {
  const recommendations = [];

  // After Practice session with mistakes
  if (sessionType === 'practice' && weakConcepts.length > 0) {
    const primaryConcept = weakConcepts[0];
    
    recommendations.push({
      id: 'review-notes-weak',
      priority: 'high',
      icon: '📋',
      title: `Review ${formatConceptName(primaryConcept)} in Smart Notes`,
      description: 'Strengthen your understanding of this concept',
      action: {
        type: 'smart-notes',
        params: { courseId, topicName: formatConceptName(primaryConcept) }
      },
      color: 'amber'
    });

    recommendations.push({
      id: 'practice-flashcards-weak',
      priority: 'medium',
      icon: '🎴',
      title: `Practice ${formatConceptName(primaryConcept)} flashcards`,
      description: 'Reinforce with spaced repetition',
      action: {
        type: 'flashcards',
        params: { courseId, filterTopic: formatConceptName(primaryConcept) }
      },
      color: 'blue'
    });

    recommendations.push({
      id: 'ask-tutor-weak',
      priority: 'medium',
      icon: '🤖',
      title: `Ask AI Tutor about ${formatConceptName(primaryConcept)}`,
      description: 'Get personalized explanation',
      action: {
        type: 'tutor',
        params: { 
          courseId, 
          initialPrompt: `I'm struggling with ${formatConceptName(primaryConcept)}. Can you explain it in simple terms and give me a way to remember it?`
        }
      },
      color: 'indigo'
    });
  }

  // After Flashcards session - check for due reviews
  if (sessionType === 'flashcards') {
    const dueCount = getDueForReview(courseId, 'flashcards').length;
    
    if (dueCount > 0) {
      recommendations.push({
        id: 'continue-flashcards',
        priority: 'high',
        icon: '🎴',
        title: `${dueCount} more flashcards due`,
        description: 'Keep your streak going',
        action: {
          type: 'flashcards',
          params: { courseId, dueDeckOnly: true }
        },
        color: 'blue'
      });
    } else {
      recommendations.push({
        id: 'practice-after-flashcards',
        priority: 'medium',
        icon: '📝',
        title: 'Test yourself with practice questions',
        description: 'Apply what you just reviewed',
        action: {
          type: 'practice',
          params: { courseId }
        },
        color: 'green'
      });
    }
  }

  // Check for flagged/confused concepts in Smart Notes
  const flaggedConcepts = getFlaggedForReview().filter(f => f.courseId === courseId);
  const confusedConcepts = getConfusedConcepts().filter(c => c.courseId === courseId);
  
  if (flaggedConcepts.length > 0 || confusedConcepts.length > 0) {
    const concept = flaggedConcepts[0] || confusedConcepts[0];
    recommendations.push({
      id: 'review-flagged',
      priority: confusedConcepts.length > 0 ? 'high' : 'medium',
      icon: confusedConcepts.length > 0 ? '❓' : '📌',
      title: `Review ${concept.topicName}`,
      description: confusedConcepts.length > 0 ? 'You marked this as confusing' : 'Flagged for review',
      action: {
        type: 'smart-notes',
        params: { courseId, topicName: concept.topicName }
      },
      color: confusedConcepts.length > 0 ? 'red' : 'amber'
    });
  }

  // After good performance - encourage to get ahead
  if (sessionType === 'practice' && score && score >= 80) {
    recommendations.push({
      id: 'get-ahead',
      priority: 'low',
      icon: '🚀',
      title: 'You\'re doing great! Get ahead',
      description: 'Preview upcoming topics or try advanced questions',
      action: {
        type: 'practice',
        params: { courseId }
      },
      color: 'green'
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Return top 3 recommendations
  return recommendations.slice(0, 3);
}

/**
 * Format concept ID to readable name
 */
function formatConceptName(conceptId) {
  if (!conceptId) return '';
  return conceptId
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Detect actionable intents in AI Tutor responses
 */
export function detectTutorActionIntents(message) {
  const actions = [];
  const lowerMessage = message.toLowerCase();

  // Detect flashcard suggestion
  if (lowerMessage.includes('flashcard') || 
      lowerMessage.includes('practice card') ||
      lowerMessage.includes('spaced repetition')) {
    actions.push({
      type: 'flashcards',
      label: 'Open Flashcards',
      icon: '🎴',
      priority: 'high'
    });
  }

  // Detect practice suggestion
  if (lowerMessage.includes('practice question') || 
      lowerMessage.includes('quiz') ||
      lowerMessage.includes('test yourself')) {
    actions.push({
      type: 'practice',
      label: 'Practice Questions',
      icon: '📝',
      priority: 'high'
    });
  }

  // Detect smart notes suggestion
  if (lowerMessage.includes('review') || 
      lowerMessage.includes('summary') ||
      lowerMessage.includes('note')) {
    actions.push({
      type: 'smart-notes',
      label: 'Review Notes',
      icon: '📋',
      priority: 'medium'
    });
  }

  // Detect concept mention that could have visual mnemonic
  const conceptPatterns = [
    /cell membrane/i,
    /protein synthesis/i,
    /mitosis/i,
    /photosynthesis/i
  ];
  
  for (const pattern of conceptPatterns) {
    if (pattern.test(message)) {
      actions.push({
        type: 'visual-reference',
        label: 'See Concept',
        icon: '👁️',
        priority: 'low'
      });
      break;
    }
  }

  return actions;
}
