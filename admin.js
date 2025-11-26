import { supabase } from './supabaseClient.js';

const openListEl = document.getElementById('open-questions');
const answeredListEl = document.getElementById('answered-questions');

let currentUser = null;

async function init() {
  // 1. get logged-in user
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    alert('You must be logged in.');
    // optionally: window.location.href = 'login.html';
    return;
  }
  currentUser = data.user;

  // 2. check if user is admin (profiles.role = 'admin')
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single();

  if (profileError) {
    console.error(profileError);
    alert('Could not load profile.');
    return;
  }

  if (!profile || profile.role !== 'admin') {
    alert('You are not authorized to view this page.');
    // optionally redirect:
    // window.location.href = 'dashboard.html';
    return;
  }

  // 3. load questions
  await loadQuestions();
}

async function loadQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, question, answer, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const openQs = data.filter((q) => q.status === 'open');
  const answeredQs = data.filter((q) => q.status !== 'open');

  openListEl.innerHTML = openQs
    .map(
      (q) => `
      <div class="question-card">
        <p><strong>Asked:</strong> ${new Date(
          q.created_at
        ).toLocaleString()}</p>
        <p><strong>Question:</strong> ${q.question}</p>
        <textarea id="answer-${q.id}" rows="3" placeholder="Type your answer..."></textarea>
        <button onclick="answerQuestion('${q.id}')">Submit Answer</button>
      </div>
    `
    )
    .join('');

  answeredListEl.innerHTML = answeredQs
    .map(
      (q) => `
      <div class="question-card">
        <p><strong>Asked:</strong> ${new Date(
          q.created_at
        ).toLocaleString()}</p>
        <p><strong>Question:</strong> ${q.question}</p>
        <p><strong>Answer:</strong> ${q.answer || ''}</p>
        <p><strong>Status:</strong> ${q.status}</p>
      </div>
    `
    )
    .join('');
}

// called from inline onclick in loadQuestions()
window.answerQuestion = async function (questionId) {
  const textarea = document.getElementById(`answer-${questionId}`);
  const answer = textarea.value.trim();
  if (!answer) return;

  const { error } = await supabase
    .from('questions')
    .update({
      answer,
      status: 'answered',
      answered_at: new Date().toISOString(),
      answered_by: currentUser.id
    })
    .eq('id', questionId);

  if (error) {
    console.error(error);
    alert('Failed to save answer.');
    return;
  }

  textarea.value = '';
  await loadQuestions();
};

window.addEventListener('load', init);
